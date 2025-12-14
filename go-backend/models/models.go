package models

import (
	"time"
)

// Device represents a hardware device
type Device struct {
	ID          string    `json:"id" db:"id"`
	DriverEmail string    `json:"driver_email" db:"driver_email"`
	Status      string    `json:"status" db:"status"`
	LastUpdate  time.Time `json:"last_update" db:"last_update"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

// DrowsinessData represents real-time drowsiness detection data
type DrowsinessData struct {
	ID              int       `json:"id" db:"id"`
	DeviceID        string    `json:"device_id" db:"device_id"`
	EyeClosure      float64   `json:"eye_closure" db:"eye_closure"`
	DrowsinessLevel string    `json:"drowsiness_level" db:"drowsiness_level"`
	Status          string    `json:"status" db:"status"`
	Timestamp       time.Time `json:"timestamp" db:"timestamp"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
}

// Alert represents drowsiness alert
type Alert struct {
	ID           int       `json:"id" db:"id"`
	DeviceID     string    `json:"device_id" db:"device_id"`
	AlertType    string    `json:"alert_type" db:"alert_type"`
	Severity     string    `json:"severity" db:"severity"`
	Acknowledged bool      `json:"acknowledged" db:"acknowledged"`
	Status       string    `json:"status" db:"status"`
	Timestamp    time.Time `json:"timestamp" db:"timestamp"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}

// DataPayload is the incoming data from Python script
type DataPayload struct {
	EyeClosure      float64 `json:"eye_closure"`
	DrowsinessLevel string  `json:"drowsiness_level"`
	Status          string  `json:"status"`
	Timestamp       string  `json:"timestamp,omitempty"`
}

// AlertPayload is the incoming alert from Python script
type AlertPayload struct {
	AlertType string `json:"alert_type"`
	Severity  string `json:"severity"`
	Timestamp string `json:"timestamp,omitempty"`
}

// AdminDriverSummary is a compact view for master dashboard driver list
type AdminDriverSummary struct {
	ID                  string `json:"id"`
	Name                string `json:"name"`
	DeviceID            string `json:"device_id"`
	IsOnline            bool   `json:"is_online"`
	CriticalAlertsToday int    `json:"critical_alerts_today"`
	Source              string `json:"source"` // "real" or "mock"
}

// AdminRecentAlert represents a unified recent alert/event item
// used in the master dashboard "recent alerts" card.
type AdminRecentAlert struct {
	Time      string `json:"time"`
	Driver    string `json:"driver"`
	Type      string `json:"type"`
	Severity  string `json:"severity"`
	VehicleID string `json:"vehicleId"`
	Source    string `json:"source"` // "real" or "mock"
}

// AdminAlertSlot represents alert count per time slot for analytics card
type AdminAlertSlot struct {
	Label string `json:"label"`
	Count int    `json:"count"`
}

// AdminAlertLevelSummary aggregates alert counts and percentages by level
type AdminAlertLevelSummary struct {
	HighCount   int     `json:"high_count"`
	MediumCount int     `json:"medium_count"`
	HighPct     float64 `json:"high_pct"`
	MediumPct   float64 `json:"medium_pct"`
	SafePct     float64 `json:"safe_pct"`
}

// User represents an application user (for authentication)
type User struct {
	ID           int       `json:"id" db:"id"`
	Email        string    `json:"email" db:"email"`
	PasswordHash string    `json:"-" db:"password_hash"`
	Name         string    `json:"name" db:"name"`
	Phone        string    `json:"phone" db:"phone"`
	Role         string    `json:"role" db:"role"`
	UserType     string    `json:"user_type" db:"user_type"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}

// RegisterRequest represents incoming register payload
type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Name     string `json:"name"`
	DeviceID string `json:"device_id"`
	Phone    string `json:"phone"`
	UserType string `json:"user_type"`
}

// LoginRequest represents incoming login payload
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// AuthResponse is returned after successful login/register
type AuthResponse struct {
	Token string `json:"token"`
	User  struct {
		ID       int    `json:"id"`
		Email    string `json:"email"`
		Name     string `json:"name"`
		Role     string `json:"role"`
		Phone    string `json:"phone,omitempty"`
		DeviceID string `json:"device_id,omitempty"`
		UserType string `json:"user_type,omitempty"`
	} `json:"user"`
}
