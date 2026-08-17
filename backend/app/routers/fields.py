from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.field import Field
from app.schemas.field import FieldCreate, FieldUpdate, FieldResponse
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/fields", tags=["Fields"])

@router.get("", response_model=List[FieldResponse])
def list_fields(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Field).filter(Field.farmer_id == current_user.id).all()

@router.post("", response_model=FieldResponse)
def create_field(
    field_in: FieldCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    field = Field(
        farmer_id=current_user.id,
        name=field_in.name,
        area_acres=field_in.area_acres,
        latitude=field_in.latitude,
        longitude=field_in.longitude,
        crop_id=field_in.crop_id,
        current_stage_id=field_in.current_stage_id
    )
    db.add(field)
    db.commit()
    db.refresh(field)
    return field

@router.get("/{field_id}", response_model=FieldResponse)
def get_field(
    field_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    field = db.query(Field).filter(Field.id == field_id, Field.farmer_id == current_user.id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    return field

@router.put("/{field_id}", response_model=FieldResponse)
def update_field(
    field_id: str,
    field_update: FieldUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    field = db.query(Field).filter(Field.id == field_id, Field.farmer_id == current_user.id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")

    update_data = field_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(field, key, value)

    db.commit()
    db.refresh(field)
    return field
