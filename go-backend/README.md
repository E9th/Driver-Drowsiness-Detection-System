# Driver Drowsiness Detection - Go Backend

Backend API สำหรับระบบตรวจจับความง่วงของคนขับรถ รับข้อมูลจาก Python hardware และให้บริการ API แก่ React frontend

## 🚀 Quick Start

### 1. ติดตั้ง Dependencies
```bash
go mod download
```

### 2. ติดตั้ง PostgreSQL
ดาวน์โหลดและติดตั้ง PostgreSQL จาก https://www.postgresql.org/download/

สร้าง database:
```sql
CREATE DATABASE drowsiness_db;
```

### 3. ตั้งค่า Environment Variables
คัดลอก `.env.example` เป็น `.env` และแก้ไขค่าตามการตั้งค่า PostgreSQL ของคุณ:
```bash
cp .env.example .env
```

แก้ไขค่าใน `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=drowsiness_db
PORT=8080
```

### 4. รัน Backend
```bash
go run main.go
```

Server จะเริ่มทำงานที่ `http://localhost:8080`

## 📡 API Endpoints

### Health Check
- **GET** `/api/health` - ตรวจสอบสถานะ API

### Device Data (Python Hardware → Backend)
- **POST** `/api/devices/:id/data` - รับข้อมูล drowsiness จาก Python script
  ```json
  {
    "eye_closure": 0.8,
    "drowsiness_level": "high",
    "status": "drowsy",
    "timestamp": "2025-11-09T12:00:00Z"
  }
  ```

- **POST** `/api/devices/:id/alert` - รับ alert จาก Python script
  ```json
  {
    "alert_type": "drowsiness_detected",
    "severity": "high",
    "timestamp": "2025-11-09T12:00:00Z"
  }
  ```

### Device Data (Backend → Frontend)
- **GET** `/api/devices` - ดึงรายการ device ทั้งหมด
- **GET** `/api/devices/:id/data` - ดึงข้อมูลล่าสุดของ device
- **GET** `/api/devices/:id/history?limit=100` - ดึงประวัติข้อมูล
- **GET** `/api/devices/:id/alerts?limit=50` - ดึงรายการ alerts

## 🗄️ Database Schema

### Table: devices
```sql
id VARCHAR(50) PRIMARY KEY
driver_email VARCHAR(255)
status VARCHAR(50)
last_update TIMESTAMP
created_at TIMESTAMP
```

### Table: drowsiness_data
```sql
id SERIAL PRIMARY KEY
device_id VARCHAR(50)
eye_closure FLOAT
drowsiness_level VARCHAR(50)
status VARCHAR(50)
timestamp TIMESTAMP
created_at TIMESTAMP
```

### Table: alerts
```sql
id SERIAL PRIMARY KEY
device_id VARCHAR(50)
alert_type VARCHAR(100)
severity VARCHAR(50)
acknowledged BOOLEAN
status VARCHAR(50)
timestamp TIMESTAMP
created_at TIMESTAMP
```

## 🐍 Python Integration

แก้ไข Python script (`core/firebase.py`) ให้ส่งข้อมูลมายัง Go backend:

```python
import requests

BACKEND_URL = "http://localhost:8080"
DEVICE_ID = "device_01"

# ส่งข้อมูล drowsiness
def send_data_to_backend(data):
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/devices/{DEVICE_ID}/data",
            json=data,
            timeout=5
        )
        if response.status_code == 200:
            print("✅ Data sent successfully")
        else:
            print(f"❌ Error: {response.status_code}")
    except Exception as e:
        print(f"❌ Failed to send data: {e}")

# ส่ง alert
def send_alert_to_backend(alert_type, severity):
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/devices/{DEVICE_ID}/alert",
            json={
                "alert_type": alert_type,
                "severity": severity
            },
            timeout=5
        )
        if response.status_code == 200:
            print("🚨 Alert sent successfully")
    except Exception as e:
        print(f"❌ Failed to send alert: {e}")
```

## 🧪 Testing

### ทดสอบด้วย curl:

**ส่งข้อมูล:**
```bash
curl -X POST http://localhost:8080/api/devices/device_01/data \
  -H "Content-Type: application/json" \
  -d '{"eye_closure": 0.8, "drowsiness_level": "high", "status": "drowsy"}'
```

**ดึงข้อมูลล่าสุด:**
```bash
curl http://localhost:8080/api/devices/device_01/data
```

**ดึงประวัติ:**
```bash
curl http://localhost:8080/api/devices/device_01/history?limit=10
```

## 📦 Project Structure

```
go-backend/
├── main.go              # Entry point
├── config/              
│   └── config.go        # Configuration & .env loader
├── database/
│   └── database.go      # Database connection & migrations
├── models/
│   └── models.go        # Data structures
├── handlers/
│   └── handlers.go      # API handlers
├── .env                 # Environment variables
├── .env.example         # Example environment variables
└── go.mod               # Go dependencies
```

## 🔧 Deployment

### Deploy บน Railway / Render / Fly.io
1. Push โค้ดขึ้น GitHub
2. เชื่อมต่อ repository กับ hosting platform
3. ตั้งค่า environment variables
4. Platform จะ detect Go project และ build อัตโนมัติ

### Environment Variables สำหรับ Production:
```
DB_HOST=your-postgres-host
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=drowsiness_db
PORT=8080
ENV=production
```

## 📝 Notes

- Backend จะสร้าง tables อัตโนมัติเมื่อรันครั้งแรก (auto-migration)
- มี sample devices (`device_01`, `device_02`) ถูกสร้างอัตโนมัติ
- CORS ถูกเปิดให้ frontend เข้าถึงได้
- ข้อมูลจะถูกจัดเก็บใน PostgreSQL แทน Firebase

## 🤝 Integration Flow

```
[Python Hardware] → POST data → [Go Backend] → [PostgreSQL]
                                      ↓
                                [React Frontend] ← GET data
```
