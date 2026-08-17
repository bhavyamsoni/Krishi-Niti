from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

class FertilizerApplicationBase(BaseModel):
    product_id: str
    quantity_kg: float = Field(..., gt=0)
    application_date: date = Field(default_factory=date.today)
    growth_stage_id: str
    zone_id: Optional[str] = None
    notes: Optional[str] = None

class FertilizerApplicationCreate(FertilizerApplicationBase):
    field_id: str

class FertilizerApplicationResponse(FertilizerApplicationBase):
    id: str
    field_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class FertilizerProductResponse(BaseModel):
    id: str
    name: str
    grade: str
    n_percent: float
    p_percent: float
    k_percent: float
    bag_weight_kg: float
    default_price_inr: float

    class Config:
        from_attributes = True
