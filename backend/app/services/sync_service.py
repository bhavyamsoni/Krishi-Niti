from datetime import datetime
from typing import List, Tuple
from sqlalchemy.orm import Session
from app.models.sync import SyncEvent, SyncOperation, SyncStatus
from app.models.field import Field
from app.models.soil_test import SoilTest, SoilQualityStatus
from app.models.fertilizer import FertilizerApplication
from app.schemas.sync import SyncPushRequest, SyncConflictItem, SyncPushResponse

class SyncService:
    @staticmethod
    def process_push(db: Session, user_id: str, request: SyncPushRequest) -> SyncPushResponse:
        accepted_count = 0
        conflicts: List[SyncConflictItem] = []

        for item in request.events:
            # 1. Record SyncEvent audit
            sync_record = SyncEvent(
                id=item.id,
                device_id=request.device_id,
                user_id=user_id,
                entity_type=item.entity_type,
                entity_id=item.entity_id,
                operation=item.operation,
                payload=item.payload,
                status=SyncStatus.SYNCED,
                client_timestamp=item.client_timestamp
            )

            try:
                # 2. Process according to entity type
                if item.entity_type == "field":
                    existing = db.query(Field).filter(Field.id == item.entity_id).first()
                    if item.operation in [SyncOperation.CREATE, SyncOperation.UPDATE]:
                        if existing and existing.updated_at > item.client_timestamp:
                            conflicts.append(SyncConflictItem(
                                entity_type="field",
                                entity_id=item.entity_id,
                                reason="Server has a newer update for this field",
                                server_timestamp=existing.updated_at
                            ))
                            continue
                        
                        if not existing:
                            field_obj = Field(
                                id=item.entity_id,
                                farmer_id=user_id,
                                name=item.payload.get("name", "Field"),
                                area_acres=item.payload.get("area_acres", 1.0),
                                crop_id=item.payload.get("crop_id", "cotton"),
                                current_stage_id=item.payload.get("current_stage_id", "basal"),
                                latitude=item.payload.get("latitude"),
                                longitude=item.payload.get("longitude")
                            )
                            db.add(field_obj)
                        else:
                            existing.name = item.payload.get("name", existing.name)
                            existing.area_acres = item.payload.get("area_acres", existing.area_acres)
                            existing.crop_id = item.payload.get("crop_id", existing.crop_id)
                            existing.current_stage_id = item.payload.get("current_stage_id", existing.current_stage_id)
                            existing.latitude = item.payload.get("latitude", existing.latitude)
                            existing.longitude = item.payload.get("longitude", existing.longitude)

                elif item.entity_type == "soil_test":
                    existing_st = db.query(SoilTest).filter(SoilTest.id == item.entity_id).first()
                    if not existing_st and item.operation == SyncOperation.CREATE:
                        st = SoilTest(
                            id=item.entity_id,
                            field_id=item.payload.get("field_id"),
                            test_date=datetime.fromisoformat(item.payload["test_date"]).date() if "test_date" in item.payload else datetime.utcnow().date(),
                            lab_source=item.payload.get("lab_source", "Soil Health Card"),
                            nitrogen_n=item.payload.get("nitrogen_n"),
                            phosphorus_p=item.payload.get("phosphorus_p"),
                            potassium_k=item.payload.get("potassium_k"),
                            ph=item.payload.get("ph"),
                            organic_carbon=item.payload.get("organic_carbon"),
                            quality_status=SoilQualityStatus(item.payload.get("quality_status", "VALID"))
                        )
                        db.add(st)

                elif item.entity_type == "application":
                    existing_app = db.query(FertilizerApplication).filter(FertilizerApplication.id == item.entity_id).first()
                    if not existing_app and item.operation == SyncOperation.CREATE:
                        app_obj = FertilizerApplication(
                            id=item.entity_id,
                            field_id=item.payload.get("field_id"),
                            product_id=item.payload.get("product_id"),
                            quantity_kg=item.payload.get("quantity_kg"),
                            application_date=datetime.fromisoformat(item.payload["application_date"]).date() if "application_date" in item.payload else datetime.utcnow().date(),
                            growth_stage_id=item.payload.get("growth_stage_id"),
                            notes=item.payload.get("notes")
                        )
                        db.add(app_obj)

                db.add(sync_record)
                db.commit()
                accepted_count += 1
            except Exception as e:
                db.rollback()
                conflicts.append(SyncConflictItem(
                    entity_type=item.entity_type,
                    entity_id=item.entity_id,
                    reason=f"Failed to apply: {str(e)}",
                    server_timestamp=datetime.utcnow()
                ))

        return SyncPushResponse(
            accepted_count=accepted_count,
            conflicts=conflicts,
            synced_at=datetime.utcnow()
        )
