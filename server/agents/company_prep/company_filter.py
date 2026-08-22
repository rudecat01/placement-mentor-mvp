#
# Company-Specific Prep Overlay & Freemium Gate
# [OWNED BY MEMBER 3 - AI & AGENTS]
#


from __future__ import annotations

from typing import Any

from ..config.gemini_client import MODELS, call_gemini_json

# Company-specific DSA topic weight overrides
COMPANY_TOPIC_WEIGHTS: dict[str, dict[str, float]] = {
    "google": {
        "graphs": 1.5, "dynamic-programming": 1.4, "trees": 1.3,
        "bit-manipulation": 1.2, "system-design": 1.3,
    },
    "amazon": {
        "arrays-hashing": 1.3, "two-pointers": 1.2, "trees": 1.2,
        "behavioral-lp": 2.0, "system-design": 1.4,
    },
    "meta": {
        "graphs": 1.4, "dynamic-programming": 1.3, "sliding-window": 1.3,
        "system-design": 1.5, "behavioral-lp": 1.5,
    },
    "microsoft": {
        "trees": 1.3, "dynamic-programming": 1.2, "arrays-hashing": 1.2,
        "system-design": 1.3, "behavioral-lp": 1.3,
    },
    "startup": {
        "web-dev": 1.5, "system-design": 1.3, "arrays-hashing": 1.1,
    },
}

# Freemium limits
FREEMIUM_LIMITS = {
    "max_practice_questions": 2,
    "max_mini_mock_interviews": 1,
    "company_tracks_unlocked": [],
}

OVERLAY_SYSTEM_INSTRUCTION = """
You are the Company-Specific Prep Overlay Agent for Placement Mentor 2.0.
Given a student's current skill graph and a target company, adjust the topic priority weights
and generate company-specific preparation guidance.

Output ONLY the JSON schema:
{
  "company": "string",
  "adjusted_topic_weights": {"topic_id": weight_float},
  "high_priority_topics": ["string"],
  "behavioral_themes": ["string"],
  "company_specific_tips": ["string"],
  "sample_interview_questions": ["string"]
}
"""


def get_company_weights(company_name: str) -> dict[str, float]:
    """Return topic weight multipliers for a given company."""
    return COMPANY_TOPIC_WEIGHTS.get(company_name.lower(), {})


def check_freemium_access(
    user_tier: str,
    company_name: str,
    questions_accessed_today: int,
    mocks_accessed_today: int,
) -> dict[str, Any]:
    """
    Enforce freemium gating logic.

    Returns:
        Dict with access_granted bool and reason string.
    """
    if user_tier == "premium":
        return {"access_granted": True, "reason": "Premium access — full track unlocked."}

    if questions_accessed_today >= FREEMIUM_LIMITS["max_practice_questions"]:
        return {
            "access_granted": False,
            "reason": f"Free tier limit: {FREEMIUM_LIMITS['max_practice_questions']} practice questions/day. Upgrade to Premium.",
            "upgrade_prompt": "Unlock unlimited practice, all company tracks, and full mock interview panels.",
        }

    if mocks_accessed_today >= FREEMIUM_LIMITS["max_mini_mock_interviews"]:
        return {
            "access_granted": False,
            "reason": "Free tier limit: 1 mini mock interview/day. Upgrade for full 5-stage interview simulations.",
            "upgrade_prompt": "Get unlimited mock interviews with Shadow Critic scoring and PTG reports.",
        }

    return {"access_granted": True, "reason": "Within free tier limits."}


async def generate_company_prep_overlay(
    company_name: str,
    target_role: str,
    skill_graph_topics: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Generate company-specific preparation guidance and topic weight overlay.

    Args:
        company_name: Target company (e.g., "google", "amazon").
        target_role: Student's target role (SDE, ML, etc.)
        skill_graph_topics: List of topic nodes from the skill graph.

    Returns:
        Company overlay JSON with adjusted weights and tips.
    """
    prompt = f"""
Target Company: {company_name}
Target Role: {target_role}
Known Topic Weight Overrides for {company_name}: {get_company_weights(company_name)}

Current Skill Graph Topics:
{skill_graph_topics[:20]}  # Limit to 20 for token efficiency

Generate a company-specific prep overlay with high-priority topics,
behavioral themes, tips, and 3-5 sample interview questions from {company_name}.
"""
    return await call_gemini_json(MODELS["FLASH"], OVERLAY_SYSTEM_INSTRUCTION, prompt)
