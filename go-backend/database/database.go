package database

import (
	"database/sql"
	"log"
	"strings"
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

// CleanupDuplicateDevices merges duplicate devices that differ only by letter case.
// Example: device_02 and Device_02 -> keep canonical lowercase `device_02`.
// It also repairs ownership by preferring non-unknown driver_email/user_id metadata.
func CleanupDuplicateDevices() error {
	tx, err := DB.Begin()
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback()
		}
	}()

	rows, err := tx.Query(`
		SELECT id, COALESCE(driver_email, ''), user_id
		FROM devices
		ORDER BY created_at ASC
	`)
	if err != nil {
		return err
	}
	defer rows.Close()

	type deviceRow struct {
		id          string
		driverEmail string
		userID      sql.NullInt64
	}

	groups := map[string][]deviceRow{}
	for rows.Next() {
		var r deviceRow
		if err = rows.Scan(&r.id, &r.driverEmail, &r.userID); err != nil {
			return err
		}
		canonical := strings.ToLower(strings.TrimSpace(r.id))
		if canonical == "" {
			continue
		}
		groups[canonical] = append(groups[canonical], r)
	}
	if err = rows.Err(); err != nil {
		return err
	}

	totalMerged := 0
	for canonicalID, entries := range groups {
		if len(entries) <= 1 {
			continue
		}

		var (
			canonicalExists bool
			canonicalEmail  string
			canonicalUserID sql.NullInt64
		)

		for _, e := range entries {
			if e.id == canonicalID {
				canonicalExists = true
				canonicalEmail = e.driverEmail
				canonicalUserID = e.userID
				break
			}
		}

		// Find best metadata source (prefer linked user and non-unknown email).
		bestEmail := canonicalEmail
		bestUserID := canonicalUserID
		for _, e := range entries {
			email := strings.TrimSpace(strings.ToLower(e.driverEmail))
			isUsefulEmail := email != "" && email != "unknown@device.local"
			if !bestUserID.Valid && e.userID.Valid {
				bestUserID = e.userID
			}
			if (!isUsefulEmail && strings.TrimSpace(strings.ToLower(bestEmail)) != "") || !isUsefulEmail {
				continue
			}
			if strings.TrimSpace(strings.ToLower(bestEmail)) == "" || strings.TrimSpace(strings.ToLower(bestEmail)) == "unknown@device.local" {
				bestEmail = e.driverEmail
			}
		}

		if !canonicalExists {
			driverEmail := strings.TrimSpace(bestEmail)
			if driverEmail == "" {
				driverEmail = "unknown@device.local"
			}

			_, err = tx.Exec(`
				INSERT INTO devices (id, driver_email, user_id, status, last_update, created_at)
				VALUES ($1, $2, $3, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
				ON CONFLICT (id) DO NOTHING
			`, canonicalID, driverEmail, bestUserID)
			if err != nil {
				return err
			}
		}

		for _, e := range entries {
			if e.id == canonicalID {
				continue
			}

			if _, err = tx.Exec(`UPDATE drowsiness_data SET device_id = $1 WHERE device_id = $2`, canonicalID, e.id); err != nil {
				return err
			}
			if _, err = tx.Exec(`UPDATE alerts SET device_id = $1 WHERE device_id = $2`, canonicalID, e.id); err != nil {
				return err
			}

			if _, err = tx.Exec(`
				UPDATE devices
				SET driver_email = CASE
						WHEN (driver_email IS NULL OR TRIM(driver_email) = '' OR LOWER(TRIM(driver_email)) = 'unknown@device.local')
							AND $2 IS NOT NULL AND TRIM($2) <> '' THEN $2
						ELSE driver_email
					END,
					user_id = COALESCE(user_id, $3),
					last_update = GREATEST(last_update, CURRENT_TIMESTAMP)
				WHERE id = $1
			`, canonicalID, e.driverEmail, e.userID); err != nil {
				return err
			}

			if _, err = tx.Exec(`DELETE FROM devices WHERE id = $1`, e.id); err != nil {
				return err
			}

			totalMerged++
		}
	}

	// Backfill user_id from driver_email for any orphan devices.
	if _, err = tx.Exec(`
		UPDATE devices d
		SET user_id = u.id
		FROM users u
		WHERE LOWER(TRIM(d.driver_email)) = LOWER(TRIM(u.email))
		  AND (d.user_id IS NULL OR d.user_id <> u.id)
	`); err != nil {
		return err
	}

	// If device already has user_id but still uses unknown email, rewrite to owner's email.
	if _, err = tx.Exec(`
		UPDATE devices d
		SET driver_email = u.email
		FROM users u
		WHERE d.user_id = u.id
		  AND (TRIM(d.driver_email) = '' OR LOWER(TRIM(d.driver_email)) = 'unknown@device.local')
	`); err != nil {
		return err
	}

	if err = tx.Commit(); err != nil {
		return err
	}

	if totalMerged > 0 {
		log.Printf("✅ Device cleanup merged %d duplicate device rows", totalMerged)
	} else {
		log.Println("✅ Device cleanup: no duplicate case-variant device rows found")
	}

	return nil
}

// Migrate creates database tables if they don't exist
func Migrate() error {
	log.Println("📊 Running database migrations...")

	// Create users table FIRST (other tables reference this)
	_, err := DB.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			email VARCHAR(255) UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			name VARCHAR(100),
			phone VARCHAR(50),
			role VARCHAR(50) DEFAULT 'driver',
			user_type VARCHAR(50),
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		return err
	}

	// Ensure profile columns exist even if users table was created earlier
	_, _ = DB.Exec(`
		ALTER TABLE users
		ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
	`)
	_, _ = DB.Exec(`
		ALTER TABLE users
		ADD COLUMN IF NOT EXISTS user_type VARCHAR(50);
	`)

	// Create devices table (references users)
	_, err = DB.Exec(`
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

	// Create password_resets table for forgot password feature
	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS password_resets (
			id SERIAL PRIMARY KEY,
			user_id INT NOT NULL,
			reset_code VARCHAR(10) NOT NULL,
			expires_at TIMESTAMP NOT NULL,
			used BOOLEAN DEFAULT FALSE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		)
	`)
	if err != nil {
		return err
	}

	log.Println("✅ Database migrations completed successfully")
	return nil
}

// CreateUser inserts a new user
func CreateUser(email, passwordHash, name, role, phone, userType string) (int, error) {
	var id int
	err := DB.QueryRow(`
		INSERT INTO users (email, password_hash, name, role, phone, user_type)
		VALUES ($1, $2, $3, COALESCE($4, 'driver'), $5, $6)
		RETURNING id
	`, email, passwordHash, name, role, phone, userType).Scan(&id)
	return id, err
}

// GetUserByEmail retrieves user by email
func GetUserByEmail(email string) (*models.User, error) {
	var u models.User
	var phone sql.NullString
	var userType sql.NullString
	err := DB.QueryRow(`
		SELECT id, email, password_hash, name, phone, role, user_type, created_at
		FROM users WHERE email = $1
	`, email).Scan(&u.ID, &u.Email, &u.PasswordHash, &u.Name, &phone, &u.Role, &userType, &u.CreatedAt)
	if err != nil {
		return nil, err
	}
	if phone.Valid {
		u.Phone = phone.String
	} else {
		u.Phone = ""
	}
	if userType.Valid {
		u.UserType = userType.String
	} else {
		u.UserType = ""
	}
	return &u, nil
}

// GetUserByID retrieves user by id
func GetUserByID(id int) (*models.User, error) {
	var u models.User
	var phone sql.NullString
	var userType sql.NullString
	err := DB.QueryRow(`
		SELECT id, email, password_hash, name, phone, role, user_type, created_at
		FROM users WHERE id = $1
	`, id).Scan(&u.ID, &u.Email, &u.PasswordHash, &u.Name, &phone, &u.Role, &userType, &u.CreatedAt)
	if err != nil {
		return nil, err
	}
	if phone.Valid {
		u.Phone = phone.String
	} else {
		u.Phone = ""
	}
	if userType.Valid {
		u.UserType = userType.String
	} else {
		u.UserType = ""
	}
	return &u, nil
}

// SeedDevices inserts sample devices for testing
/*func SeedDevices() error {
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
}*/

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

// UpsertDeviceForUser links a device to a user (by email and user ID).
// If the device already exists, its driver_email and user_id are updated.
func UpsertDeviceForUser(deviceID, email string, userID int) error {
	deviceID = strings.TrimSpace(deviceID)
	if deviceID == "" {
		return nil
	}

	var canonicalID string
	err := DB.QueryRow(`
		SELECT id
		FROM devices
		WHERE LOWER(id) = LOWER($1)
		LIMIT 1
	`, deviceID).Scan(&canonicalID)
	if err == nil {
		deviceID = canonicalID
	} else {
		deviceID = strings.ToLower(deviceID)
	}
	_, err = DB.Exec(`
		INSERT INTO devices (id, driver_email, user_id, status)
		VALUES ($1, $2, $3, 'active')
		ON CONFLICT (id) DO UPDATE SET
		  driver_email = EXCLUDED.driver_email,
		  user_id = EXCLUDED.user_id
	`, deviceID, email, userID)
	return err
}

// GetPrimaryDeviceForUser returns the latest device associated with a user.
func GetPrimaryDeviceForUser(userID int) (string, error) {
	var deviceID string
	err := DB.QueryRow(`
		SELECT id FROM devices
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT 1
	`, userID).Scan(&deviceID)
	if err != nil {
		return "", err
	}
	return deviceID, nil
}

// ================== PASSWORD RESET FUNCTIONS ==================

// StoreResetCode stores a password reset code for a user
func StoreResetCode(userID int, code string) error {
	// Delete any existing reset codes for this user
	_, _ = DB.Exec(`DELETE FROM password_resets WHERE user_id = $1`, userID)

	// Insert new reset code (valid for 15 minutes)
	_, err := DB.Exec(`
		INSERT INTO password_resets (user_id, reset_code, expires_at)
		VALUES ($1, $2, NOW() + INTERVAL '15 minutes')
	`, userID, code)
	return err
}

// ValidateResetCode checks if a reset code is valid and not expired
func ValidateResetCode(email, code string) (*models.User, error) {
	var u models.User
	err := DB.QueryRow(`
		SELECT u.id, u.email, u.name, u.role
		FROM users u
		JOIN password_resets pr ON u.id = pr.user_id
		WHERE u.email = $1 
		  AND pr.reset_code = $2 
		  AND pr.expires_at > NOW() 
		  AND pr.used = FALSE
	`, email, code).Scan(&u.ID, &u.Email, &u.Name, &u.Role)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

// UpdateUserPassword updates user's password
func UpdateUserPassword(userID int, passwordHash string) error {
	_, err := DB.Exec(`
		UPDATE users SET password_hash = $1 WHERE id = $2
	`, passwordHash, userID)
	return err
}

// ClearResetCode marks reset code as used
func ClearResetCode(userID int) error {
	_, err := DB.Exec(`
		UPDATE password_resets SET used = TRUE WHERE user_id = $1
	`, userID)
	return err
}
