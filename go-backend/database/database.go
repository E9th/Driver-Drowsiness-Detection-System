package database

import (
	"database/sql"
	"log"

	"driver-drowsiness-backend/config"

	_ "github.com/lib/pq"
)

var DB *sql.DB

// Connect establishes database connection
func Connect() error {
	var err error
	
	connStr := config.GetDatabaseURL()
	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		return err
	}

	// Test connection
	err = DB.Ping()
	if err != nil {
		return err
	}

	log.Println("✅ Database connected successfully")
	return nil
}

// Close closes database connection
func Close() {
	if DB != nil {
		DB.Close()
		log.Println("🔌 Database connection closed")
	}
}

// Migrate creates database tables if they don't exist
func Migrate() error {
	log.Println("📊 Running database migrations...")

	// Create devices table
	_, err := DB.Exec(`
		CREATE TABLE IF NOT EXISTS devices (
			id VARCHAR(50) PRIMARY KEY,
			driver_email VARCHAR(255) NOT NULL,
			status VARCHAR(50) DEFAULT 'active',
			last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		return err
	}

	// Create drowsiness_data table
	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS drowsiness_data (
			id SERIAL PRIMARY KEY,
			device_id VARCHAR(50) NOT NULL,
			eye_closure FLOAT NOT NULL,
			drowsiness_level VARCHAR(50) NOT NULL,
			status VARCHAR(50) NOT NULL,
			timestamp TIMESTAMP NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
		)
	`)
	if err != nil {
		return err
	}

	// Create index on device_id and timestamp for faster queries
	_, err = DB.Exec(`
		CREATE INDEX IF NOT EXISTS idx_drowsiness_device_timestamp 
		ON drowsiness_data(device_id, timestamp DESC)
	`)
	if err != nil {
		return err
	}

	// Create alerts table
	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS alerts (
			id SERIAL PRIMARY KEY,
			device_id VARCHAR(50) NOT NULL,
			alert_type VARCHAR(100) NOT NULL,
			severity VARCHAR(50) NOT NULL,
			acknowledged BOOLEAN DEFAULT FALSE,
			status VARCHAR(50) DEFAULT 'active',
			timestamp TIMESTAMP NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
		)
	`)
	if err != nil {
		return err
	}

	// Create index on device_id for faster queries
	_, err = DB.Exec(`
		CREATE INDEX IF NOT EXISTS idx_alerts_device 
		ON alerts(device_id, timestamp DESC)
	`)
	if err != nil {
		return err
	}

	log.Println("✅ Database migrations completed successfully")
	return nil
}

// SeedDevices inserts sample devices for testing
func SeedDevices() error {
	log.Println("🌱 Seeding sample devices...")

	devices := []struct {
		id    string
		email string
	}{
		{"device_01", "driver01@gmail.com"},
		{"device_02", "driver02@gmail.com"},
	}

	for _, device := range devices {
		_, err := DB.Exec(`
			INSERT INTO devices (id, driver_email, status)
			VALUES ($1, $2, 'active')
			ON CONFLICT (id) DO NOTHING
		`, device.id, device.email)
		
		if err != nil {
			log.Printf("Warning: Could not seed device %s: %v", device.id, err)
		}
	}

	log.Println("✅ Sample devices seeded")
	return nil
}
