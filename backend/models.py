from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date, time

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
    time_in: str
    time_out: Optional[str] = None
    shift: Optional[str] = "Morning"
    code_abbr: Optional[str] = ""
    photo_url: Optional[str] = ""
    signature_url: Optional[str] = ""  # Fixed missing field from spec

class SoilLogInput(BaseModel):
    station_name: str
    code_abbr: Optional[str] = "SL-STN-001"
    logged_by: Optional[str] = None
    trip_count: int
    cubic_meters_per_trip: float
    scrap_sales_amount: float = 0.0
    staff_decisions: Optional[str] = None  # Point 3.2: «ការសម្រេចចិត្តរបស់បុគ្គលិក»
    issues_description: Optional[str] = None
    receipt_photo_url: Optional[str] = ""  # Made optional to match corrected schema
    log_date: Optional[str] = None
    time_start: str = "07:00"
    time_end: str = "17:30"
