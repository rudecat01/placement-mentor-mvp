"""
Placement Mentor 2.0 - Central Thread-Safe Database Store
[OWNED BY MEMBER 1 - DB & USER STATE ARCHITECT]

Provides persistent storage abstractions for:
- User Authentication & Credentials
- Persistent Student Profile & Telemetry State
- Multi-source Onboarding Ingestion Logs
- Topic Mastery States (BKT, Practice, Interview, PTG)
- Daily Roadmaps, Tasks, and Audit Logs
- Practice Submissions and Mock Interview Records
"""

from typing import Dict, List, Optional, Any
import hashlib
import threading
import time
from ..schemas.student import (
    StudentProfile,
    StudentState,
    MultiSourceTelemetry,
    ResumeSignals,
    GitHubSignals,
    LeetCodeSignals,
)
from ..schemas.mastery import TopicMasteryState
from ..schemas.roadmap import DailyRoadmap, DailyTask, ExplainabilityLog
from .models import (
    UserRecord,
    AuditLogRecord,
    PracticeAttemptRecord,
    InterviewSessionRecord,
)


class PlacementDatabase:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(PlacementDatabase, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._lock = threading.Lock()
        self._users: Dict[str, UserRecord] = {}
        self._users_by_email: Dict[str, str] = {}
        self._student_states: Dict[str, StudentState] = {}
        self._roadmaps: Dict[str, List[DailyRoadmap]] = {}  # user_id -> list of DailyRoadmap
        self._audit_logs: Dict[str, List[AuditLogRecord]] = {}  # user_id -> list of logs
        self._attempts: Dict[str, List[PracticeAttemptRecord]] = {}  # user_id -> list of attempts
        self._interview_sessions: Dict[str, List[InterviewSessionRecord]] = {}  # user_id -> list of sessions
        self._settings: Dict[str, Any] = {
            "gemini_api_key": "",
            "active_model": "gemini-2.0-flash",
        }

        # Seed default test student for immediate out-of-the-box operation
        self._seed_default_state()
        self._initialized = True

    def _hash_password(self, password: str) -> str:
        return hashlib.sha256(password.encode("utf-8")).hexdigest()

    def _seed_default_state(self):
        default_user_id = "usr_demo123"
        default_email = "student@placement.ai"
        pw_hash = self._hash_password("password123")

        user = UserRecord(
            id=default_user_id,
            email=default_email,
            password_hash=pw_hash,
            name="Aryan Sharma",
            is_active=True
        )
        self._users[default_user_id] = user
        self._users_by_email[default_email] = default_user_id

        profile = StudentProfile(
            id=default_user_id,
            email=default_email,
            name="Aryan Sharma",
            target_role="SDE",
            target_companies=["Google", "Amazon", "Microsoft"],
            target_deadline_days=45,
            daily_time_budget_minutes=120,
            experience_level="INTERMEDIATE",
            preferred_language="python",
            created_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            updated_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        )

        telemetry = MultiSourceTelemetry(
            resume_signals=ResumeSignals(
                extracted_skills=["Python", "FastAPI", "PostgreSQL", "React", "Docker"],
                extracted_projects=["Distributed Task Queue", "E-Commerce Microservice"],
                ats_score=84.5,
                experience_years=1.5
            ),
            github_signals=GitHubSignals(
                username="aryansharma",
                top_languages={"Python": 65, "TypeScript": 25, "Go": 10},
                public_repos_count=14,
                recent_commit_velocity=4.2
            ),
            leetcode_signals=LeetCodeSignals(
                username="aryancodes",
                total_solved=142,
                easy_solved=68,
                medium_solved=62,
                hard_solved=12,
                contest_rating=1620.0
            ),
            self_assessment={
                "arrays": 0.70,
                "trees": 0.50,
                "graphs": 0.35,
                "dp": 0.30,
                "system_design": 0.40
            }
        )

        # Baseline topic masteries
        initial_topics = {
            "Arrays & Hashing": TopicMasteryState(topic_id="Arrays & Hashing", topic_name="Arrays & Hashing", mastery=0.65, practice_score=0.70),
            "Two Pointers": TopicMasteryState(topic_id="Two Pointers", topic_name="Two Pointers", mastery=0.55, practice_score=0.60),
            "Stack": TopicMasteryState(topic_id="Stack", topic_name="Stack", mastery=0.50, practice_score=0.55),
            "Binary Search": TopicMasteryState(topic_id="Binary Search", topic_name="Binary Search", mastery=0.55, practice_score=0.60),
            "Sliding Window": TopicMasteryState(topic_id="Sliding Window", topic_name="Sliding Window", mastery=0.50, practice_score=0.55),
            "Linked List": TopicMasteryState(topic_id="Linked List", topic_name="Linked List", mastery=0.60, practice_score=0.65),
            "Trees": TopicMasteryState(topic_id="Trees", topic_name="Trees", mastery=0.45, practice_score=0.50),
            "Tries": TopicMasteryState(topic_id="Tries", topic_name="Tries", mastery=0.40, practice_score=0.45),
            "Heap / Priority Queue": TopicMasteryState(topic_id="Heap / Priority Queue", topic_name="Heap / Priority Queue", mastery=0.45, practice_score=0.50),
            "Backtracking": TopicMasteryState(topic_id="Backtracking", topic_name="Backtracking", mastery=0.35, practice_score=0.40),
            "Graphs": TopicMasteryState(topic_id="Graphs", topic_name="Graphs", mastery=0.35, practice_score=0.40),
            "1-D Dynamic Programming": TopicMasteryState(topic_id="1-D Dynamic Programming", topic_name="1-D Dynamic Programming", mastery=0.25, practice_score=0.30),
            "Intervals": TopicMasteryState(topic_id="Intervals", topic_name="Intervals", mastery=0.40, practice_score=0.45),
            "Greedy": TopicMasteryState(topic_id="Greedy", topic_name="Greedy", mastery=0.30, practice_score=0.35),
            "Advanced Graphs": TopicMasteryState(topic_id="Advanced Graphs", topic_name="Advanced Graphs", mastery=0.20, practice_score=0.25),
            "2-D Dynamic Programming": TopicMasteryState(topic_id="2-D Dynamic Programming", topic_name="2-D Dynamic Programming", mastery=0.15, practice_score=0.20),
            "Bit Manipulation": TopicMasteryState(topic_id="Bit Manipulation", topic_name="Bit Manipulation", mastery=0.40, practice_score=0.45),
            "Math & Geometry": TopicMasteryState(topic_id="Math & Geometry", topic_name="Math & Geometry", mastery=0.35, practice_score=0.40)
        }

        self._student_states[default_user_id] = StudentState(
            profile=profile,
            telemetry=telemetry,
            topic_states=initial_topics,
            overall_practice_score=0.74,
            overall_interview_score=None,
            overall_ptg=None,
            completed_days=0,
            remaining_days=45,
            is_interview_eligible=False
        )

    # ---------------- USER & AUTH CRUD ----------------

    def create_user(self, email: str, password: str, name: str) -> UserRecord:
        with self._lock:
            email_clean = email.strip().lower()
            if email_clean in self._users_by_email:
                raise ValueError(f"User with email '{email_clean}' already exists.")
            pw_hash = self._hash_password(password)
            user = UserRecord(
                email=email_clean,
                password_hash=pw_hash,
                name=name.strip()
            )
            self._users[user.id] = user
            self._users_by_email[email_clean] = user.id
            return user

    def get_user_by_id(self, user_id: str) -> Optional[UserRecord]:
        with self._lock:
            return self._users.get(user_id)

    def get_user_by_email(self, email: str) -> Optional[UserRecord]:
        with self._lock:
            email_clean = email.strip().lower()
            user_id = self._users_by_email.get(email_clean)
            if user_id:
                return self._users.get(user_id)
            return None

    def verify_password(self, email: str, password: str) -> Optional[UserRecord]:
        user = self.get_user_by_email(email)
        if not user:
            return None
        if user.password_hash == self._hash_password(password):
            return user
        return None

    # ---------------- STUDENT STATE & PROFILE CRUD ----------------

    def get_student_state(self, user_id: str = "usr_demo123") -> Optional[StudentState]:
        with self._lock:
            return self._student_states.get(user_id)

    def save_student_state(self, state: StudentState) -> None:
        with self._lock:
            self._student_states[state.profile.id] = state

    def get_profile(self, user_id: str = "usr_demo123") -> Optional[StudentProfile]:
        state = self.get_student_state(user_id)
        return state.profile if state else None

    def update_profile(self, user_id: str, updates: Dict[str, Any]) -> Optional[StudentProfile]:
        with self._lock:
            state = self._student_states.get(user_id)
            if not state:
                return None
            profile_data = state.profile.model_dump()
            profile_data.update(updates)
            profile_data["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            state.profile = StudentProfile(**profile_data)
            self._student_states[user_id] = state
            return state.profile

    def get_telemetry(self, user_id: str = "usr_demo123") -> Optional[MultiSourceTelemetry]:
        state = self.get_student_state(user_id)
        return state.telemetry if state else None

    def update_telemetry(self, user_id: str, telemetry: MultiSourceTelemetry) -> None:
        with self._lock:
            state = self._student_states.get(user_id)
            if state:
                state.telemetry = telemetry
                self._student_states[user_id] = state

    def get_topic_state(self, user_id: str, topic_id: str) -> Optional[TopicMasteryState]:
        with self._lock:
            state = self._student_states.get(user_id)
            if state and topic_id in state.topic_states:
                return state.topic_states[topic_id]
            return None

    def save_topic_state(self, user_id: str, topic_state: TopicMasteryState) -> None:
        with self._lock:
            state = self._student_states.get(user_id)
            if state:
                state.topic_states[topic_state.topic_id] = topic_state
                self._student_states[user_id] = state

    # ---------------- ROADMAPS & TASKS ----------------

    def save_roadmap(self, user_id: str, roadmap: DailyRoadmap) -> None:
        with self._lock:
            if user_id not in self._roadmaps:
                self._roadmaps[user_id] = []
            # Replace existing roadmap for this day if present
            self._roadmaps[user_id] = [r for r in self._roadmaps[user_id] if r.day_number != roadmap.day_number]
            self._roadmaps[user_id].append(roadmap)

    def get_roadmap_by_day(self, user_id: str, day_number: int) -> Optional[DailyRoadmap]:
        with self._lock:
            user_roadmaps = self._roadmaps.get(user_id, [])
            for r in user_roadmaps:
                if r.day_number == day_number:
                    return r
            return None

    def get_all_roadmaps(self, user_id: str) -> List[DailyRoadmap]:
        with self._lock:
            return list(self._roadmaps.get(user_id, []))

    # ---------------- PRACTICE ATTEMPTS & AUDIT LOGS ----------------

    def record_attempt(self, attempt: PracticeAttemptRecord) -> None:
        with self._lock:
            if attempt.user_id not in self._attempts:
                self._attempts[attempt.user_id] = []
            self._attempts[attempt.user_id].append(attempt)

    def get_attempts(self, user_id: str) -> List[PracticeAttemptRecord]:
        with self._lock:
            return list(self._attempts.get(user_id, []))

    def record_audit_log(self, log: AuditLogRecord) -> None:
        with self._lock:
            if log.user_id not in self._audit_logs:
                self._audit_logs[log.user_id] = []
            self._audit_logs[log.user_id].append(log)

    def get_audit_logs(self, user_id: str) -> List[AuditLogRecord]:
        with self._lock:
            return list(self._audit_logs.get(user_id, []))

    # ---------------- INTERVIEW SESSIONS & PTG CALIBRATION ----------------

    def save_interview_session(self, session: InterviewSessionRecord) -> None:
        with self._lock:
            if session.user_id not in self._interview_sessions:
                self._interview_sessions[session.user_id] = []
            self._interview_sessions[session.user_id].append(session)

    def get_interview_sessions(self, user_id: str) -> List[InterviewSessionRecord]:
        with self._lock:
            return list(self._interview_sessions.get(user_id, []))

    def calibrate_student_ptg(
        self,
        user_id: str,
        interview_score: float,
        turn_scores: Optional[List[Dict[str, Any]]] = None,
        target_stage: Optional[str] = None,
        target_topic: Optional[str] = None
    ) -> Optional[StudentState]:
        """
        Atomically unlocks and calibrates the student's overall PTG and topic-level PTGs
        upon completing a mock interview.
        """
        with self._lock:
            state = self._student_states.get(user_id)
            if not state:
                return None

            rounded_interview_score = round(max(0.0, min(1.0, interview_score)), 2)
            practice_score = state.overall_practice_score or 0.50
            overall_ptg = max(0.0, round(practice_score - rounded_interview_score, 2))

            state.overall_interview_score = rounded_interview_score
            state.overall_ptg = overall_ptg
            state.is_interview_eligible = bool(rounded_interview_score >= 0.80 and practice_score >= 0.85)

            # Map stages to specific topic keys
            stage_topic_mapping = {
                "STAGE_4_DSA": ["arrays", "two_pointers", "trees", "graphs", "dp"],
                "LIVE_DSA": ["arrays", "two_pointers", "trees", "graphs", "dp"],
                "STAGE_3_PROGRAMMING_FUNDAMENTALS": ["dbms_sql", "os_concurrency"],
                "CS_CORE": ["dbms_sql", "os_concurrency"],
                "STAGE_7_SYSTEM_DESIGN": ["system_design"],
                "SYSTEM_DESIGN": ["system_design"],
                "STAGE_2_PROJECT_DEEP_DIVE": ["system_design", "arrays"],
                "RESUME_DEEP_DIVE": ["system_design", "arrays"],
            }

            affected_topics = set()
            if target_topic and target_topic in state.topic_states:
                affected_topics.add(target_topic)
            elif target_stage and target_stage in stage_topic_mapping:
                for t in stage_topic_mapping[target_stage]:
                    if t in state.topic_states:
                        affected_topics.add(t)
            else:
                # General interview round calibrates all topics proportionally
                affected_topics = set(state.topic_states.keys())

            for t_id in affected_topics:
                topic = state.topic_states[t_id]
                topic_prac = topic.practice_score or topic.mastery or 0.50
                topic.interview_score = rounded_interview_score
                topic.ptg = max(0.0, round(topic_prac - rounded_interview_score, 2))
                # Slight mastery boost for attempting a mock round
                topic.mastery = round(min(0.98, max(0.1, (topic.mastery * 0.7) + (rounded_interview_score * 0.3))), 2)

            self._student_states[user_id] = state

            # Record audit log
            audit = AuditLogRecord(
                user_id=user_id,
                day_number=state.completed_days + 1,
                event_type="ptg_calibration",
                topic=target_stage or "Mock Interview Calibration",
                change_description=f"Calibrated PTG Score: Interview Score {rounded_interview_score*100:.0f}%, Practice {practice_score*100:.0f}%, PTG Gap {overall_ptg*100:.0f}%.",
                rationale="Unlocked PTG transfer gap and recalibrated mastery baselines across tested topics.",
                previous_value="PTG: Locked / Uncalibrated",
                new_value=f"PTG: {overall_ptg*100:.0f}%"
            )
            if user_id not in self._audit_logs:
                self._audit_logs[user_id] = []
            self._audit_logs[user_id].append(audit)

            return state

    # ---------------- GLOBAL SETTINGS ----------------

    def set_api_key(self, api_key: str):
        with self._lock:
            self._settings["gemini_api_key"] = api_key.strip()

    def get_api_key(self) -> str:
        with self._lock:
            return self._settings.get("gemini_api_key", "")


# Singleton global database instance
db = PlacementDatabase()

