import uuid
from datetime import date, datetime

from pydantic import BaseModel, model_validator


class CropHistoryCreate(BaseModel):
    crop_name: str
    sown_date: date | None = None
    harvest_date: date | None = None
    yield_tons: float | None = None
    season: str | None = None

    @model_validator(mode="after")
    def harvest_after_sown(self) -> "CropHistoryCreate":
        if self.sown_date and self.harvest_date:
            if self.harvest_date < self.sown_date:
                raise ValueError("harvest_date must be on or after sown_date")
        return self


class CropHistoryResponse(BaseModel):
    history_id: uuid.UUID
    farm_id: uuid.UUID
    crop_name: str
    sown_date: date | None
    harvest_date: date | None
    yield_tons: float | None
    season: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
