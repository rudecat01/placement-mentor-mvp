import os
import json
from langchain_core.messages import AIMessage, ToolMessage

from llm import llm
from state import MVPState
from tools import problem_bank
from tools.code_eval import get_dsa_problem, evaluate_code, give_hint
from agents.planning_agent import find_week

_PROMPT_PATH = os.path.join(os.path.dirname(__file__), "..", "prompts", "dsa_agent.txt")
with open(_PROMPT_PATH) as f:
    DSA_PROMPT = f.read()

TOOLS = [get_dsa_problem, evaluate_code, give_hint]
TOOLS_BY_NAME = {t.name: t for t in TOOLS}


def format_problem_card(problem: dict, day: int = None) -> str:
    header = f"**Day {day}: {problem['title']}**" if day else f"**{problem['title']}**"
    return (
        f"{header} ({problem['topic']}, {problem['difficulty']})\n\n"
        f"{problem['statement']}\n\n"
        f"🔗 Solve it on LeetCode: {problem['leetcode_url']}\n\n"
        f"Paste your code here when you're done, or ask for a hint."
    )


def _pick_fallback_problem(state: MVPState) -> dict:
    """No roadmap yet — assign a problem from the student's weakest non-communication topic."""
    weakest = min(
        ((k, v) for k, v in state["skill_mastery"].items() if k != "communication"),
        key=lambda x: x[1],
    )[0]
    return problem_bank.find(topic=weakest, difficulty="easy")


def dsa_agent_node(state: MVPState) -> dict:
    sess = dict(state["dsa_session"])

    # --- primary path: assign today's problem, no LLM call needed ---
    if not sess.get("active_problem"):
        problem = None
        day = state["current_day"]
        if state.get("roadmap"):
            try:
                week = find_week(state["roadmap"], day)
                today = next(d for d in week["daily_plan"] if d["day"] == day)
                sess["assigned_problem_ids"] = today["problem_ids"]
                problem = problem_bank.get(today["problem_ids"][0])
            except (StopIteration, KeyError, IndexError):
                problem = None

        if problem is None:
            problem = _pick_fallback_problem(state)
            sess["assigned_problem_ids"] = [problem["id"]]
            day = None

        sess["active_problem"] = problem
        sess["awaiting_submission"] = True
        sess["hints_given"] = 0
        return {"dsa_session": sess, "messages": [AIMessage(content=format_problem_card(problem, day))]}

    # --- fallback / evaluation path: tool-calling loop ---
    llm_with_tools = llm.bind_tools(TOOLS)
    history = [("system", DSA_PROMPT.format(
        skill_mastery=state["skill_mastery"],
        active_problem=sess["active_problem"],
    ))] + state["messages"][-4:]

    response = llm_with_tools.invoke(history)

    last_eval = None
    if response.tool_calls:
        tool_messages = []
        for call in response.tool_calls:
            tool_fn = TOOLS_BY_NAME[call["name"]]
            args = dict(call["args"])
            if call["name"] in ("evaluate_code", "give_hint"):
                args.setdefault("problem_id", sess["active_problem"]["id"])
            result = tool_fn.invoke(args)
            if call["name"] == "evaluate_code":
                last_eval = result
            if call["name"] == "give_hint":
                sess["hints_given"] = sess.get("hints_given", 0) + 1
            tool_messages.append(ToolMessage(content=json.dumps(result), tool_call_id=call["id"]))

        followup = llm_with_tools.invoke(history + [response] + tool_messages)
        final_text = followup.content or "Got it — let me know if you'd like a hint or to try again."
    else:
        final_text = response.content

    out = {"dsa_session": sess, "messages": [AIMessage(content=final_text)]}
    if last_eval:
        out["_last_eval"] = last_eval
    return out
