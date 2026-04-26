from langgraph.graph import StateGraph, END
from .state import ResearchState
from .nodes import research_pricing, research_trends, research_competitors, analyze_and_format

def build_graph():
    g = StateGraph(ResearchState)

    g.add_node("research_pricing", research_pricing)
    g.add_node("research_trends", research_trends)
    g.add_node("research_competitors", research_competitors)
    g.add_node("analyze_and_format", analyze_and_format)

    # Fan out in parallel from __start__
    g.set_entry_point("research_pricing")  # see note below
    g.add_edge("research_pricing", "analyze_and_format")
    g.add_edge("research_trends", "analyze_and_format")
    g.add_edge("research_competitors", "analyze_and_format")
    g.add_edge("analyze_and_format", END)

    return g.compile()

# Parallel fan-out using Send API
from langgraph.types import Send

def route_parallel(state: ResearchState):
    return [
        Send("research_pricing", state),
        Send("research_trends", state),
        Send("research_competitors", state),
    ]

def build_graph():
    g = StateGraph(ResearchState)
    g.add_node("research_pricing", research_pricing)
    g.add_node("research_trends", research_trends)
    g.add_node("research_competitors", research_competitors)
    g.add_node("analyze_and_format", analyze_and_format)
    g.add_node("fan_out", lambda s: s)  # passthrough to trigger routing

    g.set_entry_point("fan_out")
    g.add_conditional_edges("fan_out", route_parallel)

    for node in ("research_pricing", "research_trends", "research_competitors"):
        g.add_edge(node, "analyze_and_format")

    g.add_edge("analyze_and_format", END)
    return g.compile()

workflow = build_graph()