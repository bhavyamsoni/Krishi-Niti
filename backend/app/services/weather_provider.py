import httpx
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from app.models.weather import WeatherSnapshot
from app.models.field import Field
from app.config import settings


class WeatherProvider:
    """
    Synchronous weather abstraction layer using Open-Meteo (free, no API key).
    Caches results in the database for 6 hours to avoid redundant API calls.
    """

    @staticmethod
    def get_weather_for_field(db: Session, field: Field) -> Optional[WeatherSnapshot]:
        # 1. Check for a recent cached snapshot (< 6 hours old)
        six_hours_ago = datetime.utcnow() - timedelta(hours=6)
        recent = (
            db.query(WeatherSnapshot)
            .filter(
                WeatherSnapshot.field_id == field.id,
                WeatherSnapshot.retrieved_at >= six_hours_ago
            )
            .order_by(WeatherSnapshot.retrieved_at.desc())
            .first()
        )
        if recent:
            return recent

        # 2. Determine coordinates (fallback to central Gujarat)
        lat = field.latitude if field.latitude is not None else 22.2587
        lon = field.longitude if field.longitude is not None else 71.1924

        # 3. Fetch fresh data from Open-Meteo
        try:
            params = {
                "latitude": lat,
                "longitude": lon,
                "hourly": "precipitation_probability,precipitation,temperature_2m,relative_humidity_2m",
                "current": "temperature_2m,relative_humidity_2m,precipitation",
                "forecast_days": 2,
                "timezone": "auto"
            }
            with httpx.Client(timeout=6.0) as client:
                resp = client.get(settings.OPEN_METEO_BASE_URL, params=params)

            if resp.status_code == 200:
                data = resp.json()
                hourly = data.get("hourly", {})
                precip_probs = hourly.get("precipitation_probability", [0.0])[:24]
                precip_vals = hourly.get("precipitation", [0.0])[:24]

                max_prob = float(max(precip_probs)) if precip_probs else 0.0
                total_rain = float(sum(precip_vals)) if precip_vals else 0.0

                current = data.get("current", {})
                temp = current.get("temperature_2m", 28.0)
                humidity = current.get("relative_humidity_2m", 65.0)

                condition = "Clear"
                if max_prob > 60:
                    condition = "Rain Expected"
                elif max_prob > 30:
                    condition = "Partly Cloudy"

                snapshot = WeatherSnapshot(
                    field_id=field.id,
                    rainfall_probability=max_prob,
                    expected_rainfall_mm=round(total_rain, 1),
                    temperature_c=temp,
                    humidity_percent=humidity,
                    weather_condition=condition,
                    raw_forecast=data,
                    provider="Open-Meteo"
                )
                db.add(snapshot)
                db.commit()
                db.refresh(snapshot)
                return snapshot

        except Exception:
            pass

        # 4. Fallback: return any older cached snapshot
        old = (
            db.query(WeatherSnapshot)
            .filter(WeatherSnapshot.field_id == field.id)
            .order_by(WeatherSnapshot.retrieved_at.desc())
            .first()
        )
        return old
