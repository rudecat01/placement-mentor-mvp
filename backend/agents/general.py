from langchain_core.messages import AIMessage

from llm import llm
from state import MVPState

SYSTEM = (
    "You are a friendly placement-prep mentor assistant. The user's message doesn't fit "
    "resume review, DSA practice, mock interviews, or roadmap planning. Respond briefly and "
    "helpfully, and if relevant, mention you can help with: resume feedback, DSA problems, "
    "mock interviews, or a study roadmap."
)


def general_node(state: MVPState) -> dict:
    response = llm.invoke([("system", SYSTEM)] + state["messages"][-3:])
    return {"messages": [AIMessage(content=response.content)]}
