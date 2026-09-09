import uuid
from datetime import datetime

from pydantic import BaseModel, field_validator


class FarmCreate(BaseModel):
    name: str
    region: str | None = None
    area_hectares: float
    latitude: float | None = None
    longitude: float | None = None
    current_crop: str | None = None

    @field_validator("area_hectares")
    @classmethod
    def area_range(cls, v: float) -> float:
        if v <= 0 or v > 10000:
            raise ValueError("area_hectares must be > 0 and ≤ 10000")
        return v

    @field_validator("latitude")
    @classmethod
    def lat_range(cls, v: float | None) -> float | None:
        if v is not None and not (-90 <= v <= 90):
            raise ValueError("latitude must be between -90 and 90")
        return v

    @field_validator("longitude")
    @classmethod
    def lon_range(cls, v: float | None) -> float | None:
        if v is not None and not (-180 <= v <= 180):
            raise ValueError("longitude must be between -180 and 180")
        return v


class FarmUpdate(BaseModel):
    name: str | None = None
    region: str | None = None
    area_hectares: float | None = None
    latitude: float | None = None
    longitude: float | None = None
    current_crop: str | None = None

    @field_validator("area_hectares")
    @classmethod
    def area_range(cls, v: float | None) -> float | None:
        if v is not None and (v <= 0 or v > 10000):
            raise ValueError("area_hectares must be > 0 and ≤ 10000")
        return v

    @field_validator("latitude")
    @classmethod
    def lat_range(cls, v: float | None) -> float | None:
        if v is not None and not (-90 <= v <= 90):
            raise ValueError("latitude must be between -90 and 90")
        return v

    @field_validator("longitude")
    @classmethod
    def lon_range(cls, v: float | None) -> float | None:
        if v is not None and not (-180 <= v <= 180):
            raise ValueError("longitude must be between -180 and 180")
        return v


class FarmResponse(BaseModel):
    farm_id: uuid.UUID
    user_id: uuid.UUID
    name: str
    region: str | None
    area_hectares: float
    latitude: float | None
    longitude: float | None
    current_crop: str | None
    is_deleted: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
