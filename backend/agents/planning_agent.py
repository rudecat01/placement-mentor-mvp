import os
from pydantic import BaseModel
from langchain_core.messages import AIMessage

from llm import llm
from state import MVPState
from tools import problem_bank

_PROMPT_PATH = os.path.join(os.path.dirname(__file__), "..", "prompts", "planning_agent.txt")
with open(_PROMPT_PATH) as f:
    PLANNING_PROMPT = f.read()


class DayPlan(BaseModel):
    day: int
    problem_ids: list[str]


class WeekPlan(BaseModel):
    week: int
    focus: str
    daily_plan: list[DayPlan]


class Roadmap(BaseModel):
    weeks: list[WeekPlan]


def find_week(roadmap: list, day: int) -> dict:
    """Return the week dict that contains the given day number."""
    for week in roadmap:
        for d in week["daily_plan"]:
            if d["day"] == day:
                return week
    return roadmap[0]


def format_roadmap(roadmap: Roadmap, current_day: int = 1) -> str:
    lines = []
    for week in roadmap.weeks:
        lines.append(f"### Week {week.week}: {week.focus}")
        for d in week.daily_plan:
            marker = " ⬅️ today" if d.day == current_day else ""
            problem_lines = []
            for pid in d.problem_ids:
                p = problem_bank.get(pid)
                if p:
                    problem_lines.append(f"{p['title']} ({p['topic']}, {p['difficulty']}) — [LeetCode]({p['leetcode_url']})")
                else:
                    problem_lines.append(pid)
            lines.append(f"- **Day {d.day}**{marker}: " + "; ".join(problem_lines))
        lines.append("")
    return "\n".join(lines)


def planning_agent_node(state: MVPState) -> dict:
    weak_topics = sorted(
        ((k, v) for k, v in state["skill_mastery"].items() if k != "communication"),
        key=lambda x: x[1],
    )

    generator = llm.with_structured_output(Roadmap)
    roadmap = generator.invoke([
        ("system", PLANNING_PROMPT.format(
            user_profile=state["user_profile"] or "No resume submitted yet — assume a generalist CS student.",
            mastery=dict(weak_topics),
            available_ids=problem_bank.ids_by_topic(),
        )),
        ("human", "Generate the 1-week roadmap now."),
    ])

    reply = "## Your Roadmap\n\n" + format_roadmap(roadmap, state["current_day"])
    return {"roadmap": [w.model_dump() for w in roadmap.weeks], "messages": [AIMessage(content=reply)]}
