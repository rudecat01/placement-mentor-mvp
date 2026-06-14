import os
from pydantic import BaseModel
from langchain_core.messages import AIMessage

from llm import llm
from state import MVPState

_Q_PROMPT_PATH = os.path.join(os.path.dirname(__file__), "..", "prompts", "interview_agent.txt")
_EVAL_PROMPT_PATH = os.path.join(os.path.dirname(__file__), "..", "prompts", "interview_eval.txt")
with open(_Q_PROMPT_PATH) as f:
    INTERVIEW_PROMPT = f.read()
with open(_EVAL_PROMPT_PATH) as f:
    INTERVIEW_EVAL_PROMPT = f.read()


class QuestionScore(BaseModel):
    question: str
    score: int
    feedback: str


class InterviewReport(BaseModel):
    scores: list[QuestionScore]
    overall_feedback: str


def format_report(report: InterviewReport) -> str:
    avg = sum(s.score for s in report.scores) / len(report.scores)
    lines = ["### Mock Interview Report", "", f"**Average score: {avg:.1f}/10**", ""]
    for s in report.scores:
        lines.append(f"- **{s.question}** — {s.score}/10. {s.feedback}")
    lines.append("")
    lines.append(f"**Overall:** {report.overall_feedback}")
    return "\n".join(lines)


def interview_agent_node(state: MVPState) -> dict:
    sess = dict(state["interview_session"])
    sess["qa_log"] = list(sess.get("qa_log", []))
    user_msg = state["messages"][-1].content

    if sess["turn"] >= sess["max_turns"]:
        if sess["qa_log"]:
            sess["qa_log"][-1]["a"] = user_msg

        evaluator = llm.with_structured_output(InterviewReport)
        report = evaluator.invoke([
            ("system", INTERVIEW_EVAL_PROMPT),
            ("human", str(sess["qa_log"])),
        ])

        sess["active"] = False
        return {
            "interview_session": sess,
            "messages": [AIMessage(content=format_report(report))],
            "_last_interview_report": report.model_dump(),
        }

    if sess["qa_log"]:
        sess["qa_log"][-1]["a"] = user_msg

    next_q = llm.invoke([
        ("system", INTERVIEW_PROMPT.format(turn=sess["turn"], max_turns=sess["max_turns"])),
        ("human", "Previous questions asked: " + str([qa["q"] for qa in sess["qa_log"]])),
    ]).content

    sess["qa_log"].append({"q": next_q, "a": None})
    sess["turn"] += 1
    sess["active"] = True
    sess["type"] = sess.get("type") or "behavioral"
    return {"interview_session": sess, "messages": [AIMessage(content=next_q)]}
