from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.officer import OfficerAnalyticsResponse
from app.services.analytics_service import AnalyticsService
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/officer", tags=["Agriculture Officer Analytics"])

@router.get("/analytics", response_model=OfficerAnalyticsResponse)
def get_regional_analytics(
    district: Optional[str] = Query(None, description="Filter by district name"),
    block: Optional[str] = Query(None, description="Filter by block name"),
    crop_id: Optional[str] = Query(None, description="Filter by crop, e.g., 'cotton'"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns aggregated regional nutrient intelligence.
    Privacy-safe: No personal identifiable information (PII) of farmers is returned.
    """
    return AnalyticsService.get_regional_summary(
        db=db,
        district=district,
        block=block,
        crop_id=crop_id
    )
