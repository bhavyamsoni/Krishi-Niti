from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.sync import SyncEvent
from app.schemas.sync import SyncPushRequest, SyncPushResponse, SyncPullResponse
from app.services.sync_service import SyncService
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/sync", tags=["Offline Sync"])

@router.post("/push", response_model=SyncPushResponse)
def sync_push(
    req: SyncPushRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return SyncService.process_push(db, current_user.id, req)

@router.get("/pull", response_model=SyncPullResponse)
def sync_pull(
    since: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(SyncEvent).filter(SyncEvent.user_id == current_user.id)
    if since:
        query = query.filter(SyncEvent.synced_at > since)

    events = query.order_by(SyncEvent.synced_at.asc()).all()

    return SyncPullResponse(
        events=[
            {
                "id": ev.id,
                "entity_type": ev.entity_type,
                "entity_id": ev.entity_id,
                "operation": ev.operation,
                "payload": ev.payload,
                "synced_at": ev.synced_at.isoformat()
            }
            for ev in events
        ],
        last_sync_timestamp=datetime.utcnow()
    )
