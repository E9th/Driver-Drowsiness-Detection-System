# 🚀 Deploy Go Backend to Render

## วิธีที่ 1: Deploy ด้วย Blueprint (แนะนำ)

### ขั้นตอน:

1. **Push code ไป GitHub/GitLab**
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **สร้าง Render Account**
   - ไปที่ [render.com](https://render.com) และ sign up

3. **สร้าง Blueprint**
   - ไปที่ Dashboard > Blueprints > New Blueprint
   - เชื่อมต่อกับ GitHub/GitLab repo
   - เลือก branch ที่ต้องการ deploy
   - Render จะอ่าน `render.yaml` และสร้าง services ให้อัตโนมัติ

4. **รอ Deploy เสร็จ**
   - Render จะสร้าง PostgreSQL database และ Web service ให้
   - จะได้ URL เช่น `https://driver-drowsiness-api.onrender.com`

---

## วิธีที่ 2: Deploy แบบ Manual

### ขั้นตอน:

1. **สร้าง PostgreSQL Database บน Render**
   - ไปที่ Dashboard > New > PostgreSQL
   - ตั้งชื่อ: `driver-drowsiness-db`
   - เลือก Region: Singapore (ใกล้ที่สุด)
   - Plan: Free (หรือ Starter สำหรับ production)
   - Copy `Internal Database URL` เก็บไว้

2. **สร้าง Web Service**
   - ไปที่ Dashboard > New > Web Service
   - เชื่อมต่อกับ GitHub/GitLab repo
   - ตั้งค่า:
     - **Name**: driver-drowsiness-api
     - **Region**: Singapore
     - **Branch**: main
     - **Root Directory**: `go-backend`
     - **Runtime**: Docker
     - **Dockerfile Path**: `Dockerfile`
     - **Plan**: Free

3. **ตั้งค่า Environment Variables**
   - ไปที่ Settings > Environment
   - เพิ่ม:
     ```
     ENV=production
     PORT=8080
     JWT_SECRET=<สร้าง secret แบบสุ่ม 32 ตัวอักษร>
     DATABASE_URL=<paste Internal Database URL จากขั้นตอน 1>
     ```

4. **Deploy**
   - กด "Manual Deploy" หรือ push code ใหม่
   - รอสักครู่ จะได้ URL

---

## 🔗 เชื่อมต่อกับ Hardware (Python)

หลังจาก deploy เสร็จ คุณจะได้ URL เช่น:
```
https://driver-drowsiness-api.onrender.com
```

### แก้ไขไฟล์ Python (backend_api.py)

```python
# เปลี่ยนจาก
API_BASE_URL = "http://localhost:8080"

# เป็น
API_BASE_URL = "https://driver-drowsiness-api.onrender.com"
```

### ตัวอย่าง API Endpoints:

```python
import requests

BASE_URL = "https://driver-drowsiness-api.onrender.com"

# Health Check
response = requests.get(f"{BASE_URL}/health")
print(response.json())

# Login
response = requests.post(f"{BASE_URL}/api/auth/login", json={
    "email": "driver@example.com",
    "password": "password123"
})
token = response.json().get("token")

# ส่งข้อมูล Drowsiness (พร้อม token)
headers = {"Authorization": f"Bearer {token}"}
response = requests.post(f"{BASE_URL}/api/drowsiness", 
    json={"level": 0.75, "alert": True},
    headers=headers
)
```

---

## 🐳 ทดสอบ Docker ใน Local ก่อน Deploy

```bash
# Build Docker image
docker build -t driver-drowsiness-api .

# Run with local PostgreSQL
docker run -p 8080:8080 \
  -e ENV=development \
  -e PORT=8080 \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5432 \
  -e DB_USER=postgres \
  -e DB_PASSWORD=yourpassword \
  -e DB_NAME=drowsiness_db \
  -e JWT_SECRET=your-secret-key \
  driver-drowsiness-api
```

---

## ⚠️ หมายเหตุสำคัญ

1. **Free Plan Limitations**
   - Web service จะ sleep หลังไม่มี request 15 นาที
   - Request แรกหลัง sleep อาจใช้เวลา 30-60 วินาที
   - Database มี storage 1GB

2. **สำหรับ Production**
   - ใช้ Starter plan ($7/เดือน) เพื่อไม่ให้ sleep
   - ตั้งค่า `JWT_SECRET` ที่แข็งแกร่ง
   - Enable SSL/HTTPS (Render ให้ฟรี)

3. **Monitoring**
   - ดู logs ได้ที่ Dashboard > Logs
   - ตั้งค่า Alert ที่ Settings > Alerts

---

## 📊 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `ENV` | Environment (development/production) | Yes |
| `PORT` | Server port (Render sets automatically) | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret for JWT tokens | Yes |
| `DB_HOST` | Database host (local only) | No |
| `DB_PORT` | Database port (local only) | No |
| `DB_USER` | Database user (local only) | No |
| `DB_PASSWORD` | Database password (local only) | No |
| `DB_NAME` | Database name (local only) | No |
