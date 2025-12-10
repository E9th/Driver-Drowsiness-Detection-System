-- Database schema for Driver Drowsiness Detection System
-- Focus: registration/auth for drivers + device linkage

-- USERS: account & profile for each person who registers
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name VARCHAR(100),              -- full name (first + last)
    role VARCHAR(50) DEFAULT 'driver',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure new profile columns exist even if users table was created earlier
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS company VARCHAR(255);

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS user_type VARCHAR(50);

-- DEVICES: physical monitoring devices that send drowsiness data
CREATE TABLE IF NOT EXISTS devices (
    id VARCHAR(50) PRIMARY KEY,     -- Device ID from register form (e.g. device_01)
    driver_email VARCHAR(255) NOT NULL,
    user_id INT,                    -- FK to users.id (owner)
    status VARCHAR(50) DEFAULT 'active',
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_devices_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Index to quickly find devices by user
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);

-- DROWSINESS DATA: raw detection events per device
CREATE TABLE IF NOT EXISTS drowsiness_data (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    eye_closure FLOAT NOT NULL,
    drowsiness_level VARCHAR(50) NOT NULL,  -- low / medium / high
    status VARCHAR(50) NOT NULL,            -- text status shown on dashboard
    timestamp TIMESTAMP NOT NULL,           -- server-side event time
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_drowsiness_device FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

-- Index for dashboard queries by device + time
CREATE INDEX IF NOT EXISTS idx_drowsiness_device_timestamp 
ON drowsiness_data(device_id, timestamp DESC);

-- ALERTS: summarized alert events per device
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,          -- e.g. warning / danger
    acknowledged BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'active',
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alerts_device FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

-- Index for alert queries by device + time
CREATE INDEX IF NOT EXISTS idx_alerts_device 
ON alerts(device_id, timestamp DESC);

-- OPTIONAL: seed sample devices for quick testing (safe to re-run)
INSERT INTO devices (id, driver_email, status)
VALUES ('device_01', 'driver01@gmail.com', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO devices (id, driver_email, status)
VALUES ('device_02', 'driver02@gmail.com', 'active')
ON CONFLICT (id) DO NOTHING;
