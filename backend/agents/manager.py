import os
from pydantic import BaseModel
from typing import Literal

from llm import llm
from state import MVPState

_PROMPT_PATH = os.path.join(os.path.dirname(__file__), "..", "prompts", "manager.txt")
with open(_PROMPT_PATH) as f:
    ROUTER_PROMPT = f.read()


class IntentClassification(BaseModel):
    intent: Literal["resume", "dsa", "interview", "planning", "general"]


def router_node(state: MVPState) -> dict:
    last_msg = state["messages"][-1].content
    classifier = llm.with_structured_output(IntentClassification)
    result = classifier.invoke([
        ("system", ROUTER_PROMPT),
        ("human", last_msg),
    ])
    return {"intent": result.intent}


def route_after_router(state: MVPState) -> str:
    if state["interview_session"].get("active"):
        return "interview_agent"
    if state["dsa_session"].get("awaiting_submission"):
        return "dsa_agent"
    return state["intent"]
