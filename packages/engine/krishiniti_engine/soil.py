from typing import Dict, Any
from krishiniti_engine.models import SoilInput, NutrientStatus

# Standard threshold bands based on packages/shared/rules/nutrient_thresholds.json
THRESHOLDS = {
    "N": {"low": 280.0, "medium": 560.0},
    "P": {"low": 11.0, "medium": 25.0},
    "K": {"low": 110.0, "medium": 280.0},
    "OC": {"low": 0.50, "medium": 0.75},
    "pH": {"acidic": 6.5, "alkaline": 8.2}
}

def classify_nutrient(val: Optional[float], low: float, medium: float) -> str:
    if val is None:
        return "UNKNOWN"
    if val < low:
        return "LOW"
    elif val <= medium:
        return "MEDIUM"
    else:
        return "HIGH"

def classify_ph(val: Optional[float]) -> str:
    if val is None:
        return "UNKNOWN"
    if val < THRESHOLDS["pH"]["acidic"]:
        return "ACIDIC"
    elif val > THRESHOLDS["pH"]["alkaline"]:
        return "ALKALINE"
    else:
        return "NORMAL"

def evaluate_soil_status(soil: SoilInput) -> NutrientStatus:
    return NutrientStatus(
        nitrogen=classify_nutrient(soil.nitrogen_n, THRESHOLDS["N"]["low"], THRESHOLDS["N"]["medium"]),
        phosphorus=classify_nutrient(soil.phosphorus_p, THRESHOLDS["P"]["low"], THRESHOLDS["P"]["medium"]),
        potassium=classify_nutrient(soil.potassium_k, THRESHOLDS["K"]["low"], THRESHOLDS["K"]["medium"]),
        organic_carbon=classify_nutrient(soil.organic_carbon, THRESHOLDS["OC"]["low"], THRESHOLDS["OC"]["medium"]),
        ph_classification=classify_ph(soil.ph)
    )
