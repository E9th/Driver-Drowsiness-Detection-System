import threading
import time
from pathlib import Path

try:
    import pygame
except ImportError:  # pragma: no cover
    pygame = None

__all__ = ["play_alarm_loop", "play_alarm_once", "start_alarm_thread"]

ALARM_STATUS = "CRITICAL: EXTENDED DROWSINESS"
DEFAULT_ALARM_FILE = Path(__file__).with_name("alarm.mp3")

_alarm_thread = None
_alarm_stop = threading.Event()
_current_status = None


def _ensure_mixer():
    if pygame is None:
        raise RuntimeError("pygame is required for alarm playback. Install with 'pip install pygame'.")
    if not pygame.mixer.get_init():
        pygame.mixer.init()


def _alarm_worker(sound_file: Path):
    _ensure_mixer()
    while not _alarm_stop.is_set():
        pygame.mixer.music.load(str(sound_file))
        pygame.mixer.music.play()
        while pygame.mixer.music.get_busy() and not _alarm_stop.is_set():
            time.sleep(0.1)
    pygame.mixer.music.stop()


def _start_loop(sound_file: Path):
    global _alarm_thread
    if _alarm_thread and _alarm_thread.is_alive():
        return
    _alarm_stop.clear()
    _alarm_thread = threading.Thread(target=_alarm_worker, args=(sound_file,), daemon=True)
    _alarm_thread.start()


def _stop_loop():
    global _alarm_thread
    if _alarm_thread and _alarm_thread.is_alive():
        _alarm_stop.set()
        _alarm_thread.join(timeout=1.0)
    _alarm_thread = None


def start_alarm_thread(status_message: str, sound_file: Path | str | None = None):
    """Start/stop alarm based on status_message. Plays/loops while status is critical."""
    global _current_status
    sound_path = Path(sound_file) if sound_file else DEFAULT_ALARM_FILE

    if status_message == ALARM_STATUS:
        if _current_status != ALARM_STATUS:
            _start_loop(sound_path)
    else:
        if _current_status == ALARM_STATUS:
            _stop_loop()
    _current_status = status_message


def play_alarm_loop(sound_file: Path | str | None = None):
    """Manually start looping the alarm (without status control)."""
    _start_loop(Path(sound_file) if sound_file else DEFAULT_ALARM_FILE)


def play_alarm_once(sound_file: Path | str | None = None):
    """Play the alarm a single time synchronously."""
    _ensure_mixer()
    sound_path = Path(sound_file) if sound_file else DEFAULT_ALARM_FILE
    pygame.mixer.music.load(str(sound_path))
    pygame.mixer.music.play()
    while pygame.mixer.music.get_busy():
        time.sleep(0.05)
