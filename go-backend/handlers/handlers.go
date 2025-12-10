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

// ReceiveDeviceData receives drowsiness data from Python hardware
func ReceiveDeviceData(c *gin.Context) {
	deviceID := c.Param("id")

	var payload models.DataPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON payload"})
		return
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

	userID, err := database.CreateUser(req.Email, string(hash), req.Name, "driver", req.Phone)
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
