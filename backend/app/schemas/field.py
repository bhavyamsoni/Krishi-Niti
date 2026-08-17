from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class FieldBase(BaseModel):
    name: str
    area_acres: float = Field(..., gt=0)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    crop_id: str
    current_stage_id: str

class FieldCreate(FieldBase):
    pass

class FieldUpdate(BaseModel):
    name: Optional[str] = None
    area_acres: Optional[float] = Field(None, gt=0)
    crop_id: Optional[str] = None
    current_stage_id: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class FieldResponse(FieldBase):
    id: str
    farmer_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
