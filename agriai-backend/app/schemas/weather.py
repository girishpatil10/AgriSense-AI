from datetime import date
from typing import List, Optional
from pydantic import BaseModel

class WeatherForecastItem(BaseModel):
    date: date
    temp_max: float
    temp_min: float
    precipitation: float
    condition: str
    icon: Optional[str] = None

class WeatherResponse(BaseModel):
    location: str
    latitude: float
    longitude: float
    current_temp: Optional[float] = None
    summary: str
    forecast: List[WeatherForecastItem]
    agricultural_advisory: Optional[str] = None
