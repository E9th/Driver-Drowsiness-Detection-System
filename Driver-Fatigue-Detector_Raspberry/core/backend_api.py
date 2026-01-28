"""
Backend API Handler for Go Backend (PostgreSQL)
Replaces Firebase connection with HTTP requests to Go backend
"""

import requests
from datetime import datetime, timezone
import logging
import time
import os
import threading
from queue import Queue, Empty

# Backend Configuration
# ใช้ environment variable หรือ default เป็น Render production URL
# สำหรับ local development: set BACKEND_URL=http://localhost:8080
BACKEND_URL = os.getenv("BACKEND_URL", "https://driver-drowsiness-api.onrender.com")
DEVICE_ID = os.getenv("DEVICE_ID", "device_01")  # Unique device identifier

# Connection status
backend_connected = False

# PERFORMANCE FIX: Cooldown system to prevent video stuttering
# เพิ่มระบบ cooldown เพื่อไม่ให้พยายามเชื่อมต่อบ่อยเกินไป ทำให้วีดีโอสะดุด
last_connection_attempt = 0  # เวลาที่พยายามเชื่อมต่อครั้งล่าสุด
CONNECTION_RETRY_COOLDOWN = 30  # รอ 30 วินาทีก่อนจะลองเชื่อมต่อใหม่

# ASYNC QUEUE: ใช้ queue สำหรับส่งข้อมูลแบบ async เพื่อไม่ให้กล้องค้าง
_data_queue = Queue(maxsize=100)
_alert_queue = Queue(maxsize=50)
_worker_running = False
_worker_thread = None

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _async_worker():
    """
    Background worker thread that sends data/alerts to backend.
    This prevents camera lag by handling network I/O in a separate thread.
    """
    global _worker_running
    while _worker_running:
        try:
            # Process data queue
            try:
                data = _data_queue.get_nowait()
                _send_data_sync(data)
            except Empty:
                pass
            
            # Process alert queue
            try:
                alert = _alert_queue.get_nowait()
                _send_alert_sync(alert['alert_type'], alert['severity'])
            except Empty:
                pass
            
            # Small sleep to prevent CPU spinning
            time.sleep(0.01)
        except Exception as e:
            logger.error(f"❌ Async worker error: {e}")
            time.sleep(0.1)


def _start_async_worker():
    """Start the background worker thread if not already running"""
    global _worker_running, _worker_thread
    if not _worker_running:
        _worker_running = True
        _worker_thread = threading.Thread(target=_async_worker, daemon=True)
        _worker_thread.start()
        logger.info("🔄 Async worker started")


def initialize_backend():
    """Test connection to backend API and start async worker"""
    global backend_connected, last_connection_attempt
    
    # PERFORMANCE FIX: ลด timeout เพื่อไม่ให้วีดีโอสะดุด
    try:
        response = requests.get(f"{BACKEND_URL}/api/health", timeout=1.0)
        if response.status_code == 200:
            logger.info(f"✅ Backend connected successfully: {BACKEND_URL}")
            backend_connected = True
            last_connection_attempt = time.time()
            _start_async_worker()  # Start async worker when connected
            return True
        else:
            logger.error(f"❌ Backend returned status {response.status_code}")
            backend_connected = False
            last_connection_attempt = time.time()
            return False
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Failed to connect to backend: {e}")
        backend_connected = False
        last_connection_attempt = time.time()
        return False

def _ensure_connection():
    """
    Lazy-initialize backend connection if not yet connected.
    PERFORMANCE FIX: ใช้ cooldown system เพื่อไม่ให้พยายามเชื่อมต่อบ่อยเกินไป
    """
    global backend_connected, last_connection_attempt
    
    if backend_connected:
        return True
    
    # PERFORMANCE FIX: เช็ค cooldown ก่อนพยายามเชื่อมต่อใหม่
    current_time = time.time()
    if current_time - last_connection_attempt < CONNECTION_RETRY_COOLDOWN:
        return False
    
    return initialize_backend()


def _map_status_to_level(status: str) -> str:
    s = (status or "").lower()
    if "critical" in s:
        return "high"
    if "drowsiness" in s:
        return "medium"
    return "low"


def _send_data_sync(data):
    """
    Synchronous data send - called by async worker thread.
    """
    try:
        payload = {
            "drowsiness_level": data.get("drowsiness_level") or _map_status_to_level(data.get("status")),
            "status": data.get("status", "NORMAL"),
            "timestamp": data.get("timestamp", datetime.now(timezone.utc).isoformat()),
        }

        response = requests.post(
            f"{BACKEND_URL}/api/devices/{DEVICE_ID}/data",
            json=payload,
            timeout=2.0,  # Can use longer timeout since we're in background thread
        )
        
        if response.status_code == 200:
            logger.info(f"✅ Data sent successfully: level={payload.get('drowsiness_level')}, status={payload.get('status')}")
            return True
        else:
            logger.error(f"❌ Failed to send data: {response.status_code} - {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Error sending data: {e}")
        return False


def _send_alert_sync(alert_type, severity):
    """
    Synchronous alert send - called by async worker thread.
    """
    try:
        alert_data = {
            "alert_type": alert_type,
            "severity": severity,
            "timestamp": datetime.now().isoformat()
        }
        
        response = requests.post(
            f"{BACKEND_URL}/api/devices/{DEVICE_ID}/alert",
            json=alert_data,
            timeout=2.0,
        )
        
        if response.status_code == 200:
            logger.info(f"🚨 Alert sent successfully: type={alert_type}, severity={severity}")
            return True
        else:
            logger.error(f"❌ Failed to send alert: {response.status_code} - {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Error sending alert: {e}")
        return False


def send_data_to_backend(data):
    """
    Queue data to be sent asynchronously - NON-BLOCKING.
    This prevents camera lag by not waiting for network I/O.
    """
    if not backend_connected:
        if not _ensure_connection():
            logger.warning("⚠️ Backend not connected, skipping data send")
            return False
    
    try:
        # Add to queue instead of sending directly (non-blocking)
        _data_queue.put_nowait(data)
        return True
    except Exception as e:
        logger.warning(f"⚠️ Data queue full, dropping data: {e}")
        return False


def send_alert_to_backend(alert_type, severity="medium"):
    """
    Queue alert to be sent asynchronously - NON-BLOCKING.
    """
    if not backend_connected:
        if not _ensure_connection():
            logger.warning("⚠️ Backend not connected, skipping alert send")
            return False
    
    try:
        _alert_queue.put_nowait({"alert_type": alert_type, "severity": severity})
        return True
    except Exception as e:
        logger.warning(f"⚠️ Alert queue full, dropping alert: {e}")
        return False


# Compatibility wrappers for legacy imports
def send_data(data):
    """Backward-compatible alias for send_data_to_backend."""
    return send_data_to_backend(data)

def send_alert(alert_type, severity="medium"):
    """Backward-compatible alias for send_alert_to_backend."""
    return send_alert_to_backend(alert_type, severity)


def get_latest_data():
    """Get latest drowsiness data from backend"""
    if not backend_connected:
        return None
    
    try:
        # PERFORMANCE FIX: ลด timeout เป็น 0.3 วินาที (เดิม: 5 วินาที)
        response = requests.get(
            f"{BACKEND_URL}/api/devices/{DEVICE_ID}/data",
            timeout=0.3
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"❌ Failed to get data: {response.status_code}")
            return None
            
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Error getting data: {e}")
        return None


def cleanup_backend():
    """Cleanup backend connection and stop async worker"""
    global backend_connected, _worker_running
    _worker_running = False  # Stop the async worker
    logger.info("🔌 Backend connection closed")
    backend_connected = False


# Example usage and testing
if __name__ == "__main__":
    print("=" * 60)
    print("Testing Backend API Connection")
    print("=" * 60)
    
    # Test connection
    if initialize_backend():
        print("Backend connection test passed\n")
        
        # Test sending data
        test_data = {
            "eye_closure": 0.75,
            "drowsiness_level": "high",
            "status": "drowsy"
        }
        print(f"Sending test data: {test_data}")
        send_data_to_backend(test_data)
        
        # Test sending alert
        print("\nSending test alert...")
        send_alert_to_backend("drowsiness_detected", "high")
        
        # Test getting data
        print("\nGetting latest data...")
        latest = get_latest_data()
        if latest:
            print(f"Latest data: {latest}")
        
        cleanup_backend()
    else:
        print("❌ Backend connection test failed")
        print("Make sure Go backend is running on http://localhost:8080")
