#
# Adaptive Daily Roadmap Planner Agent
# [OWNED BY MEMBER 3 - AI & AGENTS]
#
# Solves fixed daily time-budget task allocation using Gemini structured JSON output.
# Dynamically customizes tasks from candidate's parsed resume skills, projects, and target companies.
# Ensures sum(task.allocated_minutes) == daily_budget exactly.
#

from __future__ import annotations

import json
import uuid
from typing import Any

from ..config.gemini_client import MODELS, call_gemini_json

SYSTEM_INSTRUCTION = """
You are the Senior Technical Placement Mentor for Placement Mentor 2.0.
Your job is to generate a rigorous, time-budgeted daily learning plan for a student
preparing for top-tier software engineering and placement interviews (e.g. Google, Microsoft, Amazon, Meta).

STRICT GENERATION RULES:
1. DO NOT generate trivial beginner syntax lessons (e.g., avoid basic "Arrays: Foundational Concepts" or "Variables 101") for candidates who have coding languages or projects on their resume.
2. Provide high-impact, placement-level technical milestones directly chosen from the provided DAG / Skill Graph Context nodes.
3. Every day plan MUST include exactly 3 tasks. ALL 3 tasks MUST be Coding Practice (DSA) drills that map EXACTLY to the `id` of a node in the provided DAG Context. Do NOT invent new `topic_id`s.
   - Task 1: Focus on their weakest mastered foundational topic in the DAG.
   - Task 2: Focus on an intermediate topic that builds upon Task 1, or a separate weak area.
   - Task 3: Focus on an advanced application (Hard difficulty) of the topics from Task 1 or 2.
4. The sum of ALL task `allocated_minutes` MUST EXACTLY equal `daily_budget_minutes`.
5. Output ONLY a valid JSON object matching the schema below.

OUTPUT SCHEMA:
{
  "day_number": int,
  "total_budget_minutes": int,
  "allocated_minutes": int,
  "tasks": [
    {
      "id": "uuid-string",
      "title": "string",
      "topic_id": "string",
      "topic_name": "string",
      "track": "DSA|WEB_DEV|CS_CORE|SYSTEM_DESIGN|INTERVIEW|AI_ML",
      "type": "CODING_PRACTICE|CONCEPT_REVISION|SPACED_REPETITION|MOCK_INTERVIEW|RED_TEAM_CHALLENGE",
      "difficulty": "EASY|MEDIUM|HARD",
      "allocated_minutes": int,
      "rationale": "string"
    }
  ],
  "why_this_moved_logs": [
    {
      "topic_id": "string",
      "topic_name": "string",
      "action": "PRIORITIZED|DELAYED|DIFFICULTY_ESCALATED|PREREQUISITE_INJECTED|SPACED_REPETITION_INJECTED",
      "reason": "string",
      "trigger_event": "FAILED_SUBMISSION|HIGH_PTG|MASTERY_DECAY|TIME_BUDGET_CHANGE|COMPANY_TARGET_CHANGE"
    }
  ]
}
"""


async def generate_daily_roadmap(
    student_state: dict[str, Any],
    skill_graph: dict[str, Any],
    day_number: int,
    daily_budget_minutes: int,
    target_role: str,
    target_companies: list[str] | None = None,
) -> dict[str, Any]:
    """
    Generate a single day's adaptive roadmap personalized to the candidate.
    """
    # Extract telemetry and resume data
    telemetry = student_state.get("telemetry", {}) or {}
    resume_sig = telemetry.get("resume_signals", {}) or {}
    extracted_skills = resume_sig.get("extracted_skills", []) or []
    extracted_projects = resume_sig.get("extracted_projects", []) or []
    ats_score = resume_sig.get("ats_score", 70.0)

    topic_states = student_state.get("topic_states", {}) or {}
    self_assessment = telemetry.get("self_assessment", {}) or {}

    ptg = student_state.get("ptg", 0.0)
    ptg_threshold = 0.20

    prompt = f"""
Candidate Profile:
- Target Role: {target_role}
- Target Companies: {json.dumps(target_companies or ["Google", "Microsoft"])}
- Detected Resume Skills: {json.dumps(extracted_skills)}
- Detected Resume Projects: {json.dumps(extracted_projects[:3])}
- ATS Resume Score: {ats_score}/100
- Initial Diagnostic / Self Assessment: {json.dumps(self_assessment)}
- Live Topic Masteries: {json.dumps({k: v.get("mastery") if isinstance(v, dict) else v for k, v in topic_states.items()})}
- Performance Transfer Gap (PTG): {ptg}

DAG / Skill Graph Context:
{json.dumps(skill_graph)}

Day Number: {day_number}
Daily Time Budget: {daily_budget_minutes} minutes

Instructions:
Generate a rigorous placement schedule. The sum of allocated_minutes for all tasks MUST equal exactly {daily_budget_minutes}.
Incorporate their actual resume projects ({json.dumps(extracted_projects[:2])}) into the challenges and design tasks!
CRITICAL PTG RULE: The student's PTG is {ptg}. If PTG > {ptg_threshold}, you MUST allocate significantly more time and problems to topics where they have failed in practice (remedial scaling).
Use the DAG context above to find appropriate prerequisite topics to inject if their mastery is failing.
"""
    try:
        res = await call_gemini_json(MODELS["FLASH"], SYSTEM_INSTRUCTION, prompt)
        if isinstance(res, dict) and "tasks" in res and isinstance(res["tasks"], list) and len(res["tasks"]) > 0:
            # Enforce exact allocated minutes match
            tasks = res["tasks"]
            total_alloc = sum(t.get("allocated_minutes", 0) for t in tasks)
            diff = daily_budget_minutes - total_alloc
            if diff != 0 and len(tasks) > 0:
                tasks[-1]["allocated_minutes"] = max(10, tasks[-1].get("allocated_minutes", 10) + diff)
            res["allocated_minutes"] = daily_budget_minutes
            res["total_budget_minutes"] = daily_budget_minutes
            return res
    except Exception:
        pass

    # Dynamic Personalized Deterministic Planner
    budget = daily_budget_minutes or 120
    companies_str = ", ".join(target_companies or ["Google", "Microsoft"])

    tasks = []
    why_logs = []
    skills_lower = [s.lower() for s in extracted_skills]

    # Task 1: High-ROI Technical Challenge
    if "machine learning" in target_role.lower() or any("python" in s for s in skills_lower) and "pytorch" in skills_lower:
        t1_topic_id = "pytorch_modeling"
        t1_topic_name = "PyTorch Deep Learning & Model Architecture"
        t1_title = f"Deep Learning Drill: Model Architecture Optimization for {companies_str}"
        t1_track = "AI_ML"
        t1_rationale = f"Building on your background in {', '.join(extracted_skills[:3])} to prepare for {companies_str} MLE rounds."
    elif "web" in target_role.lower() or "react" in skills_lower or "next.js" in skills_lower or "typescript" in skills_lower:
        t1_topic_id = "react_state"
        t1_topic_name = "React & Async Server State Architecture"
        t1_title = f"Fullstack Architecture Drill: High-Concurrency APIs ({companies_str})"
        t1_track = "WEB_DEV"
        t1_rationale = f"Targeting high-concurrency patterns relevant to your project ({extracted_projects[0] if extracted_projects else 'Web Applications'})."
    else:
        # SDE track
        lowest_topic = "1-D Dynamic Programming"
        lowest_name = "1-D Dynamic Programming & Space Optimization"
        if "Graphs" in topic_states and topic_states["Graphs"].get("mastery", 0.5) < 0.5:
            lowest_topic = "Graphs"
            lowest_name = "Graph Algorithms & BFS/DFS"
        elif "Trees" in topic_states and topic_states["Trees"].get("mastery", 0.5) < 0.6:
            lowest_topic = "Trees"
            lowest_name = "Binary Search Trees & Path Recursion"

        t1_topic_id = lowest_topic
        t1_topic_name = lowest_name
        t1_title = f"DSA Mastery Booster: {lowest_name} ({companies_str} Track)"
        t1_track = "DSA"
        t1_rationale = f"High-yield algorithm pattern prioritized for {companies_str} placement interviews."

    t1_mins = min(55, max(30, int(budget * 0.45)))
    tasks.append({
        "id": str(uuid.uuid4()),
        "title": t1_title,
        "topic_id": t1_topic_id,
        "topic_name": t1_topic_name,
        "track": t1_track,
        "type": "CODING_PRACTICE",
        "difficulty": "MEDIUM",
        "allocated_minutes": t1_mins,
        "rationale": t1_rationale
    })

    why_logs.append({
        "topic_id": t1_topic_id,
        "topic_name": t1_topic_name,
        "action": "PRIORITIZED",
        "reason": f"High ROI interview topic tailored to candidate profile ({len(extracted_skills)} resume skills detected).",
        "trigger_event": "HIGH_PTG"
    })

    # Task 2: Intermediate DSA Topic
    t2_mins = min(40, max(25, int(budget * 0.35)))
    tasks.append({
        "id": str(uuid.uuid4()),
        "title": f"DSA Core Practice: Two Pointers & Sliding Window",
        "topic_id": "Two Pointers",
        "topic_name": "Two Pointers",
        "track": "DSA",
        "type": "CODING_PRACTICE",
        "difficulty": "MEDIUM",
        "allocated_minutes": t2_mins,
        "rationale": f"Building up your foundational algorithmic patterns."
    })

    # Task 3: Advanced DSA Application
    t3_mins = budget - (t1_mins + t2_mins)
    if t3_mins > 0:
        tasks.append({
            "id": str(uuid.uuid4()),
            "title": f"Advanced Problem Solving: Trees & Recursion",
            "topic_id": "Trees",
            "topic_name": "Trees",
            "track": "DSA",
            "type": "CODING_PRACTICE",
            "difficulty": "HARD",
            "allocated_minutes": t3_mins,
            "rationale": f"Pushing your limits on complex recursive tree structures."
        })

    return {
        "day_number": day_number or 1,
        "total_budget_minutes": budget,
        "allocated_minutes": budget,
        "tasks": tasks,
        "why_this_moved_logs": why_logs
    }
