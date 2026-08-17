from datetime import date
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class SoilInput(BaseModel):
    nitrogen_n: Optional[float] = Field(None, description="Soil Nitrogen level in kg/ha", ge=0)
    phosphorus_p: Optional[float] = Field(None, description="Soil Phosphorus level in kg/ha", ge=0)
    potassium_k: Optional[float] = Field(None, description="Soil Potassium level in kg/ha", ge=0)
    ph: Optional[float] = Field(None, description="Soil pH value", ge=0, le=14)
    organic_carbon: Optional[float] = Field(None, description="Soil Organic Carbon percentage", ge=0, le=100)
    test_date: date

class CropInput(BaseModel):
    crop_id: str = Field(..., description="Crop identifier, e.g., 'cotton'")
    growth_stage_id: str = Field(..., description="Growth stage identifier, e.g., 'flowering'")
    irrigation_status: bool = Field(True, description="True if irrigated, False if rainfed")

class FertilizerHistoryItem(BaseModel):
    product_id: str = Field(..., description="Fertilizer product identifier, e.g., 'urea'")
    quantity_kg: float = Field(..., description="Quantity applied in kg", gt=0)
    application_date: date
    growth_stage_id: str

class WeatherInput(BaseModel):
    rainfall_probability: float = Field(..., description="Probability of significant rainfall (0-100)", ge=0, le=100)
    expected_rainfall_mm: float = Field(..., description="Expected rainfall in mm", ge=0)
    retrieved_at_delta_hours: int = Field(0, description="Hours since weather data was fetched")

class PriceSnapshotItem(BaseModel):
    product_id: str
    price_per_bag: float
    bag_weight_kg: float

class RecommendationPipelineInput(BaseModel):
    field_area_acres: float = Field(..., gt=0)
    soil: SoilInput
    crop: CropInput
    history: List[FertilizerHistoryItem] = Field(default_factory=list)
    weather: Optional[WeatherInput] = None
    prices: Optional[List[PriceSnapshotItem]] = None

class NutrientStatus(BaseModel):
    nitrogen: str  # "LOW", "MEDIUM", "HIGH", "UNKNOWN"
    phosphorus: str
    potassium: str
    organic_carbon: str
    ph_classification: str  # "ACIDIC", "NORMAL", "ALKALINE"

class FertilizerDosage(BaseModel):
    product_id: str
    product_name_keys: Dict[str, str]
    quantity_bags: float
    quantity_kg: float
    total_cost_inr: Optional[float] = None

class NutrientQuantities(BaseModel):
    n_kg: float
    p_kg: float
    k_kg: float

class RecommendationPipelineOutput(BaseModel):
    rule_version: str
    nutrient_status: NutrientStatus
    recommended_nutrients_gap_kg_ha: NutrientQuantities
    dosages: List[FertilizerDosage]
    timing_action: str  # "APPLY_NOW", "DELAY_HEAVY_RAIN", "MONITOR"
    timing_message_keys: Dict[str, str]
    confidence_level: str  # "HIGH", "MODERATE", "LOW"
    confidence_reasons: List[Dict[str, str]]
    sustainability_warnings: List[Dict[str, str]]
    explanation_keys: List[Dict[str, str]]
    estimated_total_cost_inr: Optional[float] = None
