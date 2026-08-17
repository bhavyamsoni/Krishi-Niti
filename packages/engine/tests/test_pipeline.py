from datetime import date, timedelta
import pytest
from krishiniti_engine import (
    RecommendationPipelineInput,
    SoilInput,
    CropInput,
    FertilizerHistoryItem,
    WeatherInput,
    PriceSnapshotItem,
    run_recommendation_pipeline
)

def test_cotton_flowering_low_nitrogen():
    # Input data: 2.5 acres, low Nitrogen, adequate P and K, Cotton flowering stage
    soil = SoilInput(
        nitrogen_n=150.0,  # Low (< 280)
        phosphorus_p=30.0, # High (> 25)
        potassium_k=300.0, # High (> 280)
        ph=7.0,            # Normal
        organic_carbon=0.6,# Medium
        test_date=date.today()
    )
    crop = CropInput(
        crop_id="cotton",
        growth_stage_id="flowering"
    )
    
    pipeline_input = RecommendationPipelineInput(
        field_area_acres=2.5,
        soil=soil,
        crop=crop,
        history=[]
    )
    
    output = run_recommendation_pipeline(pipeline_input)
    
    # 1. Assert soil classification worked
    assert output.nutrient_status.nitrogen == "LOW"
    assert output.nutrient_status.phosphorus == "HIGH"
    assert output.nutrient_status.potassium == "HIGH"
    
    # 2. Under Cotton flowering stage, we only apply Nitrogen (P and K weights are 0 at flowering stage)
    # Check that Urea is recommended and DAP/MOP are not (since P and K are 0 and high status)
    dosage_products = [d.product_id for d in output.dosages]
    assert "urea" in dosage_products
    assert "dap" not in dosage_products
    assert "mop" not in dosage_products
    
    # Check confidence is high for fresh test
    assert output.confidence_level == "HIGH"
    # Cost should be calculated
    assert output.estimated_total_cost_inr is not None
    assert output.estimated_total_cost_inr > 0

def test_stale_soil_test_confidence():
    # Test date 15 months ago (450 days)
    test_date = date.today() - timedelta(days=450)
    soil = SoilInput(
        nitrogen_n=300.0,
        phosphorus_p=18.0,
        potassium_k=200.0,
        ph=6.8,
        organic_carbon=0.55,
        test_date=test_date
    )
    crop = CropInput(
        crop_id="cotton",
        growth_stage_id="basal"
    )
    
    pipeline_input = RecommendationPipelineInput(
        field_area_acres=1.0,
        soil=soil,
        crop=crop,
        history=[]
    )
    
    output = run_recommendation_pipeline(pipeline_input)
    
    # Check that confidence is demoted to LOW due to age
    assert output.confidence_level == "LOW"
    assert any("stale" in reason["en"].lower() for reason in output.confidence_reasons)

def test_weather_delay_trigger():
    soil = SoilInput(
        nitrogen_n=300.0,
        phosphorus_p=18.0,
        potassium_k=200.0,
        ph=6.8,
        organic_carbon=0.55,
        test_date=date.today()
    )
    crop = CropInput(
        crop_id="wheat",
        growth_stage_id="basal"
    )
    # Weather with 80% probability of rain and 15mm expected rainfall
    weather = WeatherInput(
        rainfall_probability=80.0,
        expected_rainfall_mm=15.0
    )
    
    pipeline_input = RecommendationPipelineInput(
        field_area_acres=1.0,
        soil=soil,
        crop=crop,
        weather=weather
    )
    
    output = run_recommendation_pipeline(pipeline_input)
    
    assert output.timing_action == "DELAY_HEAVY_RAIN"
    assert "heavy rain" in output.timing_message_keys["en"].lower()

def test_history_subtraction():
    soil = SoilInput(
        nitrogen_n=200.0,  # Low
        phosphorus_p=10.0,  # Low
        potassium_k=150.0,  # Medium
        ph=7.0,
        organic_carbon=0.6,
        test_date=date.today()
    )
    # Basal stage requires Nitrogen, Phosphorus, and Potassium
    crop = CropInput(
        crop_id="wheat",
        growth_stage_id="basal"
    )
    
    # First, calculate without history to see base DAP requirement
    input_no_history = RecommendationPipelineInput(
        field_area_acres=1.0,
        soil=soil,
        crop=crop,
        history=[]
    )
    output_no_history = run_recommendation_pipeline(input_no_history)
    dap_no_history = next(d for d in output_no_history.dosages if d.product_id == "dap")
    
    # Second, record that some DAP was already applied in the current stage
    applied_dap_kg = 20.0
    history_item = FertilizerHistoryItem(
        product_id="dap",
        quantity_kg=applied_dap_kg,
        application_date=date.today(),
        growth_stage_id="basal"
    )
    
    input_with_history = RecommendationPipelineInput(
        field_area_acres=1.0,
        soil=soil,
        crop=crop,
        history=[history_item]
    )
    
    output_with_history = run_recommendation_pipeline(input_with_history)
    
    dap_with_history = next(
        (d for d in output_with_history.dosages if d.product_id == "dap"),
        None
    )
    
    # Recommended DAP quantity should be lower because of history subtraction
    if dap_with_history:
        assert dap_with_history.quantity_kg < dap_no_history.quantity_kg
    else:
        # It could be completely satisfied (0 DAP recommended)
        assert True
