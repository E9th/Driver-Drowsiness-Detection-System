package handlers

import (
	"database/sql"
	"log"
	"net/http"
	"time"

	"driver-drowsiness-backend/database"
	"driver-drowsiness-backend/models"

	"github.com/gin-gonic/gin"
)

// HealthCheck returns API health status
func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"message": "Driver Drowsiness Detection API is running",
		"time":    time.Now().Format(time.RFC3339),
	})
}

// ReceiveDeviceData receives drowsiness data from Python hardware
func ReceiveDeviceData(c *gin.Context) {
	deviceID := c.Param("id")
	
	var payload models.DataPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON payload"})
		return
	}

	// Parse timestamp or use current time
	timestamp := time.Now()
	if payload.Timestamp != "" {
		parsedTime, err := time.Parse(time.RFC3339, payload.Timestamp)
		if err == nil {
			timestamp = parsedTime
		}
	}

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

	log.Printf("✅ Data received from device %s: drowsiness=%s, eye_closure=%.2f", 
		deviceID, payload.DrowsinessLevel, payload.EyeClosure)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Data received successfully",
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
		"success": true,
		"message": "Alert received successfully",
		"device_id": deviceID,
	})
}

// GetDeviceLatestData returns the latest drowsiness data for a device
func GetDeviceLatestData(c *gin.Context) {
	deviceID := c.Param("id")

	var data models.DrowsinessData
	err := database.DB.QueryRow(`
		SELECT id, device_id, eye_closure, drowsiness_level, status, timestamp, created_at
		FROM drowsiness_data
		WHERE device_id = $1
		ORDER BY timestamp DESC
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

	rows, err := database.DB.Query(`
		SELECT id, device_id, eye_closure, drowsiness_level, status, timestamp, created_at
		FROM drowsiness_data
		WHERE device_id = $1
		ORDER BY timestamp DESC
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

	rows, err := database.DB.Query(`
		SELECT id, device_id, alert_type, severity, acknowledged, status, timestamp, created_at
		FROM alerts
		WHERE device_id = $1
		ORDER BY timestamp DESC
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
