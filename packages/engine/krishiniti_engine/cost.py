from typing import List, Optional, Dict
from krishiniti_engine.models import NutrientQuantities, FertilizerDosage, PriceSnapshotItem

DEFAULT_BAG_WEIGHTS = {
    "urea": 45.0,
    "dap": 50.0,
    "mop": 50.0,
    "npk_12_32_16": 50.0,
    "ssp": 50.0
}

DEFAULT_PRICES = {
    "urea": 266.50,
    "dap": 1350.00,
    "mop": 1700.00,
    "npk_12_32_16": 1470.00,
    "ssp": 600.00
}

FERTILIZER_NAMES = {
    "urea": {"en": "Urea", "hi": "यूरिया", "gu": "યુરિયા"},
    "dap": {"en": "DAP", "hi": "डीएपी", "gu": "ડીએપી"},
    "mop": {"en": "MOP", "hi": "एमओपी", "gu": "એમઓપી"},
    "npk_12_32_16": {"en": "NPK 12:32:16", "hi": "एनपीके 12:32:16", "gu": "એનપીકે 12:32:16"},
    "ssp": {"en": "SSP", "hi": "एसएसपी", "gu": "એસએસપી"}
}

def calculate_dosages(
    gap: NutrientQuantities,
    field_area_acres: float,
    prices: Optional[List[PriceSnapshotItem]] = None
) -> List[FertilizerDosage]:
    # Convert prices & bag weights mapping
    prices_map = dict(DEFAULT_PRICES)
    weights_map = dict(DEFAULT_BAG_WEIGHTS)
    
    if prices:
        for p in prices:
            prices_map[p.product_id] = p.price_per_bag
            weights_map[p.product_id] = p.bag_weight_kg

    # 1 Hectare = 2.47105 Acres
    ha_to_acre = 2.47105
    
    # 1. Resolve Phosphorus gap using DAP
    # DAP is 18% N, 46% P, 0% K
    dap_needed_ha = 0.0
    n_supplied_by_dap = 0.0
    if gap.p_kg > 0:
        dap_needed_ha = gap.p_kg / 0.46
        n_supplied_by_dap = dap_needed_ha * 0.18

    # 2. Resolve Nitrogen gap using Urea
    # Urea is 46% N
    n_remaining_ha = max(0.0, gap.n_kg - n_supplied_by_dap)
    urea_needed_ha = 0.0
    if n_remaining_ha > 0:
        urea_needed_ha = n_remaining_ha / 0.46

    # 3. Resolve Potassium gap using MOP
    # MOP is 60% K
    mop_needed_ha = 0.0
    if gap.k_kg > 0:
        mop_needed_ha = gap.k_kg / 0.60

    dosages = []
    
    # Helper to build a dosage
    def build_dosage(product_id: str, kg_ha: float) -> Optional[FertilizerDosage]:
        if kg_ha <= 0.01:
            return None
        # Convert kg/ha to kg for field area
        kg_field = (kg_ha / ha_to_acre) * field_area_acres
        bag_wt = weights_map.get(product_id, 50.0)
        bags = kg_field / bag_wt
        
        cost = None
        if product_id in prices_map:
            cost = bags * prices_map[product_id]
            
        return FertilizerDosage(
            product_id=product_id,
            product_name_keys=FERTILIZER_NAMES[product_id],
            quantity_bags=round(bags, 2),
            quantity_kg=round(kg_field, 1),
            total_cost_inr=round(cost, 2) if cost is not None else None
        )

    for prod, qty in [("dap", dap_needed_ha), ("urea", urea_needed_ha), ("mop", mop_needed_ha)]:
        d = build_dosage(prod, qty)
        if d:
            dosages.append(d)
            
    return dosages
