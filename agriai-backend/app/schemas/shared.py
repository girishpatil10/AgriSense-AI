from pydantic import BaseModel, Field
import uuid

class PlantContext(BaseModel):
    crop_name: str = Field(..., min_length=2, max_length=50)
    growth_stage: str | None = None
    farm_id: uuid.UUID | None = None
    region: str | None = None
