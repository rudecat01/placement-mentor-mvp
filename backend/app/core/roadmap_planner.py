"""Placement Mentor 2.0 - Fixed Daily Budget Roadmap Planner & Audit Logger.

Core Invariants:
1. Fixed Daily Time Budget (e.g., 120 min) is strictly conserved.
2. Tasks never reshuffle mid-day upon single submissions; re-planning happens exclusively at End-of-Day Checkpoint.
3. Every task allocation includes an explainable 'Why This Moved' audit log entry.
"""

from typing import List, Tuple
from backend.app.config import ROADMAP_SETTINGS
from backend.app.core.decay_engine import MemoryDecayEngine
from backend.app.core.ptg_engine import PTGEngine, PTGTransferCategory
from backend.app.core.skill_dag import SkillDAG
from backend.app.models.schemas import (
    AuditLog,
    DailyPlan,
    Problem,
    RoadmapTask,
    SkillNode,
    StudentProfile,
    TaskStatus,
    TaskType,
)


class RoadmapPlanner:
    def __init__(self):
        self.ptg_engine = PTGEngine()
        self.decay_engine = MemoryDecayEngine()

    def generate_daily_plan(
        self,
        profile: StudentProfile,
        skills: List[SkillNode],
        problems: List[Problem],
        day_number: int
    ) -> Tuple[DailyPlan, List[AuditLog]]:
        budget = profile.daily_time_budget_minutes
        allocated_minutes = 0
        tasks: List[RoadmapTask] = []
        audit_logs: List[AuditLog] = []

        dag = SkillDAG(skills)
        ordered_skills = dag.get_topological_order()

        # Phase 1: Check for High PTG Red Team Adversarial Drills (15 mins each)
        for s in skills:
            if s.ptg is not None and s.ptg > 0.25:
                drill_duration = ROADMAP_SETTINGS.red_team_drill_minutes  # 15 mins
                if allocated_minutes + drill_duration <= budget:
                    task = RoadmapTask(
                        id=f"task_red_team_{s.id}_{day_number}",
                        day_number=day_number,
                        title=f"Red Team Pressure Drill: {s.name}",
                        topic=s.name,
                        task_type=TaskType.RED_TEAM_PRESSURE,
                        estimated_minutes=drill_duration,
                        problem_id=None,
                        why_selected=f"High Performance Transfer Gap (PTG = {s.ptg:.2f}) indicates interview verbalization freeze under pressure.",
                        status=TaskStatus.PENDING
                    )
                    tasks.append(task)
                    allocated_minutes += drill_duration

                    audit_logs.append(AuditLog(
                        id=f"audit_ptg_{s.id}_{day_number}",
                        day_number=day_number,
                        event_type="ptg_alert",
                        topic=s.name,
                        change_description=f"Injected 15m Red Team Adversary Drill into Day {day_number} schedule.",
                        rationale=f"Practice Score ({s.practice_score:.2f}) vs Interview Score ({s.interview_score:.2f}) triggered high PTG threshold.",
                        new_value=f"{drill_duration}m"
                    ))

        # Phase 2: Core DSA & Curriculum Progression
        for s in ordered_skills:
            if allocated_minutes >= budget:
                break

            # Find matching problems in the bank
            matching_problems = [p for p in problems if s.name.lower() in p.topic.lower() or p.topic.lower() in s.name.lower()]

            if s.mastery < 0.75:
                # Skill needs work
                task_duration = 35
                if allocated_minutes + task_duration <= budget:
                    problem_to_assign = matching_problems[0] if matching_problems else None
                    prob_title = problem_to_assign.title if problem_to_assign else f"Mastery Booster: {s.name}"

                    task = RoadmapTask(
                        id=f"task_dsa_{s.id}_{day_number}",
                        day_number=day_number,
                        title=prob_title,
                        topic=s.name,
                        task_type=TaskType.DEEP_PRACTICE,
                        estimated_minutes=task_duration,
                        problem_id=problem_to_assign.id if problem_to_assign else None,
                        why_selected=f"Current BKT Mastery is {s.mastery:.2f} (target >= 0.75). Prerequisites are fully satisfied in DAG.",
                        status=TaskStatus.PENDING
                    )
                    tasks.append(task)
                    allocated_minutes += task_duration

                    audit_logs.append(AuditLog(
                        id=f"audit_dsa_{s.id}_{day_number}",
                        day_number=day_number,
                        event_type="replan",
                        topic=s.name,
                        change_description=f"Scheduled '{prob_title}' ({task_duration}m).",
                        rationale=f"DAG topological sort prioritized topic with mastery {s.mastery:.2f}.",
                        new_value=f"{task_duration}m"
                    ))

        # Phase 3: Exact Budget Top-Up (Fill remainder strictly to equal budget)
        remaining = budget - allocated_minutes
        if remaining > 0:
            # Add Spaced Revision or Interview Prep chunk
            focus_topic = ordered_skills[0].name if ordered_skills else "General DSA"
            task = RoadmapTask(
                id=f"task_topup_{day_number}",
                day_number=day_number,
                title=f"Spaced Retention & Concept Scaffolding: {focus_topic}",
                topic=focus_topic,
                task_type=TaskType.SPACED_REVISION,
                estimated_minutes=remaining,
                problem_id=None,
                why_selected=f"Conserves strict {budget}m daily budget invariant by reinforcing high-priority retention.",
                status=TaskStatus.PENDING
            )
            tasks.append(task)
            allocated_minutes += remaining

            audit_logs.append(AuditLog(
                id=f"audit_topup_{day_number}",
                day_number=day_number,
                event_type="budget_invariant",
                topic=focus_topic,
                change_description=f"Allocated {remaining}m Spaced Revision task to conserve {budget}m budget.",
                rationale="Strict Daily Budget Invariant: Total daily tasks must sum to exactly user's allocated daily capacity.",
                new_value=f"{remaining}m"
            ))

        plan = DailyPlan(
            id=f"plan_day_{day_number}",
            day_number=day_number,
            target_budget_minutes=budget,
            total_allocated_minutes=allocated_minutes,
            tasks=tasks
        )

        return plan, audit_logs
