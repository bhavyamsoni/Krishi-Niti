import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Float, Date, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class SoilQualityStatus(str, enum.Enum):
    VALID = "VALID"
    STALE = "STALE"
    INVALID = "INVALID"
    PARTIAL = "PARTIAL"

class SoilTest(Base):
    __tablename__ = "soil_tests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    field_id = Column(String(36), ForeignKey("fields.id"), index=True, nullable=False)
    test_date = Column(Date, nullable=False, default=date.today)
    lab_source = Column(String(150), nullable=True, default="Soil Health Card")
    nitrogen_n = Column(Float, nullable=True)
    phosphorus_p = Column(Float, nullable=True)
    potassium_k = Column(Float, nullable=True)
    ph = Column(Float, nullable=True)
    organic_carbon = Column(Float, nullable=True)
    quality_status = Column(SQLEnum(SoilQualityStatus), default=SoilQualityStatus.VALID, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    field = relationship("Field", back_populates="soil_tests")
