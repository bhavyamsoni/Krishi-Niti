from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from app.models.soil_test import SoilQualityStatus

class SoilTestBase(BaseModel):
    test_date: date = Field(default_factory=date.today)
    lab_source: Optional[str] = "Soil Health Card"
    nitrogen_n: Optional[float] = Field(None, ge=0)
    phosphorus_p: Optional[float] = Field(None, ge=0)
    potassium_k: Optional[float] = Field(None, ge=0)
    ph: Optional[float] = Field(None, ge=0, le=14)
    organic_carbon: Optional[float] = Field(None, ge=0, le=100)

class SoilTestCreate(SoilTestBase):
    field_id: str

class SoilTestResponse(SoilTestBase):
    id: str
    field_id: str
    quality_status: SoilQualityStatus
    created_at: datetime

    class Config:
        from_attributes = True
