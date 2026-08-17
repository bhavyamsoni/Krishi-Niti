from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime

class RecommendationCreateRequest(BaseModel):
    field_id: str
    include_weather: bool = True

class RecommendationResponse(BaseModel):
    id: str
    field_id: str
    created_at: datetime
    input_snapshot: Dict[str, Any]
    output_recommendation: Dict[str, Any]
    rule_version: str
    confidence_score: str
    timing_action: str

    class Config:
        from_attributes = True
