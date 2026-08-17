from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.user import UserRole, Language

class FarmerProfileBase(BaseModel):
    full_name: str
    district: str
    block: str
    village: str
    consent_given: bool = True

class FarmerProfileCreate(FarmerProfileBase):
    pass

class FarmerProfileResponse(FarmerProfileBase):
    id: str
    user_id: str
    
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    phone_number: Optional[str] = None
    role: UserRole = UserRole.FARMER
    language: Language = Language.GUJARATI

class UserCreate(UserBase):
    password: Optional[str] = "krishiniti123"
    profile: Optional[FarmerProfileCreate] = None

class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    farmer_profile: Optional[FarmerProfileResponse] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[str] = None
