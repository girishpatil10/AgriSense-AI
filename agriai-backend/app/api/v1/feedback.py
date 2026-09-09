from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import Annotated, List
from uuid import UUID

from app.dependencies import get_current_user, get_db
from app.db.models.user import User
from app.db.models.prediction import Prediction
from app.db.models.feedback import Feedback
from app.schemas.feedback import FeedbackCreate, FeedbackResponse

router = APIRouter(prefix="/feedback", tags=["Feedback"])

@router.post("", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
async def create_feedback(
    request: FeedbackCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    # Validate prediction exists and owned by user
    query = select(Prediction).where(
        and_(
            Prediction.prediction_id == request.prediction_id,
            Prediction.user_id == current_user.user_id
        )
    )
    result = await session.execute(query)
    prediction = result.scalar_one_or_none()
    
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found or not owned by you"
        )

    # Check for duplicate feedback
    query = select(Feedback).where(
        and_(
            Feedback.prediction_id == request.prediction_id,
            Feedback.user_id == current_user.user_id
        )
    )
    result = await session.execute(query)
    existing_feedback = result.scalar_one_or_none()
    
    if existing_feedback:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Feedback already submitted for this prediction"
        )

    # Create feedback
    feedback = Feedback(
        prediction_id=request.prediction_id,
        user_id=current_user.user_id,
        rating=request.rating,
        comment=request.comment,
        actual_outcome=request.actual_outcome
    )
    
    session.add(feedback)
    await session.commit()
    await session.refresh(feedback)
    
    return feedback

@router.get("/my", response_model=List[FeedbackResponse])
async def get_my_feedback(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
):
    query = select(Feedback).where(
        Feedback.user_id == current_user.user_id
    ).order_by(Feedback.submitted_at.desc()).offset(skip).limit(limit)
    
    result = await session.execute(query)
    return result.scalars().all()
