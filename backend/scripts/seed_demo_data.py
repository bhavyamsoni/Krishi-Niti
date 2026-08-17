import uuid
from datetime import datetime, date, timedelta
from app.database import Base, engine, SessionLocal
from app.models import User, FarmerProfile, Field, SoilTest, SoilQualityStatus, FertilizerApplication, UserRole, Language

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("Seeding KrishiNiti Demo Data...")

    # 1. Create Demo Farmers
    farmers_data = [
        {
            "name": "Rameshbhai Patel (રમેશભાઈ પટેલ)",
            "phone": "9825012345",
            "district": "Rajkot",
            "block": "Gondal",
            "village": "Moviya (મોવીયા)",
            "lang": Language.GUJARATI,
            "fields": [
                {
                    "name": "North Field - Cotton (કપાસ પ્લોટ ૧)",
                    "area": 2.5,
                    "crop": "cotton",
                    "stage": "flowering",
                    "lat": 21.9619,
                    "lng": 70.7923,
                    "soil": {
                        "days_ago": 45,
                        "n": 175.0,  # Low Nitrogen
                        "p": 24.0,   # Adequate
                        "k": 220.0,  # Adequate
                        "ph": 7.2,
                        "oc": 0.52
                    },
                    "apps": [
                        {"product": "dap", "qty": 50.0, "stage": "basal", "days_ago": 40}
                    ]
                },
                {
                    "name": "South Field - Groundnut (મગફળી પ્લોટ ૨)",
                    "area": 3.0,
                    "crop": "groundnut",
                    "stage": "flowering",
                    "lat": 21.9650,
                    "lng": 70.7950,
                    "soil": {
                        "days_ago": 60,
                        "n": 240.0,
                        "p": 18.0,
                        "k": 190.0,
                        "ph": 7.4,
                        "oc": 0.60
                    },
                    "apps": []
                }
            ]
        },
        {
            "name": "Savitaben Vasava (સવિતાબેન વસાવા)",
            "phone": "9825054321",
            "district": "Rajkot",
            "block": "Jasdan",
            "village": "Atkot (આટકોટ)",
            "lang": Language.GUJARATI,
            "fields": [
                {
                    "name": "River Field - Wheat (ઘઉં ખેતર)",
                    "area": 4.0,
                    "crop": "wheat",
                    "stage": "tillering",
                    "lat": 22.0125,
                    "lng": 71.2014,
                    "soil": {
                        "days_ago": 30,
                        "n": 190.0,
                        "p": 12.0,
                        "k": 160.0,
                        "ph": 6.8,
                        "oc": 0.48
                    },
                    "apps": [
                        {"product": "dap", "qty": 100.0, "stage": "basal", "days_ago": 25}
                    ]
                }
            ]
        },
        {
            "name": "Mohanbhai Ahir (મોહનભાઈ આહીર)",
            "phone": "9825098765",
            "district": "Amreli",
            "block": "Babra",
            "village": "Kariyana (કરીયાણા)",
            "lang": Language.HINDI,
            "fields": [
                {
                    "name": "Babra Plot - Cotton (कपास खेत)",
                    "area": 5.0,
                    "crop": "cotton",
                    "stage": "flowering",
                    "lat": 21.8480,
                    "lng": 71.3050,
                    "soil": {
                        "days_ago": 15,
                        "n": 140.0,  # Very Low Nitrogen
                        "p": 20.0,
                        "k": 200.0,
                        "ph": 7.5,
                        "oc": 0.45
                    },
                    "apps": []
                }
            ]
        }
    ]

    for f_info in farmers_data:
        user = db.query(User).filter(User.phone_number == f_info["phone"]).first()
        if not user:
            user = User(
                phone_number=f_info["phone"],
                role=UserRole.FARMER,
                language=f_info["lang"]
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            profile = FarmerProfile(
                user_id=user.id,
                full_name=f_info["name"],
                district=f_info["district"],
                block=f_info["block"],
                village=f_info["village"]
            )
            db.add(profile)
            db.commit()

        for fld in f_info["fields"]:
            field_obj = Field(
                farmer_id=user.id,
                name=fld["name"],
                area_acres=fld["area"],
                crop_id=fld["crop"],
                current_stage_id=fld["stage"],
                latitude=fld["lat"],
                longitude=fld["lng"]
            )
            db.add(field_obj)
            db.commit()
            db.refresh(field_obj)

            # Soil Test
            s = fld["soil"]
            st = SoilTest(
                field_id=field_obj.id,
                test_date=date.today() - timedelta(days=s["days_ago"]),
                nitrogen_n=s["n"],
                phosphorus_p=s["p"],
                potassium_k=s["k"],
                ph=s["ph"],
                organic_carbon=s["oc"],
                quality_status=SoilQualityStatus.VALID
            )
            db.add(st)

            # Applications
            for a in fld["apps"]:
                app_obj = FertilizerApplication(
                    field_id=field_obj.id,
                    product_id=a["product"],
                    quantity_kg=a["qty"],
                    application_date=date.today() - timedelta(days=a["days_ago"]),
                    growth_stage_id=a["stage"]
                )
                db.add(app_obj)

            db.commit()

    print("Demo dataset seeded successfully!")

if __name__ == "__main__":
    seed()
