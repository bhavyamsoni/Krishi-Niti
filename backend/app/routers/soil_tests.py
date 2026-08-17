from datetime import date, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.field import Field
from app.models.soil_test import SoilTest, SoilQualityStatus
from app.schemas.soil_test import SoilTestCreate, SoilTestResponse
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/soil-tests", tags=["Soil Tests"])

@router.post("", response_model=SoilTestResponse)
def create_soil_test(
    soil_in: SoilTestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify field ownership
    field = db.query(Field).filter(Field.id == soil_in.field_id, Field.farmer_id == current_user.id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found or access denied")

    # FR-SOIL-03: Validation
    if soil_in.ph is not None and (soil_in.ph < 0 or soil_in.ph > 14):
        raise HTTPException(status_code=400, detail="Invalid pH value. Must be between 0 and 14.")
    if soil_in.nitrogen_n is not None and soil_in.nitrogen_n < 0:
        raise HTTPException(status_code=400, detail="Nitrogen value cannot be negative.")
    if soil_in.phosphorus_p is not None and soil_in.phosphorus_p < 0:
        raise HTTPException(status_code=400, detail="Phosphorus value cannot be negative.")
    if soil_in.potassium_k is not None and soil_in.potassium_k < 0:
        raise HTTPException(status_code=400, detail="Potassium value cannot be negative.")

    # Determine Quality Status
    status = SoilQualityStatus.VALID
    one_year_ago = date.today() - timedelta(days=365)
    if soil_in.test_date < one_year_ago:
        status = SoilQualityStatus.STALE
    elif (soil_in.nitrogen_n is None or soil_in.phosphorus_p is None or soil_in.potassium_k is None):
        status = SoilQualityStatus.PARTIAL

    soil_test = SoilTest(
        field_id=soil_in.field_id,
        test_date=soil_in.test_date,
        lab_source=soil_in.lab_source,
        nitrogen_n=soil_in.nitrogen_n,
        phosphorus_p=soil_in.phosphorus_p,
        potassium_k=soil_in.potassium_k,
        ph=soil_in.ph,
        organic_carbon=soil_in.organic_carbon,
        quality_status=status
    )
    db.add(soil_test)
    db.commit()
    db.refresh(soil_test)
    return soil_test

@router.get("/field/{field_id}", response_model=List[SoilTestResponse])
def list_field_soil_tests(
    field_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    field = db.query(Field).filter(Field.id == field_id, Field.farmer_id == current_user.id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    return db.query(SoilTest).filter(SoilTest.field_id == field_id).order_by(SoilTest.test_date.desc()).all()
