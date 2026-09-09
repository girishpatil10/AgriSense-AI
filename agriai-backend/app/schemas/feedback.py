from datetime import datetime
import uuid
from pydantic import BaseModel, Field
from app.db.models.feedback import FeedbackRating

class FeedbackBase(BaseModel):
    rating: FeedbackRating
    comment: str | None = None
    actual_outcome: dict | None = None

class FeedbackCreate(FeedbackBase):
    prediction_id: uuid.UUID

class FeedbackResponse(FeedbackBase):
    feedback_id: uuid.UUID
    prediction_id: uuid.UUID
    submitted_at: datetime

    class Config:
        from_attributes = True

class FeedbackStats(BaseModel):
    total: int
    correct: int
    partially_correct: int
    incorrect: int
    accuracy_pct: float
