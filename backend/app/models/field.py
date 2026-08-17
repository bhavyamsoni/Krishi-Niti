import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Field(Base):
    __tablename__ = "fields"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    farmer_id = Column(String(36), ForeignKey("users.id"), index=True, nullable=False)
    name = Column(String(100), nullable=False)
    area_acres = Column(Float, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    crop_id = Column(String(50), nullable=False)
    current_stage_id = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    farmer = relationship("User", back_populates="fields")
    soil_tests = relationship("SoilTest", back_populates="field", cascade="all, delete-orphan")
    applications = relationship("FertilizerApplication", back_populates="field", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="field", cascade="all, delete-orphan")
    weather_snapshots = relationship("WeatherSnapshot", back_populates="field", cascade="all, delete-orphan")
