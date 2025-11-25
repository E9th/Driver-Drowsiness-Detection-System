import cv2
import numpy as np
from scipy.spatial import distance as dist
import mediapipe as mp
from datetime import datetime

class FatigueDetector:
    def __init__(self):
        # Constants for detection
        self.EYE_AR_THRESH = 0.25
        self.EYE_AR_CONSEC_FRAMES = 48
        self.MOUTH_AR_THRESH = 0.7
        self.MOUTH_AR_CONSEC_FRAMES = 48
        self.HEAD_TILT_THRESH = 10
        self.HEAD_TILT_CONSEC_FRAMES = 48
        
        # Detection counters
        self.eye_counter = 0
        self.mouth_counter = 0
        self.head_tilt_counter = 0
        
        # Detection components
        self.cap = None
        self.face_mesh = None
        
        print("👁️ FatigueDetector initialized (MediaPipe mode)")
    
    def initialize(self):
        """เริ่มต้นระบบตรวจจับ"""
        try:
            print("🔧 Initializing fatigue detection components...")
            
            # Initialize MediaPipe FaceMesh
            if not self._load_detectors():
                return False
            
            # เริ่มต้น video capture
            if not self._initialize_camera():
                return False
            
            print("✅ Fatigue detector initialized successfully")
            return True
            
        except Exception as e:
            print(f"❌ Error initializing fatigue detector: {e}")
            return False
    
    def _load_detectors(self):
        """Initialize MediaPipe FaceMesh (replace dlib)."""
        try:
            mp_face_mesh = mp.solutions.face_mesh
            # static_image_mode=False, max_num_faces=2, refine_landmarks=True for iris detail (optional)
            self.face_mesh = mp_face_mesh.FaceMesh(
                static_image_mode=False,
                max_num_faces=2,
                refine_landmarks=False,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            )
            print("✅ MediaPipe FaceMesh loaded")
            return True
        except Exception as e:
            print(f"❌ Error loading MediaPipe FaceMesh: {e}")
            return False
    
    def _initialize_camera(self):
        """เริ่มต้นกล้อง"""
        try:
            self.cap = cv2.VideoCapture(0)
            if not self.cap.isOpened():
                print("❌ Could not open camera")
                return False
            
            # ตั้งค่ากล้อง
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            self.cap.set(cv2.CAP_PROP_FPS, 30)
            
            print("✅ Camera initialized successfully")
            return True
            
        except Exception as e:
            print(f"❌ Error initializing camera: {e}")
            return False
    
    def _compute_ratio(self, p1, p2, p3, p4, p5, p6) -> float:
        """Generic vertical/horizontal ratio for EAR/MAR (pixel points)."""
        A = dist.euclidean(p2, p6)
        B = dist.euclidean(p3, p5)
        C = dist.euclidean(p1, p4)
        return (A + B) / (2.0 * C) if C else 0.0

    def process_frame(self):
        """Read one frame and return (frame, stats dict)."""
        if not self.cap or not self.cap.isOpened():
            return None, {}
        
        try:
            # อ่านเฟรม
            ret, frame = self.cap.read()
            if not ret:
                return None, {}
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.face_mesh.process(rgb)
            faces_landmarks = results.multi_face_landmarks or []
            detection_stats = {
                "drowsiness": False,
                "yawning": False,
                "head_tilt": False,
                "faces_detected": len(faces_landmarks),
                "timestamp": datetime.now().isoformat(),
                "ear": 0.0,
                "mar": 0.0,
                "head_angle": 0.0
            }
            h, w = frame.shape[:2]
            for face_landmarks in faces_landmarks:
                points = self._normalize_to_pixels(face_landmarks, w, h)
                stats = self._analyze_facial_features(frame, points)
                detection_stats.update(stats)
            return frame, detection_stats
        except Exception as e:
            print(f"❌ Error processing frame: {e}")
            return None, {}
    
    def _normalize_to_pixels(self, face_landmarks, w: int, h: int):
        """Convert normalized landmarks to pixel array [(x,y), ...]."""
        pts = []
        for lm in face_landmarks.landmark:
            pts.append((int(lm.x * w), int(lm.y * h)))
        return pts
    
    def _analyze_facial_features(self, frame, pts):
        """วิเคราะห์ลักษณะใบหน้า (เฉพาะตรวจจับ ไม่ส่งการแจ้งเตือน)"""
        stats = {
            "drowsiness": False,
            "yawning": False,
            "head_tilt": False,
            "ear": 0.0,
            "mar": 0.0,
            "head_angle": 0.0
        }
        
        try:
            # MediaPipe indices (approximate):
            # Eyes (corners + vertical)
            LEFT_EYE = {"left": 33, "right": 133, "top": 159, "top2": 158, "bottom": 145, "bottom2": 153}
            RIGHT_EYE = {"left": 362, "right": 263, "top": 386, "top2": 387, "bottom": 374, "bottom2": 380}
            # Mouth (corners + vertical)
            MOUTH = {"left": 78, "right": 308, "top": 13, "bottom": 14, "top2": 82, "bottom2": 312}
            
            # EAR (average vertical / horizontal)
            def ear_mp(e):
                A = (dist.euclidean(pts[e["top"]], pts[e["bottom"]]) + dist.euclidean(pts[e["top2"]], pts[e["bottom2"]])) / 2.0
                C = dist.euclidean(pts[e["left"]], pts[e["right"]])
                return A / C if C != 0 else 0.0
            
            left_ear = ear_mp(LEFT_EYE)
            right_ear = ear_mp(RIGHT_EYE)
            ear = (left_ear + right_ear) / 2.0
            stats["ear"] = ear
            
            if ear < self.EYE_AR_THRESH:
                self.eye_counter += 1
                if self.eye_counter >= self.EYE_AR_CONSEC_FRAMES:
                    stats["drowsiness"] = True
                    cv2.putText(frame, "DROWSINESS DETECTED!", (10, 30),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            else:
                self.eye_counter = 0
            
            # MAR
            def mar_mp(m):
                A = (dist.euclidean(pts[m["top"]], pts[m["bottom"]]) + dist.euclidean(pts[m["top2"]], pts[m["bottom2"]])) / 2.0
                C = dist.euclidean(pts[m["left"]], pts[m["right"]])
                return A / C if C != 0 else 0.0
            
            mar = mar_mp(MOUTH)
            stats["mar"] = mar
            if mar > self.MOUTH_AR_THRESH:
                self.mouth_counter += 1
                if self.mouth_counter >= self.MOUTH_AR_CONSEC_FRAMES:
                    stats["yawning"] = True
                    cv2.putText(frame, "YAWNING DETECTED!", (10, 60),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            else:
                self.mouth_counter = 0
            
            # Head tilt (compute angle between eye corners)
            head_angle = self._head_tilt_angle_mp(pts[LEFT_EYE["left"]], pts[LEFT_EYE["right"]],
                                                  pts[RIGHT_EYE["left"]], pts[RIGHT_EYE["right"]])
            stats["head_angle"] = head_angle
            if abs(head_angle) > self.HEAD_TILT_THRESH:
                self.head_tilt_counter += 1
                if self.head_tilt_counter >= self.HEAD_TILT_CONSEC_FRAMES:
                    stats["head_tilt"] = True
                    cv2.putText(frame, "HEAD TILT DETECTED!", (10, 90),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            else:
                self.head_tilt_counter = 0
            
            # Draw simplified contours
            self._draw_landmarks_mp(frame, pts, LEFT_EYE, RIGHT_EYE, MOUTH)
        except Exception as e:
            print(f"❌ Error analyzing facial features (MediaPipe): {e}")
        return stats
    
    def _head_tilt_angle_mp(self, l_left, l_right, r_left, r_right) -> float:
        """Approximate head tilt using average eye line."""
        # Use left eye line for angle
        dx = l_right[0] - l_left[0]
        dy = l_right[1] - l_left[1]
        angle = np.degrees(np.arctan2(dy, dx))
        return angle
    
    def _draw_landmarks_mp(self, frame, pts, L, R, M):
        try:
            # Eyes outline (corners + vertical points)
            for k in [L["left"], L["right"], L["top"], L["bottom"]]:
                cv2.circle(frame, pts[k], 2, (0, 255, 0), -1)
            for k in [R["left"], R["right"], R["top"], R["bottom"]]:
                cv2.circle(frame, pts[k], 2, (0, 255, 0), -1)
            # Mouth
            for k in [M["left"], M["right"], M["top"], M["bottom"]]:
                cv2.circle(frame, pts[k], 2, (255, 0, 0), -1)
        except Exception as e:
            print(f"⚠️ Error drawing MediaPipe landmarks: {e}")
    
    def cleanup(self):
        """ทำความสะอาดทรัพยากร"""
        try:
            if self.cap:
                self.cap.release()
                print("✅ Camera released")
            
            cv2.destroyAllWindows()
            print("✅ OpenCV windows closed")
            
        except Exception as e:
            print(f"❌ Error during cleanup: {e}")

def load_detectors(predictor_path="models/shape_predictor_68_face_landmarks.dat"):
    """Legacy function for backward compatibility (returns None for predictor)."""
    detector = FatigueDetector()
    if detector.initialize():
        return detector.face_mesh, None
    else:
        return None, None
