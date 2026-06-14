import os
import json
from langchain_core.tools import tool
from pydantic import BaseModel, Field
from typing import Literal

from tools import problem_bank
from llm import llm

_PROMPT_PATH = os.path.join(os.path.dirname(__file__), "..", "prompts", "code_review.txt")
with open(_PROMPT_PATH) as f:
    CODE_REVIEW_PROMPT = f.read()


class CodeReview(BaseModel):
    verdict: Literal["correct", "partially_correct", "incorrect"] = Field(
        description="Overall verdict on the submitted solution"
    )
    complexity_estimate: str = Field(description="e.g. 'O(n) time, O(1) space'")
    feedback: str = Field(description="2-4 sentences of specific feedback")


@tool
def get_dsa_problem(topic: str, difficulty: str = "medium") -> dict:
    """Fetch a DSA problem from the bank by topic and difficulty (fallback for on-demand requests outside today's plan)."""
    problem = problem_bank.find(topic=topic, difficulty=difficulty)
    return {
        "id": problem["id"],
        "title": problem["title"],
        "topic": problem["topic"],
        "difficulty": problem["difficulty"],
        "statement": problem["statement"],
        "leetcode_url": problem["leetcode_url"],
    }


@tool
def evaluate_code(problem_id: str, code: str) -> dict:
    """Review submitted code for a given problem WITHOUT executing it. Returns verdict, complexity estimate, and feedback."""
    problem = problem_bank.get(problem_id)
    if not problem:
        return {"verdict": "incorrect", "complexity_estimate": "unknown", "feedback": "Could not find this problem in the bank."}

    reviewer = llm.with_structured_output(CodeReview)
    review = reviewer.invoke([
        ("system", CODE_REVIEW_PROMPT),
        ("human", f"Problem:\n{problem['statement']}\n\nSubmitted code:\n{code}"),
    ])
    return review.model_dump()


@tool
def give_hint(problem_id: str, hint_level: int = 1) -> str:
    """Give a pre-written hint for the given problem. hint_level is 1-indexed; higher levels are more specific."""
    problem = problem_bank.get(problem_id)
    if not problem:
        return "No hints available for this problem."
    hints = problem.get("hints", [])
    idx = min(max(hint_level, 1), len(hints)) - 1
    if idx < 0 or not hints:
        return "No hints available for this problem."
    return hints[idx]
