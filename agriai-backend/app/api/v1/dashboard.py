from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc, extract
from typing import Annotated, List, Optional
from uuid import UUID
from datetime import datetime, timedelta

from app.dependencies import get_current_user, get_db
from app.db.models.user import User
from app.db.models.prediction import Prediction, PredictionType
from app.db.models.feedback import Feedback, FeedbackRating
from app.db.models.farm import Farm
from app.schemas.prediction import PredictionHistoryResponse
from app.schemas.dashboard import DashboardSummary

router = APIRouter(tags=["Dashboard"])

@router.get("/predictions/history", response_model=List[PredictionHistoryResponse])
async def get_prediction_history(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
    prediction_type: Optional[PredictionType] = Query(None),
    farm_id: Optional[UUID] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100)
):
    # Base query joining with Feedback to get ratings
    query = select(
        Prediction,
        Feedback.rating.label("feedback_rating")
    ).outerjoin(
        Feedback, 
        and_(
            Feedback.prediction_id == Prediction.prediction_id,
            Feedback.user_id == current_user.user_id
        )
    ).where(
        Prediction.user_id == current_user.user_id
    )

    if prediction_type:
        query = query.where(Prediction.prediction_type == prediction_type)
    
    if farm_id:
        # Filter by farm_id inside input_data JSONB
        query = query.where(Prediction.input_data["farm_id"].astext == str(farm_id))

    query = query.order_by(desc(Prediction.created_at)).offset(skip).limit(limit)
    
    result = await session.execute(query)
    history = []
    for row in result.all():
        pred = row[0]
        rating = row[1]
        history.append(
            PredictionHistoryResponse(
                prediction_id=pred.prediction_id,
                user_id=pred.user_id,
                prediction_type=pred.prediction_type,
                input_data=pred.input_data,
                result=pred.result,
                created_at=pred.created_at,
                feedback_rating=rating
            )
        )
    return history

@router.get("/dashboard/summary", response_model=DashboardSummary)
async def get_dashboard_summary(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)]
):
    # 1. Farm stats
    farm_query = select(
        func.count(Farm.farm_id),
        func.sum(Farm.area_hectares)
    ).where(Farm.user_id == current_user.user_id)
    farm_res = await session.execute(farm_query)
    total_farms, total_area = farm_res.one()
    total_area = float(total_area or 0)

    # 2. Predictions this month
    start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    pred_count_query = select(func.count(Prediction.prediction_id)).where(
        and_(
            Prediction.user_id == current_user.user_id,
            Prediction.created_at >= start_of_month
        )
    )
    pred_count_res = await session.execute(pred_count_query)
    predictions_this_month = pred_count_res.scalar_one()

    # 3. Recent prediction
    recent_pred_query = select(
        Prediction,
        Feedback.rating.label("feedback_rating")
    ).outerjoin(
        Feedback,
        and_(
            Feedback.prediction_id == Prediction.prediction_id,
            Feedback.user_id == current_user.user_id
        )
    ).where(
        Prediction.user_id == current_user.user_id
    ).order_by(desc(Prediction.created_at)).limit(1)
    
    recent_pred_res = await session.execute(recent_pred_query)
    recent_row = recent_pred_res.first()
    recent_prediction = None
    if recent_row:
        pred = recent_row[0]
        rating = recent_row[1]
        recent_prediction = PredictionHistoryResponse(
            prediction_id=pred.prediction_id,
            user_id=pred.user_id,
            prediction_type=pred.prediction_type,
            input_data=pred.input_data,
            result=pred.result,
            created_at=pred.created_at,
            feedback_rating=rating
        )

    # 4. Feedback stats
    feedback_stats_query = select(
        Feedback.rating,
        func.count(Feedback.feedback_id)
    ).where(
        Feedback.user_id == current_user.user_id
    ).group_by(Feedback.rating)
    
    feedback_res = await session.execute(feedback_stats_query)
    stats = {r: 0 for r in FeedbackRating}
    total_feedback = 0
    for rating, count in feedback_res.all():
        stats[rating] = count
        total_feedback += count

    # Weighted Accuracy Calculation
    # Correct = 1.0, Partial = 0.5, Incorrect = 0.0
    correct = stats.get(FeedbackRating.correct, 0)
    partial = stats.get(FeedbackRating.partially_correct, 0)
    incorrect = stats.get(FeedbackRating.incorrect, 0)
    
    weighted_accuracy = 0.0
    if total_feedback > 0:
        weighted_accuracy = ((correct * 1.0) + (partial * 0.5)) / total_feedback * 100

    return DashboardSummary(
        total_farms=total_farms,
        total_area_hectares=total_area,
        predictions_this_month=predictions_this_month,
        recent_prediction=recent_prediction,
        total_feedback=total_feedback,
        correct_count=correct,
        partially_correct_count=partial,
        incorrect_count=incorrect,
        weighted_accuracy_pct=round(weighted_accuracy, 2)
    )
