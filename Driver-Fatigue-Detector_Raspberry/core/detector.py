import cv2
import numpy as np
from scipy.spatial import distance as dist
import mediapipe as mp
from datetime import datetime

class FatigueDetector:
    def __init__(self):
        # Constants for detection (ที่ 10 FPS: 20 frames ≈ 2 วินาที, 10 frames ≈ 1 วินาที)
        self.EYE_AR_THRESH = 0.22          # หลับตา EAR จะต่ำกว่านี้ (ไวขึ้นนิดหนึ่ง)
        self.EYE_AR_CONSEC_FRAMES = 15     # ~1.5 วินาที หลับตาต่อเนื่อง = ง่วง
        self.MOUTH_AR_THRESH = 0.40        # อ้าปากกว้าง MAR เกินนี้ = หาว (ลดไว้ให้ยิงง่าย)
        self.MOUTH_AR_CONSEC_FRAMES = 8    # ~0.8 วินาที อ้าปากต่อเนื่อง = หาว (ไม่ต้องรอ 5 วินาที)
        self.HEAD_TILT_THRESH = 10
        self.HEAD_TILT_CONSEC_FRAMES = 48
        
        # Detection counters
        self.eye_counter = 0
        self.mouth_counter = 0
        self.head_tilt_counter = 0
        
        # Detection components
        self.cap = None
        self.face_mesh = None
        # Low-res for Pi/headless: process at 320px width (0 = full res)
        self.detection_width = 320
        
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
                refine_landmarks=True,   # ให้จุดตา/ปากแม่นขึ้น (เหมือนตอนมีวิดีโอ)
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

    def process_frame(self, skip_draw=False):
        """Read one frame and return (frame, stats dict). skip_draw=True for headless (no overlay)."""
        if not self.cap or not self.cap.isOpened():
            return None, {}
        
        try:
            ret, frame = self.cap.read()
            if not ret:
                return None, {}
            h, w = frame.shape[:2]
            # Low-res processing for Pi/headless: faster and detection still accurate (EAR/MAR are ratios)
            if self.detection_width and self.detection_width < w:
                new_w = self.detection_width
                new_h = int(h * new_w / w)
                frame = cv2.resize(frame, (new_w, new_h))
                h, w = new_h, new_w
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
            for face_landmarks in faces_landmarks:
                points = self._normalize_to_pixels(face_landmarks, w, h)
                stats = self._analyze_facial_features(frame, points, skip_draw=skip_draw)
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
    
    def _ear_same_as_video_mode(self, pts):
        """EAR แบบเดียวกับตอนมีวิดีโอ (gui_update): ชุด landmark เดิม → ค่าใกล้เคียง 0.25 ตอนหลับตา."""
        left_idx = [33, 160, 158, 133, 153, 144]   # p0..p5 → A=p1-p5, B=p2-p4, C=p0-p3
        right_idx = [263, 387, 385, 362, 380, 373]
        def ear_6pt(indices):
            p = [pts[i] for i in indices]
            A = dist.euclidean(p[1], p[5])
            B = dist.euclidean(p[2], p[4])
            C = dist.euclidean(p[0], p[3])
            return (A + B) / (2.0 * C) if C else 0.0
        left_ear = ear_6pt(left_idx)
        right_ear = ear_6pt(right_idx)
        return (left_ear + right_ear) / 2.0

    def _mar_same_as_video_mode(self, pts):
        """MAR แบบเดียวกับ lip_distance ใน calculation.py → ค่าขึ้นถึง ~0.5+ ตอนหาว."""
        top = np.array([
            (pts[13][0] + pts[14][0]) / 2,
            (pts[13][1] + pts[14][1]) / 2
        ])
        bottom = np.array([
            (pts[17][0] + pts[18][0]) / 2,
            (pts[17][1] + pts[18][1]) / 2
        ])
        vertical = np.linalg.norm(top - bottom)
        left = np.array(pts[61])
        right = np.array(pts[291])
        horizontal = np.linalg.norm(left - right)
        return (vertical / horizontal) if horizontal > 0 else 0.0

    def _analyze_facial_features(self, frame, pts, skip_draw=False):
        """วิเคราะห์ลักษณะใบหน้า (เฉพาะตรวจจับ ไม่ส่งการแจ้งเตือน). skip_draw=True = headless, no overlay."""
        stats = {
            "drowsiness": False,
            "yawning": False,
            "head_tilt": False,
            "ear": 0.0,
            "mar": 0.0,
            "head_angle": 0.0
        }
        
        try:
            # ใช้สูตร EAR/MAR เดียวกับตอนมีวิดีโอ เพื่อให้ช่วงตัวเลขตรง (หลับตา ~0.2, หาว ~0.5+)
            ear = self._ear_same_as_video_mode(pts)
            mar = self._mar_same_as_video_mode(pts)
            stats["ear"] = ear
            stats["mar"] = mar

            LEFT_EYE = {"left": 33, "right": 133, "top": 159, "top2": 158, "bottom": 145, "bottom2": 153}
            RIGHT_EYE = {"left": 362, "right": 263, "top": 386, "top2": 387, "bottom": 374, "bottom2": 380}
            MOUTH = {"left": 78, "right": 308, "top": 13, "bottom": 14, "top2": 82, "bottom2": 312}
            
            if ear < self.EYE_AR_THRESH:
                self.eye_counter += 1
                if self.eye_counter >= self.EYE_AR_CONSEC_FRAMES:
                    stats["drowsiness"] = True
                if not skip_draw:
                    cv2.putText(frame, "DROWSINESS DETECTED!", (10, 30),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            else:
                self.eye_counter = 0
            
            if mar > self.MOUTH_AR_THRESH:
                self.mouth_counter += 1
                if self.mouth_counter >= self.MOUTH_AR_CONSEC_FRAMES:
                    stats["yawning"] = True
                if not skip_draw:
                    cv2.putText(frame, "YAWNING DETECTED!", (10, 60),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            else:
                self.mouth_counter = 0
            
            head_angle = self._head_tilt_angle_mp(pts[LEFT_EYE["left"]], pts[LEFT_EYE["right"]],
                                                  pts[RIGHT_EYE["left"]], pts[RIGHT_EYE["right"]])
            stats["head_angle"] = head_angle
            if abs(head_angle) > self.HEAD_TILT_THRESH:
                self.head_tilt_counter += 1
                if self.head_tilt_counter >= self.HEAD_TILT_CONSEC_FRAMES:
                    stats["head_tilt"] = True
                if not skip_draw:
                    cv2.putText(frame, "HEAD TILT DETECTED!", (10, 90),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            else:
                self.head_tilt_counter = 0
            
            if not skip_draw:
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
