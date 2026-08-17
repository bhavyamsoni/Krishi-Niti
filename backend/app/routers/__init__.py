from app.routers.auth import router as auth_router
from app.routers.fields import router as fields_router
from app.routers.soil_tests import router as soil_tests_router
from app.routers.recommendations import router as recommendations_router
from app.routers.applications import router as applications_router
from app.routers.weather import router as weather_router
from app.routers.sync import router as sync_router
from app.routers.officer import router as officer_router

__all__ = [
    "auth_router",
    "fields_router",
    "soil_tests_router",
    "recommendations_router",
    "applications_router",
    "weather_router",
    "sync_router",
    "officer_router"
]
