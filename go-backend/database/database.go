package database

import (
	"database/sql"
	"log"
	"time"

	"driver-drowsiness-backend/config"
	"driver-drowsiness-backend/models"

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
			user_id INT,
			status VARCHAR(50) DEFAULT 'active',
			last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			CONSTRAINT fk_devices_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
		)
	`)
	if err != nil {
		return err
	}

	// If devices table existed before, ensure user_id column exists (idempotent)
	_, _ = DB.Exec(`
		ALTER TABLE devices
		ADD COLUMN IF NOT EXISTS user_id INT;
	`)

	// Ensure FK constraint exists (ignore if already there)
	_, _ = DB.Exec(`
		DO $$
		BEGIN
		  IF NOT EXISTS (
		    SELECT 1 FROM pg_constraint WHERE conname = 'fk_devices_user'
		  ) THEN
		    ALTER TABLE devices
		    ADD CONSTRAINT fk_devices_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
		  END IF;
		END $$;
	`)

	// Backfill user_id from driver_email when possible
	_, _ = DB.Exec(`
		UPDATE devices d
		SET user_id = u.id
		FROM users u
		WHERE d.driver_email = u.email AND (d.user_id IS NULL OR d.user_id <> u.id);
	`)

	// Index for user_id
	_, _ = DB.Exec(`
		CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);
	`)

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

	// Create users table (authentication)
	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			email VARCHAR(255) UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			name VARCHAR(100),
			role VARCHAR(50) DEFAULT 'driver',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		return err
	}

	log.Println("✅ Database migrations completed successfully")
	return nil
}

// CreateUser inserts a new user
func CreateUser(email, passwordHash, name, role string) (int, error) {
	var id int
	err := DB.QueryRow(`
		INSERT INTO users (email, password_hash, name, role)
		VALUES ($1, $2, $3, COALESCE($4, 'driver'))
		RETURNING id
	`, email, passwordHash, name, role).Scan(&id)
	return id, err
}

// GetUserByEmail retrieves user by email
func GetUserByEmail(email string) (*models.User, error) {
	var u models.User
	err := DB.QueryRow(`
		SELECT id, email, password_hash, name, role, created_at
		FROM users WHERE email = $1
	`, email).Scan(&u.ID, &u.Email, &u.PasswordHash, &u.Name, &u.Role, &u.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

// GetUserByID retrieves user by id
func GetUserByID(id int) (*models.User, error) {
	var u models.User
	err := DB.QueryRow(`
		SELECT id, email, password_hash, name, role, created_at
		FROM users WHERE id = $1
	`, id).Scan(&u.ID, &u.Email, &u.PasswordHash, &u.Name, &u.Role, &u.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
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

// PurgeNonTodayData deletes records not from the current UTC date
// If you need local timezone day-based retention, adjust the query accordingly.
func PurgeNonTodayData() error {
	log.Println("🧹 Purging non-today drowsiness and alert data...")
	// Delete old drowsiness_data rows
	if _, err := DB.Exec(`DELETE FROM drowsiness_data WHERE timestamp::date <> CURRENT_DATE`); err != nil {
		log.Printf("⚠️ Failed to purge drowsiness_data: %v", err)
		return err
	}
	// Delete old alerts rows
	if _, err := DB.Exec(`DELETE FROM alerts WHERE timestamp::date <> CURRENT_DATE`); err != nil {
		log.Printf("⚠️ Failed to purge alerts: %v", err)
		return err
	}
	log.Println("✅ Purge complete (retained only today's rows)")
	return nil
}

// ScheduleDailyPurge sets up a background goroutine to purge at next midnight UTC
func ScheduleDailyPurge() {
	go func() {
		for {
			now := time.Now().UTC()
			// Next midnight + small offset (5s) to avoid race with incoming data
			next := time.Date(now.Year(), now.Month(), now.Day()+1, 0, 0, 5, 0, time.UTC)
			sleepDur := next.Sub(now)
			time.Sleep(sleepDur)
			if err := PurgeNonTodayData(); err != nil {
				log.Printf("❌ Daily purge failed: %v", err)
			}
		}
	}()
	log.Println("⏰ Scheduled daily purge at UTC midnight")
}
