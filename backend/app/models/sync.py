import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum as SQLEnum, JSON, ForeignKey
import enum
from app.database import Base

class SyncOperation(str, enum.Enum):
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"

class SyncStatus(str, enum.Enum):
    PENDING = "PENDING"
    SYNCED = "SYNCED"
    CONFLICT = "CONFLICT"

class SyncEvent(Base):
    __tablename__ = "sync_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    device_id = Column(String(100), index=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), index=True, nullable=False)
    entity_type = Column(String(50), nullable=False)  # "field", "soil_test", "application"
    entity_id = Column(String(36), nullable=False, index=True)
    operation = Column(SQLEnum(SyncOperation), nullable=False)
    payload = Column(JSON, nullable=False)
    status = Column(SQLEnum(SyncStatus), default=SyncStatus.SYNCED, nullable=False)
    client_timestamp = Column(DateTime, nullable=False)
    synced_at = Column(DateTime, default=datetime.utcnow)
