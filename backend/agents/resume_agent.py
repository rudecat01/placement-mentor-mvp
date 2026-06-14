import os
from pydantic import BaseModel, Field
from langchain_core.messages import AIMessage

from llm import llm
from state import MVPState
from tools.resume_parser import extract_resume_text

_PROMPT_PATH = os.path.join(os.path.dirname(__file__), "..", "prompts", "resume_agent.txt")
with open(_PROMPT_PATH) as f:
    RESUME_PROMPT = f.read()

TARGET_ROLES = [
    "Software Development Engineer (SDE)",
    "Frontend Engineer",
    "Backend Engineer",
    "Full Stack Engineer",
    "Data Scientist",
    "Machine Learning Engineer",
    "Data Engineer",
    "DevOps / Cloud Engineer",
    "Mobile Engineer (iOS/Android)",
    "Product Analyst",
]


class ResumeAnalysis(BaseModel):
    skills_detected: list[str] = Field(description="Concrete technical skills found in the resume")
    suggested_roles: list[str] = Field(
        description=f"2-4 best-fit roles for this candidate from this list: {TARGET_ROLES}. Return exact strings from the list."
    )
    strengths: list[str]
    gaps: list[str]
    suggestions: list[str]
    summary: str


def format_resume_feedback(analysis: ResumeAnalysis) -> str:
    lines = ["### Resume Review", "", f"**Summary:** {analysis.summary}", ""]
    lines.append("**Detected skills:** " + ", ".join(analysis.skills_detected))
    lines.append("")
    lines.append("**Strengths:**")
    lines += [f"- {s}" for s in analysis.strengths]
    lines.append("")
    lines.append("**Gaps:**")
    lines += [f"- {g}" for g in analysis.gaps]
    lines.append("")
    lines.append("**Suggestions:**")
    lines += [f"- {s}" for s in analysis.suggestions]
    lines.append("")
    lines.append("**Suggested roles:** " + ", ".join(analysis.suggested_roles))
    return "\n".join(lines)


def resume_agent_node(state: MVPState) -> dict:
    resume_text = extract_resume_text(state["messages"][-1])

    analyzer = llm.with_structured_output(ResumeAnalysis)
    response = analyzer.invoke([
        ("system", RESUME_PROMPT),
        ("human", resume_text),
    ])

    # Validate suggested roles against known list, fallback gracefully
    valid_roles = [r for r in response.suggested_roles if r in TARGET_ROLES]
    if not valid_roles:
        valid_roles = TARGET_ROLES[:3]

    profile = {
        **state["user_profile"],
        "skills_detected": response.skills_detected,
        "resume_summary": response.summary,
        "suggested_roles": valid_roles,
    }
    reply = format_resume_feedback(response)
    return {"user_profile": profile, "messages": [AIMessage(content=reply)]}