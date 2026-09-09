from uuid import UUID
import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from app.schemas.prediction import (
    SoilRequest, SoilResponse, 
    CropRequest, CropResponse, RecommendedCrop,
    FertilizerRequest, FertilizerResponse, 
    DiseaseResponse,
    YieldRequest, YieldResponse, YieldRange
)

from app.db.models.prediction import Prediction, PredictionType
from app.db.models.soil_report import SoilReport
from app.db.models.farm import Farm
from app.db.models.crop_history import CropHistory

from app.models.soil import run_soil_prediction
from app.models.crop import predict_crop_llm
from app.services.crop_rules_engine import get_rule_based_recommendations
from app.models.fertilizer import predict_fertilizer_type
from app.models.disease import predict_disease_model
from app.models.yield_model import predict_yield_fallback
from app.services.weather_service import get_weather_forecast, weather_service

from app.utils.cache import cache_get, cache_set, make_cache_key
from app.utils.image_utils import preprocess_for_inference
from app.models.loader import get_model

async def predict_soil(request: SoilRequest, user_id: UUID, session: AsyncSession) -> SoilResponse:
    if request.report_id:
        query = select(SoilReport).options(joinedload(SoilReport.farm)).where(SoilReport.report_id == request.report_id)
        result = await session.execute(query)
        report = result.scalar_one_or_none()
        if not report:
            raise HTTPException(status_code=404, detail="Soil report not found")
        if report.farm.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this report")
        n, p, k, ph, m = (
            report.nitrogen_ppm or 0.0,
            report.phosphorus_ppm or 0.0,
            report.potassium_ppm or 0.0,
            report.ph_level or 7.0,
            report.moisture_percent or 50.0
        )
    elif request.inline_values:
        n, p, k, ph, m = (
            request.inline_values.nitrogen,
            request.inline_values.phosphorus,
            request.inline_values.potassium,
            request.inline_values.ph,
            request.inline_values.moisture
        )
    else:
        raise HTTPException(status_code=400, detail="Must provide report_id or inline_values")

    cache_key = make_cache_key("soil_pred", n=n, p=p, k=k, ph=ph, m=m)
    cached = await cache_get(cache_key)

    if not cached:
        prediction_result = run_soil_prediction(nitrogen=n, phosphorus=p, potassium=k, ph=ph, moisture=m)
        result_dict = {
            "soil_type": prediction_result.soil_type,
            "confidence": prediction_result.confidence,
            "deficiencies": prediction_result.deficiencies,
            "recommendations": prediction_result.recommendations
        }
        await cache_set(cache_key, result_dict)
        is_cached = False
    else:
        result_dict = cached
        is_cached = True
    
    prediction = Prediction(
        user_id=user_id,
        prediction_type=PredictionType.soil,
        input_data={"nitrogen": n, "phosphorus": p, "potassium": k, "ph": ph, "moisture": m},
        result=result_dict
    )
    session.add(prediction)
    await session.commit()
    await session.refresh(prediction)

    return SoilResponse(
        **result_dict,
        prediction_id=prediction.prediction_id,
        cached=is_cached
    )

async def predict_crop(request: CropRequest, user_id: UUID, session: AsyncSession) -> CropResponse:
    if request.soil_report_id:
        query = select(SoilReport).options(joinedload(SoilReport.farm)).where(SoilReport.report_id == request.soil_report_id)
        result = await session.execute(query)
        report = result.scalar_one_or_none()
        if not report:
            raise HTTPException(status_code=404, detail="Soil report not found")
        if report.farm.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this report")
        
        soil_data = {
            "N": report.nitrogen_ppm or 0.0, "P": report.phosphorus_ppm or 0.0, "K": report.potassium_ppm or 0.0,
            "ph": report.ph_level or 7.0, "moisture": report.moisture_percent or 50.0
        }
    else:
        raise HTTPException(status_code=400, detail="soil_report_id is required for crop recommendation")

    region = "Unknown"
    if request.farm_id:
        query = select(Farm).where(Farm.farm_id == request.farm_id, Farm.user_id == user_id)
        result = await session.execute(query)
        farm = result.scalar_one_or_none()
        if farm:
            region = farm.region or "Unknown"

    previous_crops = [request.previous_crop] if request.previous_crop else []
    cache_key = make_cache_key("crop_pred", soil=soil_data, season=request.season, pc=previous_crops)
    cached = await cache_get(cache_key)

    if cached:
        result_dict = cached
        is_cached = True
    else:
        try:
            result_dict = await predict_crop_llm(
                soil_data=soil_data,
                region=region,
                season=request.season,
                previous_crops=previous_crops
            )
            is_cached = False
        except Exception:
            result_dict = get_rule_based_recommendations(
                soil_data=soil_data,
                season=request.season,
                previous_crops=previous_crops
            )
            is_cached = False
        await cache_set(cache_key, result_dict)

    prediction = Prediction(
        user_id=user_id,
        prediction_type=PredictionType.crop,
        input_data={
            "soil_report_id": str(request.soil_report_id),
            "farm_id": str(request.farm_id) if request.farm_id else None,
            "season": request.season,
            "previous_crop": request.previous_crop
        },
        result=result_dict
    )
    session.add(prediction)
    await session.commit()
    await session.refresh(prediction)

    return CropResponse(
        recommended_crops=[RecommendedCrop(**c) for c in result_dict["recommended_crops"]],
        rotation_advice=result_dict["rotation_advice"],
        inference_mode=result_dict.get("inference_mode", "llm"),
        prediction_id=prediction.prediction_id,
        cached=is_cached
    )

async def predict_fertilizer(request: FertilizerRequest, user_id: UUID, session: AsyncSession) -> FertilizerResponse:
    if request.soil_report_id:
        query = select(SoilReport).options(joinedload(SoilReport.farm)).where(SoilReport.report_id == request.soil_report_id)
        result = await session.execute(query)
        report = result.scalar_one_or_none()
        if not report:
            raise HTTPException(status_code=404, detail="Soil report not found")
        if report.farm.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this report")
        n, p, k, ph, m = (
            report.nitrogen_ppm or 0.0,
            report.phosphorus_ppm or 0.0,
            report.potassium_ppm or 0.0,
            report.ph_level or 7.0,
            report.moisture_percent or 50.0
        )
    elif request.inline_values:
        n, p, k, ph, m = (
            request.inline_values.nitrogen,
            request.inline_values.phosphorus,
            request.inline_values.potassium,
            request.inline_values.ph,
            request.inline_values.moisture
        )
    else:
        raise HTTPException(status_code=400, detail="Must provide soil_report_id or inline_values")

    cache_key = make_cache_key("fertilizer", n=n, p=p, k=k, ph=ph, m=m, c=request.crop_name, a=request.area_hectares)
    cached = await cache_get(cache_key)

    if not cached:
        prediction_result = predict_fertilizer_type(nitrogen=n, phosphorus=p, potassium=k, ph=ph, moisture=m, crop_name=request.crop_name)
        total_dosage = prediction_result.base_dosage_kg_per_hectare * request.area_hectares
        result_dict = {
            "fertilizer_type": prediction_result.fertilizer_type,
            "confidence": prediction_result.confidence,
            "dosage_kg_per_hectare": prediction_result.base_dosage_kg_per_hectare,
            "total_dosage_kg": total_dosage,
            "application_method": prediction_result.application_method,
            "additional_notes": prediction_result.notes
        }
        await cache_set(cache_key, result_dict)
        is_cached = False
    else:
        result_dict = cached
        is_cached = True

    prediction = Prediction(
        user_id=user_id,
        prediction_type=PredictionType.fertilizer,
        input_data={
            "nitrogen": n, "phosphorus": p, "potassium": k, "ph": ph, "moisture": m, 
            "crop_name": request.crop_name, "area_hectares": request.area_hectares
        },
        result=result_dict
    )
    session.add(prediction)
    await session.commit()
    await session.refresh(prediction)

    return FertilizerResponse(
        fertilizer_type=result_dict["fertilizer_type"],
        dosage_kg_per_hectare=result_dict["dosage_kg_per_hectare"],
        total_dosage_kg=result_dict["total_dosage_kg"],
        application_method=result_dict["application_method"],
        additional_notes=result_dict["additional_notes"],
        confidence=result_dict["confidence"],
        cached=is_cached,
        prediction_id=prediction.prediction_id
    )

async def predict_disease(image_file: UploadFile, user_id: UUID, session: AsyncSession) -> DiseaseResponse:
    content = await image_file.read()
    image_obj = preprocess_for_inference(content)
    result_dict = predict_disease_model(image_obj)
    
    prediction = Prediction(
        user_id=user_id,
        prediction_type=PredictionType.disease,
        input_data={"filename": image_file.filename, "content_type": image_file.content_type},
        result=result_dict
    )
    session.add(prediction)
    await session.commit()
    await session.refresh(prediction)
    return DiseaseResponse(**result_dict, prediction_id=prediction.prediction_id)

async def predict_yield(request: YieldRequest, user_id: UUID, session: AsyncSession) -> YieldResponse:
    # 1. Fetch Farm and Soil Report
    query = select(Farm).where(Farm.farm_id == request.farm_id, Farm.user_id == user_id)
    result = await session.execute(query)
    farm = result.scalar_one_or_none()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    query = select(SoilReport).where(SoilReport.report_id == request.soil_report_id)
    result = await session.execute(query)
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Soil report not found")

    # 2. Fetch Weather Data (Cached)
    weather = await get_weather_forecast(farm.latitude, farm.longitude, days=7)
    
    # Calculate simple averages for the model
    avg_temp = sum([item.temp_max + item.temp_min for item in weather.forecast]) / (2 * len(weather.forecast))
    avg_precip = sum([item.precipitation for item in weather.forecast]) * 30 # Rough estimate for 30 days based on 7-day trend

    # 3. Cache Check
    cache_key = make_cache_key("yield", f=str(request.farm_id), c=request.crop_name, s=str(request.soil_report_id))
    cached = await cache_get(cache_key)

    if cached:
        result_dict = cached
        is_cached = True
    else:
        result_dict = predict_yield_fallback(
            crop_name=request.crop_name,
            area_hectares=farm.area_hectares,
            nitrogen=report.nitrogen_ppm or 0.0,
            phosphorus=report.phosphorus_ppm or 0.0,
            potassium=report.potassium_ppm or 0.0,
            ph=report.ph_level or 7.0,
            moisture=report.moisture_percent or 50.0,
            avg_temp=avg_temp,
            avg_precip=avg_precip
        )
        await cache_set(cache_key, result_dict)
        is_cached = False

    # 4. Save Prediction
    prediction = Prediction(
        user_id=user_id,
        prediction_type=PredictionType.yield_,
        input_data={
            "farm_id": str(request.farm_id),
            "crop_name": request.crop_name,
            "soil_report_id": str(request.soil_report_id),
            "season": request.season
        },
        result=result_dict
    )
    session.add(prediction)
    await session.commit()
    await session.refresh(prediction)

    return YieldResponse(
        **result_dict,
        prediction_id=prediction.prediction_id,
        cached=is_cached
    )
