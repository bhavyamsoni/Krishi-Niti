from typing import List
from krishiniti_engine.models import FertilizerHistoryItem, NutrientQuantities

FERTILIZER_COMPOSITIONS = {
    "urea": {"n": 0.46, "p": 0.0, "k": 0.0},
    "dap": {"n": 0.18, "p": 0.46, "k": 0.0},
    "mop": {"n": 0.0, "p": 0.0, "k": 0.60},
    "npk_12_32_16": {"n": 0.12, "p": 0.32, "k": 0.16},
    "ssp": {"n": 0.0, "p": 0.16, "k": 0.0}
}

def calculate_applied_nutrients(history: List[FertilizerHistoryItem]) -> NutrientQuantities:
    n_total = 0.0
    p_total = 0.0
    k_total = 0.0
    
    for item in history:
        prod_id = item.product_id.lower()
        if prod_id in FERTILIZER_COMPOSITIONS:
            comp = FERTILIZER_COMPOSITIONS[prod_id]
            n_total += item.quantity_kg * comp["n"]
            p_total += item.quantity_kg * comp["p"]
            k_total += item.quantity_kg * comp["k"]
            
    return NutrientQuantities(n_kg=n_total, p_kg=p_total, k_kg=k_total)
