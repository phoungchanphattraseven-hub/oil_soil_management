-- ============================================================
-- FULL DATABASE SCHEMA — Station Management Operations
-- Run ALL of this in Supabase SQL Editor as one query
-- ============================================================

-- Step 1: Drop everything first
DROP TABLE IF EXISTS fuel_logs CASCADE;
DROP TABLE IF EXISTS soil_logs CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS fuel_stations CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Step 2: Create enum
CREATE TYPE user_role AS ENUM ('admin', 'phattra', 'user');

-- Step 3: Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    password_hash TEXT,
    role user_role NOT NULL DEFAULT 'phattra',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create fuel_stations table
CREATE TABLE fuel_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    current_stock_liters NUMERIC(10, 2) DEFAULT 6000.00,
    target_capacity_liters NUMERIC(10, 2) DEFAULT 6000.00,
    reorder_threshold_liters NUMERIC(10, 2) DEFAULT 4000.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Create staff table
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(20) DEFAULT 'Male',
    station_name VARCHAR(100),
    license_plate VARCHAR(50),
    phone VARCHAR(50),
    role VARCHAR(50),
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Create fuel_logs table
CREATE TABLE fuel_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID REFERENCES fuel_stations(id) ON DELETE CASCADE,
    logged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    driver_name VARCHAR(100),
    license_plate VARCHAR(50),
    refill_liters NUMERIC(10, 2) NOT NULL DEFAULT 0,
    oil_in NUMERIC(10, 2) NOT NULL DEFAULT 0,
    time_in TIMESTAMP WITH TIME ZONE NOT NULL,
    time_out TIMESTAMP WITH TIME ZONE,
    shift VARCHAR(20) DEFAULT 'Morning',
    code_abbr VARCHAR(50),
    photo_url TEXT,
    signature_url TEXT,
    status VARCHAR(20) DEFAULT 'Completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 7: Create soil_logs table
CREATE TABLE soil_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_name VARCHAR(100) NOT NULL,
    code_abbr VARCHAR(50),
    logged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    trip_count INT NOT NULL,
    cubic_meters_per_trip NUMERIC(10, 2) NOT NULL,
    total_cubic_meters NUMERIC(10, 2) GENERATED ALWAYS AS (trip_count * cubic_meters_per_trip) STORED,
    scrap_sales_amount NUMERIC(10, 2) DEFAULT 0.00,
    staff_decisions TEXT,
    issues_description TEXT,
    receipt_photo_url TEXT,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    time_start TIME NOT NULL,
    time_end TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 8: Insert seed users (run this in Supabase SQL editor if users table is empty)
-- The main admin uses .env credentials and doesn't need a DB record
-- These are example starters only:
INSERT INTO users (username, role) VALUES ('admin@company.com', 'admin') ON CONFLICT (username) DO NOTHING;
INSERT INTO users (username, role) VALUES ('phattra', 'phattra') ON CONFLICT (username) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────
-- MIGRATION: Run this in Supabase SQL editor if DB already exists
-- (safe to run multiple times — uses IF NOT EXISTS / DO NOTHING)
-- ─────────────────────────────────────────────────────────────────
-- 1. Add 'user' value to existing enum (skip if already present):
--    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'user';
--
-- 2. Add new columns if not already there:
--    ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(100);
--    ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
--    ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
--    ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
-- ─────────────────────────────────────────────────────────────────

-- Step 9: Insert station Y34
INSERT INTO fuel_stations (station_name, location, current_stock_liters, target_capacity_liters, reorder_threshold_liters)
VALUES ('Y34', 'National Road 4', 6000.00, 6000.00, 4000.00);

-- Step 10: Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_logs ENABLE ROW LEVEL SECURITY;

-- Step 11: Create RLS policies
CREATE POLICY "Allow all access to users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to fuel_stations" ON fuel_stations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to staff" ON staff FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to fuel_logs" ON fuel_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to soil_logs" ON soil_logs FOR ALL USING (true) WITH CHECK (true);


