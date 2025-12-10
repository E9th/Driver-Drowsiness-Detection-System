package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"driver-drowsiness-backend/config"
	"driver-drowsiness-backend/database"
	"driver-drowsiness-backend/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	log.Println("🚗 Starting Driver Drowsiness Detection Backend...")

	// Load configuration
	config.LoadConfig()

	// Connect to database
	if err := database.Connect(); err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Run migrations
	if err := database.Migrate(); err != nil {
		log.Fatalf("❌ Failed to run migrations: %v", err)
	}

	// Initial purge of previous days' data (retain only today)
	if err := database.PurgeNonTodayData(); err != nil {
		log.Printf("⚠️ Initial purge encountered an error: %v", err)
	}

	// Schedule daily purge at midnight UTC
	database.ScheduleDailyPurge()

	// Seed sample devices (for testing)
	if err := database.SeedDevices(); err != nil {
		log.Printf("⚠️ Warning: Failed to seed devices: %v", err)
	}

	// Setup Gin router
	router := setupRouter()

	// Setup graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan
		log.Println("\n🛑 Shutting down gracefully...")
		database.Close()
		os.Exit(0)
	}()

	// Start server
	port := config.AppConfig.ServerPort
	log.Printf("🚀 Server starting on port %s", port)
	log.Printf("📡 API Endpoint: http://localhost:%s", port)
	log.Printf("💚 Health Check: http://localhost:%s/health", port)

	if err := router.Run(":" + port); err != nil {
		log.Fatalf("❌ Failed to start server: %v", err)
	}
}

func setupRouter() *gin.Engine {
	// Set Gin mode
	if config.AppConfig.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()

	// CORS middleware - relax policy to allow all origins (no cookies)
	router.Use(cors.New(cors.Config{
		AllowAllOrigins: true,
		AllowMethods:    []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders: []string{
			"Origin", "Content-Type", "Authorization", "Accept", "Cache-Control", "Pragma",
		},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
		MaxAge:           43200, // 12 hours
	}))

	// Root endpoints
	router.GET("/", handlers.Root)
	router.GET("/health", handlers.HealthCheck)
	router.GET("/.well-known/appspecific/com.chrome.devtools.json", handlers.DevToolsManifest)

	// API routes
	api := router.Group("/api")
	{
		// Auth routes
		api.POST("/auth/register", handlers.Register)
		api.POST("/auth/login", handlers.Login)
		api.GET("/auth/me", handlers.AuthMiddleware(), handlers.Me)

		// Health check
		api.GET("/health", handlers.HealthCheck)

		// Device routes
		devices := api.Group("/devices")
		{
			// Public device list could be protected later
			devices.GET("", handlers.GetAllDevices)

			// Device-specific routes
			// These could require AuthMiddleware() later
			devices.POST("/:id/data", handlers.ReceiveDeviceData)  // Python sends data here
			devices.POST("/:id/alert", handlers.ReceiveAlert)      // Python sends alerts here
			devices.GET("/:id/data", handlers.GetDeviceLatestData) // Frontend gets latest data
			devices.GET("/:id/history", handlers.GetDeviceHistory) // Frontend gets history
			devices.GET("/:id/alerts", handlers.GetDeviceAlerts)   // Frontend gets alerts
		}
	}

	// Log all routes
	log.Println("📍 Available API endpoints:")
	for _, route := range router.Routes() {
		log.Printf("   %s %s", route.Method, route.Path)
	}

	return router
}
