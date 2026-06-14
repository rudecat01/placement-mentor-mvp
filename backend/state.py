from typing import TypedDict, Annotated, Literal, Optional
from langgraph.graph.message import add_messages


class MVPState(TypedDict):
    messages: Annotated[list, add_messages]

    intent: Optional[Literal["resume", "dsa", "interview", "planning", "general"]]

    user_profile: dict
    skill_mastery: dict
    dsa_session: dict
    interview_session: dict
    roadmap: Optional[list]
    current_day: int

    # scratch fields consumed by update_mastery_node, cleared each turn
    _last_eval: Optional[dict]
    _last_interview_report: Optional[dict]


INITIAL_STATE: dict = {
    "messages": [],
    "intent": None,
    "user_profile": {},
    "skill_mastery": {
        "arrays": 0.3, "strings": 0.3, "trees": 0.3,
        "graphs": 0.3, "dp": 0.3, "communication": 0.3,
    },
    "dsa_session": {
        "assigned_problem_ids": [], "active_problem": None,
        "awaiting_submission": False, "hints_given": 0,
    },
    "interview_session": {
        "active": False, "type": None, "turn": 0, "qa_log": [], "max_turns": 4,
    },
    "roadmap": None,
    "current_day": 1,
    "_last_eval": None,
    "_last_interview_report": None,
}
