"""Placement Mentor 2.0 - File-Backed JSON Persistence Database.

Stores:
- Problems bank
- Student profile
- Skill Graph DAG nodes
- Daily Roadmaps
- Attempt evidence history
- 'Why This Moved' audit logs
"""

import json
import os
from typing import Dict, List, Optional
from backend.app.core.skill_dag import build_default_skill_dag
from backend.app.models.schemas import (
    AttemptEvidence,
    AuditLog,
    DailyPlan,
    Problem,
    SkillNode,
    StudentProfile,
)


class PlacementDatabase:
    def __init__(self, data_dir: Optional[str] = None):
        if data_dir is None:
            self.data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
        else:
            self.data_dir = data_dir

        os.makedirs(self.data_dir, exist_ok=True)

        self.problems_file = os.path.join(self.data_dir, "problems.json")
        self.profile_file = os.path.join(self.data_dir, "profile.json")
        self.skills_file = os.path.join(self.data_dir, "skills.json")
        self.roadmaps_file = os.path.join(self.data_dir, "roadmaps.json")
        self.attempts_file = os.path.join(self.data_dir, "attempts.json")
        self.audits_file = os.path.join(self.data_dir, "audits.json")

        self._init_default_data()

    def _init_default_data(self):
        # 1. Profile
        if not os.path.exists(self.profile_file):
            default_profile = StudentProfile()
            self.save_profile(default_profile)

        # 2. Skills DAG
        if not os.path.exists(self.skills_file):
            default_skills = build_default_skill_dag()
            self.save_skill_nodes(default_skills)

        # 3. Roadmaps
        if not os.path.exists(self.roadmaps_file):
            with open(self.roadmaps_file, "w", encoding="utf-8") as f:
                json.dump({}, f)

        # 4. Attempts
        if not os.path.exists(self.attempts_file):
            with open(self.attempts_file, "w", encoding="utf-8") as f:
                json.dump([], f)

        # 5. Audits
        if not os.path.exists(self.audits_file):
            with open(self.audits_file, "w", encoding="utf-8") as f:
                json.dump([], f)

    # Profile
    def get_profile(self) -> StudentProfile:
        with open(self.profile_file, "r", encoding="utf-8") as f:
            return StudentProfile(**json.load(f))

    def save_profile(self, profile: StudentProfile):
        with open(self.profile_file, "w", encoding="utf-8") as f:
            json.dump(profile.model_dump(mode="json"), f, indent=2)

    # Problems
    def get_all_problems(self) -> List[Problem]:
        if not os.path.exists(self.problems_file):
            return []
        with open(self.problems_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            return [Problem(**p) for p in data]

    def get_problem_by_id(self, problem_id: str) -> Optional[Problem]:
        for p in self.get_all_problems():
            if p.id == problem_id:
                return p
        return None

    def save_problems(self, problems: List[Problem]):
        with open(self.problems_file, "w", encoding="utf-8") as f:
            json.dump([p.model_dump(mode="json") for p in problems], f, indent=2)

    # Skills DAG
    def get_skill_nodes(self) -> List[SkillNode]:
        with open(self.skills_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            return [SkillNode(**s) for s in data]

    def save_skill_nodes(self, skills: List[SkillNode]):
        with open(self.skills_file, "w", encoding="utf-8") as f:
            json.dump([s.model_dump(mode="json") for s in skills], f, indent=2)

    # Roadmaps
    def get_roadmap_for_day(self, day_number: int) -> Optional[DailyPlan]:
        with open(self.roadmaps_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            raw = data.get(str(day_number))
            return DailyPlan(**raw) if raw else None

    def save_roadmap_for_day(self, plan: DailyPlan):
        with open(self.roadmaps_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        data[str(plan.day_number)] = plan.model_dump(mode="json")
        with open(self.roadmaps_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    # Attempts
    def record_attempt(self, attempt: AttemptEvidence):
        with open(self.attempts_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        data.append(attempt.model_dump(mode="json"))
        with open(self.attempts_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def get_all_attempts(self) -> List[AttemptEvidence]:
        with open(self.attempts_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            return [AttemptEvidence(**a) for a in data]

    # Audits
    def record_audit_log(self, audit: AuditLog):
        with open(self.audits_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        data.append(audit.model_dump(mode="json"))
        with open(self.audits_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def get_audit_logs(self) -> List[AuditLog]:
        with open(self.audits_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            return [AuditLog(**a) for a in data]
