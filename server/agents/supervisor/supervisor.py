#
# Supervisor Agent — Intent Classifier & Session Router
# [OWNED BY MEMBER 3 - AI & AGENTS]
#
# Routes incoming requests to the correct specialist agent.
# Acts as the single entry point for all agent interactions.
#


from __future__ import annotations

from enum import Enum
from typing import Any

from ..config.gemini_client import MODELS, call_gemini_json

SYSTEM_INSTRUCTION = """
You are the Supervisor Agent for Placement Mentor 2.0.
Given a user's request in the context of their current session, classify the intent
and determine which specialist agent should handle it.

AVAILABLE AGENTS:
- PLANNER: Daily roadmap generation or end-of-day re-planning.
- BLUE_TEAM: Socratic hints, concept explanations, submission debugging.
- RED_TEAM: Adversarial challenges, edge-case pressure, complexity follow-ups.
- INTERVIEW_PANEL: Conducting a stage of the mock interview.
- SHADOW_CRITIC: Scoring a completed interview turn (internal use only).
- COMPANY_FILTER: Company-specific prep overlay and tips.

Output ONLY the JSON schema below:
{
  "intent": "string — brief description of what the user wants",
  "routed_to": "PLANNER|BLUE_TEAM|RED_TEAM|INTERVIEW_PANEL|SHADOW_CRITIC|COMPANY_FILTER",
  "confidence": 0.0-1.0,
  "extracted_params": {
    "stage": "string or null",
    "hint_level": 1|2|3|null,
    "company": "string or null",
    "action": "string — brief action key"
  }
}
"""


class AgentRoute(str, Enum):
    PLANNER = "PLANNER"
    BLUE_TEAM = "BLUE_TEAM"
    RED_TEAM = "RED_TEAM"
    INTERVIEW_PANEL = "INTERVIEW_PANEL"
    SHADOW_CRITIC = "SHADOW_CRITIC"
    COMPANY_FILTER = "COMPANY_FILTER"


async def classify_and_route(
    user_message: str,
    session_context: dict[str, Any],
) -> dict[str, Any]:
    """
    Classify a user's incoming message and route it to the appropriate agent.

    Args:
        user_message: Raw user input text.
        session_context: Current session state (current_stage, active_task, etc.)

    Returns:
        Routing decision JSON dict.
    """
    prompt = f"""
Current Session Context:
- Active Task: {session_context.get("active_task_id", "None")}
- Current Interview Stage: {session_context.get("interview_stage", "None")}
- Currently Practicing Topic: {session_context.get("active_topic", "None")}
- Hints Already Given: {session_context.get("hints_given_count", 0)}
- Target Company: {session_context.get("target_company", "None")}

User Message: "{user_message}"

Classify this intent and route to the correct agent.
"""
    return await call_gemini_json(MODELS["FLASH"], SYSTEM_INSTRUCTION, prompt)
