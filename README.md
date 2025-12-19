<div align="center">

# 🚗 Driver Drowsiness Detection System

[![Version](https://img.shields.io/badge/version-2.0-blue.svg?style=for-the-badge)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=for-the-badge)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.10+-blue.svg?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Go](https://img.shields.io/badge/go-1.21+-00ADD8.svg?style=for-the-badge&logo=go&logoColor=white)](https://golang.org)
[![React](https://img.shields.io/badge/react-18.3+-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)

### 🎯 A comprehensive real-time driver fatigue detection system with AI-powered monitoring, web dashboard, and alert management

*Final Year Project - Computer Engineering*

---

[📋 Table of Contents](#-table-of-contents) • [🎥 Demo](#-video-demo) • [🚀 Quick Start](#-installation--setup) • [📖 Documentation](#-api-documentation) • [👥 Authors](#-authors)

</div>

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [🎥 Video Demo](#-video-demo)
- [👥 Authors](#-authors)
- [✨ Features](#-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🛠️ Technology Stack](#️-technology-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Installation & Setup](#-installation--setup)
- [💻 Usage](#-usage)
- [📡 API Documentation](#-api-documentation)
- [⚙️ Configuration](#️-configuration)
- [🚢 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🎯 Overview

<div align="center">

### 🌟 **An Intelligent Solution for Road Safety**

</div>

The **Driver Drowsiness Detection System** is an intelligent solution designed to monitor driver fatigue in real-time using computer vision and machine learning. The system consists of three main components:

<div align="center">

| 🧠 **AI Detection Module** | 🔧 **Backend API** | 🎨 **Web Dashboard** |
|:---:|:---:|:---:|
| Real-time face and eye tracking | RESTful API for data management | Modern React-based frontend |
| OpenCV & MediaPipe | Go & PostgreSQL | TypeScript & Tailwind CSS |

</div>

The system continuously analyzes driver behavior, detects signs of drowsiness, and triggers alerts to prevent accidents. It provides comprehensive dashboards for both drivers and administrators to monitor fatigue levels, view historical data, and manage alerts.

---

## 🎥 Video Demo

<div align="center">

### 🎬 **AI Drowsiness Detection in Action**

Watch our AI system detect driver drowsiness in real-time using facial recognition and eye tracking technology.

</div>

<div align="center">

**📹 Demo Video: AI Face Detection & Drowsiness Monitoring**

[![Watch the Demo on YouTube](https://img.shields.io/badge/▶️-Watch%20on%20YouTube-red?style=for-the-badge&logo=youtube&logoColor=white)](https://youtu.be/KB7e2CCGpOI)

<a href="https://youtu.be/KB7e2CCGpOI" target="_blank">
  <img src="https://img.youtube.com/vi/KB7e2CCGpOI/maxresdefault.jpg" alt="Driver Drowsiness Detection Demo" style="max-width:100%; border-radius:8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
</a>

<details>
<summary><b>📺 Video Details</b></summary>

**🎥 YouTube Video:** [Watch on YouTube](https://youtu.be/KB7e2CCGpOI)

This demonstration video showcases:
- ✅ Real-time face detection using Haar Cascade classifier
- ✅ Eye landmark detection with MediaPipe
- ✅ Eye Aspect Ratio (EAR) calculation
- ✅ Drowsiness level classification (Normal → Low → Medium → High)
- ✅ Visual feedback with live video feed
- ✅ Audio alert system activation
- ✅ GUI interface with status indicators

> 💡 **Click the image above or the button to watch the full demo on YouTube!**

</details>

</div>

---

## 👥 Authors

<div align="center">

### 🎓 **Final Year Project - Computer Engineering**

This project was developed by:

<table>
<tr>
<td align="center">
<strong>Mr. Patchara Al-umaree</strong>
</td>
<td align="center">
<strong>Mr. Thanapon Dongphuyaw</strong>
</td>
<td align="center">
<strong>Mr. Disorn Suppartum</strong>
</td>
</tr>
</table>

</div>

---

## ✨ Features

### 🤖 AI Detection Module

<div align="center">

| Feature | Description |
|:---:|:---|
| 👁️ **Real-time Face Detection** | Haar Cascade classifier for robust face detection |
| 📊 **Eye Aspect Ratio (EAR) Calculation** | Precise eye closure detection using facial landmarks |
| 🎯 **Drowsiness Level Classification** | Multi-level fatigue detection (normal, low, medium, high) |
| 🖥️ **Visual Feedback** | Real-time GUI with live video feed and status indicators |
| 🔊 **Audio Alerts** | Automatic alarm system when drowsiness is detected |
| 🔄 **Cross-platform Support** | Works on Raspberry Pi and Windows systems |

</div>

### 🔧 Backend API

<div align="center">

| Feature | Description |
|:---:|:---|
| 🌐 **RESTful Architecture** | Clean and well-structured API endpoints |
| 🗄️ **PostgreSQL Database** | Reliable data storage with automatic migrations |
| 🔐 **JWT Authentication** | Secure user authentication and authorization |
| ⚡ **Real-time Data Processing** | Efficient handling of device data streams |
| 🚨 **Alert Management** | Comprehensive alert tracking and acknowledgment system |
| 👨‍💼 **Admin Dashboard Support** | Specialized endpoints for administrative functions |
| 🧹 **Automatic Data Purge** | Daily cleanup of old data to maintain performance |

</div>

### 🎨 Web Dashboard

<div align="center">

| Feature | Description |
|:---:|:---|
| 🎨 **Modern UI/UX** | Beautiful, responsive design built with React and Tailwind CSS |
| 🚗 **Driver Dashboard** | Personal monitoring interface with real-time statistics |
| 👑 **Master Dashboard** | Administrative overview with multi-driver analytics |
| 🔑 **User Authentication** | Secure login and registration system |
| 👤 **Profile Management** | User profile customization and settings |
| 📈 **Data Visualization** | Interactive charts and graphs using Recharts |
| 🔄 **Real-time Updates** | Live data synchronization with backend |

</div>

---

## 🏗️ System Architecture

<div align="center">

```
╔═══════════════════════════════════════════════════════════════╗
║          🚗 Driver Drowsiness Detection System 🚗              ║
╚═══════════════════════════════════════════════════════════════╝
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   AI Module   │    │  Go Backend   │    │ React Frontend │
│   (Python)    │───▶│     (API)     │◀───│   (Dashboard)  │
│               │    │               │    │               │
│ • OpenCV      │    │ • PostgreSQL  │    │ • React 18    │
│ • MediaPipe   │    │ • JWT Auth    │    │ • TypeScript  │
│ • Haar Cascade│    │ • REST API    │    │ • Tailwind CSS│
└───────────────┘    └───────────────┘    └───────────────┘
        │                     │                     │
        │                     │                     │
        └─────────────────────┴─────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │    Database     │
                    └─────────────────┘
```

</div>

### 📊 Data Flow

<div align="center">

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Detection  │────▶│ Processing  │────▶│Transmission │
│  (Camera)   │     │  (EAR Calc) │     │  (REST API) │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│Visualization│◀────│  Storage    │◀────│   Backend   │
│  (Frontend) │     │ (PostgreSQL)│     │   (Go API)  │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐
│   Alerts    │
│ (Audio/UI)  │
└─────────────┘
```

**Flow Steps:**
1. 📹 **Detection** - AI module captures video feed and analyzes driver's face
2. 🧮 **Processing** - Eye aspect ratio and drowsiness metrics are calculated
3. 📡 **Transmission** - Data is sent to Go backend via REST API
4. 💾 **Storage** - Backend stores data in PostgreSQL database
5. 📊 **Visualization** - React frontend fetches and displays data in real-time
6. 🚨 **Alerts** - System triggers audio/visual alerts when drowsiness is detected

</div>

---

## 🛠️ Technology Stack

### 🤖 AI Detection Module

<div align="center">

| Technology | Purpose |
|:---:|:---|
| 🐍 **Python 3.10+** | Core programming language |
| 📷 **OpenCV** | Computer vision and image processing |
| 👁️ **MediaPipe** | Face and landmark detection |
| 🔢 **NumPy** | Numerical computations |
| 🔬 **SciPy** | Scientific computing |
| 🖼️ **Tkinter** | GUI framework |
| 🌐 **Requests** | HTTP client for API communication |

</div>

### 🔧 Backend API

<div align="center">

| Technology | Purpose |
|:---:|:---|
| 🐹 **Go 1.21+** | Core programming language |
| 🚀 **Gin** | Web framework |
| 🗄️ **PostgreSQL** | Relational database |
| 🔐 **JWT** | Authentication tokens |
| 📦 **lib/pq** | PostgreSQL driver |

</div>

### 🎨 Frontend Dashboard

<div align="center">

| Technology | Purpose |
|:---:|:---|
| ⚛️ **React 18.3** | UI framework |
| 📘 **TypeScript** | Type-safe JavaScript |
| ⚡ **Vite** | Build tool and dev server |
| 🎨 **Tailwind CSS** | Utility-first CSS framework |
| 🧩 **Radix UI** | Accessible component library |
| 📈 **Recharts** | Chart library |
| 📝 **React Hook Form** | Form management |
| 🎯 **Lucide React** | Icon library |

</div>

---

## 📁 Project Structure

```
Driver-Drowsiness-Detection-System/
│
├── Driver-Fatigue-Detector_Raspberry/    # AI Detection Module
│   ├── core/
│   │   ├── detector.py                   # Main detection logic
│   │   ├── calculation.py                # EAR calculations
│   │   ├── backend_api.py                 # API client
│   │   ├── notification_handler.py       # Alert management
│   │   └── sound.py                      # Audio alerts
│   ├── gui/
│   │   ├── gui_main.py                   # Main GUI window
│   │   └── gui_update.py                 # GUI update logic
│   ├── models/
│   │   └── haarcascade_frontalface_default.xml  # Face detection model
│   ├── main.py                           # Entry point
│   ├── requirements.txt                  # Python dependencies
│   ├── RUN_raspberry.sh                  # Raspberry Pi startup script
│   └── RUN_windows.bat                  # Windows startup script
│
├── go-backend/                           # Backend API
│   ├── config/
│   │   └── config.go                     # Configuration management
│   ├── database/
│   │   └── database.go                   # Database connection & migrations
│   ├── handlers/
│   │   └── handlers.go                   # API route handlers
│   ├── models/
│   │   └── models.go                     # Data models
│   ├── main.go                           # Entry point
│   ├── go.mod                            # Go dependencies
│   ├── schema_register.sql              # Database schema
│   └── README.md                         # Backend documentation
│
├── src/                                  # Frontend Dashboard
│   ├── components/
│   │   ├── AuthContext.tsx              # Authentication context
│   │   ├── HomePage.tsx                 # Landing page
│   │   ├── LoginPage.tsx                # Login interface
│   │   ├── SignupPage.tsx               # Registration interface
│   │   ├── DriverDashboard.tsx          # Driver dashboard
│   │   ├── MasterDashboard.tsx          # Admin dashboard
│   │   ├── ProfilePage.tsx              # User profile
│   │   └── ui/                          # UI components
│   ├── utils/
│   │   ├── auth.ts                      # Auth utilities
│   │   └── algorithms.ts                # Helper algorithms
│   ├── App.tsx                          # Main app component
│   └── main.tsx                         # Entry point
│
├── package.json                          # Frontend dependencies
├── vite.config.ts                        # Vite configuration
├── tailwind.config.js                    # Tailwind configuration
└── README.md                             # This file
```

---

## 🚀 Installation & Setup

### 📦 Prerequisites

<div align="center">

| Requirement | Version | Purpose |
|:---:|:---:|:---|
| 🐍 **Python** | 3.10+ | AI Detection Module |
| 🐹 **Go** | 1.21+ | Backend API |
| 📦 **Node.js** | 18+ | Frontend Dashboard |
| 🗄️ **PostgreSQL** | 14+ | Database |
| 📷 **Camera/Webcam** | Any | Detection Input |

</div>

### 1. AI Detection Module Setup

#### For Windows:
```bash
cd Driver-Fatigue-Detector_Raspberry
pip install -r requirements.txt
```

#### For Raspberry Pi:
```bash
cd Driver-Fatigue-Detector_Raspberry
pip3 install -r requirements.txt
```

#### Configuration:
Edit `core/backend_api.py` to configure the backend API URL:
```python
BACKEND_URL = "http://localhost:8080"  # Change to your backend URL
DEVICE_ID = "device_01"                 # Unique device identifier
```

### 2. Backend API Setup

#### Install Dependencies:
```bash
cd go-backend
go mod download
```

#### Database Setup:
1. Install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)
2. Create a new database:
```sql
CREATE DATABASE drowsiness_db;
```

#### Environment Configuration:
Create a `.env` file in `go-backend/` directory:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=drowsiness_db
PORT=8080
ENV=development
JWT_SECRET=your-secret-key-here
```

#### Run Database Migrations:
The backend will automatically run migrations on first startup.

### 3. Frontend Dashboard Setup

#### Install Dependencies:
```bash
npm install
```

#### Environment Configuration:
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:8080
```

#### Development Server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

---

## 💻 Usage

### 🚀 Starting the System

<div align="center">

#### **Step-by-Step Startup Guide**

</div>

#### 1️⃣ Start Backend API

```bash
cd go-backend
go run main.go
```

<div align="center">

✅ Backend will run on `http://localhost:8080`

</div>

#### 2️⃣ Start Frontend Dashboard

```bash
npm run dev
```

<div align="center">

✅ Frontend will run on `http://localhost:3000`

</div>

#### 3️⃣ Start AI Detection Module

**🪟 Windows:**
```bash
cd Driver-Fatigue-Detector_Raspberry
RUN_windows.bat
```

**🍓 Raspberry Pi:**
```bash
cd Driver-Fatigue-Detector_Raspberry
chmod +x RUN_raspberry.sh
./RUN_raspberry.sh
```

**🔧 Or directly:**
```bash
python main.py
```

### 📖 Using the System

<div align="center">

| Step | Action | Description |
|:---:|:---|:---|
| 1️⃣ | **Registration/Login** | Create an account or login through the web dashboard |
| 2️⃣ | **Device Setup** | Ensure your camera is connected and the AI module is running |
| 3️⃣ | **Monitoring** | The system will automatically detect and report drowsiness levels |
| 4️⃣ | **Dashboard** | View real-time statistics and historical data in the web interface |
| 5️⃣ | **Alerts** | System will trigger audio alerts when drowsiness is detected |

</div>

---

## 📡 API Documentation

<div align="center">

### 🌐 **Base URL**

```
http://localhost:8080/api
```

</div>

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "role": "driver"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Device Data Endpoints

#### Send Device Data (from AI module)
```http
POST /api/devices/:id/data
Content-Type: application/json

{
  "eye_closure": 0.8,
  "drowsiness_level": "high",
  "status": "drowsy",
  "timestamp": "2025-01-09T12:00:00Z"
}
```

#### Get Latest Device Data
```http
GET /api/devices/:id/data
```

#### Get Device History
```http
GET /api/devices/:id/history?limit=100
```

#### Send Alert
```http
POST /api/devices/:id/alert
Content-Type: application/json

{
  "alert_type": "drowsiness_detected",
  "severity": "high",
  "timestamp": "2025-01-09T12:00:00Z"
}
```

#### Get Device Alerts
```http
GET /api/devices/:id/alerts?limit=50
```

### Admin Endpoints (Requires Admin Role)

#### Admin Overview
```http
GET /api/admin/overview
Authorization: Bearer <admin-token>
```

#### Get All Drivers
```http
GET /api/admin/drivers
Authorization: Bearer <admin-token>
```

#### Recent Alerts
```http
GET /api/admin/recent-alerts
Authorization: Bearer <admin-token>
```

### Health Check
```http
GET /api/health
```

---

## ⚙️ Configuration

### AI Module Configuration

Key parameters in `core/detector.py`:
- `EAR_THRESHOLD` - Eye aspect ratio threshold (default: 0.25)
- `FRAME_COUNT` - Consecutive frames for drowsiness detection
- `ALERT_DURATION` - Alert sound duration

### Backend Configuration

Environment variables in `go-backend/.env`:
- Database connection settings
- JWT secret key
- Server port
- Environment mode (development/production)

### Frontend Configuration

Environment variables in root `.env`:
- `VITE_API_URL` - Backend API URL

---

## 🚢 Deployment

### Backend Deployment

#### Using Docker (Recommended):
```dockerfile
FROM golang:1.21-alpine
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o main .
EXPOSE 8080
CMD ["./main"]
```

#### Manual Deployment:
1. Build the binary:
```bash
cd go-backend
go build -o driver-drowsiness-backend main.go
```

2. Set environment variables
3. Run the binary:
```bash
./driver-drowsiness-backend
```

### Frontend Deployment

#### Build for Production:
```bash
npm run build
```

#### Deploy to Vercel/Netlify:
1. Connect your repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Configure environment variables

### AI Module Deployment

#### Raspberry Pi:
1. Install dependencies
2. Set up auto-start service:
```bash
sudo systemctl enable driver-drowsiness.service
```

#### Windows Service:
Use NSSM (Non-Sucking Service Manager) to create a Windows service.

---

## 🤝 Contributing

<div align="center">

### 💡 **Contributions Welcome!**

This is a final year project. Contributions and suggestions are welcome!

</div>

<div align="center">

| Step | Action |
|:---:|:---|
| 1️⃣ | Fork the repository |
| 2️⃣ | Create a feature branch |
| 3️⃣ | Make your changes |
| 4️⃣ | Submit a pull request |

</div>

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Patchara Al-umaree, Thanapon Dongphuyaw, Disorn Suppartum

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

<div align="center">

### 🌟 **Special Thanks**

| Organization/Project | Contribution |
|:---:|:---|
| 👁️ **OpenCV Community** | Computer vision tools and libraries |
| 🤖 **MediaPipe Team** | Face detection models and landmarks |
| ⚛️ **React Community** | Excellent frontend framework |
| 🐹 **Go Community** | Robust backend framework |
| 🌍 **Open Source Contributors** | All libraries that made this project possible |

</div>

---

<div align="center">

---

### 🎓 **Made with ❤️ by Computer Engineering Students**

**Final Year Project - Driver Drowsiness Detection System**

---

[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Documentation](https://img.shields.io/badge/Documentation-README-blue?style=for-the-badge)](README.md)

**⭐ Star this repository if you find it helpful!**

</div>
  