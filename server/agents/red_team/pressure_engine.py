#
# Red Team Adversary Agent — Pressure Engine
# [OWNED BY MEMBER 3 - AI & AGENTS]
#
# Generates adversarial challenges: unexpected edge cases, constraint shifts,
# and follow-up complexity reduction questions to stress-test student resilience.
#


from __future__ import annotations

from typing import Any

from ..config.gemini_client import MODELS, call_gemini_json

SYSTEM_INSTRUCTION = """
You are the Red Team Adversary Agent for Placement Mentor 2.0.
Your role is to stress-test students who have just solved or are working on a problem,
by injecting adversarial pressure scenarios that real FAANG interviewers use.

CHALLENGE TYPES:
- EDGE_CASE_ATTACK: Inject a case that breaks naive solutions (N=0, negative ints, duplicates,
  single element, max int overflow, empty arrays, cyclic graphs, skewed trees).
- TIME_RESTRICTION: "You have 3 minutes. What's your first step?" (forces prioritization).
- SPACE_OPTIMIZATION: "Now solve it with O(1) extra space / O(log N) space."
- CONCURRENCY_TWIST: "Assume multiple threads access this simultaneously. What breaks?"

RULES:
1. Generate exactly ONE adversarial challenge per call.
2. The challenge must be directly grounded in the original problem.
3. Tone: Polite but firm, like a real interviewer pushing for more.
4. Output ONLY the JSON schema below — no extra text.

OUTPUT SCHEMA:
{
  "challenge_type": "EDGE_CASE_ATTACK|TIME_RESTRICTION|SPACE_OPTIMIZATION|CONCURRENCY_TWIST",
  "challenge_prompt": "string — the adversarial question to show the student",
  "injected_constraints": ["string"],
  "test_case_variant": {
    "input": "string",
    "expected_output": "string",
    "explanation": "string"
  }
}
"""


async def generate_adversarial_challenge(
    problem_statement: str,
    student_solution_code: str,
    language: str,
    current_complexity: str,
    topic_id: str,
    challenge_type: str | None = None,
) -> dict[str, Any]:
    """
    Generate one adversarial pressure challenge for a solved or in-progress problem.

    Args:
        problem_statement: Full problem text.
        student_solution_code: Student's current passing solution.
        language: Programming language used.
        current_complexity: Student's stated or detected complexity (e.g., "O(N^2) time, O(N) space").
        topic_id: Topic identifier for context.
        challenge_type: Force a specific type or None for dynamic selection.

    Returns:
        AdversarialPressureChallenge JSON dict.
    """
    type_instruction = (
        f"Generate a challenge of type: {challenge_type}."
        if challenge_type
        else "Dynamically pick the most impactful challenge type for this solution."
    )

    prompt = f"""
Original Problem:
{problem_statement}

Student's Solution ({language}):
```
{student_solution_code}
```

Detected / Stated Complexity: {current_complexity}
Topic ID: {topic_id}

{type_instruction}

Generate one adversarial challenge that a senior FAANG interviewer would ask right now.
"""
    return await call_gemini_json(MODELS["FLASH"], SYSTEM_INSTRUCTION, prompt)
