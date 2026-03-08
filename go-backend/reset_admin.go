//go:build ignore
// +build ignore

package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	email := "admin01@gmail.com"
	name := "admin01"
	password := "123456a"
	role := "admin"

	// Connect to database
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:newpassword123@localhost:5432/drowsiness_db?sslmode=disable"
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Generate bcrypt hash
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	// Delete existing admin if exists, then recreate
	_, _ = db.Exec("DELETE FROM users WHERE email = $1", email)

	// Insert new admin
	var userID int
	err = db.QueryRow(
		"INSERT INTO users (email, password_hash, name, role, user_type) VALUES ($1, $2, $3, $4, $5) RETURNING id",
		email, string(hash), name, role, "admin",
	).Scan(&userID)

	if err != nil {
		log.Fatalf("Failed to create admin: %v", err)
	}

	fmt.Printf("✅ Admin user created successfully!\n")
	fmt.Printf("   ID:       %d\n", userID)
	fmt.Printf("   Email:    %s\n", email)
	fmt.Printf("   Username: %s\n", name)
	fmt.Printf("   Password: %s\n", password)
	fmt.Printf("   Role:     %s\n", role)
}
