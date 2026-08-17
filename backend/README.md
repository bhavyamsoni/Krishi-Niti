# KrishiNiti FastAPI Backend

FastAPI backend providing REST APIs for farmer field management, soil tests, precision recommendations, weather forecast integration (Open-Meteo), offline sync push/pull, and regional agriculture officer intelligence.

## Features
- **Deterministic Recommendation Generation**: Directly integrates `krishiniti_engine`.
- **Weather Timing**: Open-Meteo provider abstraction with 6-hour SQLite/Postgres caching.
- **Offline Synchronization**: Idempotent push/pull protocol with conflict detection.
- **Agriculture Officer Dashboard API**: Privacy-safe regional deficiency aggregations with zero PII.
- **Database Flexibility**: Default local SQLite for offline/prototype usage, seamlessly switchable to Supabase/PostgreSQL via `DATABASE_URL`.

## Local Setup

1. Install engine package:
```bash
cd ../packages/engine
pip install -e .
```

2. Install backend dependencies:
```bash
cd ../../backend
pip install -r requirements.txt
```

3. Run the development server:
```bash
uvicorn app.main:app --reload --port 8000
```

4. Interactive Swagger documentation available at:
`http://localhost:8000/docs`
