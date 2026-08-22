"""
Placement Mentor 2.0 - Persistent Student State Orchestration Service
[OWNED BY MEMBER 1 - DB & USER STATE ARCHITECT]

Manages:
- Multi-Source Onboarding Ingestion pipeline orchestration
- Synthesis of Resume, GitHub, LeetCode, and Self-Assessment signals into baseline masteries
- Persistent state initialization and continuous synchronization
- Profile and Telemetry queries and updates
"""

import time
from typing import Dict, Any, Optional, List
from ...db.database import db
from ...db.models import AuditLogRecord
from ...schemas.student import (
    StudentProfile,
    StudentState,
    MultiSourceTelemetry,
    ResumeSignals,
    GitHubSignals,
    LeetCodeSignals,
    OnboardingSubmissionPayload,
)
from ...schemas.mastery import TopicMasteryState
from ..ingestion.resume_parser import resume_parser
from ..ingestion.github_fetcher import github_fetcher
from ..ingestion.leetcode_fetcher import leetcode_fetcher


DEFAULT_TOPICS_BY_ROLE = {
    "SDE": [
        ("Arrays & Hashing", "Arrays & Hashing"),
        ("Two Pointers", "Two Pointers"),
        ("Stack", "Stack"),
        ("Binary Search", "Binary Search"),
        ("Sliding Window", "Sliding Window"),
        ("Linked List", "Linked List"),
        ("Trees", "Trees"),
        ("Tries", "Tries"),
        ("Heap / Priority Queue", "Heap / Priority Queue"),
        ("Backtracking", "Backtracking"),
        ("Graphs", "Graphs"),
        ("1-D Dynamic Programming", "1-D Dynamic Programming"),
        ("Intervals", "Intervals"),
        ("Greedy", "Greedy"),
        ("Advanced Graphs", "Advanced Graphs"),
        ("2-D Dynamic Programming", "2-D Dynamic Programming"),
        ("Bit Manipulation", "Bit Manipulation"),
        ("Math & Geometry", "Math & Geometry")
    ],
    "WEB_DEVELOPMENT": [
        ("html_css", "HTML5, CSS3 & Responsive Design"),
        ("javascript_core", "JavaScript ES6+ & Async Programming"),
        ("typescript", "TypeScript Type System"),
        ("react_ecosystem", "React, Hooks & Component Architecture"),
        ("nextjs_ssr", "Next.js & Server Side Rendering"),
        ("backend_apis", "REST & GraphQL API Design"),
        ("databases", "PostgreSQL & Database Modeling"),
        ("auth_security", "Web Security & Authentication"),
        ("ci_cd_deployment", "Docker & CI/CD Pipelines"),
        ("testing", "Unit & Integration Testing")
    ],
    "MACHINE_LEARNING": [
        ("python_scientific", "Python, NumPy & Pandas"),
        ("math_linear_algebra", "Linear Algebra & Probability"),
        ("classical_ml", "Supervised & Unsupervised ML"),
        ("deep_learning", "Deep Learning & Neural Networks"),
        ("pytorch_framework", "PyTorch Modeling"),
        ("nlp_transformers", "NLP & LLM Architectures"),
        ("cv_fundamentals", "Computer Vision"),
        ("mlops_pipeline", "MLOps & Model Deployment")
    ]
}


class StudentStateService:
    async def process_onboarding(self, payload: OnboardingSubmissionPayload, user_id: str = "usr_demo123") -> StudentState:
        """
        Orchestrates full multi-source ingestion:
        1. Parse Resume (Skills, Projects, Experience, ATS Score)
        2. Fetch GitHub (Language breakdown, commit velocity)
        3. Fetch LeetCode (Total solved, Easy/Med/Hard breakdown, rating)
        4. Integrate Self-Assessment Sliders
        5. Initialize Baseline Topic Masteries realistically
        6. Persist Student State and record audit log
        """
        target_role = payload.target_role or "SDE"

        # 1. Ingestion Pipelines
        resume_sig = None
        if payload.resume_text and payload.resume_text.strip():
            resume_sig = await resume_parser.parse_text(payload.resume_text, target_role)

        github_sig = None
        if payload.github_username and payload.github_username.strip():
            github_sig = github_fetcher.fetch_signals(payload.github_username)

        leetcode_sig = None
        if payload.leetcode_username and payload.leetcode_username.strip():
            leetcode_sig = leetcode_fetcher.fetch_signals(payload.leetcode_username)

        telemetry = MultiSourceTelemetry(
            resume_signals=resume_sig,
            github_signals=github_sig,
            leetcode_signals=leetcode_sig,
            self_assessment=payload.self_assessment_sliders or {}
        )

        # 2. Build Student Profile
        now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        exp_level = "FRESHER"
        if resume_sig and (resume_sig.experience_years >= 1.0 or len(resume_sig.extracted_projects) >= 2):
            exp_level = "INTERMEDIATE"

        profile = StudentProfile(
            id=user_id,
            email=payload.email,
            name=payload.full_name,
            target_role=target_role,
            target_companies=payload.target_companies or ["Google", "Amazon", "Microsoft"],
            target_deadline_days=payload.target_deadline_days or 45,
            daily_time_budget_minutes=payload.daily_time_budget_minutes or 120,
            experience_level=exp_level,
            preferred_language=payload.preferred_language or "python",
            created_at=now_iso,
            updated_at=now_iso
        )

        # 3. Baseline Topic Mastery Synthesis
        topic_states = self._synthesize_baseline_mastery(target_role, telemetry)

        # 4. Overall Practice Score calculation
        mastery_vals = [ts.mastery for ts in topic_states.values()]
        avg_mastery = sum(mastery_vals) / len(mastery_vals) if mastery_vals else 0.50
        practice_score = round(avg_mastery, 2)

        # 5. Build Complete Student State
        state = StudentState(
            profile=profile,
            telemetry=telemetry,
            topic_states=topic_states,
            overall_practice_score=min(0.95, practice_score),
            overall_interview_score=None,
            overall_ptg=None,
            completed_days=0,
            remaining_days=payload.target_deadline_days or 45,
            is_interview_eligible=False,
            active_roadmap_id=None,
            last_checkpoint_at=now_iso
        )

        # 6. Save to DB
        db.save_student_state(state)

        # 7. Record Audit Log
        db.record_audit_log(AuditLogRecord(
            user_id=user_id,
            day_number=1,
            event_type="onboarding",
            topic="Multi-Source Onboarding",
            change_description=f"Initialized Student State for {payload.full_name} ({target_role}).",
            rationale=f"Synthesized signals: Resume ({len(resume_sig.extracted_skills if resume_sig else [])} skills, {len(resume_sig.extracted_projects if resume_sig else [])} projects), ATS score {resume_sig.ats_score if resume_sig else 0}/100.",
            previous_value="None",
            new_value=f"Baseline Practice Score {state.overall_practice_score:.2f}"
        ))

        return state

    def _synthesize_baseline_mastery(
        self,
        role: str,
        telemetry: MultiSourceTelemetry
    ) -> Dict[str, TopicMasteryState]:
        """Calculates individualized, differentiated topic mastery curves from multi-source signals."""
        role_key = "SDE" if "sde" in role.lower() else ("WEB_DEVELOPMENT" if "web" in role.lower() else "MACHINE_LEARNING")
        topics = DEFAULT_TOPICS_BY_ROLE.get(role_key, DEFAULT_TOPICS_BY_ROLE["SDE"])

        # Base multiplier from LeetCode
        lc_bonus = 0.0
        if telemetry.leetcode_signals:
            solved = telemetry.leetcode_signals.total_solved
            if solved > 300:
                lc_bonus = 0.25
            elif solved > 100:
                lc_bonus = 0.15
            elif solved > 30:
                lc_bonus = 0.08

        # Resume signals
        resume_sig = telemetry.resume_signals
        resume_skills_lower = [s.lower() for s in (resume_sig.extracted_skills if resume_sig else [])]
        has_coding_lang = any(lang in resume_skills_lower for lang in ["python", "c++", "cpp", "java", "javascript", "typescript", "c#", "go"])
        has_projects = bool(resume_sig and len(resume_sig.extracted_projects) > 0)
        ats_score = resume_sig.ats_score if resume_sig else 50.0

        # Base proficiency baseline
        base = 0.50 + lc_bonus
        if has_coding_lang:
            base += 0.10
        if has_projects:
            base += 0.08
        if ats_score >= 80:
            base += 0.05

        # Topic-specific natural proficiency offsets
        topic_offsets = {
            "arrays": +0.12,
            "two_pointers": +0.05,
            "stack_queue": +0.08,
            "linked_list": +0.02,
            "trees": -0.08,
            "graphs": -0.18,
            "dp": -0.24,
            "system_design": +0.18 if any(k in resume_skills_lower for k in ["docker", "aws", "system design", "microservices", "sql", "postgresql", "fastapi"]) else -0.05,
            "dbms_sql": +0.22 if any(k in resume_skills_lower for k in ["sql", "postgresql", "mysql", "database", "mongodb"]) else 0.0,
            "os_concurrency": -0.08,
            # Web track
            "html_css": +0.25,
            "javascript_core": +0.20,
            "typescript": +0.15 if "typescript" in resume_skills_lower else -0.05,
            "react_ecosystem": +0.22 if any(k in resume_skills_lower for k in ["react", "next.js", "nextjs"]) else -0.10,
            "nextjs_ssr": +0.18 if any(k in resume_skills_lower for k in ["next.js", "nextjs"]) else -0.15,
            "backend_apis": +0.18 if any(k in resume_skills_lower for k in ["fastapi", "django", "node.js", "express", "rest"]) else 0.0,
            "databases": +0.18 if any(k in resume_skills_lower for k in ["postgresql", "sql", "mongodb", "prisma"]) else 0.0,
            "auth_security": +0.05,
            "ci_cd_deployment": +0.12 if any(k in resume_skills_lower for k in ["docker", "ci/cd", "kubernetes", "aws"]) else -0.10,
            # ML track
            "python_scientific": +0.25 if any(k in resume_skills_lower for k in ["python", "numpy", "pandas"]) else 0.0,
            "pytorch_framework": +0.22 if "pytorch" in resume_skills_lower else -0.15,
            "deep_learning": +0.15 if any(k in resume_skills_lower for k in ["deep learning", "neural networks", "tensorflow"]) else -0.10,
            "nlp_transformers": +0.12 if any(k in resume_skills_lower for k in ["nlp", "transformers", "llm"]) else -0.20,
            "classical_ml": +0.10 if "scikit-learn" in resume_skills_lower else -0.05,
            "mlops_pipeline": +0.10 if "docker" in resume_skills_lower else -0.15,
        }

        topic_states = {}
        for topic_id, topic_name in topics:
            offset = topic_offsets.get(topic_id, 0.0)
            val = base + offset

            # Check self-assessment slider if user adjusted it
            if telemetry.self_assessment and topic_id in telemetry.self_assessment:
                val = telemetry.self_assessment[topic_id]

            clamped_mastery = round(max(0.0, min(1.0, val)), 2)
            topic_states[topic_id] = TopicMasteryState(
                topic_id=topic_id,
                topic_name=topic_name,
                mastery=clamped_mastery,
                practice_score=round(min(0.95, clamped_mastery + 0.05), 2),
                interview_score=None,
                ptg=None,
                attempts_count=0,
                success_count=0
            )

        return topic_states

    def get_state(self, user_id: str = "usr_demo123") -> Optional[StudentState]:
        return db.get_student_state(user_id)

    def get_profile(self, user_id: str = "usr_demo123") -> Optional[StudentProfile]:
        return db.get_profile(user_id)

    def update_profile(self, user_id: str, updates: Dict[str, Any]) -> Optional[StudentProfile]:
        return db.update_profile(user_id, updates)

    def get_telemetry(self, user_id: str = "usr_demo123") -> Optional[MultiSourceTelemetry]:
        return db.get_telemetry(user_id)

    def mark_topic_completed(self, user_id: str, topic_id: str, difficulty: str = "MEDIUM"):
        """Marks a topic as completed, boosts its mastery, and recalculates the overall practice score."""
        state = self.get_state(user_id)
        if not state or not state.topic_states or topic_id not in state.topic_states:
            return

        topic_state = state.topic_states[topic_id]
        topic_state.attempts_count = (topic_state.attempts_count or 0) + 1
        topic_state.success_count = (topic_state.success_count or 0) + 1

        # Boost mastery based on difficulty
        boost = 0.05
        if difficulty == "HARD":
            boost = 0.08
        elif difficulty == "EASY":
            boost = 0.02

        topic_state.mastery = min(0.95, round(topic_state.mastery + boost, 2))
        topic_state.practice_score = min(0.95, round((topic_state.practice_score or topic_state.mastery) + boost, 2))

        # Recompute overall practice score
        mastery_vals = [ts.mastery for ts in state.topic_states.values()]
        avg_mastery = sum(mastery_vals) / len(mastery_vals) if mastery_vals else 0.50
        state.overall_practice_score = min(0.95, round(avg_mastery, 2))

        db.save_student_state(state)


student_state_service = StudentStateService()
