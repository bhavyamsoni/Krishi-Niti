from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class RegionalNutrientSummary(BaseModel):
    total_fields_assessed: int
    nitrogen_deficiency_percent: float
    phosphorus_deficiency_percent: float
    potassium_deficiency_percent: float
    potential_overuse_percent: float
    stale_soil_tests_percent: float

class VillageAnalyticsItem(BaseModel):
    district: str
    block: str
    village: str
    fields_count: int
    nitrogen_deficiency_percent: float
    phosphorus_deficiency_percent: float
    potassium_deficiency_percent: float
    overuse_risk_level: str  # "LOW", "MODERATE", "CRITICAL"
    top_crops: List[str]

class OfficerAnalyticsResponse(BaseModel):
    overview: RegionalNutrientSummary
    village_breakdown: List[VillageAnalyticsItem]
