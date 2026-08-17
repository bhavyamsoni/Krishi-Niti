from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.models.sync import SyncOperation, SyncStatus

class SyncEventItem(BaseModel):
    id: str
    device_id: str
    entity_type: str
    entity_id: str
    operation: SyncOperation
    payload: Dict[str, Any]
    client_timestamp: datetime

class SyncPushRequest(BaseModel):
    device_id: str
    events: List[SyncEventItem]

class SyncConflictItem(BaseModel):
    entity_type: str
    entity_id: str
    reason: str
    server_timestamp: datetime

class SyncPushResponse(BaseModel):
    accepted_count: int
    conflicts: List[SyncConflictItem] = []
    synced_at: datetime

class SyncPullResponse(BaseModel):
    events: List[Dict[str, Any]]
    last_sync_timestamp: datetime
