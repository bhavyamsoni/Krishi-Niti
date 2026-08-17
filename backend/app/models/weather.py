import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class WeatherSnapshot(Base):
    __tablename__ = "weather_snapshots"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    field_id = Column(String(36), ForeignKey("fields.id"), index=True, nullable=False)
    retrieved_at = Column(DateTime, default=datetime.utcnow)
    rainfall_probability = Column(Float, nullable=False)
    expected_rainfall_mm = Column(Float, nullable=False)
    temperature_c = Column(Float, nullable=True)
    humidity_percent = Column(Float, nullable=True)
    weather_condition = Column(String(100), nullable=True)
    raw_forecast = Column(JSON, nullable=True)
    provider = Column(String(50), default="Open-Meteo")

    # Relationships
    field = relationship("Field", back_populates="weather_snapshots")
