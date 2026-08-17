from krishiniti_engine.models import SoilInput, CropInput, NutrientStatus, NutrientQuantities

# Base requirements in kg/ha
CROP_BASE_DEMAND = {
    "cotton": {"n": 120.0, "p": 60.0, "k": 60.0},
    "wheat": {"n": 120.0, "p": 60.0, "k": 40.0},
    "rice": {"n": 100.0, "p": 50.0, "k": 50.0},
    "groundnut": {"n": 25.0, "p": 50.0, "k": 0.0},
    "maize": {"n": 120.0, "p": 60.0, "k": 40.0}
}

# Stage distribution weights for N, P, K
# Basal stage gets 100% of P and K because they are slow-releasing and needed for root development.
# Nitrogen is split across growth stages.
STAGE_WEIGHTS = {
    "cotton": {
        "basal": {"n": 0.33, "p": 1.0, "k": 1.0},
        "vegetative": {"n": 0.33, "p": 0.0, "k": 0.0},
        "flowering": {"n": 0.34, "p": 0.0, "k": 0.0},
        "boll_development": {"n": 0.0, "p": 0.0, "k": 0.0}
    },
    "wheat": {
        "basal": {"n": 0.33, "p": 1.0, "k": 1.0},
        "tillering": {"n": 0.33, "p": 0.0, "k": 0.0},
        "jointing": {"n": 0.34, "p": 0.0, "k": 0.0},
        "heading": {"n": 0.0, "p": 0.0, "k": 0.0}
    },
    "rice": {
        "basal": {"n": 0.33, "p": 1.0, "k": 1.0},
        "active_tillering": {"n": 0.33, "p": 0.0, "k": 0.0},
        "panicle_initiation": {"n": 0.34, "p": 0.0, "k": 0.0}
    },
    "groundnut": {
        "basal": {"n": 1.0, "p": 1.0, "k": 0.0},
        "flowering": {"n": 0.0, "p": 0.0, "k": 0.0},
        "pod_development": {"n": 0.0, "p": 0.0, "k": 0.0}
    },
    "maize": {
        "basal": {"n": 0.33, "p": 1.0, "k": 1.0},
        "knee_high": {"n": 0.33, "p": 0.0, "k": 0.0},
        "tasseling": {"n": 0.34, "p": 0.0, "k": 0.0}
    }
}

def calculate_nutrient_gap(
    soil_status: NutrientStatus,
    crop: CropInput,
    applied_nutrients: NutrientQuantities
) -> NutrientQuantities:
    crop_id = crop.crop_id.lower()
    stage_id = crop.growth_stage_id.lower()
    
    # 1. Get base demand or default
    demand = CROP_BASE_DEMAND.get(crop_id, {"n": 100.0, "p": 50.0, "k": 50.0})
    
    # 2. Adjust demand based on soil nutrient status
    # Low soil index means we add 20% to recommendation. High means we reduce by 30%.
    def adjust_for_status(base_val: float, status: str) -> float:
        if status == "LOW":
            return base_val * 1.20
        elif status == "HIGH":
            return base_val * 0.70
        else: # MEDIUM or UNKNOWN
            return base_val
            
    adj_n = adjust_for_status(demand["n"], soil_status.nitrogen)
    adj_p = adjust_for_status(demand["p"], soil_status.phosphorus)
    adj_k = adjust_for_status(demand["k"], soil_status.potassium)
    
    # 3. Apply growth stage weight
    weights = STAGE_WEIGHTS.get(crop_id, {}).get(stage_id, {"n": 0.33, "p": 0.33, "k": 0.33})
    
    target_n = adj_n * weights["n"]
    target_p = adj_p * weights["p"]
    target_k = adj_k * weights["k"]
    
    # 4. Subtract already applied nutrients for this stage
    gap_n = max(0.0, target_n - applied_nutrients.n_kg)
    gap_p = max(0.0, target_p - applied_nutrients.p_kg)
    gap_k = max(0.0, target_k - applied_nutrients.k_kg)
    
    return NutrientQuantities(n_kg=gap_n, p_kg=gap_p, k_kg=gap_k)
