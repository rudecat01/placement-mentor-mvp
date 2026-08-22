#
# End-of-Day Re-Plan Checkpoint Processor
# [OWNED BY MEMBER 3 - AI & AGENTS]
#
# Triggered at end of each day to recalculate the upcoming schedule
# based on updated mastery, completion rate, and PTG shift.
#


from __future__ import annotations

from typing import Any

from ..config.gemini_client import MODELS, call_gemini_json

SYSTEM_INSTRUCTION = """
You are the Re-Plan Checkpoint Engine for Placement Mentor 2.0.
A student has just completed a practice day. Based on their day completion results,
updated mastery scores, and PTG shift, you must adjust the NEXT 3 days of their roadmap.

RULES:
1. If day completion < 60%: De-escalate tomorrow's difficulty. Carry incomplete tasks forward.
2. If PTG (practice_score - interview_score) > 0.30: Increase mock interview and Red Team slots.
3. If any topic mastery dropped (decay): Inject spaced repetition for that topic tomorrow.
4. Preserve the daily_budget_minutes hard constraint on each adjusted day.
5. Output ONLY a valid JSON object. No extra text.

OUTPUT SCHEMA:
{
  "replan_summary": "string — 1-2 sentence summary of what changed and why",
  "adjusted_days": [
    {
      "day_number": int,
      "total_budget_minutes": int,
      "allocated_minutes": int,
      "tasks": [ { ...same task schema as roadmap planner... } ],
      "why_this_moved_logs": [ { ...same log schema... } ]
    }
  ]
}
"""


async def process_end_of_day_replan(
    completed_day: dict[str, Any],
    updated_mastery: dict[str, float],
    updated_ptg: float,
    remaining_days: int,
    daily_budget_minutes: int,
    target_role: str,
) -> dict[str, Any]:
    """
    Recalculate the next 3 days based on end-of-day signals.

    Args:
        completed_day: The DayPlan dict that was just completed (with task scores filled in).
        updated_mastery: Map of topic_id -> latest mastery score post BKT update.
        updated_ptg: Latest PTG value after today's interview/practice scores.
        remaining_days: Total remaining prep days after today.
        daily_budget_minutes: Fixed daily time budget.
        target_role: Student's target placement role.

    Returns:
        Adjusted next-3-day plan as JSON dict.
    """
    tasks_completed = sum(1 for t in completed_day.get("tasks", []) if t.get("completed"))
    tasks_total = len(completed_day.get("tasks", []))
    completion_pct = (tasks_completed / tasks_total * 100) if tasks_total else 0

    incomplete_tasks = [t for t in completed_day.get("tasks", []) if not t.get("completed")]
    decayed_topics = [tid for tid, score in updated_mastery.items() if score < 0.45]

    prompt = f"""
Day {completed_day.get('day_number')} Completion Report:
- Tasks Completed: {tasks_completed}/{tasks_total} ({completion_pct:.1f}%)
- Incomplete Tasks: {incomplete_tasks}
- Updated PTG: {updated_ptg:.3f}
- Decayed Topics (mastery < 0.45): {decayed_topics}
- Remaining Prep Days: {remaining_days}
- Daily Budget: {daily_budget_minutes} minutes
- Target Role: {target_role}

Updated Mastery Scores:
{updated_mastery}

Generate the adjusted plans for the next 3 days (days {completed_day.get('day_number', 0) + 1} 
to {completed_day.get('day_number', 0) + 3}).
Each day's allocated_minutes must exactly equal {daily_budget_minutes}.
"""
    return await call_gemini_json(MODELS["FLASH"], SYSTEM_INSTRUCTION, prompt)
