import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    field_id = Column(String(36), ForeignKey("fields.id"), index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Store complete input & output snapshots for full traceability and auditability
    input_snapshot = Column(JSON, nullable=False)
    output_recommendation = Column(JSON, nullable=False)
    
    rule_version = Column(String(20), nullable=False, default="1.0.0")
    confidence_score = Column(String(20), nullable=False)  # "HIGH", "MODERATE", "LOW"
    timing_action = Column(String(50), nullable=False)     # "APPLY_NOW", "DELAY_HEAVY_RAIN", "MONITOR"

    # Relationships
    field = relationship("Field", back_populates="recommendations")
