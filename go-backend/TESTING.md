# คู่มือการทดสอบระบบ Driver Drowsiness Detection

## ขั้นตอนที่ 1: รัน Go Backend

### วิธีที่ 1 (แนะนำ): ใช้ไฟล์ batch
1. เปิด File Explorer
2. ไปที่ `go-backend` folder
3. Double-click `run.bat`
4. จะเห็น console window แสดงว่า server กำลังรัน

### วิธีที่ 2: ใช้ Command Line
```bash
cd "c:\Users\Earth\OneDrive\Desktop\DDD\Driver Drowsiness Detection System Website\go-backend"
go run main.go
```

**เมื่อรันสำเร็จจะเห็น:**
```
🚗 Starting Driver Drowsiness Detection Backend...
✅ Configuration loaded successfully
📊 Database: postgres@localhost:5432/drowsiness_db
🌐 Server Port: 8080
✅ Database connected successfully
📊 Running database migrations...
✅ Database migrations completed successfully
🌱 Seeding sample devices...
✅ Sample devices seeded
📍 Available API endpoints:
   GET /api/health
   POST /api/devices/:id/data
   ...
🚀 Server starting on port 8080
📡 API Endpoint: http://localhost:8080
💚 Health Check: http://localhost:8080/health
```

---

## ขั้นตอนที่ 2: ทดสอบ Backend API

### วิธีที่ 1: ใช้เว็บเบราว์เซอร์
เปิดเบราว์เซอร์แล้วเข้า:
```
http://localhost:8080/api/health
```

ควรเห็น:
```json
{
  "status": "ok",
  "message": "Driver Drowsiness Detection API is running",
  "time": "2025-11-12T..."
}
```

### วิธีที่ 2: ใช้ PowerShell (curl)
```powershell
# ทดสอบ health check
Invoke-WebRequest -Uri "http://localhost:8080/api/health" -Method GET

# ส่งข้อมูลทดสอบ
$body = @{
    eye_closure = 0.8
    drowsiness_level = "high"
    status = "drowsy"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8080/api/devices/device_01/data" -Method POST -Body $body -ContentType "application/json"

# ดึงข้อมูลล่าสุด
Invoke-WebRequest -Uri "http://localhost:8080/api/devices/device_01/data" -Method GET
```

---

## ขั้นตอนที่ 3: ทดสอบ Python Integration

### 1. เปิด terminal ใหม่ (สำหรับ Python)
```bash
cd "c:\Users\Earth\OneDrive\Desktop\DDD\Driver Drowsiness Detection System Website\Driver-Fatigue-Detector_Raspberry"
```

### 2. ทดสอบ backend_api.py
```bash
python core/backend_api.py
```

**ควรเห็น:**
```
============================================================
Testing Backend API Connection
============================================================
✅ Backend connection test passed

📤 Sending test data: {'eye_closure': 0.75, 'drowsiness_level': 'high', 'status': 'drowsy'}
✅ Data sent successfully: drowsiness=high, eye_closure=0.75

📤 Sending test alert...
🚨 Alert sent successfully: type=drowsiness_detected, severity=high

📥 Getting latest data...
Latest data: {...}
```

---

## ขั้นตอนที่ 4: แก้ไข Python Script (ถ้าต้องการ)

### ตัวอย่างการแก้ไข detector.py หรือไฟล์อื่นๆ:

**เดิม (ใช้ Firebase):**
```python
from core.firebase import send_data_to_firebase, send_alert_to_firebase, initialize_firebase

initialize_firebase()
send_data_to_firebase(data)
send_alert_to_firebase("drowsiness_detected", "high")
```

**ใหม่ (ใช้ Go Backend):**
```python
from core.backend_api import send_data_to_backend, send_alert_to_backend, initialize_backend

initialize_backend()
send_data_to_backend(data)
send_alert_to_backend("drowsiness_detected", "high")
```

---

## การแก้ปัญหา (Troubleshooting)

### ❌ ปัญหา: Cannot connect to database
**แก้ไข:**
- ตรวจสอบว่า PostgreSQL กำลังรันอยู่
- ตรวจสอบ password ใน `.env` ให้ตรงกับ PostgreSQL
- ตรวจสอบว่า database `drowsiness_db` ถูกสร้างแล้ว

### ❌ ปัญหา: Port 8080 already in use
**แก้ไข:**
- เปลี่ยน PORT ใน `.env` เป็น 8081 หรือเลขอื่น
- หรือปิดโปรแกรมที่ใช้ port 8080 อยู่

### ❌ ปัญหา: Python cannot connect to backend
**แก้ไข:**
- ตรวจสอบว่า Go backend กำลังรันอยู่
- ลองเปิด http://localhost:8080/api/health ในเบราว์เซอร์
- ตรวจสอบว่า `BACKEND_URL` ใน `backend_api.py` ถูกต้อง

---

## ตัวอย่างการใช้งานจริง

### 1. รัน Go Backend (Terminal 1)
```bash
cd go-backend
go run main.go
```

### 2. รัน Python Hardware Script (Terminal 2)
```bash
cd Driver-Fatigue-Detector_Raspberry
python main.py
```

### 3. ดูข้อมูลใน Browser
เปิดเบราว์เซอร์:
- Health: http://localhost:8080/api/health
- Device Data: http://localhost:8080/api/devices/device_01/data
- History: http://localhost:8080/api/devices/device_01/history
- Alerts: http://localhost:8080/api/devices/device_01/alerts

---

## หมายเหตุสำคัญ

1. **ต้องรัน Go Backend ก่อน** ถึงจะทดสอบ Python ได้
2. **Python script และ Go backend ต้องรันพร้อมกัน** เพื่อส่งข้อมูล real-time
3. **เปิด 2 terminal:** หนึ่งสำหรับ Go, อีกหนึ่งสำหรับ Python
4. **Backend ต้องรันก่อน Frontend** เพื่อให้ React ดึงข้อมูลได้

---

## API Testing Tools (ถ้าต้องการ)

- **Postman:** https://www.postman.com/downloads/
- **Insomnia:** https://insomnia.rest/download
- **Thunder Client:** VS Code Extension

Import API endpoints:
```
POST http://localhost:8080/api/devices/device_01/data
GET  http://localhost:8080/api/devices/device_01/data
POST http://localhost:8080/api/devices/device_01/alert
GET  http://localhost:8080/api/devices/device_01/alerts
GET  http://localhost:8080/api/devices/device_01/history
```
