"""
Backend API Handler for Go Backend (PostgreSQL)
Replaces Firebase connection with HTTP requests to Go backend
"""

import requests
from datetime import datetime, timezone
import logging

# Backend Configuration
BACKEND_URL = "http://localhost:8080"  # Change to your production URL when deployed
DEVICE_ID = "device_01"  # Unique device identifier

# Connection status
backend_connected = False

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def initialize_backend():
    """Test connection to backend API"""
    global backend_connected
    try:
        response = requests.get(f"{BACKEND_URL}/api/health", timeout=5)
        if response.status_code == 200:
            logger.info(f"✅ Backend connected successfully: {BACKEND_URL}")
            backend_connected = True
            return True
        else:
            logger.error(f"❌ Backend returned status {response.status_code}")
            backend_connected = False
            return False
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Failed to connect to backend: {e}")
        backend_connected = False
        return False

def _ensure_connection():
    """Lazy-initialize backend connection if not yet connected."""
    global backend_connected
    if not backend_connected:
        initialize_backend()
    return backend_connected


def _map_status_to_level(status: str) -> str:
    s = (status or "").lower()
    if "critical" in s:
        return "high"
    if "drowsiness" in s:
        return "medium"
    return "low"

def send_data_to_backend(data):
    """
    Send minimal payload required by PostgreSQL backend.
    Only sends: device_id (via URL), drowsiness_level, timestamp, status.
    """
    if not backend_connected:
        if not _ensure_connection():
            logger.warning("⚠️ Backend not connected, skipping data send")
            return False
    
    try:
        # Build minimal payload
        payload = {
            "drowsiness_level": data.get("drowsiness_level") or _map_status_to_level(data.get("status")),
            "status": data.get("status", "NORMAL"),
            "timestamp": data.get("timestamp", datetime.now(timezone.utc).isoformat()),
        }

        response = requests.post(
            f"{BACKEND_URL}/api/devices/{DEVICE_ID}/data",
            json=payload,
            timeout=5,
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


def send_alert_to_backend(alert_type, severity="medium"):
    """
    Send alert to backend
    
    Args:
        alert_type (str): Type of alert (e.g., 'drowsiness_detected', 'eye_closure_critical')
        severity (str): Severity level ('low', 'medium', 'high')
    """
    if not backend_connected:
        if not _ensure_connection():
            logger.warning("⚠️ Backend not connected, skipping alert send")
            return False
    
    try:
        alert_data = {
            "alert_type": alert_type,
            "severity": severity,
            "timestamp": datetime.now().isoformat()
        }
        
        # Send POST request to backend
        response = requests.post(
            f"{BACKEND_URL}/api/devices/{DEVICE_ID}/alert",
            json=alert_data,
            timeout=5
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
        response = requests.get(
            f"{BACKEND_URL}/api/devices/{DEVICE_ID}/data",
            timeout=5
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
    """Cleanup backend connection"""
    global backend_connected
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
