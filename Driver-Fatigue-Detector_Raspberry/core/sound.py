import os
import threading

# Allow disabling alarm sound via environment variable. Set to '1' or 'true' to disable.
_DISABLE_ALARM_SOUND = os.environ.get("DISABLE_ALARM_SOUND", "0").lower() in ("1", "true", "yes")

# Try to import playsound; if not available, provide a harmless stub so the app doesn't crash.
try:
    from playsound import playsound as _playsound_impl
    _PLAYSOUND_AVAILABLE = True
except Exception:
    _PLAYSOUND_AVAILABLE = False
    def _playsound_impl(path):
        # playsound missing: print a message instead of raising
        print(f"[Sound] playsound not available - would play: {path}")


def _should_play_sound():
    return (not _DISABLE_ALARM_SOUND) and _PLAYSOUND_AVAILABLE


def play_alarm_loop(path, alarm_flag):
    """
    เล่นเสียงซ้ำจนกว่า alarm_flag จะเป็น False
    ใช้สำหรับกรณีง่วงนอน (ตาปิดนาน)
    """
    try:
        if not _should_play_sound():
            print(f"[Sound] Alarm disabled or playsound missing. (path={path})")
            return

        while alarm_flag():
            _playsound_impl(path)
    except Exception as e:
        print(f"[Sound] Alarm loop error: {e}")

def play_alarm_once(path, state_flag_setter=None, state_flag_clearer=None):
    """
    เล่นเสียง 1 ครั้ง เช่นกรณีหาว
    """
    try:
        if state_flag_setter:
            state_flag_setter()

        if not _should_play_sound():
            print(f"[Sound] One-time alarm disabled or playsound missing. (path={path})")
            return

        _playsound_impl(path)
    except Exception as e:
        print(f"[Sound] One-time alarm error: {e}")
    finally:
        if state_flag_clearer:
            state_flag_clearer()

def start_alarm_thread(path, alarm_flag=lambda: False, once=False, state_flag_setter=None, state_flag_clearer=None):
    """
    เรียกใช้เสียงใน Thread แยก เพื่อไม่ให้บล็อกการทำงานของ GUI
    - once=True: เล่นครั้งเดียว
    - alarm_flag: ฟังก์ชันคืนค่า boolean สำหรับ loop
    - state_flag_setter/clearer: ตัวเลือกสำหรับจัดการ state
    """
    if once:
        threading.Thread(target=play_alarm_once, args=(path, state_flag_setter, state_flag_clearer), daemon=True).start()
    else:
        threading.Thread(target=play_alarm_loop, args=(path, alarm_flag), daemon=True).start()
