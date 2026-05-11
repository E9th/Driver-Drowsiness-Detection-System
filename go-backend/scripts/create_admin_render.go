package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"

	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

const (
	adminEmail    = "admin01@gmail.com"
	adminName     = "admin01"
	adminPassword = "123456a"
)

func main() {
	dbURL := strings.TrimSpace(os.Getenv("DATABASE_URL"))
	if dbURL == "" {
		log.Fatal("DATABASE_URL is not set. Use Render's Internal Database URL.")
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(adminPassword), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	var userID int
	err = db.QueryRow(`
		INSERT INTO users (email, password_hash, name, role, user_type)
		VALUES ($1, $2, $3, 'admin', 'admin')
		ON CONFLICT (email) DO UPDATE
		SET password_hash = EXCLUDED.password_hash,
			name = EXCLUDED.name,
			role = EXCLUDED.role,
			user_type = EXCLUDED.user_type
		RETURNING id
	`, adminEmail, string(hash), adminName).Scan(&userID)
	if err != nil {
		log.Fatalf("Failed to create admin: %v", err)
	}

	fmt.Println("Admin user is ready.")
	fmt.Printf("ID: %d\n", userID)
	fmt.Printf("Email: %s\n", adminEmail)
	fmt.Printf("Username: %s\n", adminName)
	fmt.Printf("Password: %s\n", adminPassword)
	fmt.Println("Role: admin")
}
