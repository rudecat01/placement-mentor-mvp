import json
import os

_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "problems.json")

with open(_PATH) as f:
    _PROBLEMS = json.load(f)

_BY_ID = {p["id"]: p for p in _PROBLEMS}


def get(problem_id: str) -> dict:
    return _BY_ID.get(problem_id)


def find(topic: str = None, difficulty: str = None) -> dict:
    """Return the first problem matching topic/difficulty (case-insensitive). Falls back to any topic match."""
    topic = (topic or "").lower()
    difficulty = (difficulty or "").lower()
    candidates = _PROBLEMS
    if topic:
        candidates = [p for p in candidates if p["topic"] == topic]
    if difficulty:
        diff_matches = [p for p in candidates if p["difficulty"] == difficulty]
        if diff_matches:
            candidates = diff_matches
    return candidates[0] if candidates else _PROBLEMS[0]


def all_problems() -> list:
    return _PROBLEMS


def ids_by_topic() -> dict:
    out = {}
    for p in _PROBLEMS:
        out.setdefault(p["topic"], []).append(f'{p["id"]}({p["difficulty"]})')
    return out
