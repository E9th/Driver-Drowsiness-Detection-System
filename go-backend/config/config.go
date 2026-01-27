package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost      string
	DBPort      string
	DBUser      string
	DBPassword  string
	DBName      string
	DatabaseURL string // For Render/Heroku style DATABASE_URL
	ServerPort  string
	Environment string
	JWTSecret   string
}

var AppConfig *Config

// LoadConfig loads environment variables from .env file
func LoadConfig() {
	// Load .env file (only in development)
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	AppConfig = &Config{
		DBHost:      getEnv("DB_HOST", "localhost"),
		DBPort:      getEnv("DB_PORT", "5432"),
		DBUser:      getEnv("DB_USER", "postgres"),
		DBPassword:  getEnv("DB_PASSWORD", "postgres"),
		DBName:      getEnv("DB_NAME", "drowsiness_db"),
		DatabaseURL: getEnv("DATABASE_URL", ""), // Render provides this
		ServerPort:  getEnv("PORT", "8080"),
		Environment: getEnv("ENV", "development"),
		JWTSecret:   getEnv("JWT_SECRET", "dev-secret-change-me"),
	}

	log.Println("✅ Configuration loaded successfully")
	if AppConfig.DatabaseURL != "" {
		log.Println("📊 Using DATABASE_URL connection string")
	} else {
		log.Printf("📊 Database: %s@%s:%s/%s", AppConfig.DBUser, AppConfig.DBHost, AppConfig.DBPort, AppConfig.DBName)
	}
	log.Printf("🌐 Server Port: %s", AppConfig.ServerPort)
	log.Printf("🌍 Environment: %s", AppConfig.Environment)
	if AppConfig.Environment == "production" && AppConfig.JWTSecret == "dev-secret-change-me" {
		log.Println("⚠️ Warning: Using default JWT secret in production. Set JWT_SECRET env variable!")
	}
}

// GetDatabaseURL returns the PostgreSQL connection string
func GetDatabaseURL() string {
	// If DATABASE_URL is set (Render, Heroku, etc.), use it directly
	if AppConfig.DatabaseURL != "" {
		return AppConfig.DatabaseURL
	}

	// Otherwise build from individual components (local development)
	sslMode := "disable"
	if AppConfig.Environment == "production" {
		sslMode = "require"
	}

	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		AppConfig.DBHost,
		AppConfig.DBPort,
		AppConfig.DBUser,
		AppConfig.DBPassword,
		AppConfig.DBName,
		sslMode,
	)
}

// getEnv gets environment variable or returns default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
