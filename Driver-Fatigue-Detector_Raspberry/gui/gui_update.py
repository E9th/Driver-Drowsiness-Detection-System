"""
Headless detection loop: no video/landmarks. Uses detector only.
Detection 100%, status display, sound, backend send, event log.
"""
import time
from datetime import datetime
import tkinter as tk
from tkinter import messagebox
from core.backend_api import send_data, send_alert
from core.sound import start_alarm_thread

#-- Global variables for GUI components and state
video_label = None
status_value_label = None
status_display_label = None
progress_bar = None
ear_value_label = None
yawn_value_label = None
blink_value_label = None
yawn_count_value_label = None
doze_value_label = None
event_log_listbox = None
start_button = None
stop_button = None
root = None
vs = None
detector = None
last_logged_status = None
detection_enabled = False
camera_available = False

#-- Detection: 10 FPS for stable Pi performance and accurate consecutive-frame counting
DETECTION_INTERVAL_MS = 100
FIREBASE_SEND_INTERVAL = 30
CRITICAL_DEBOUNCE_SECONDS = 10
YAWN_DEBOUNCE_SECONDS = 3
CRITICAL_FRAMES_THRESHOLD = 50  # ~5 sec at 10 FPS → CRITICAL

drowsy_active = False
eye_blink_count = 0
yawn_count = 0
progress_full_count = 0
closed_eye_time = 0
alert_triggered = False
last_backend_send_time = 0
last_yawn_event_time = 0.0
last_yawn_send_time = 0.0
current_detection_data = {}


def set_gui_refs(refs):
    global video_label, start_button, stop_button, status_value_label, status_display_label
    global progress_bar, blink_value_label, yawn_count_value_label
    global doze_value_label, ear_value_label, yawn_value_label, event_log_listbox
    global root, vs, camera_available, detector

    video_label = refs.get("video_label")
    start_button = refs.get("start_button")
    stop_button = refs.get("stop_button")
    status_value_label = refs.get("status_value_label")
    status_display_label = refs.get("status_display_label")
    progress_bar = refs.get("progress_bar")
    blink_value_label = refs.get("blink_value_label")
    yawn_count_value_label = refs.get("yawn_count_value_label")
    doze_value_label = refs.get("doze_value_label")
    ear_value_label = refs.get("ear_value_label")
    yawn_value_label = refs.get("yawn_value_label")
    event_log_listbox = refs.get("event_log_listbox")
    root = refs.get("root")
    vs = refs.get("vs")
    camera_available = refs.get("camera_available", False)
    detector = refs.get("detector")


def _append_log(message: str, max_entries: int = 100) -> None:
    """Add timestamped log entry to event log."""
    global event_log_listbox
    if not event_log_listbox or not event_log_listbox.winfo_exists():
        return
    try:
        ts = datetime.now().strftime("%H:%M:%S.%f")[:-3]
        entry = f"[{ts}] {message}"
        event_log_listbox.insert(tk.END, entry)
        event_log_listbox.see(tk.END)
        count = event_log_listbox.size()
        if count > max_entries:
            event_log_listbox.delete(0, count - max_entries - 1)
    except Exception:
        pass


def _send_periodic_backend(status_message: str, data: dict) -> None:
    global last_backend_send_time, last_yawn_send_time
    now = time.time()
    minimal = {"status": status_message, "drowsiness_level": None}

    if status_message == "CRITICAL: EXTENDED DROWSINESS":
        if now - last_backend_send_time >= CRITICAL_DEBOUNCE_SECONDS:
            send_data(minimal)
            send_alert("critical_drowsiness", "high")
            last_backend_send_time = now
        return

    if status_message == "YAWN DETECTED":
        if now - last_yawn_send_time >= YAWN_DEBOUNCE_SECONDS:
            minimal["drowsiness_level"] = "medium"
            send_data(minimal)
            send_alert("yawn_detected", "medium")
            last_yawn_send_time = now
        return

    if now - last_backend_send_time >= FIREBASE_SEND_INTERVAL:
        send_data(minimal)
        if status_message == "DROWSINESS DETECTED":
            send_alert("drowsiness_detected", "medium")
        last_backend_send_time = now


def update_frame() -> None:
    """Headless detection loop: detector only, no video. Updates status, sound, backend, log."""
    global drowsy_active, eye_blink_count, yawn_count, progress_full_count
    global closed_eye_time, alert_triggered, last_yawn_event_time, current_detection_data
    global last_logged_status

    if not root or not root.winfo_exists():
        return
    if not detection_enabled or not camera_available:
        root.after(DETECTION_INTERVAL_MS, update_frame)
        return
    if not detector or not getattr(detector, "cap", None) or not detector.cap.isOpened():
        root.after(DETECTION_INTERVAL_MS, update_frame)
        return

    try:
        _, stats = detector.process_frame(skip_draw=True)
        if not stats:
            root.after(DETECTION_INTERVAL_MS, update_frame)
            return

        faces = stats.get("faces_detected", 0)
        drowsiness = stats.get("drowsiness", False)
        yawning = stats.get("yawning", False)
        ear = stats.get("ear", 0.0)
        mar = stats.get("mar", 0.0)

        status_message = "NORMAL"
        status_color = "#4CAF50"

        if faces == 0:
            status_message = "NO FACE DETECTED"
            status_color = "#FF9800"
            closed_eye_time = 0
            drowsy_active = False
            alert_triggered = False
        else:
            if drowsiness:
                closed_eye_time += 1
                if not drowsy_active:
                    eye_blink_count += 1
                    drowsy_active = True
                status_message = "DROWSINESS DETECTED"
                status_color = "#F44336"
                if closed_eye_time >= CRITICAL_FRAMES_THRESHOLD:
                    alert_triggered = True
                    status_message = "CRITICAL: EXTENDED DROWSINESS"
                    status_color = "#D32F2F"
                    # นับ Critical ทันทีเมื่อเข้าสถานะ CRITICAL (หลับตาต่อเนื่อง ~5 วินาที)
                    if closed_eye_time == CRITICAL_FRAMES_THRESHOLD:
                        progress_full_count += 1
            else:
                closed_eye_time = 0
                drowsy_active = False
                alert_triggered = False

            if yawning:
                now_t = time.time()
                if (now_t - last_yawn_event_time) >= 3.0:
                    yawn_count += 1
                    last_yawn_event_time = now_t
                if status_message == "NORMAL":
                    status_message = "YAWN DETECTED"
                    status_color = "#FF9800"

        if alert_triggered:
            if progress_bar:
                progress_bar["value"] = min(100, progress_bar["value"] + 3)
                if progress_bar["value"] >= 100:
                    progress_full_count += 1
                    progress_bar["value"] = 0
        else:
            if progress_bar and progress_bar["value"] > 0:
                progress_bar["value"] = max(0, progress_bar["value"] - 1)

        start_alarm_thread(status_message)
        if ear_value_label:
            ear_value_label.config(text=f"{ear:.3f}")
        if yawn_value_label:
            yawn_value_label.config(text=f"{mar:.2f}")
        if blink_value_label:
            blink_value_label.config(text=str(eye_blink_count))
        if yawn_count_value_label:
            yawn_count_value_label.config(text=str(yawn_count))
        if doze_value_label:
            doze_value_label.config(text=str(progress_full_count))
        if status_value_label:
            status_value_label.config(text=status_message, fg=status_color)
        if status_display_label:
            status_display_label.config(text=status_message, fg=status_color)

        # Log status changes (avoid duplicate consecutive entries)
        if last_logged_status != status_message:
            _append_log(status_message)
            last_logged_status = status_message

        current_detection_data = {
            "ear": ear,
            "mouth_distance": mar,
            "status": status_message,
            "drowsiness_events": eye_blink_count,
            "yawn_events": yawn_count,
            "critical_alerts": progress_full_count,
        }
        _send_periodic_backend(status_message, current_detection_data)

    except Exception as e:
        print(f"[Detection] Error: {e}")
    finally:
        if root and root.winfo_exists():
            root.after(DETECTION_INTERVAL_MS, update_frame)


def start_video() -> None:
    global detection_enabled, last_logged_status
    detection_enabled = True
    last_logged_status = None
    _append_log("Detection STARTED")
    if start_button:
        start_button.config(state="disabled", text="SYSTEM RUNNING", bg="#37474F")
    if stop_button:
        stop_button.config(state="normal")
    if status_value_label:
        status_value_label.config(text="DETECTION ACTIVE", fg="#4CAF50")
    if status_display_label:
        status_display_label.config(text="DETECTION ACTIVE", fg="#4CAF50")
    update_frame()


def stop_video() -> None:
    global detection_enabled
    detection_enabled = False
    _append_log("Detection STOPPED")
    if start_button:
        start_button.config(state="normal", text="START DETECTION", bg="#4CAF50")
    if stop_button:
        stop_button.config(state="disabled")
    if status_value_label:
        status_value_label.config(text="SYSTEM STOPPED", fg="#FF9800")
    if status_display_label:
        status_display_label.config(text="STOPPED", fg="#FF9800")


def reset_values() -> None:
    global eye_blink_count, yawn_count, progress_full_count, closed_eye_time
    global alert_triggered, drowsy_active
    eye_blink_count = yawn_count = progress_full_count = closed_eye_time = 0
    _append_log("Counts RESET")
    alert_triggered = drowsy_active = False
    if blink_value_label:
        blink_value_label.config(text="0")
    if yawn_count_value_label:
        yawn_count_value_label.config(text="0")
    if doze_value_label:
        doze_value_label.config(text="0")
    if ear_value_label:
        ear_value_label.config(text="0.000")
    if yawn_value_label:
        yawn_value_label.config(text="0.00")
    if progress_bar:
        progress_bar["value"] = 0
    if status_value_label:
        status_value_label.config(text="RESET COMPLETE", fg="#4CAF50")
    if status_display_label:
        status_display_label.config(text="RESET", fg="#4CAF50")


def exit_program():
    on_closing()


def change_camera_source(source: int) -> None:
    global vs, camera_available, detection_enabled
    if detector and getattr(detector, "cap", None) and detector.cap.isOpened():
        messagebox.showinfo("Camera Source", "Using detector camera. Change disabled in headless mode.")
        return
    if vs:
        try:
            vs.stop()
        except Exception:
            pass
    try:
        from imutils.video import VideoStream
        vs = VideoStream(src=source).start()
        time.sleep(2.0)
        frame = vs.read()
        camera_available = frame is not None
        if camera_available:
            messagebox.showinfo("Camera Source", f"Camera changed to {source}")
            if not detection_enabled:
                start_video()
        else:
            messagebox.showerror("Camera Error", f"Failed to connect to camera {source}")
    except Exception as e:
        messagebox.showerror("Camera Error", str(e))


def on_closing() -> None:
    global vs
    if vs:
        try:
            vs.stop()
        except Exception:
            pass
    try:
        import cv2
        cv2.destroyAllWindows()
    except Exception:
        pass
    if root:
        try:
            root.destroy()
        except Exception:
            pass
