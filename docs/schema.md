# KrishiNiti — Data Model & Schema Documentation

Version: 1.0.0

## Entity Relationship Overview

```
User (1) ─── (1) FarmerProfile / OfficerProfile
  │
  ├─── (N) Field (1) ─── (N) SoilTest
  │           │
  │           ├─── (N) FertilizerApplication
  │           ├─── (N) Recommendation
  │           └─── (N) WeatherSnapshot
  │
  └─── (N) SyncEvent
```

---

## Table Schemas

### 1. `users`
- `id`: UUID (Primary Key)
- `phone_number`: String (Nullable)
- `role`: Enum (`FARMER`, `OFFICER`, `ADMIN`)
- `language`: Enum (`gu`, `hi`, `en`)
- `created_at`: Timestamp

### 2. `farmer_profiles`
- `id`: UUID (Primary Key)
- `user_id`: UUID (FK -> users.id)
- `full_name`: String
- `district`: String
- `block`: String
- `village`: String
- `consent_given`: Boolean

### 3. `fields`
- `id`: UUID (Primary Key)
- `farmer_id`: UUID (FK -> users.id)
- `name`: String
- `area_acres`: Float
- `latitude`: Float (Nullable)
- `longitude`: Float (Nullable)
- `crop_id`: String (FK -> crop catalog)
- `current_stage_id`: String
- `created_at`: Timestamp
- `updated_at`: Timestamp

### 4. `soil_tests`
- `id`: UUID (Primary Key)
- `field_id`: UUID (FK -> fields.id)
- `test_date`: Date
- `lab_source`: String (e.g. "Soil Health Card", "Private Lab")
- `nitrogen_n`: Float (kg/ha)
- `phosphorus_p`: Float (kg/ha)
- `potassium_k`: Float (kg/ha)
- `ph`: Float
- `organic_carbon`: Float (%)
- `quality_status`: Enum (`VALID`, `STALE`, `INVALID`, `PARTIAL`)
- `created_at`: Timestamp

### 5. `fertilizer_applications`
- `id`: UUID (Primary Key)
- `field_id`: UUID (FK -> fields.id)
- `zone_id`: String (Nullable)
- `product_id`: String (e.g. "urea", "dap")
- `quantity_kg`: Float
- `application_date`: Date
- `growth_stage_id`: String
- `notes`: Text
- `created_at`: Timestamp

### 6. `recommendations`
- `id`: UUID (Primary Key)
- `field_id`: UUID (FK -> fields.id)
- `created_at`: Timestamp
- `input_snapshot`: JSONB (Complete copy of soil + crop + stage + weather at generation time)
- `output_recommendation`: JSONB (Product recommendations, quantities, cost, timing)
- `rule_version`: String
- `confidence_score`: Enum (`HIGH`, `MODERATE`, `LOW`)
- `sustainability_risk`: Enum (`LOW`, `MODERATE`, `HIGH`)

### 7. `weather_snapshots`
- `id`: UUID (Primary Key)
- `field_id`: UUID (FK -> fields.id)
- `retrieved_at`: Timestamp
- `rainfall_probability`: Float (%)
- `expected_rainfall_mm`: Float
- `temperature_c`: Float
- `weather_condition`: String
- `provider`: String ("Open-Meteo")

### 8. `sync_events`
- `id`: UUID (Primary Key)
- `device_id`: String
- `entity_type`: String ("field", "soil_test", "application")
- `entity_id`: UUID
- `operation`: Enum (`CREATE`, `UPDATE`, `DELETE`)
- `payload`: JSONB
- `status`: Enum (`PENDING`, `SYNCED`, `CONFLICT`)
- `client_timestamp`: Timestamp
- `synced_at`: Timestamp
