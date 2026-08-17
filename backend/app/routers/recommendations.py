from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.field import Field
from app.models.recommendation import Recommendation
from app.schemas.recommendation import RecommendationCreateRequest, RecommendationResponse
from app.services.recommendation_service import RecommendationService
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.post("", response_model=RecommendationResponse)
async def generate_recommendation(
    req: RecommendationCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify field access
    field = db.query(Field).filter(Field.id == req.field_id, Field.farmer_id == current_user.id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found or access denied")

    recommendation = await RecommendationService.generate_for_field(
        db=db,
        field_id=req.field_id,
        include_weather=req.include_weather
    )
    return recommendation

@router.get("/field/{field_id}", response_model=List[RecommendationResponse])
def get_field_recommendations(
    field_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    field = db.query(Field).filter(Field.id == field_id, Field.farmer_id == current_user.id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")

    return (
        db.query(Recommendation)
        .filter(Recommendation.field_id == field_id)
        .order_by(Recommendation.created_at.desc())
        .all()
    )
