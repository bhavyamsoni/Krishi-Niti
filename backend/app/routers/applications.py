from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.field import Field
from app.models.fertilizer import FertilizerApplication, FertilizerProduct
from app.schemas.fertilizer import (
    FertilizerApplicationCreate,
    FertilizerApplicationResponse,
    FertilizerProductResponse
)
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/applications", tags=["Fertilizer Applications"])

@router.post("", response_model=FertilizerApplicationResponse)
def record_fertilizer_application(
    app_in: FertilizerApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    field = db.query(Field).filter(Field.id == app_in.field_id, Field.farmer_id == current_user.id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found or access denied")

    app_record = FertilizerApplication(
        field_id=app_in.field_id,
        product_id=app_in.product_id,
        quantity_kg=app_in.quantity_kg,
        application_date=app_in.application_date,
        growth_stage_id=app_in.growth_stage_id,
        zone_id=app_in.zone_id,
        notes=app_in.notes
    )
    db.add(app_record)
    db.commit()
    db.refresh(app_record)
    return app_record

@router.get("/field/{field_id}", response_model=List[FertilizerApplicationResponse])
def list_field_applications(
    field_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    field = db.query(Field).filter(Field.id == field_id, Field.farmer_id == current_user.id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")

    return (
        db.query(FertilizerApplication)
        .filter(FertilizerApplication.field_id == field_id)
        .order_by(FertilizerApplication.application_date.desc())
        .all()
    )

@router.get("/products", response_model=List[FertilizerProductResponse])
def list_fertilizer_products(db: Session = Depends(get_db)):
    products = db.query(FertilizerProduct).all()
    if not products:
        # Default catalog if empty in DB
        return [
            FertilizerProductResponse(id="urea", name="Urea", grade="46-0-0", n_percent=46.0, p_percent=0.0, k_percent=0.0, bag_weight_kg=45.0, default_price_inr=266.50),
            FertilizerProductResponse(id="dap", name="DAP", grade="18-46-0", n_percent=18.0, p_percent=46.0, k_percent=0.0, bag_weight_kg=50.0, default_price_inr=1350.00),
            FertilizerProductResponse(id="mop", name="MOP", grade="0-0-60", n_percent=0.0, p_percent=0.0, k_percent=60.0, bag_weight_kg=50.0, default_price_inr=1700.00),
            FertilizerProductResponse(id="npk_12_32_16", name="NPK 12:32:16", grade="12-32-16", n_percent=12.0, p_percent=32.0, k_percent=16.0, bag_weight_kg=50.0, default_price_inr=1470.00),
            FertilizerProductResponse(id="ssp", name="SSP", grade="0-16-0", n_percent=0.0, p_percent=16.0, k_percent=0.0, bag_weight_kg=50.0, default_price_inr=600.00),
        ]
    return products
