from datetime import datetime, date
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.field import Field
from app.models.soil_test import SoilTest, SoilQualityStatus
from app.models.fertilizer import FertilizerApplication
from app.models.recommendation import Recommendation
from app.models.weather import WeatherSnapshot
from app.services.weather_provider import WeatherProvider

from krishiniti_engine import (
    run_recommendation_pipeline,
    RecommendationPipelineInput,
    SoilInput,
    CropInput,
    FertilizerHistoryItem,
    WeatherInput
)


class RecommendationService:
    @staticmethod
    def generate_for_field(
        db: Session,
        field_id: str,
        include_weather: bool = True
    ) -> Recommendation:
        # 1. Fetch Field
        field = db.query(Field).filter(Field.id == field_id).first()
        if not field:
            raise HTTPException(status_code=404, detail="Field not found")

        # 2. Fetch Latest Valid Soil Test
        latest_soil_test = (
            db.query(SoilTest)
            .filter(SoilTest.field_id == field_id)
            .order_by(SoilTest.test_date.desc(), SoilTest.created_at.desc())
            .first()
        )
        if not latest_soil_test:
            raise HTTPException(
                status_code=400,
                detail="No soil test found for this field. Please add a soil test before requesting a recommendation."
            )

        # 3. Fetch Fertilizer Application History
        applications = (
            db.query(FertilizerApplication)
            .filter(FertilizerApplication.field_id == field_id)
            .all()
        )

        # 4. Fetch Weather (synchronous)
        weather_input: Optional[WeatherInput] = None
        if include_weather:
            weather_snapshot = WeatherProvider.get_weather_for_field(db, field)
            if weather_snapshot:
                hours_ago = int(
                    (datetime.utcnow() - weather_snapshot.retrieved_at).total_seconds() / 3600
                )
                weather_input = WeatherInput(
                    rainfall_probability=weather_snapshot.rainfall_probability,
                    expected_rainfall_mm=weather_snapshot.expected_rainfall_mm,
                    retrieved_at_delta_hours=hours_ago
                )

        # 5. Build Engine Input
        soil_in = SoilInput(
            nitrogen_n=latest_soil_test.nitrogen_n,
            phosphorus_p=latest_soil_test.phosphorus_p,
            potassium_k=latest_soil_test.potassium_k,
            ph=latest_soil_test.ph,
            organic_carbon=latest_soil_test.organic_carbon,
            test_date=latest_soil_test.test_date
        )
        crop_in = CropInput(
            crop_id=field.crop_id,
            growth_stage_id=field.current_stage_id,
            irrigation_status=True
        )
        history_items = [
            FertilizerHistoryItem(
                product_id=app.product_id,
                quantity_kg=app.quantity_kg,
                application_date=app.application_date,
                growth_stage_id=app.growth_stage_id
            )
            for app in applications
        ]
        pipeline_input = RecommendationPipelineInput(
            field_area_acres=field.area_acres,
            soil=soil_in,
            crop=crop_in,
            history=history_items,
            weather=weather_input
        )

        # 6. Run Deterministic Engine (no LLM in dosage decisions)
        engine_output = run_recommendation_pipeline(pipeline_input)

        # 7. Persist to database for auditability
        recommendation = Recommendation(
            field_id=field.id,
            input_snapshot=pipeline_input.model_dump(mode="json"),
            output_recommendation=engine_output.model_dump(mode="json"),
            rule_version=engine_output.rule_version,
            confidence_score=engine_output.confidence_level,
            timing_action=engine_output.timing_action
        )
        db.add(recommendation)
        db.commit()
        db.refresh(recommendation)
        return recommendation
