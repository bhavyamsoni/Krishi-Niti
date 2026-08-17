from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, FarmerProfile
from app.schemas.user import UserCreate, UserResponse, Token
from app.middleware.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    if user_in.phone_number:
        existing = db.query(User).filter(User.phone_number == user_in.phone_number).first()
        if existing:
            raise HTTPException(status_code=400, detail="Phone number already registered")

    user = User(
        phone_number=user_in.phone_number,
        hashed_password=get_password_hash(user_in.password) if user_in.password else None,
        role=user_in.role,
        language=user_in.language
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    if user_in.profile:
        profile = FarmerProfile(
            user_id=user.id,
            full_name=user_in.profile.full_name,
            district=user_in.profile.district,
            block=user_in.profile.block,
            village=user_in.profile.village,
            consent_given=user_in.profile.consent_given
        )
        db.add(profile)
        db.commit()
        db.refresh(user)

    return user

@router.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone_number == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone number or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.id, "role": user.role})
    return Token(access_token=access_token, token_type="bearer", user=user)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
