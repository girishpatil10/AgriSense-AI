import uuid
from datetime import datetime

from pydantic import BaseModel, field_validator


class SoilReportCreate(BaseModel):
    ph_level: float | None = None
    moisture_percent: float | None = None
    nitrogen_ppm: float | None = None
    phosphorus_ppm: float | None = None
    potassium_ppm: float | None = None
    organic_matter_percent: float | None = None
    notes: str | None = None

    @field_validator("ph_level")
    @classmethod
    def ph_range(cls, v: float | None) -> float | None:
        if v is not None and not (0 <= v <= 14):
            raise ValueError("ph_level must be between 0 and 14")
        return v

    @field_validator("moisture_percent")
    @classmethod
    def moisture_range(cls, v: float | None) -> float | None:
        if v is not None and not (0 <= v <= 100):
            raise ValueError("moisture_percent must be between 0 and 100")
        return v

    @field_validator("organic_matter_percent")
    @classmethod
    def organic_range(cls, v: float | None) -> float | None:
        if v is not None and not (0 <= v <= 100):
            raise ValueError("organic_matter_percent must be between 0 and 100")
        return v


class SoilReportResponse(BaseModel):
    report_id: uuid.UUID
    farm_id: uuid.UUID
    ph_level: float | None
    moisture_percent: float | None
    nitrogen_ppm: float | None
    phosphorus_ppm: float | None
    potassium_ppm: float | None
    organic_matter_percent: float | None
    notes: str | None
    reported_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}
