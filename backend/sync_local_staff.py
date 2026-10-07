"""
sync_local_staff.py — One-time script to sync staff from localStorage export -> Supabase.

HOW TO USE:
1. Open your browser DevTools (F12) -> Console
2. Run this command to get your locally stored staff:
       copy(JSON.stringify(JSON.parse(localStorage.getItem('app_staff'))))
3. Paste the JSON output into the STAFF_JSON variable below (replace the placeholder)
4. Run: python backend/sync_local_staff.py
"""

import os
import json
from pathlib import Path
from supabase import create_client

# --- PASTE YOUR STAFF JSON HERE -----------------------------------------------
# Paste the output from: JSON.stringify(JSON.parse(localStorage.getItem('app_staff')))
STAFF_JSON = """
PASTE_YOUR_JSON_HERE
"""
# ------------------------------------------------------------------------------

def load_env(p):
    if os.path.exists(p):
        with open(p, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ[k.strip()] = v.strip()

root_dir = Path(__file__).resolve().parent.parent
load_env(root_dir / ".env")

url = os.environ.get("supabase_url") or os.environ.get("SUPABASE_URL")
key = os.environ.get("supabase_role_service_key") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Supabase URL or KEY not found in .env!")
    exit(1)

client = create_client(url, key)

if STAFF_JSON.strip() == "PASTE_YOUR_JSON_HERE":
    print("ERROR: You must paste your staff JSON into the STAFF_JSON variable first!")
    print()
    print("Steps:")
    print("1. Open browser DevTools (F12) -> Console tab")
    print("2. Run: copy(JSON.stringify(JSON.parse(localStorage.getItem('app_staff'))))")
    print("3. Paste the copied JSON into this script's STAFF_JSON variable")
    print("4. Run this script again")
    exit(1)

try:
    staff_list = json.loads(STAFF_JSON.strip())
except json.JSONDecodeError as e:
    print(f"Invalid JSON: {e}")
    exit(1)

if not isinstance(staff_list, list):
    print("Expected a JSON array of staff members.")
    exit(1)

print(f"Found {len(staff_list)} staff members to sync...")

success_count = 0
skip_count = 0
error_count = 0

for member in staff_list:
    name = member.get("name", "?")
    member_id = member.get("id", "")

    # Check if it's a temp (non-UUID) id - these were never saved to Supabase
    is_temp_id = not member_id or member_id.startswith("staff-")

    # Build insert payload (only Supabase columns)
    insert_data = {
        "name": member.get("name", ""),
        "gender": member.get("gender") or "Male",
        "station_name": member.get("working_at") or member.get("station_name") or "",
        "license_plate": member.get("license_plate") or "",
        "phone": member.get("phone") or "",
        "role": member.get("role") or "Driver",
        "photo_url": member.get("photo_url") or "",
        "signature_url": member.get("signature_url") or "",
    }

    try:
        if is_temp_id:
            # New insert - no existing UUID
            res = client.table("staff").insert(insert_data).execute()
            print(f"  INSERTED: {name}  (new UUID: {res.data[0]['id']})")
            success_count += 1
        else:
            # Check if already exists in Supabase by UUID
            existing = client.table("staff").select("id").eq("id", member_id).execute()
            if existing.data:
                print(f"  SKIPPED (already in Supabase): {name}")
                skip_count += 1
            else:
                # Insert with known UUID
                insert_data["id"] = member_id
                res = client.table("staff").insert(insert_data).execute()
                print(f"  INSERTED: {name}  (UUID: {member_id})")
                success_count += 1
    except Exception as e:
        print(f"  ERROR for {name}: {e}")
        error_count += 1

print()
print(f"Done! Inserted: {success_count}  Skipped: {skip_count}  Errors: {error_count}")
