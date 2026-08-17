from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
import app.models  # Ensure all models are registered with Base metadata
from app.routers import (
    auth_router,
    fields_router,
    soil_tests_router,
    recommendations_router,
    applications_router,
    weather_router,
    sync_router,
    officer_router
)

# Auto-create tables on startup (works seamlessly with SQLite and PostgreSQL)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="Offline-First Precision Nutrient Intelligence Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(fields_router, prefix=settings.API_V1_STR)
app.include_router(soil_tests_router, prefix=settings.API_V1_STR)
app.include_router(recommendations_router, prefix=settings.API_V1_STR)
app.include_router(applications_router, prefix=settings.API_V1_STR)
app.include_router(weather_router, prefix=settings.API_V1_STR)
app.include_router(sync_router, prefix=settings.API_V1_STR)
app.include_router(officer_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
