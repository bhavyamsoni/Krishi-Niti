from typing import List, Optional
from krishiniti_engine.models import (
    RecommendationPipelineInput,
    RecommendationPipelineOutput,
    NutrientQuantities
)
from krishiniti_engine.soil import evaluate_soil_status
from krishiniti_engine.history import calculate_applied_nutrients
from krishiniti_engine.nutrient_gap import calculate_nutrient_gap
from krishiniti_engine.weather_rules import evaluate_weather_rules
from krishiniti_engine.cost import calculate_dosages
from krishiniti_engine.sustainability import evaluate_sustainability
from krishiniti_engine.confidence import calculate_confidence_score
from krishiniti_engine.explanations import generate_explanations

RULE_VERSION = "1.0.0"

def run_recommendation_pipeline(
    input_data: RecommendationPipelineInput
) -> RecommendationPipelineOutput:
    # 1. Evaluate soil status
    soil_status = evaluate_soil_status(input_data.soil)
    
    # 2. Accumulate fertilizer application history for this growth stage
    # Filter history items matching current growth stage to subtract from current recommendation
    current_stage_history = [
        item for item in input_data.history 
        if item.growth_stage_id.lower() == input_data.crop.growth_stage_id.lower()
    ]
    applied = calculate_applied_nutrients(current_stage_history)
    
    # 3. Calculate nutrient gap (kg/ha)
    gap = calculate_nutrient_gap(soil_status, input_data.crop, applied)
    
    # 4. Convert nutrient gap to actual fertilizer dosages & cost estimation
    dosages = calculate_dosages(gap, input_data.field_area_acres, input_data.prices)
    
    # Calculate estimated total cost
    total_cost = None
    if any(d.total_cost_inr is not None for d in dosages):
        total_cost = sum(d.total_cost_inr for d in dosages if d.total_cost_inr is not None)
        total_cost = round(total_cost, 2)
        
    # 5. Evaluate weather timing
    timing_action, timing_msg = evaluate_weather_rules(input_data.weather)
    
    # 6. Calculate confidence score
    confidence_level, confidence_reasons = calculate_confidence_score(input_data.soil)
    
    # 7. Evaluate sustainability warnings
    sustainability_warnings = evaluate_sustainability(input_data.soil, soil_status, input_data.history)
    
    # 8. Generate multilingual explanations
    explanations = generate_explanations(soil_status, input_data.crop, gap)
    
    return RecommendationPipelineOutput(
        rule_version=RULE_VERSION,
        nutrient_status=soil_status,
        recommended_nutrients_gap_kg_ha=gap,
        dosages=dosages,
        timing_action=timing_action,
        timing_message_keys=timing_msg,
        confidence_level=confidence_level,
        confidence_reasons=confidence_reasons,
        sustainability_warnings=sustainability_warnings,
        explanation_keys=explanations,
        estimated_total_cost_inr=total_cost
    )
