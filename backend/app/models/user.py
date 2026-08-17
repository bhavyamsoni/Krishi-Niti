import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum as SQLEnum, ForeignKey, Boolean
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class UserRole(str, enum.Enum):
    FARMER = "FARMER"
    OFFICER = "OFFICER"
    ADMIN = "ADMIN"

class Language(str, enum.Enum):
    GUJARATI = "gu"
    HINDI = "hi"
    ENGLISH = "en"

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    phone_number = Column(String(20), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=True)
    role = Column(SQLEnum(UserRole), default=UserRole.FARMER, nullable=False)
    language = Column(SQLEnum(Language), default=Language.GUJARATI, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    farmer_profile = relationship("FarmerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    fields = relationship("Field", back_populates="farmer", cascade="all, delete-orphan")

class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, unique=True)
    full_name = Column(String(100), nullable=False)
    district = Column(String(100), index=True, nullable=False)
    block = Column(String(100), index=True, nullable=False)
    village = Column(String(100), index=True, nullable=False)
    consent_given = Column(Boolean, default=True)

    # Relationships
    user = relationship("User", back_populates="farmer_profile")
