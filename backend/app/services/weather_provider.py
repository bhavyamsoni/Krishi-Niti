import httpx
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.weather import WeatherSnapshot
from app.models.field import Field
from app.config import settings

class WeatherProvider:
    """
    Abstraction layer for Weather Forecast.
    Uses Open-Meteo (Free, No API Key required) with automatic fallback and database caching.
    """
    
    @staticmethod
    async def get_weather_for_field(db: Session, field: Field) -> Optional[WeatherSnapshot]:
        # 1. Check if we have a recent snapshot (< 6 hours old) in database
        six_hours_ago = datetime.utcnow() - timedelta(hours=6)
        recent_snapshot = (
            db.query(WeatherSnapshot)
            .filter(WeatherSnapshot.field_id == field.id, WeatherSnapshot.retrieved_at >= six_hours_ago)
            .order_by(WeatherSnapshot.retrieved_at.desc())
            .first()
        )
        if recent_snapshot:
            return recent_snapshot

        # 2. Determine Coordinates (Default to Gujarat if field coordinates are missing)
        lat = field.latitude if field.latitude is not None else 22.2587
        lon = field.longitude if field.longitude is not None else 71.1924

        # 3. Fetch from Open-Meteo
        try:
            params = {
                "latitude": lat,
                "longitude": lon,
                "hourly": "precipitation_probability,precipitation,temperature_2m,relative_humidity_2m",
                "current": "temperature_2m,relative_humidity_2m,precipitation",
                "forecast_days": 2,
                "timezone": "auto"
            }
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.get(settings.OPEN_METEO_BASE_URL, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    
                    # Extract max precipitation probability & total expected rainfall in next 24h
                    hourly = data.get("hourly", {})
                    precip_probs = hourly.get("precipitation_probability", [0.0])[:24]
                    precip_vals = hourly.get("precipitation", [0.0])[:24]
                    
                    max_prob = float(max(precip_probs)) if precip_probs else 0.0
                    total_expected_rain = float(sum(precip_vals)) if precip_vals else 0.0
                    
                    current = data.get("current", {})
                    current_temp = current.get("temperature_2m", 28.0)
                    current_humidity = current.get("relative_humidity_2m", 65.0)

                    condition = "Clear"
                    if max_prob > 60:
                        condition = "Rain Expected"
                    elif max_prob > 30:
                        condition = "Partly Cloudy"

                    snapshot = WeatherSnapshot(
                        field_id=field.id,
                        rainfall_probability=max_prob,
                        expected_rainfall_mm=round(total_expected_rain, 1),
                        temperature_c=current_temp,
                        humidity_percent=current_humidity,
                        weather_condition=condition,
                        raw_forecast=data,
                        provider="Open-Meteo"
                    )
                    db.add(snapshot)
                    db.commit()
                    db.refresh(snapshot)
                    return snapshot
        except Exception as e:
            # Weather fetch failed - check if any older cached snapshot exists
            old_snapshot = (
                db.query(WeatherSnapshot)
                .filter(WeatherSnapshot.field_id == field.id)
                .order_by(WeatherSnapshot.retrieved_at.desc())
                .first()
            )
            if old_snapshot:
                return old_snapshot

        return None
