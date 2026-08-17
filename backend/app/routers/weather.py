from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.field import Field
from app.schemas.weather import WeatherResponse
from app.services.weather_provider import WeatherProvider
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/weather", tags=["Weather"])


@router.get("/{field_id}", response_model=WeatherResponse)
def get_field_weather(
    field_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    field = db.query(Field).filter(Field.id == field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")

    snapshot = WeatherProvider.get_weather_for_field(db, field)
    if not snapshot:
        raise HTTPException(status_code=503, detail="Weather data currently unavailable")

    return snapshot
