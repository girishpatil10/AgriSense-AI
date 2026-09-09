from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.prediction import PredictionHistoryResponse

class DashboardSummary(BaseModel):
    total_farms: int
    total_area_hectares: float
    predictions_this_month: int
    recent_prediction: Optional[PredictionHistoryResponse] = None
    
    # Feedback stats
    total_feedback: int
    correct_count: int
    partially_correct_count: int
    incorrect_count: int
    weighted_accuracy_pct: float
