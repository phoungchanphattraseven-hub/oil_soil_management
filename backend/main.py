import os
import uuid
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Dict, Any
from supabase import create_client, Client
from pydantic import BaseModel

# Helper to load .env
def load_env_file(env_path):
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    os.environ[key.strip()] = val.strip()

root_dir = Path(__file__).resolve().parent.parent
load_env_file(root_dir / ".env")
load_env_file(Path(__file__).resolve().parent / ".env")

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("supabase_url")
SUPABASE_KEY = (
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or 
    os.environ.get("supabase_role_service_key")
)

supabase: Optional[Client] = None
if SUPABASE_URL and SUPABASE_KEY and "your-supabase" not in SUPABASE_URL:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("Connected to Supabase at:", SUPABASE_URL)
    except Exception as e:
        print(f"Warning: Failed to initialize Supabase client: {e}")

def is_valid_uuid(val: Any) -> bool:
    if not val:
        return False
    try:
        uuid.UUID(str(val))
        return True
    except ValueError:
        return False

app = FastAPI(title="Station Management Operations API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StationInput(BaseModel):
    name: str
    location: Optional[str] = "Station Site"
    current_stock_liters: float = 6000.0
    target_capacity_liters: float = 6000.0
    reorder_threshold_liters: float = 4000.0

class FuelLogInput(BaseModel):
    station_id: Optional[str] = None
    station_name: Optional[str] = "Station"
    logged_by: Optional[str] = None
    log_date: Optional[str] = None
    description: Optional[str] = "A Refueled Car"
    driver_name: Optional[str] = None
    license_plate: Optional[str] = ""
    refill_liters: float = 0.0
    oil_in: float = 0.0
    time_in: Optional[str] = ""
    time_out: Optional[str] = None
    shift: Optional[str] = "Morning"
    code_abbr: Optional[str] = ""
    photo_url: Optional[str] = ""
    signature_url: Optional[str] = ""

class SoilLogInput(BaseModel):
    station_name: str
    code_abbr: Optional[str] = "SL-STN-001"
    logged_by: Optional[str] = None
    trip_count: int
    cubic_meters_per_trip: float
    scrap_sales_amount: float = 0.0
    staff_decisions: Optional[str] = None
    issues_description: Optional[str] = None
    receipt_photo_url: Optional[str] = ""
    log_date: Optional[str] = None
    time_start: Optional[str] = "07:00"
    time_end: Optional[str] = "17:30"

class StaffInput(BaseModel):
    name: str
    gender: Optional[str] = "Male"
    station_name: Optional[str] = ""
    license_plate: Optional[str] = ""
    phone: Optional[str] = ""
    role: Optional[str] = "Driver"
    photo_url: Optional[str] = ""
    signature_url: Optional[str] = ""

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "Station Management Operations API",
        "supabase_connected": supabase is not None,
        "supabase_url": SUPABASE_URL if SUPABASE_URL else "Not set"
    }

# ──────────────────────────────────────────────
# Auth Endpoint — validates against .env credentials
# ──────────────────────────────────────────────

class LoginInput(BaseModel):
    email: str
    password: str

@app.post("/api/auth/login")
def login(data: LoginInput):
    admin_email    = os.environ.get("email", "").strip().lower()
    admin_password = os.environ.get("password", "").strip()

    if not admin_email or not admin_password:
        raise HTTPException(status_code=500, detail="Server credentials not configured in .env")

    if data.email.strip().lower() != admin_email or data.password != admin_password:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    import secrets
    token = secrets.token_hex(32)
    return {
        "status": "success",
        "token": token,
        "email": admin_email,
        "message": "Login successful"
    }

@app.get("/api/dashboard/summary")
def get_dashboard_summary():
    if not supabase:
        return {"stations": [], "fuel_logs": [], "soil_logs": [], "staff": [], "message": "Supabase client not initialized"}

    try:
        fuel_stations = supabase.table("fuel_stations").select("*").execute()
        soil_data = supabase.table("soil_logs").select("*").execute()
        fuel_logs_data = supabase.table("fuel_logs").select("*").execute()
        staff_data = supabase.table("staff").select("*").execute()
        return {
            "stations": fuel_stations.data or [],
            "soil_logs": soil_data.data or [],
            "fuel_logs": fuel_logs_data.data or [],
            "staff": staff_data.data or []
        }
    except Exception as err:
        print("Error in /api/dashboard/summary:", str(err))
        return {"stations": [], "soil_logs": [], "fuel_logs": [], "staff": [], "error": str(err)}

@app.post("/api/fuel/station")
def create_fuel_station(data: StationInput):
    if not supabase:
        return {"status": "demo", "data": data.dict()}
    try:
        res = supabase.table("fuel_stations").insert({
            "station_name": data.name,
            "location": data.location,
            "current_stock_liters": data.current_stock_liters,
            "target_capacity_liters": data.target_capacity_liters,
            "reorder_threshold_liters": data.reorder_threshold_liters
        }).execute()
        return {"status": "success", "data": res.data}
    except Exception as err:
        print("Error creating station:", str(err))
        raise HTTPException(status_code=500, detail=str(err))

@app.delete("/api/fuel/station/{station_id}")
def delete_fuel_station(station_id: str):
    if not supabase:
        return {"status": "demo", "message": f"Station {station_id} deleted (demo mode)"}
    try:
        if is_valid_uuid(station_id):
            # First cleanup any fuel logs associated with this station to avoid FK violation
            try:
                supabase.table("fuel_logs").delete().eq("station_id", station_id).execute()
            except Exception as log_err:
                print("Note cleaning fuel_logs:", str(log_err))

            res = supabase.table("fuel_stations").delete().eq("id", station_id).execute()
            return {"status": "success", "data": res.data}
        else:
            return {"status": "success", "message": f"Demo/mock station {station_id} removed"}
    except Exception as err:
        print("Error deleting station:", str(err))
        raise HTTPException(status_code=500, detail=str(err))

@app.delete("/api/fuel/log/{log_id}")
def delete_fuel_log(log_id: str):
    if not supabase:
        return {"status": "demo", "message": f"Fuel log {log_id} deleted (demo mode)"}
    try:
        if is_valid_uuid(log_id):
            res = supabase.table("fuel_logs").delete().eq("id", log_id).execute()
            return {"status": "success", "data": res.data}
        else:
            return {"status": "success", "message": f"Local fuel log {log_id} removed"}
    except Exception as err:
        print("Error deleting fuel log:", str(err))
        raise HTTPException(status_code=500, detail=str(err))

@app.delete("/api/fuel/logs/clear")
def clear_all_fuel_logs():
    if not supabase:
        return {"status": "demo", "message": "All fuel logs cleared (demo mode)"}
    try:
        res = supabase.table("fuel_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        return {"status": "success", "message": "All active fuel logs cleared from database"}
    except Exception as err:
        print("Error clearing fuel logs:", str(err))
        raise HTTPException(status_code=500, detail=str(err))


@app.put("/api/fuel/log/{log_id}")
def update_fuel_log(log_id: str, data: FuelLogInput):
    if not supabase:
        return {"status": "demo", "data": data.dict()}
    try:
        if not is_valid_uuid(log_id):
            return {"status": "success", "message": f"Local fuel log {log_id} updated (no Supabase sync needed)"}

        # Fetch existing log to calculate stock delta
        existing = supabase.table("fuel_logs").select("refill_liters, oil_in, station_id").eq("id", log_id).execute()
        old_out = 0.0
        old_in = 0.0
        station_id_from_db = None
        if existing.data and len(existing.data) > 0:
            old_out = float(existing.data[0].get("refill_liters") or 0)
            old_in = float(existing.data[0].get("oil_in") or 0)
            station_id_from_db = existing.data[0].get("station_id")

        update_data = {
            "description": data.description or "",
            "driver_name": data.driver_name or "",
            "license_plate": data.license_plate or "",
            "refill_liters": data.refill_liters,
            "oil_in": data.oil_in,
            "time_in": data.time_in,
            "shift": data.shift or "Morning",
            "code_abbr": data.code_abbr or "",
        }
        if data.log_date:
            update_data["log_date"] = data.log_date

        res = supabase.table("fuel_logs").update(update_data).eq("id", log_id).execute()

        # Reconcile station stock: undo old values, apply new values
        target_id = station_id_from_db or (data.station_id if is_valid_uuid(data.station_id) else None)
        if target_id:
            try:
                st = supabase.table("fuel_stations").select("current_stock_liters").eq("id", target_id).execute()
                if st.data and len(st.data) > 0:
                    current = float(st.data[0]["current_stock_liters"])
                    # Undo old effect, apply new effect
                    new_stock = max(0.0, current + old_out - old_in - data.refill_liters + data.oil_in)
                    supabase.table("fuel_stations").update({"current_stock_liters": new_stock}).eq("id", target_id).execute()
            except Exception as st_err:
                print("Stock reconcile warning on edit:", st_err)

        return {"status": "success", "data": res.data}
    except Exception as err:
        print("Error updating fuel log:", str(err))
        raise HTTPException(status_code=500, detail=str(err))



@app.post("/api/fuel/log")
def log_fuel_entry(data: FuelLogInput):
    if not supabase:
        return {"status": "demo", "data": data.dict()}

    try:
        target_station_id = None

        # Check if station_id is valid UUID
        if is_valid_uuid(data.station_id):
            target_station_id = data.station_id
        elif data.station_name:
            # Try to lookup station UUID by station_name in Supabase
            try:
                st_match = supabase.table("fuel_stations").select("id").eq("station_name", data.station_name).execute()
                if st_match.data and len(st_match.data) > 0:
                    target_station_id = st_match.data[0]["id"]
            except Exception as find_err:
                print("Station name lookup note:", find_err)

        insert_data = {
            "description": data.description or "",
            "driver_name": data.driver_name or "",
            "refill_liters": data.refill_liters,
            "oil_in": data.oil_in,
            "license_plate": data.license_plate or "",
            "time_in": data.time_in,
            "time_out": data.time_out,
            "shift": data.shift or "Morning",
            "code_abbr": data.code_abbr or "",
            "photo_url": data.photo_url or "",
            "signature_url": data.signature_url or "",
            "status": "Completed"
        }

        if data.log_date:
            insert_data["log_date"] = data.log_date

        if target_station_id:
            insert_data["station_id"] = target_station_id

        # Insert fuel log into Supabase
        res = supabase.table("fuel_logs").insert(insert_data).execute()

        # Update station stock if station is linked
        if target_station_id:
            try:
                st = supabase.table("fuel_stations").select("current_stock_liters").eq("id", target_station_id).execute()
                if st.data and len(st.data) > 0:
                    old_stock = float(st.data[0]["current_stock_liters"])
                    new_stock = max(0.0, old_stock - data.refill_liters + data.oil_in)
                    supabase.table("fuel_stations").update({"current_stock_liters": new_stock}).eq("id", target_station_id).execute()
            except Exception as st_err:
                print("Station stock update warning:", st_err)

        print("Fuel Log saved to Supabase successfully!")
        return {"status": "success", "data": res.data}
    except Exception as err:
        print("Error logging fuel:", str(err))
        raise HTTPException(status_code=500, detail=str(err))

@app.post("/api/soil/log")
def log_soil_entry(data: SoilLogInput):
    if not supabase:
        return {"status": "demo", "data": data.dict()}

    try:
        # Build insert dict explicitly — exclude total_cubic_meters (GENERATED column)
        insert_data = {
            "station_name": data.station_name,
            "code_abbr": data.code_abbr or "SL-STN-001",
            "trip_count": data.trip_count,
            "cubic_meters_per_trip": data.cubic_meters_per_trip,
            "scrap_sales_amount": data.scrap_sales_amount,
            "staff_decisions": data.staff_decisions,
            "issues_description": data.issues_description,
            "receipt_photo_url": data.receipt_photo_url or "",
            "time_start": data.time_start,
            "time_end": data.time_end
        }

        # Add log_date if provided
        if data.log_date:
            insert_data["log_date"] = data.log_date

        # Ensure logged_by is valid UUID or None to prevent foreign key errors
        if is_valid_uuid(data.logged_by):
            insert_data["logged_by"] = data.logged_by
        else:
            insert_data["logged_by"] = None

        res = supabase.table("soil_logs").insert(insert_data).execute()
        print("Soil Log saved to Supabase successfully!")
        return {"status": "success", "data": res.data}
    except Exception as err:
        print("Error logging soil:", str(err))
        raise HTTPException(status_code=500, detail=str(err))

# ──────────────────────────────────────────────
# Staff CRUD Endpoints
# ──────────────────────────────────────────────

@app.get("/api/staff")
def get_all_staff():
    if not supabase:
        return {"status": "demo", "data": []}
    try:
        res = supabase.table("staff").select("*").order("created_at", desc=False).execute()
        return {"status": "success", "data": res.data or []}
    except Exception as err:
        print("Error fetching staff:", str(err))
        raise HTTPException(status_code=500, detail=str(err))

@app.post("/api/staff")
def create_staff(data: StaffInput):
    if not supabase:
        return {"status": "demo", "data": data.dict()}
    try:
        insert_data = {
            "name": data.name,
            "gender": data.gender or "Male",
            "station_name": data.station_name or "",
            "license_plate": data.license_plate or "",
            "phone": data.phone or "",
            "role": data.role or "Driver",
            "photo_url": data.photo_url or "",
            "signature_url": data.signature_url or "",
        }
        res = supabase.table("staff").insert(insert_data).execute()
        print(f"Staff '{data.name}' created in Supabase!")
        return {"status": "success", "data": res.data}
    except Exception as err:
        print("Error creating staff:", str(err))
        raise HTTPException(status_code=500, detail=str(err))

@app.put("/api/staff/{staff_id}")
def update_staff(staff_id: str, data: StaffInput):
    if not supabase:
        return {"status": "demo", "data": data.dict()}
    try:
        update_data = {
            "name": data.name,
            "gender": data.gender or "Male",
            "station_name": data.station_name or "",
            "license_plate": data.license_plate or "",
            "phone": data.phone or "",
            "role": data.role or "Driver",
            "photo_url": data.photo_url or "",
            "signature_url": data.signature_url or "",
        }
        if is_valid_uuid(staff_id):
            res = supabase.table("staff").update(update_data).eq("id", staff_id).execute()
            return {"status": "success", "data": res.data}
        else:
            return {"status": "success", "message": f"Demo staff {staff_id} updated"}
    except Exception as err:
        print("Error updating staff:", str(err))
        raise HTTPException(status_code=500, detail=str(err))

@app.delete("/api/staff/{staff_id}")
def delete_staff(staff_id: str):
    if not supabase:
        return {"status": "demo", "message": f"Staff {staff_id} deleted (demo mode)"}
    try:
        if is_valid_uuid(staff_id):
            res = supabase.table("staff").delete().eq("id", staff_id).execute()
            return {"status": "success", "data": res.data}
        else:
            return {"status": "success", "message": f"Demo/mock staff {staff_id} removed"}
    except Exception as err:
        print("Error deleting staff:", str(err))
        raise HTTPException(status_code=500, detail=str(err))
