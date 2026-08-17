import uuid
from datetime import date
from app.database import Base, engine, SessionLocal
from app.models import User, FarmerProfile, Field, SoilTest, SoilQualityStatus, FertilizerApplication
from app.services.analytics_service import AnalyticsService
from krishiniti_engine import (
    run_recommendation_pipeline,
    RecommendationPipelineInput,
    SoilInput,
    CropInput
)

def test_full_database_and_analytics_flow():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    unique_phone = f"98{str(uuid.uuid4().int)[:8]}"
    
    # 1. Create User & Profile
    user = User(phone_number=unique_phone)
    db.add(user)
    db.commit()
    db.refresh(user)
    
    profile = FarmerProfile(
        user_id=user.id,
        full_name="Ramesh Patel",
        district="Rajkot",
        block="Gondal",
        village="Moviya"
    )
    db.add(profile)
    db.commit()

    # 2. Create Field
    field = Field(
        farmer_id=user.id,
        name="Field North",
        area_acres=2.5,
        crop_id="cotton",
        current_stage_id="flowering"
    )
    db.add(field)
    db.commit()
    db.refresh(field)

    # 3. Create Soil Test
    soil_test = SoilTest(
        field_id=field.id,
        test_date=date.today(),
        nitrogen_n=170.0,
        phosphorus_p=24.0,
        potassium_k=220.0,
        ph=7.1,
        organic_carbon=0.55,
        quality_status=SoilQualityStatus.VALID
    )
    db.add(soil_test)
    db.commit()

    # 4. Run Recommendation via Engine
    rec_input = RecommendationPipelineInput(
        field_area_acres=field.area_acres,
        soil=SoilInput(
            nitrogen_n=soil_test.nitrogen_n,
            phosphorus_p=soil_test.phosphorus_p,
            potassium_k=soil_test.potassium_k,
            ph=soil_test.ph,
            organic_carbon=soil_test.organic_carbon,
            test_date=soil_test.test_date
        ),
        crop=CropInput(crop_id=field.crop_id, growth_stage_id=field.current_stage_id),
        history=[]
    )
    rec_output = run_recommendation_pipeline(rec_input)
    assert rec_output.nutrient_status.nitrogen == "LOW"
    assert rec_output.confidence_level == "HIGH"
    assert len(rec_output.dosages) > 0

    # 5. Record Fertilizer Application
    app = FertilizerApplication(
        field_id=field.id,
        product_id="urea",
        quantity_kg=45.0,
        growth_stage_id="flowering"
    )
    db.add(app)
    db.commit()

    # 6. Test Regional Analytics Aggregation
    analytics = AnalyticsService.get_regional_summary(db=db, district="Rajkot")
    assert analytics.overview.total_fields_assessed >= 1
    assert len(analytics.village_breakdown) >= 1
    village = next(v for v in analytics.village_breakdown if v.village == "Moviya")
    assert village.village == "Moviya"
    assert village.nitrogen_deficiency_percent >= 50.0

    print("ALL BACKEND & ANALYTICS INTEGRATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_full_database_and_analytics_flow()
