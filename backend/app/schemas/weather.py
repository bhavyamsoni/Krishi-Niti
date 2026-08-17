from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class WeatherResponse(BaseModel):
    field_id: str
    rainfall_probability: float
    expected_rainfall_mm: float
    temperature_c: Optional[float] = None
    humidity_percent: Optional[float] = None
    weather_condition: Optional[str] = None
    retrieved_at: datetime
    provider: str = "Open-Meteo"

    class Config:
        from_attributes = True
