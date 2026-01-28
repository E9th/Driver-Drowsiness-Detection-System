package handlers

import (
	"database/sql"
	"log"
	"net/http"
	"time"

	"driver-drowsiness-backend/config"
	"driver-drowsiness-backend/database"
	"driver-drowsiness-backend/models"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// Root returns a simple landing response
func Root(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"app":     "Driver Drowsiness Detection API",
		"version": "v1",
		"endpoints": []string{
			"/health",
			"/api/health",
			"/api/devices",
			"/api/devices/:id/data",
			"/api/devices/:id/alerts",
			"/api/devices/:id/history",
		},
		"time": time.Now().Format(time.RFC3339),
	})
}

// HealthCheck returns API health status
func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"message": "Driver Drowsiness Detection API is running",
		"time":    time.Now().Format(time.RFC3339),
	})
}

// DevToolsManifest returns a minimal JSON for Chrome devtools probing
func DevToolsManifest(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"version": 1,
		"targets": []gin.H{},
	})
}

// ensureDeviceExists creates a device if it doesn't exist (auto-registration)
func ensureDeviceExists(deviceID string, driverEmail string) error {
	// Use UPSERT (INSERT ... ON CONFLICT DO NOTHING)
	_, err := database.DB.Exec(`
		INSERT INTO devices (id, driver_email, status, last_update, created_at)
		VALUES ($1, $2, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		ON CONFLICT (id) DO UPDATE SET last_update = CURRENT_TIMESTAMP
	`, deviceID, driverEmail)
	return err
}

// ReceiveDeviceData receives drowsiness data from Python hardware
func ReceiveDeviceData(c *gin.Context) {
	deviceID := c.Param("id")

	var payload models.DataPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON payload"})
		return
	}

	// Auto-register device if it doesn't exist
	driverEmail := payload.DriverEmail
	if driverEmail == "" {
		driverEmail = "unknown@device.local" // Default email for unregistered devices
	}
	if err := ensureDeviceExists(deviceID, driverEmail); err != nil {
		log.Printf("⚠️ Warning: Could not ensure device exists: %v", err)
	}

	// Use server-side timestamp to ensure consistent ordering
	timestamp := time.Now()

	// Insert data into database
	_, err := database.DB.Exec(`
		INSERT INTO drowsiness_data (device_id, eye_closure, drowsiness_level, status, timestamp)
		VALUES ($1, $2, $3, $4, $5)
	`, deviceID, payload.EyeClosure, payload.DrowsinessLevel, payload.Status, timestamp)

	if err != nil {
		log.Printf("❌ Error inserting data: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save data"})
		return
	}

	// Update device last_update
	_, err = database.DB.Exec(`
		UPDATE devices SET last_update = $1 WHERE id = $2
	`, time.Now(), deviceID)

	if err != nil {
		log.Printf("⚠️ Warning: Could not update device last_update: %v", err)
	}

	// Diagnostic: confirm latest row id for this device
	var latestID int
	_ = database.DB.QueryRow(`
		SELECT id FROM drowsiness_data WHERE device_id = $1 ORDER BY timestamp DESC, id DESC LIMIT 1
	`, deviceID).Scan(&latestID)

	log.Printf("✅ Data received from device %s: drowsiness=%s, eye_closure=%.2f (latest id=%d)",
		deviceID, payload.DrowsinessLevel, payload.EyeClosure, latestID)

	c.JSON(http.StatusOK, gin.H{
		"success":   true,
		"message":   "Data received successfully",
		"device_id": deviceID,
	})
}

// ReceiveAlert receives alert from Python hardware
func ReceiveAlert(c *gin.Context) {
	deviceID := c.Param("id")

	var payload models.AlertPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON payload"})
		return
	}

	// Auto-register device if it doesn't exist
	if err := ensureDeviceExists(deviceID, "unknown@device.local"); err != nil {
		log.Printf("⚠️ Warning: Could not ensure device exists: %v", err)
	}

	// Parse timestamp or use current time
	timestamp := time.Now()
	if payload.Timestamp != "" {
		parsedTime, err := time.Parse(time.RFC3339, payload.Timestamp)
		if err == nil {
			timestamp = parsedTime
		}
	}

	// Insert alert into database
	_, err := database.DB.Exec(`
		INSERT INTO alerts (device_id, alert_type, severity, timestamp, status)
		VALUES ($1, $2, $3, $4, 'active')
	`, deviceID, payload.AlertType, payload.Severity, timestamp)

	if err != nil {
		log.Printf("❌ Error inserting alert: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save alert"})
		return
	}

	log.Printf("🚨 Alert received from device %s: type=%s, severity=%s",
		deviceID, payload.AlertType, payload.Severity)

	c.JSON(http.StatusOK, gin.H{
		"success":   true,
		"message":   "Alert received successfully",
		"device_id": deviceID,
	})
}

// GetDeviceLatestData returns the latest drowsiness data for a device
func GetDeviceLatestData(c *gin.Context) {
	deviceID := c.Param("id")

	// Prevent client/proxy caching so latest data is always fetched
	c.Header("Cache-Control", "no-store, no-cache, must-revalidate, private")
	c.Header("Pragma", "no-cache")
	c.Header("Expires", "0")

	var data models.DrowsinessData
	err := database.DB.QueryRow(`
		SELECT id, device_id, eye_closure, drowsiness_level, status, timestamp, created_at
		FROM drowsiness_data
		WHERE device_id = $1
		ORDER BY timestamp DESC, id DESC
		LIMIT 1
	`, deviceID).Scan(
		&data.ID, &data.DeviceID, &data.EyeClosure,
		&data.DrowsinessLevel, &data.Status, &data.Timestamp, &data.CreatedAt,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "No data found for this device"})
		return
	}

	if err != nil {
		log.Printf("❌ Error fetching data: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch data"})
		return
	}

	c.JSON(http.StatusOK, data)
}

// GetDeviceHistory returns historical data for a device
func GetDeviceHistory(c *gin.Context) {
	deviceID := c.Param("id")
	limit := c.DefaultQuery("limit", "100")

	// Prevent caching
	c.Header("Cache-Control", "no-store, no-cache, must-revalidate, private")
	c.Header("Pragma", "no-cache")
	c.Header("Expires", "0")

	rows, err := database.DB.Query(`
		SELECT id, device_id, eye_closure, drowsiness_level, status, timestamp, created_at
		FROM drowsiness_data
		WHERE device_id = $1
		ORDER BY timestamp DESC, id DESC
		LIMIT $2
	`, deviceID, limit)

	if err != nil {
		log.Printf("❌ Error fetching history: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch history"})
		return
	}
	defer rows.Close()

	var history []models.DrowsinessData
	for rows.Next() {
		var data models.DrowsinessData
		err := rows.Scan(
			&data.ID, &data.DeviceID, &data.EyeClosure,
			&data.DrowsinessLevel, &data.Status, &data.Timestamp, &data.CreatedAt,
		)
		if err != nil {
			log.Printf("❌ Error scanning row: %v", err)
			continue
		}
		history = append(history, data)
	}

	c.JSON(http.StatusOK, gin.H{
		"device_id": deviceID,
		"count":     len(history),
		"data":      history,
	})
}

// GetDeviceAlerts returns alerts for a device
func GetDeviceAlerts(c *gin.Context) {
	deviceID := c.Param("id")
	limit := c.DefaultQuery("limit", "50")

	// Prevent caching
	c.Header("Cache-Control", "no-store, no-cache, must-revalidate, private")
	c.Header("Pragma", "no-cache")
	c.Header("Expires", "0")

	rows, err := database.DB.Query(`
		SELECT id, device_id, alert_type, severity, acknowledged, status, timestamp, created_at
		FROM alerts
		WHERE device_id = $1
		ORDER BY timestamp DESC, id DESC
		LIMIT $2
	`, deviceID, limit)

	if err != nil {
		log.Printf("❌ Error fetching alerts: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch alerts"})
		return
	}
	defer rows.Close()

	var alerts []models.Alert
	for rows.Next() {
		var alert models.Alert
		err := rows.Scan(
			&alert.ID, &alert.DeviceID, &alert.AlertType, &alert.Severity,
			&alert.Acknowledged, &alert.Status, &alert.Timestamp, &alert.CreatedAt,
		)
		if err != nil {
			log.Printf("❌ Error scanning row: %v", err)
			continue
		}
		alerts = append(alerts, alert)
	}

	c.JSON(http.StatusOK, gin.H{
		"device_id": deviceID,
		"count":     len(alerts),
		"alerts":    alerts,
	})
}

// GetAllDevices returns all registered devices
func GetAllDevices(c *gin.Context) {
	rows, err := database.DB.Query(`
		SELECT id, driver_email, status, last_update, created_at
		FROM devices
		ORDER BY last_update DESC
	`)

	if err != nil {
		log.Printf("❌ Error fetching devices: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch devices"})
		return
	}
	defer rows.Close()

	var devices []models.Device
	for rows.Next() {
		var device models.Device
		err := rows.Scan(
			&device.ID, &device.DriverEmail, &device.Status,
			&device.LastUpdate, &device.CreatedAt,
		)
		if err != nil {
			log.Printf("❌ Error scanning row: %v", err)
			continue
		}
		devices = append(devices, device)
	}

	c.JSON(http.StatusOK, gin.H{
		"count":   len(devices),
		"devices": devices,
	})
}

// AdminOverview returns aggregated statistics for master dashboard
// - total_drivers: จำนวนผู้ขับขี่ทั้งหมดจาก users (role='driver') + mock_drivers
// - active_drivers: จำนวนผู้ขับขี่ที่มีการอัปเดตล่าสุดภายใน 1 นาที (เฉพาะข้อมูลของวันที่ปัจจุบัน)
//   - ข้อมูลจริงอ้างอิงจาก drowsiness_data ผ่าน devices -> users (ภายใน 1 นาที)
//   - หรือ devices.last_update ภายใน 10 วินาที (มองเป็น heartbeat)
//   - ข้อมูล mock อ้างอิงจาก mock_drowsiness_events -> mock_drivers (ภายใน 1 นาที)
//
// - total_devices: จำนวน device id ทั้งหมดจาก devices (จริง) + mock_drowsiness_events (mock)
// - alerts_today: การแจ้งเตือนระดับด่วนวันนี้
//   - ผู้ใช้จริง: นับจาก drowsiness_data.drowsiness_level='high' ของวันที่ปัจจุบัน (device ที่ผูกกับ users.role='driver')
//   - ผู้ใช้ mock: mock_drowsiness_events.drowsiness_level='high' (ปัจจุบันยังใช้ทุกวันรวมกัน)
//
// - critical_alerts_today: ใช้สูตรเดียวกับ alerts_today เพื่อความสอดคล้อง
func AdminOverview(c *gin.Context) {
	// Prevent caching so dashboard always sees latest summary
	c.Header("Cache-Control", "no-store, no-cache, must-revalidate, private")
	c.Header("Pragma", "no-cache")
	c.Header("Expires", "0")
	var totalDrivers int
	var activeDrivers int
	var totalDevices int
	var alertsToday int
	var criticalAlertsToday int

	// Aggregate in a single query for consistency
	query := `
SELECT
	COALESCE((SELECT COUNT(*) FROM mock_drivers), 0)
	+ COALESCE((SELECT COUNT(*) FROM users WHERE role = 'driver'), 0) AS total_drivers,
	(
		COALESCE((
			SELECT COUNT(DISTINCT u.id)
			FROM users u
			JOIN devices d ON d.user_id = u.id
			JOIN LATERAL (
				SELECT timestamp
				FROM drowsiness_data dd
				WHERE dd.device_id = d.id
					AND dd.timestamp::date = CURRENT_DATE
				ORDER BY dd.timestamp DESC, dd.id DESC
				LIMIT 1
			) last ON TRUE
			WHERE u.role = 'driver'
				AND (
					(last.timestamp IS NOT NULL AND last.timestamp >= NOW() - INTERVAL '1 minute')
					OR d.last_update >= NOW() - INTERVAL '10 seconds'
				)
		), 0)
	) AS active_drivers,
	(
		COALESCE((SELECT COUNT(DISTINCT id) FROM devices), 0)
		+
		COALESCE((SELECT COUNT(DISTINCT device_id) FROM mock_drowsiness_events), 0)
	) AS total_devices,
	(
		COALESCE((
			SELECT COUNT(*)
			FROM drowsiness_data dd
			JOIN devices d ON dd.device_id = d.id
			JOIN users u ON d.user_id = u.id
			WHERE u.role = 'driver'
				AND dd.timestamp::date = CURRENT_DATE
				AND LOWER(dd.drowsiness_level) = 'high'
		), 0)
		+
		COALESCE((
			SELECT COUNT(*)
			FROM mock_drowsiness_events
			WHERE LOWER(drowsiness_level) = 'high'
		), 0)
	) AS alerts_today,
	(
		COALESCE((
			SELECT COUNT(*)
			FROM drowsiness_data dd
			JOIN devices d ON dd.device_id = d.id
			JOIN users u ON d.user_id = u.id
			WHERE u.role = 'driver'
				AND dd.timestamp::date = CURRENT_DATE
				AND LOWER(dd.drowsiness_level) = 'high'
		), 0)
		+
		COALESCE((
			SELECT COUNT(*)
			FROM mock_drowsiness_events
			WHERE LOWER(drowsiness_level) = 'high'
		), 0)
	) AS critical_alerts_today;
`

	if err := database.DB.QueryRow(query).Scan(&totalDrivers, &activeDrivers, &totalDevices, &alertsToday, &criticalAlertsToday); err != nil {
		log.Printf("❌ Error fetching admin overview stats: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch overview stats"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total_drivers":         totalDrivers,
		"active_drivers":        activeDrivers,
		"total_devices":         totalDevices,
		"alerts_today":          alertsToday,
		"critical_alerts_today": criticalAlertsToday,
		"generated_at":          time.Now().Format(time.RFC3339),
	})
}

// AdminDrivers returns a combined list of real and mock drivers with online status
// and count of today's critical alerts, for use in the master dashboard driver table.
// Online criteria:
//   - สำหรับผู้ใช้จริง: มีข้อมูล drowsiness_data ภายใน 1 นาทีล่าสุดของวันนี้
//     หรือ devices.last_update ภายใน 10 วินาทีล่าสุด (มองเป็น heartbeat)
//   - สำหรับ mock: มี mock_drowsiness_events ภายใน 1 นาทีล่าสุดของวันนี้
func AdminDrivers(c *gin.Context) {
	// Prevent caching so driver list reflects real-time status
	c.Header("Cache-Control", "no-store, no-cache, must-revalidate, private")
	c.Header("Pragma", "no-cache")
	c.Header("Expires", "0")
	const realDriversQuery = `
SELECT
	u.id,
	COALESCE(NULLIF(u.name, ''), u.email) AS name,
	dev.device_id,
	act.last_ts,
	dev.last_update,
	CASE
		WHEN (
			(act.last_ts IS NOT NULL AND act.last_ts >= NOW() - INTERVAL '1 minute')
			OR (dev.last_update IS NOT NULL AND dev.last_update >= NOW() - INTERVAL '10 seconds')
		) THEN TRUE
		ELSE FALSE
	END AS is_online,
	COALESCE(ac.critical_count, 0) AS critical_alerts_today
FROM users u
LEFT JOIN LATERAL (
	SELECT d.id AS device_id,
	       d.last_update
	FROM devices d
	WHERE d.user_id = u.id
	ORDER BY d.created_at DESC
	LIMIT 1
) dev ON TRUE
LEFT JOIN LATERAL (
	SELECT MAX(dd.timestamp) AS last_ts
	FROM drowsiness_data dd
	WHERE dd.device_id = dev.device_id
		AND dd.timestamp::date = CURRENT_DATE
) act ON TRUE
LEFT JOIN LATERAL (
	SELECT COUNT(*) AS critical_count
	FROM drowsiness_data dd
	WHERE dd.device_id = dev.device_id
		AND dd.timestamp::date = CURRENT_DATE
		AND LOWER(dd.drowsiness_level) = 'high'
) ac ON TRUE
WHERE u.role = 'driver';`

	const mockDriversQuery = `
	SELECT
		md.driver_code,
		md.full_name,
		COALESCE(devs.device_id, '') AS device_id,
		recent.last_ts,
		FALSE AS is_online,
		COALESCE(highs.critical_count, 0) AS critical_alerts_today
	FROM mock_drivers md
	LEFT JOIN LATERAL (
		SELECT MAX(e.timestamp) AS last_ts
		FROM mock_drowsiness_events e
		WHERE e.driver_code = md.driver_code
		  AND e.timestamp::date = CURRENT_DATE
	) recent ON TRUE
	LEFT JOIN LATERAL (
		SELECT COUNT(*) AS critical_count
		FROM mock_drowsiness_events e
		WHERE e.driver_code = md.driver_code
		  AND LOWER(e.drowsiness_level) = 'high'
	) highs ON TRUE
	LEFT JOIN LATERAL (
		SELECT MAX(e.device_id) AS device_id
		FROM mock_drowsiness_events e
		WHERE e.driver_code = md.driver_code
	) devs ON TRUE;`

	var results []models.AdminDriverSummary

	// Real drivers
	realRows, err := database.DB.Query(realDriversQuery)
	if err != nil {
		log.Printf("error querying real drivers: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to query real drivers"})
		return
	}
	defer realRows.Close()

	for realRows.Next() {
		var (
			userID         int
			name           string
			deviceID       sql.NullString
			lastTS         sql.NullTime
			lastUpdate     sql.NullTime
			isOnlineSQL    bool
			criticalAlerts int
		)
		if err := realRows.Scan(&userID, &name, &deviceID, &lastTS, &lastUpdate, &isOnlineSQL, &criticalAlerts); err != nil {
			log.Printf("error scanning real driver row: %v", err)
			continue
		}

		devID := ""
		if deviceID.Valid {
			devID = deviceID.String
		}

		results = append(results, models.AdminDriverSummary{
			ID:                  "real_" + strconv.Itoa(userID),
			Name:                name,
			DeviceID:            devID,
			IsOnline:            isOnlineSQL,
			CriticalAlertsToday: criticalAlerts,
			Source:              "real",
		})
	}

	// Mock drivers
	mockRows, err := database.DB.Query(mockDriversQuery)
	if err != nil {
		log.Printf("error querying mock drivers: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to query mock drivers"})
		return
	}
	defer mockRows.Close()

	for mockRows.Next() {
		var (
			driverCode     string
			fullName       string
			deviceID       string
			lastTS         sql.NullTime
			isOnlineSQL    bool
			criticalAlerts int
		)
		if err := mockRows.Scan(&driverCode, &fullName, &deviceID, &lastTS, &isOnlineSQL, &criticalAlerts); err != nil {
			log.Printf("error scanning mock driver row: %v", err)
			continue
		}

		results = append(results, models.AdminDriverSummary{
			ID:                  "mock_" + driverCode,
			Name:                fullName,
			DeviceID:            deviceID,
			IsOnline:            false,
			CriticalAlertsToday: criticalAlerts,
			Source:              "mock",
		})
	}

	if err := realRows.Err(); err != nil {
		log.Printf("error after iterating real driver rows: %v", err)
	}
	if err := mockRows.Err(); err != nil {
		log.Printf("error after iterating mock driver rows: %v", err)
	}

	c.JSON(http.StatusOK, gin.H{"drivers": results})
}

// AdminRecentAlerts returns a unified list of recent medium/high drowsiness events
// from both real devices (drowsiness_data) and mock drivers (mock_drowsiness_events).
// This is used by the master dashboard "recent alerts" card and includes both
// medium (warning) and high (critical) severity events.
func AdminRecentAlerts(c *gin.Context) {
	// Prevent caching for recent alerts feed
	c.Header("Cache-Control", "no-store, no-cache, must-revalidate, private")
	c.Header("Pragma", "no-cache")
	c.Header("Expires", "0")
	limitStr := c.DefaultQuery("limit", "20")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 20
	}

	query := `
SELECT
	dd.timestamp AS ts,
	COALESCE(NULLIF(u.name, ''), u.email) AS driver_name,
	CASE
		WHEN LOWER(dd.drowsiness_level) = 'high' THEN 'ความเหนื่อยล้าสูง'
		WHEN LOWER(dd.drowsiness_level) = 'medium' THEN 'เหนื่อยล้าเล็กน้อย'
		ELSE 'สถานะปกติ'
	END AS alert_type,
	CASE
		WHEN LOWER(dd.drowsiness_level) = 'high' THEN 'critical'
		WHEN LOWER(dd.drowsiness_level) = 'medium' THEN 'warning'
		ELSE 'info'
	END AS severity,
	d.id AS vehicle_id,
	'real' AS source
FROM drowsiness_data dd
JOIN devices d ON dd.device_id = d.id
JOIN users u ON d.user_id = u.id
WHERE LOWER(dd.drowsiness_level) IN ('medium', 'high')
	AND u.role = 'driver'
ORDER BY ts DESC
LIMIT $1;
`

	rows, err := database.DB.Query(query, limit)
	if err != nil {
		log.Printf("error querying recent alerts: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch recent alerts"})
		return
	}
	defer rows.Close()

	var results []models.AdminRecentAlert
	for rows.Next() {
		var (
			ts       time.Time
			driver   string
			typeStr  string
			severity string
			vehicle  string
			source   string
		)
		if err := rows.Scan(&ts, &driver, &typeStr, &severity, &vehicle, &source); err != nil {
			log.Printf("error scanning recent alert row: %v", err)
			continue
		}

		results = append(results, models.AdminRecentAlert{
			Time:      ts.UTC().Format("15:04"),
			Driver:    driver,
			Type:      typeStr,
			Severity:  severity,
			VehicleID: vehicle,
			Source:    source,
		})
	}

	if err := rows.Err(); err != nil {
		log.Printf("error after iterating recent alert rows: %v", err)
	}

	c.JSON(http.StatusOK, gin.H{"alerts": results})
}

// AdminAlertSlots returns aggregated high-level alerts per time slot
// combining real critical alerts (today only) and mock high events (all-time).
// Slots are 2-hour windows from 06:00-24:00 (06-08, 08-10, ..., 22-24).
func AdminAlertSlots(c *gin.Context) {
	// Prevent caching so time-slot analytics stay fresh
	c.Header("Cache-Control", "no-store, no-cache, must-revalidate, private")
	c.Header("Pragma", "no-cache")
	c.Header("Expires", "0")
	// Predefine all slots to ensure zero-count slots are included
	slotLabels := []string{"06-08", "08-10", "10-12", "12-14", "14-16", "16-18", "18-20", "20-22", "22-24"}

	query := `
WITH real_counts AS (
    SELECT
        CASE
            WHEN EXTRACT(HOUR FROM dd.timestamp) >= 6 AND EXTRACT(HOUR FROM dd.timestamp) < 8 THEN '06-08'
            WHEN EXTRACT(HOUR FROM dd.timestamp) >= 8 AND EXTRACT(HOUR FROM dd.timestamp) < 10 THEN '08-10'
            WHEN EXTRACT(HOUR FROM dd.timestamp) >= 10 AND EXTRACT(HOUR FROM dd.timestamp) < 12 THEN '10-12'
            WHEN EXTRACT(HOUR FROM dd.timestamp) >= 12 AND EXTRACT(HOUR FROM dd.timestamp) < 14 THEN '12-14'
            WHEN EXTRACT(HOUR FROM dd.timestamp) >= 14 AND EXTRACT(HOUR FROM dd.timestamp) < 16 THEN '14-16'
            WHEN EXTRACT(HOUR FROM dd.timestamp) >= 16 AND EXTRACT(HOUR FROM dd.timestamp) < 18 THEN '16-18'
            WHEN EXTRACT(HOUR FROM dd.timestamp) >= 18 AND EXTRACT(HOUR FROM dd.timestamp) < 20 THEN '18-20'
            WHEN EXTRACT(HOUR FROM dd.timestamp) >= 20 AND EXTRACT(HOUR FROM dd.timestamp) < 22 THEN '20-22'
            WHEN EXTRACT(HOUR FROM dd.timestamp) >= 22 AND EXTRACT(HOUR FROM dd.timestamp) < 24 THEN '22-24'
            ELSE NULL
        END AS slot,
        COUNT(*) AS cnt
    FROM drowsiness_data dd
    JOIN devices d ON dd.device_id = d.id
    JOIN users u ON d.user_id = u.id
    WHERE u.role = 'driver'
      AND dd.timestamp::date = CURRENT_DATE
      AND LOWER(dd.drowsiness_level) = 'high'
    GROUP BY slot
),
mock_counts AS (
    SELECT
        CASE
            WHEN EXTRACT(HOUR FROM e.timestamp) >= 6 AND EXTRACT(HOUR FROM e.timestamp) < 8 THEN '06-08'
            WHEN EXTRACT(HOUR FROM e.timestamp) >= 8 AND EXTRACT(HOUR FROM e.timestamp) < 10 THEN '08-10'
            WHEN EXTRACT(HOUR FROM e.timestamp) >= 10 AND EXTRACT(HOUR FROM e.timestamp) < 12 THEN '10-12'
            WHEN EXTRACT(HOUR FROM e.timestamp) >= 12 AND EXTRACT(HOUR FROM e.timestamp) < 14 THEN '12-14'
            WHEN EXTRACT(HOUR FROM e.timestamp) >= 14 AND EXTRACT(HOUR FROM e.timestamp) < 16 THEN '14-16'
            WHEN EXTRACT(HOUR FROM e.timestamp) >= 16 AND EXTRACT(HOUR FROM e.timestamp) < 18 THEN '16-18'
            WHEN EXTRACT(HOUR FROM e.timestamp) >= 18 AND EXTRACT(HOUR FROM e.timestamp) < 20 THEN '18-20'
            WHEN EXTRACT(HOUR FROM e.timestamp) >= 20 AND EXTRACT(HOUR FROM e.timestamp) < 22 THEN '20-22'
            WHEN EXTRACT(HOUR FROM e.timestamp) >= 22 AND EXTRACT(HOUR FROM e.timestamp) < 24 THEN '22-24'
            ELSE NULL
        END AS slot,
        COUNT(*) AS cnt
    FROM mock_drowsiness_events e
      WHERE LOWER(e.drowsiness_level) = 'high'
    GROUP BY slot
),
combined AS (
    SELECT slot, SUM(cnt) AS total_cnt
    FROM (
        SELECT slot, cnt FROM real_counts
        UNION ALL
        SELECT slot, cnt FROM mock_counts
    ) x
    WHERE slot IS NOT NULL
    GROUP BY slot
)
SELECT slot, COALESCE(total_cnt, 0) AS count
FROM combined;
`

	rows, err := database.DB.Query(query)
	if err != nil {
		log.Printf("error querying alert slots: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch alert slots"})
		return
	}
	defer rows.Close()

	counts := make(map[string]int)
	for rows.Next() {
		var (
			slotLabel string
			count     int
		)
		if err := rows.Scan(&slotLabel, &count); err != nil {
			log.Printf("error scanning alert slot row: %v", err)
			continue
		}
		counts[slotLabel] = count
	}

	if err := rows.Err(); err != nil {
		log.Printf("error after iterating alert slot rows: %v", err)
	}

	var (
		slots     []models.AdminAlertSlot
		totalHigh int
		peakLbl   string
		peakCnt   int
	)

	for _, label := range slotLabels {
		cnt := counts[label]
		slots = append(slots, models.AdminAlertSlot{Label: label, Count: cnt})
		totalHigh += cnt
		if cnt > peakCnt {
			peakCnt = cnt
			peakLbl = label
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"slots":      slots,
		"total_high": totalHigh,
		"peak_slot":  peakLbl,
		"peak_count": peakCnt,
	})
}

// AdminAlertLevels returns aggregated counts and percentages of medium/high alerts
// combining real alerts (today) and mock drowsiness events (all-time) for use in
// the donut card.
func AdminAlertLevels(c *gin.Context) {
	// Prevent caching for alert level distribution (donut card)
	c.Header("Cache-Control", "no-store, no-cache, must-revalidate, private")
	c.Header("Pragma", "no-cache")
	c.Header("Expires", "0")
	query := `
WITH real AS (
	SELECT
		COUNT(*) FILTER (WHERE LOWER(dd.drowsiness_level) = 'high') AS high_real,
		COUNT(*) FILTER (WHERE LOWER(dd.drowsiness_level) = 'medium') AS medium_real
	FROM drowsiness_data dd
	JOIN devices d ON dd.device_id = d.id
	JOIN users u ON d.user_id = u.id
	WHERE u.role = 'driver'
	  AND dd.timestamp::date = CURRENT_DATE
),
mock AS (
	SELECT
		COUNT(*) FILTER (WHERE LOWER(drowsiness_level) = 'high') AS high_mock,
		COUNT(*) FILTER (WHERE LOWER(drowsiness_level) = 'medium') AS medium_mock
	FROM mock_drowsiness_events
)
SELECT
	COALESCE(real.high_real, 0) + COALESCE(mock.high_mock, 0) AS high_total,
	COALESCE(real.medium_real, 0) + COALESCE(mock.medium_mock, 0) AS medium_total
FROM real, mock;
`

	var highCount, mediumCount int
	if err := database.DB.QueryRow(query).Scan(&highCount, &mediumCount); err != nil {
		log.Printf("error querying alert levels: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch alert levels"})
		return
	}

	total := highCount + mediumCount
	var highPct, mediumPct, safePct float64
	if total > 0 {
		highPct = float64(highCount) * 100.0 / float64(total)
		mediumPct = float64(mediumCount) * 100.0 / float64(total)
		safePct = 100.0 - highPct - mediumPct
		if safePct < 0 {
			safePct = 0
		}
	} else {
		safePct = 100.0
	}

	resp := models.AdminAlertLevelSummary{
		HighCount:   highCount,
		MediumCount: mediumCount,
		HighPct:     highPct,
		MediumPct:   mediumPct,
		SafePct:     safePct,
	}

	c.JSON(http.StatusOK, resp)
}

// ================== AUTH HANDLERS & MIDDLEWARE ==================

// Register creates a new user account
func Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Check existing user
	if _, err := database.GetUserByEmail(req.Email); err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
		return
	}

	// Hash password
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	userID, err := database.CreateUser(req.Email, string(hash), req.Name, "driver", req.Phone, req.UserType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Link device to this user if provided
	if strings.TrimSpace(req.DeviceID) != "" {
		if err := database.UpsertDeviceForUser(req.DeviceID, req.Email, userID); err != nil {
			log.Printf("⚠️ Failed to link device %s to user %s: %v", req.DeviceID, req.Email, err)
		}
	}

	token, err := generateJWT(userID, req.Email, "driver")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create token"})
		return
	}

	resp := models.AuthResponse{Token: token}
	resp.User.ID = userID
	resp.User.Email = req.Email
	resp.User.Name = req.Name
	resp.User.Role = "driver"
	resp.User.Phone = req.Phone
	resp.User.DeviceID = req.DeviceID
	resp.User.UserType = req.UserType

	c.JSON(http.StatusCreated, resp)
}

// Login authenticates a user and returns a JWT
func Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	user, err := database.GetUserByEmail(req.Email)
	if err != nil {
		log.Printf("🔐 Login failed: user not found for email=%s: %v", req.Email, err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		log.Printf("🔐 Login failed: wrong password for email=%s", req.Email)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	deviceID, _ := database.GetPrimaryDeviceForUser(user.ID)

	token, err := generateJWT(user.ID, user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create token"})
		return
	}

	resp := models.AuthResponse{Token: token}
	resp.User.ID = user.ID
	resp.User.Email = user.Email
	resp.User.Name = user.Name
	resp.User.Role = user.Role
	resp.User.Phone = user.Phone
	resp.User.DeviceID = deviceID
	resp.User.UserType = user.UserType
	c.JSON(http.StatusOK, resp)
}

// Me returns current authenticated user
func Me(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := userIDVal.(int)
	user, err := database.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	deviceID, _ := database.GetPrimaryDeviceForUser(user.ID)
	c.JSON(http.StatusOK, gin.H{
		"id":        user.ID,
		"email":     user.Email,
		"name":      user.Name,
		"role":      user.Role,
		"phone":     user.Phone,
		"user_type": user.UserType,
		"device_id": deviceID,
	})
}

// AuthMiddleware validates JWT and sets user in context
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if header == "" || !strings.HasPrefix(header, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing token"})
			return
		}
		tokenStr := strings.TrimPrefix(header, "Bearer ")
		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			return []byte(config.AppConfig.JWTSecret), nil
		})
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid claims"})
			return
		}
		uidFloat, ok := claims["user_id"].(float64)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid user id"})
			return
		}
		c.Set("user_id", int(uidFloat))
		c.Set("user_email", claims["email"])
		c.Next()
	}
}

// generateJWT creates a signed token
func generateJWT(userID int, email, role string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"email":   email,
		"role":    role,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
		"iat":     time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.AppConfig.JWTSecret))
}

// (Optional) helper to convert string id param to int
func paramIDToInt(c *gin.Context, name string) (int, error) {
	s := c.Param(name)
	return strconv.Atoi(s)
}

// ================== SEED & PASSWORD RESET HANDLERS ==================

// SeedAdmin creates an admin account (for initial setup)
func SeedAdmin(c *gin.Context) {
	var req struct {
		Email    string `json:"email"`
		Name     string `json:"name"`
		Password string `json:"password"`
		Secret   string `json:"secret"` // Simple protection
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Simple secret check to prevent abuse
	if req.Secret != "drowsiness-admin-setup-2026" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Invalid setup secret"})
		return
	}

	// Check if admin already exists
	if _, err := database.GetUserByEmail(req.Email); err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Admin already exists"})
		return
	}

	// Hash password
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Create admin user
	userID, err := database.CreateUser(req.Email, string(hash), req.Name, "admin", "", "admin")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create admin"})
		return
	}

	log.Printf("✅ Admin account created: %s (ID: %d)", req.Email, userID)
	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Admin account created successfully",
		"user_id": userID,
	})
}

// ForgotPassword initiates password reset
func ForgotPassword(c *gin.Context) {
	var req struct {
		Email string `json:"email"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Check if user exists
	user, err := database.GetUserByEmail(req.Email)
	if err != nil {
		// Don't reveal if email exists for security
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "If the email exists, a reset code has been sent",
		})
		return
	}

	// Generate 6-digit reset code
	resetCode := generateResetCode()

	// Store reset code in database (valid for 15 minutes)
	err = database.StoreResetCode(user.ID, resetCode)
	if err != nil {
		log.Printf("❌ Failed to store reset code: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate reset code"})
		return
	}

	// In production, send email here
	// For now, log the code (REMOVE IN PRODUCTION!)
	log.Printf("🔑 Reset code for %s: %s", req.Email, resetCode)

	c.JSON(http.StatusOK, gin.H{
		"success":    true,
		"message":    "If the email exists, a reset code has been sent",
		"reset_code": resetCode, // REMOVE IN PRODUCTION - only for testing!
	})
}

// ResetPassword completes password reset
func ResetPassword(c *gin.Context) {
	var req struct {
		Email       string `json:"email"`
		ResetCode   string `json:"reset_code"`
		NewPassword string `json:"new_password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Validate reset code
	user, err := database.ValidateResetCode(req.Email, req.ResetCode)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired reset code"})
		return
	}

	// Hash new password
	hash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Update password
	err = database.UpdateUserPassword(user.ID, string(hash))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	// Clear reset code
	database.ClearResetCode(user.ID)

	log.Printf("✅ Password reset successful for %s", req.Email)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Password reset successful. You can now login with your new password.",
	})
}

// generateResetCode creates a 6-digit code
func generateResetCode() string {
	return strconv.Itoa(100000 + time.Now().Nanosecond()%900000)
}
