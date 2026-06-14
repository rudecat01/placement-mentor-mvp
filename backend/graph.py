from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from state import MVPState
from agents.manager import router_node, route_after_router
from agents.resume_agent import resume_agent_node
from agents.dsa_agent import dsa_agent_node
from agents.interview_agent import interview_agent_node
from agents.planning_agent import planning_agent_node
from agents.general import general_node
from agents.progress import update_mastery_node


def build_graph():
    graph = StateGraph(MVPState)

    graph.add_node("router", router_node)
    graph.add_node("resume_agent", resume_agent_node)
    graph.add_node("dsa_agent", dsa_agent_node)
    graph.add_node("interview_agent", interview_agent_node)
    graph.add_node("planning_agent", planning_agent_node)
    graph.add_node("general", general_node)
    graph.add_node("update_mastery", update_mastery_node)

    graph.add_edge(START, "router")
    graph.add_conditional_edges("router", route_after_router, {
        "resume": "resume_agent",
        "dsa": "dsa_agent",
        "interview": "interview_agent",
        "planning": "planning_agent",
        "general": "general",
        "resume_agent": "resume_agent",
        "dsa_agent": "dsa_agent",
        "interview_agent": "interview_agent",
    })

    graph.add_edge("dsa_agent", "update_mastery")
    graph.add_edge("interview_agent", "update_mastery")
    graph.add_edge("update_mastery", END)

    graph.add_edge("resume_agent", END)
    graph.add_edge("planning_agent", END)
    graph.add_edge("general", END)

    return graph.compile(checkpointer=MemorySaver())


compiled_graph = build_graph()
