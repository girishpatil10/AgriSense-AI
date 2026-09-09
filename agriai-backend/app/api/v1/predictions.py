from fastapi import APIRouter, Depends, Query, File, UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Annotated, Optional
from uuid import UUID

from app.dependencies import get_current_user, get_db
from app.db.models.user import User
from app.db.models.farm import Farm
from app.schemas.prediction import (
    SoilRequest, SoilResponse, 
    CropRequest, CropResponse, 
    FertilizerRequest, FertilizerResponse, 
    DiseaseResponse,
    YieldRequest, YieldResponse
)
from app.schemas.weather import WeatherResponse
from app.services.prediction_service import (
    predict_soil, predict_crop, predict_fertilizer, predict_disease, predict_yield
)
from app.services.weather_service import get_weather_forecast
from app.utils.image_utils import validate_image, validate_size

router = APIRouter(prefix="/predict", tags=["Predictions"])


@router.post("/soil", response_model=SoilResponse)
async def predict_soil_route(
    request: SoilRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    return await predict_soil(request, current_user.user_id, session)


@router.post("/crop", response_model=CropResponse)
async def predict_crop_route(
    request: CropRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    return await predict_crop(request, current_user.user_id, session)


@router.post("/fertilizer", response_model=FertilizerResponse)
async def predict_fertilizer_route(
    request: FertilizerRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    return await predict_fertilizer(request, current_user.user_id, session)


@router.post("/disease", response_model=DiseaseResponse)
async def predict_disease_route(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
    file: UploadFile = File(...),
):
    # Validation
    validate_image(file)
    validate_size(file, max_mb=10)
    
    return await predict_disease(file, current_user.user_id, session)


@router.get("/weather", response_model=WeatherResponse)
async def predict_weather_route(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
    farm_id: Optional[UUID] = Query(None),
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
    days: int = Query(7, ge=1, le=14),
):
    if farm_id:
        query = select(Farm).where(Farm.farm_id == farm_id, Farm.user_id == current_user.user_id)
        result = await session.execute(query)
        farm = result.scalar_one_or_none()
        if not farm:
            raise HTTPException(status_code=404, detail="Farm not found")
        if farm.latitude is None or farm.longitude is None:
            raise HTTPException(status_code=400, detail="Farm has no coordinates")
        lat, lon = farm.latitude, farm.longitude
    elif lat is None or lon is None:
        raise HTTPException(status_code=400, detail="Must provide farm_id or lat/lon coordinates")

    return await get_weather_forecast(lat, lon, days)


@router.post("/yield", response_model=YieldResponse)
async def predict_yield_route(
    request: YieldRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    return await predict_yield(request, current_user.user_id, session)
