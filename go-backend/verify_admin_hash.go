package main

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	const hash = "$2a$10$kmHBXWpDEpvHUnxlt7RvWO.j4k5Flir2tgo3vVbnzERNEjWKbXJZa" // เอาค่าจาก DB มาวางตรงนี้
	const password = "Admin1234!"                                               // รหัสที่คุณใช้ล็อกอิน

	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)); err != nil {
		fmt.Println("NOT MATCH:", err)
	} else {
		fmt.Println("MATCH")
	}
}
