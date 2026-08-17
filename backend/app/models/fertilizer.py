import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Float, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class FertilizerApplication(Base):
    __tablename__ = "fertilizer_applications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    field_id = Column(String(36), ForeignKey("fields.id"), index=True, nullable=False)
    zone_id = Column(String(50), nullable=True)
    product_id = Column(String(50), nullable=False)  # e.g., 'urea', 'dap', 'mop'
    quantity_kg = Column(Float, nullable=False)
    application_date = Column(Date, nullable=False, default=date.today)
    growth_stage_id = Column(String(50), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    field = relationship("Field", back_populates="applications")

class FertilizerProduct(Base):
    __tablename__ = "fertilizer_products"

    id = Column(String(50), primary_key=True)  # 'urea', 'dap', etc.
    name = Column(String(100), nullable=False)
    grade = Column(String(50), nullable=False)
    n_percent = Column(Float, default=0.0)
    p_percent = Column(Float, default=0.0)
    k_percent = Column(Float, default=0.0)
    bag_weight_kg = Column(Float, default=50.0)
    default_price_inr = Column(Float, default=0.0)
