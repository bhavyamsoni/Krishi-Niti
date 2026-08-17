import os
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, validator

class Settings(BaseSettings):
    APP_NAME: str = "KrishiNiti API"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = "krishiniti-super-secret-jwt-key-for-development-change-in-prod-123456789"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Default database to local SQLite, but supports Supabase/PostgreSQL connection string
    DATABASE_URL: str = "sqlite:///./krishiniti.db"
    
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "*"
    ]
    
    # Weather Provider Settings
    OPEN_METEO_BASE_URL: str = "https://api.open-meteo.com/v1/forecast"
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()
