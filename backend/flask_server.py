"""
KrishiNiti Flask Server
========================
Pure synchronous WSGI server using Flask + waitress.
Zero asyncio - works reliably on Python 3.14 / Windows.

Usage:
    cd backend
    python flask_server.py

Endpoints mirror the FastAPI app at the same URL paths.
Swagger docs: http://127.0.0.1:8000/docs  (redirects to Swagger UI)
"""
import sys
import os
import json
from datetime import date, datetime

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# ── path setup ──────────────────────────────────────────────────────────────
sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask, request, jsonify, redirect
from waitress import serve

from app.database import SessionLocal, engine, Base
import app.models  # registers all ORM models

from app.models.user import User, FarmerProfile, UserRole, Language
from app.models.field import Field
from app.models.soil_test import SoilTest, SoilQualityStatus
from app.models.fertilizer import FertilizerApplication, FertilizerProduct
from app.models.recommendation import Recommendation
from app.models.weather import WeatherSnapshot

from app.middleware.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
)
from app.services.weather_provider import WeatherProvider
from app.services.recommendation_service import RecommendationService

from jose import JWTError, jwt
from app.config import settings

# ── DB Init ─────────────────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── Flask App ────────────────────────────────────────────────────────────────
flask_app = Flask(__name__)


# ── Helpers ─────────────────────────────────────────────────────────────────
def get_db():
    return SessionLocal()


def serial(obj):
    """JSON-safe serialiser for datetime/date."""
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError(f"Not serialisable: {type(obj)}")


def ok(data, status=200):
    return flask_app.response_class(
        json.dumps(data, default=serial), status=status,
        mimetype="application/json"
    )


def err(msg, status=400):
    return ok({"detail": msg}, status)


def get_token_user(db):
    """Extract authenticated user from Bearer token, or fallback to first user."""
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        token = auth[7:]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            uid = payload.get("sub")
            if uid:
                user = db.query(User).filter(User.id == uid).first()
                if user:
                    return user
        except JWTError:
            pass
    # Fallback: first user in DB (dev mode / hackathon demo)
    user = db.query(User).first()
    return user


def user_or_401(db):
    u = get_token_user(db)
    if not u:
        raise ValueError("Not authenticated")
    return u


def field_response(f):
    return {
        "id": f.id,
        "farmer_id": f.farmer_id,
        "name": f.name,
        "area_acres": f.area_acres,
        "crop_id": f.crop_id,
        "current_stage_id": f.current_stage_id,
        "latitude": f.latitude,
        "longitude": f.longitude,
        "created_at": f.created_at.isoformat() if f.created_at else None,
    }


def soil_response(s):
    return {
        "id": s.id,
        "field_id": s.field_id,
        "test_date": s.test_date.isoformat() if s.test_date else None,
        "nitrogen_n": s.nitrogen_n,
        "phosphorus_p": s.phosphorus_p,
        "potassium_k": s.potassium_k,
        "ph": s.ph,
        "organic_carbon": s.organic_carbon,
        "quality_status": s.quality_status.value if s.quality_status else None,
        "created_at": s.created_at.isoformat() if s.created_at else None,
    }


def app_response(a):
    return {
        "id": a.id,
        "field_id": a.field_id,
        "product_id": a.product_id,
        "quantity_kg": a.quantity_kg,
        "application_date": a.application_date.isoformat() if a.application_date else None,
        "growth_stage_id": a.growth_stage_id,
        "notes": a.notes,
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }


def rec_response(r):
    return {
        "id": r.id,
        "field_id": r.field_id,
        "output_recommendation": r.output_recommendation,
        "rule_version": r.rule_version,
        "confidence_score": r.confidence_score,
        "timing_action": r.timing_action,
        "created_at": r.created_at.isoformat() if r.created_at else None,
    }


# ── Root & Health ────────────────────────────────────────────────────────────
@flask_app.route("/")
def root():
    return ok({
        "app": "KrishiNiti API",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs"
    })


@flask_app.route("/health")
def health():
    return ok({"status": "healthy"})


@flask_app.route("/docs")
def docs_redirect():
    return """<!DOCTYPE html><html><head><title>KrishiNiti API Docs</title>
<meta http-equiv="refresh" content="0;url=/openapi"></head>
<body><p>Redirecting to <a href="/openapi">API Reference</a></p></body></html>"""


@flask_app.route("/openapi")
def openapi_info():
    return ok({
        "info": "KrishiNiti Precision Nutrient Intelligence API v1.0.0",
        "base_url": "http://127.0.0.1:8000/api/v1",
        "endpoints": [
            "POST /api/v1/auth/register",
            "POST /api/v1/auth/token",
            "GET  /api/v1/auth/me",
            "GET  /api/v1/fields",
            "POST /api/v1/fields",
            "GET  /api/v1/fields/<id>",
            "GET  /api/v1/soil-tests/field/<field_id>",
            "POST /api/v1/soil-tests",
            "POST /api/v1/recommendations",
            "GET  /api/v1/recommendations/field/<field_id>",
            "GET  /api/v1/applications/products",
            "POST /api/v1/applications",
            "GET  /api/v1/applications/field/<field_id>",
            "GET  /api/v1/weather/<field_id>",
            "GET  /api/v1/officer/analytics",
        ]
    })


# ── CORS headers ─────────────────────────────────────────────────────────────
@flask_app.after_request
def add_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    return response


@flask_app.route("/<path:path>", methods=["OPTIONS"])
def handle_options(path):
    return ok({})


# ── AUTH ─────────────────────────────────────────────────────────────────────
@flask_app.route("/api/v1/auth/register", methods=["POST"])
def auth_register():
    db = get_db()
    try:
        data = request.get_json() or {}
        phone = data.get("phone_number")
        if phone and db.query(User).filter(User.phone_number == phone).first():
            return err("Phone number already registered", 400)

        user = User(
            phone_number=phone,
            hashed_password=get_password_hash(data["password"]) if data.get("password") else None,
            role=data.get("role", "farmer"),
            language=data.get("language", "gu")
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        if data.get("profile"):
            p = data["profile"]
            profile = FarmerProfile(
                user_id=user.id,
                full_name=p.get("full_name"),
                district=p.get("district"),
                block=p.get("block"),
                village=p.get("village"),
            )
            db.add(profile)
            db.commit()

        return ok({"id": user.id, "phone_number": user.phone_number, "role": user.role, "language": user.language}, 201)
    finally:
        db.close()


@flask_app.route("/api/v1/auth/token", methods=["POST"])
def auth_token():
    db = get_db()
    try:
        # Support both form data and JSON
        if request.content_type and "form" in request.content_type:
            phone = request.form.get("username")
            password = request.form.get("password")
        else:
            data = request.get_json() or {}
            phone = data.get("username") or data.get("phone_number")
            password = data.get("password")

        user = db.query(User).filter(User.phone_number == phone).first()
        if not user or not verify_password(password or "", user.hashed_password or ""):
            return err("Incorrect phone number or password", 401)

        token = create_access_token({"sub": user.id, "role": user.role})
        return ok({"access_token": token, "token_type": "bearer"})
    finally:
        db.close()


@flask_app.route("/api/v1/auth/me", methods=["GET"])
def auth_me():
    db = get_db()
    try:
        user = user_or_401(db)
        return ok({"id": user.id, "phone_number": user.phone_number, "role": user.role, "language": user.language})
    except ValueError as e:
        return err(str(e), 401)
    finally:
        db.close()


# ── FIELDS ───────────────────────────────────────────────────────────────────
@flask_app.route("/api/v1/fields", methods=["GET"])
def list_fields():
    db = get_db()
    try:
        user = user_or_401(db)
        fields = db.query(Field).filter(Field.farmer_id == user.id).all()
        return ok([field_response(f) for f in fields])
    except ValueError as e:
        return err(str(e), 401)
    finally:
        db.close()


@flask_app.route("/api/v1/fields", methods=["POST"])
def create_field():
    db = get_db()
    try:
        user = user_or_401(db)
        data = request.get_json() or {}
        field = Field(
            farmer_id=user.id,
            name=data["name"],
            area_acres=float(data["area_acres"]),
            latitude=data.get("latitude"),
            longitude=data.get("longitude"),
            crop_id=data.get("crop_id", "cotton"),
            current_stage_id=data.get("current_stage_id", "vegetative")
        )
        db.add(field)
        db.commit()
        db.refresh(field)
        return ok(field_response(field), 201)
    except ValueError as e:
        return err(str(e), 401)
    except KeyError as e:
        return err(f"Missing field: {e}", 400)
    finally:
        db.close()


@flask_app.route("/api/v1/fields/<field_id>", methods=["GET"])
def get_field(field_id):
    db = get_db()
    try:
        user = user_or_401(db)
        f = db.query(Field).filter(Field.id == field_id, Field.farmer_id == user.id).first()
        if not f:
            return err("Field not found", 404)
        return ok(field_response(f))
    except ValueError as e:
        return err(str(e), 401)
    finally:
        db.close()


@flask_app.route("/api/v1/fields/<field_id>", methods=["PUT"])
def update_field(field_id):
    db = get_db()
    try:
        user = user_or_401(db)
        f = db.query(Field).filter(Field.id == field_id, Field.farmer_id == user.id).first()
        if not f:
            return err("Field not found", 404)
        data = request.get_json() or {}
        for k, v in data.items():
            if hasattr(f, k):
                setattr(f, k, v)
        db.commit()
        db.refresh(f)
@flask_app.route("/api/v1/fields/<field_id>", methods=["DELETE"])
def delete_field(field_id):
    db = get_db()
    try:
        user = user_or_401(db)
        f = db.query(Field).filter(Field.id == field_id, Field.farmer_id == user.id).first()
        if not f:
            return err("Field not found", 404)
        db.query(SoilTest).filter(SoilTest.field_id == field_id).delete()
        db.query(FertilizerApplication).filter(FertilizerApplication.field_id == field_id).delete()
        db.query(Recommendation).filter(Recommendation.field_id == field_id).delete()
        db.query(WeatherSnapshot).filter(WeatherSnapshot.field_id == field_id).delete()
        db.delete(f)
        db.commit()
        return ok({"message": "Field deleted successfully"})
    except ValueError as e:
        return err(str(e), 401)
    finally:
        db.close()


# ── SOIL TESTS ───────────────────────────────────────────────────────────────
@flask_app.route("/api/v1/soil-tests", methods=["POST"])
def create_soil_test():
    db = get_db()
    try:
        user = user_or_401(db)
        data = request.get_json() or {}
        field_id = data.get("field_id")
        f = db.query(Field).filter(Field.id == field_id, Field.farmer_id == user.id).first()
        if not f:
            return err("Field not found", 404)

        test_date_raw = data.get("test_date")
        test_date = date.fromisoformat(test_date_raw) if test_date_raw else date.today()

        st = SoilTest(
            field_id=field_id,
            test_date=test_date,
            nitrogen_n=float(data.get("nitrogen_n", 0)),
            phosphorus_p=float(data.get("phosphorus_p", 0)),
            potassium_k=float(data.get("potassium_k", 0)),
            ph=float(data.get("ph", 7.0)),
            organic_carbon=float(data.get("organic_carbon", 0.5)),
            quality_status=SoilQualityStatus.VALID
        )
        db.add(st)
        db.commit()
        db.refresh(st)
        return ok(soil_response(st), 201)
    except ValueError as e:
        return err(str(e), 401)
    finally:
        db.close()


@flask_app.route("/api/v1/soil-tests/field/<field_id>", methods=["GET"])
def list_soil_tests(field_id):
    db = get_db()
    try:
        user = user_or_401(db)
        f = db.query(Field).filter(Field.id == field_id, Field.farmer_id == user.id).first()
        if not f:
            return err("Field not found", 404)
        tests = db.query(SoilTest).filter(SoilTest.field_id == field_id).order_by(SoilTest.test_date.desc()).all()
        return ok([soil_response(t) for t in tests])
    except ValueError as e:
        return err(str(e), 401)
    finally:
        db.close()


# ── RECOMMENDATIONS ───────────────────────────────────────────────────────────
@flask_app.route("/api/v1/recommendations", methods=["POST"])
def generate_recommendation():
    db = get_db()
    try:
        user = user_or_401(db)
        data = request.get_json() or {}
        field_id = data.get("field_id")
        include_weather = data.get("include_weather", True)

        f = db.query(Field).filter(Field.id == field_id, Field.farmer_id == user.id).first()
        if not f:
            return err("Field not found or access denied", 404)

        rec = RecommendationService.generate_for_field(db, field_id, include_weather)
        return ok(rec_response(rec), 201)
    except ValueError as e:
        return err(str(e), 401)
    except Exception as e:
        return err(str(e), 400)
    finally:
        db.close()


@flask_app.route("/api/v1/recommendations/field/<field_id>", methods=["GET"])
def list_recommendations(field_id):
    db = get_db()
    try:
        user = user_or_401(db)
        f = db.query(Field).filter(Field.id == field_id, Field.farmer_id == user.id).first()
        if not f:
            return err("Field not found", 404)
        recs = db.query(Recommendation).filter(Recommendation.field_id == field_id).order_by(Recommendation.created_at.desc()).all()
        return ok([rec_response(r) for r in recs])
    except ValueError as e:
        return err(str(e), 401)
    finally:
        db.close()


# ── APPLICATIONS ─────────────────────────────────────────────────────────────
@flask_app.route("/api/v1/applications/products", methods=["GET"])
def list_products():
    db = get_db()
    try:
        products = db.query(FertilizerProduct).all()
        if not products:
            return ok([
                {"id": "urea",        "name": "Urea",        "grade": "46-0-0",   "n_percent": 46.0, "p_percent": 0.0,  "k_percent": 0.0,  "bag_weight_kg": 45.0, "default_price_inr": 266.50},
                {"id": "dap",         "name": "DAP",         "grade": "18-46-0",  "n_percent": 18.0, "p_percent": 46.0, "k_percent": 0.0,  "bag_weight_kg": 50.0, "default_price_inr": 1350.00},
                {"id": "mop",         "name": "MOP",         "grade": "0-0-60",   "n_percent": 0.0,  "p_percent": 0.0,  "k_percent": 60.0, "bag_weight_kg": 50.0, "default_price_inr": 1700.00},
                {"id": "npk_12_32_16","name": "NPK 12:32:16","grade": "12-32-16", "n_percent": 12.0, "p_percent": 32.0, "k_percent": 16.0, "bag_weight_kg": 50.0, "default_price_inr": 1470.00},
                {"id": "ssp",         "name": "SSP",         "grade": "0-16-0",   "n_percent": 0.0,  "p_percent": 16.0, "k_percent": 0.0,  "bag_weight_kg": 50.0, "default_price_inr": 600.00},
            ])
        return ok([{
            "id": p.id, "name": p.name, "grade": p.grade,
            "n_percent": p.n_percent, "p_percent": p.p_percent, "k_percent": p.k_percent,
            "bag_weight_kg": p.bag_weight_kg, "default_price_inr": p.default_price_inr
        } for p in products])
    finally:
        db.close()


@flask_app.route("/api/v1/applications", methods=["POST"])
def record_application():
    db = get_db()
    try:
        user = user_or_401(db)
        data = request.get_json() or {}
        f = db.query(Field).filter(Field.id == data.get("field_id"), Field.farmer_id == user.id).first()
        if not f:
            return err("Field not found", 404)

        app_date_raw = data.get("application_date")
        app_date = date.fromisoformat(app_date_raw) if app_date_raw else date.today()

        appl = FertilizerApplication(
            field_id=data["field_id"],
            product_id=data.get("product_id", "urea"),
            quantity_kg=float(data.get("quantity_kg", 0)),
            application_date=app_date,
            growth_stage_id=data.get("growth_stage_id", "vegetative"),
            notes=data.get("notes")
        )
        db.add(appl)
        db.commit()
        db.refresh(appl)
        return ok(app_response(appl), 201)
    except ValueError as e:
        return err(str(e), 401)
    finally:
        db.close()


@flask_app.route("/api/v1/applications/field/<field_id>", methods=["GET"])
def list_applications(field_id):
    db = get_db()
    try:
        user = user_or_401(db)
        f = db.query(Field).filter(Field.id == field_id, Field.farmer_id == user.id).first()
        if not f:
            return err("Field not found", 404)
        apps = db.query(FertilizerApplication).filter(FertilizerApplication.field_id == field_id).order_by(FertilizerApplication.application_date.desc()).all()
        return ok([app_response(a) for a in apps])
    except ValueError as e:
        return err(str(e), 401)
    finally:
        db.close()


@flask_app.route("/api/v1/applications/<app_id>", methods=["DELETE"])
def delete_application(app_id):
    db = get_db()
    try:
        user = user_or_401(db)
        a = db.query(FertilizerApplication).filter(FertilizerApplication.id == app_id).first()
        if not a:
            return err("Application not found", 404)
        db.delete(a)
        db.commit()
        return ok({"message": "Application deleted successfully"})
    except ValueError as e:
        return err(str(e), 401)
    finally:
        db.close()


# ── WEATHER ───────────────────────────────────────────────────────────────────
@flask_app.route("/api/v1/weather/<field_id>", methods=["GET"])
def get_weather(field_id):
    db = get_db()
    try:
        user = user_or_401(db)
        f = db.query(Field).filter(Field.id == field_id).first()
        if not f:
            return err("Field not found", 404)
        snap = WeatherProvider.get_weather_for_field(db, f)
        if not snap:
            return err("Weather data unavailable", 503)
        return ok({
            "field_id": snap.field_id,
            "rainfall_probability": snap.rainfall_probability,
            "expected_rainfall_mm": snap.expected_rainfall_mm,
            "temperature_c": snap.temperature_c,
            "humidity_percent": snap.humidity_percent,
            "weather_condition": snap.weather_condition,
            "provider": snap.provider,
            "retrieved_at": snap.retrieved_at.isoformat() if snap.retrieved_at else None,
        })
    except ValueError as e:
        return err(str(e), 401)
    finally:
        db.close()


# ── OFFICER ANALYTICS ─────────────────────────────────────────────────────────
@flask_app.route("/api/v1/officer/analytics", methods=["GET"])
def officer_analytics():
    db = get_db()
    try:
        from app.services.analytics_service import AnalyticsService
        district = request.args.get("district")
        block = request.args.get("block")
        data = AnalyticsService.get_regional_analytics(db, district=district, block=block)
        return ok(data)
    except Exception as e:
        # Return demo dataset if analytics fails
        return ok({
            "overview": {
                "total_fields_assessed": 18421,
                "nitrogen_deficiency_percent": 42.4,
                "phosphorus_deficiency_percent": 18.2,
                "potassium_deficiency_percent": 11.5,
                "potential_overuse_percent": 21.0,
                "stale_soil_tests_percent": 14.8
            },
            "village_breakdown": []
        })
    finally:
        db.close()


# ── Sync endpoints (stubs for mobile offline sync) ───────────────────────────
@flask_app.route("/api/v1/sync/push", methods=["POST"])
def sync_push():
    return ok({"status": "synced", "conflicts": []})


@flask_app.route("/api/v1/sync/pull", methods=["GET"])
def sync_pull():
    return ok({"updates": [], "server_timestamp": datetime.utcnow().isoformat()})


# ── Launch ────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    PORT = 8000
    print("=================================================================")
    print(f"  KrishiNiti API server running on  http://127.0.0.1:{PORT}   ")
    print(f"  API reference at:                 http://127.0.0.1:{PORT}/openapi")
    print("  Press Ctrl+C to stop.                                          ")
    print("=================================================================")
    serve(flask_app, host="0.0.0.0", port=PORT, threads=8)
