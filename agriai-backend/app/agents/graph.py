from langgraph.graph import StateGraph, END
from app.agents.state import AgriState
from app.agents.nodes import run_crop_model_node

def create_agri_graph():
    """
    Initializes the LangGraph workflow for agricultural recommendations.
    """
    workflow = StateGraph(AgriState)
    
    # Add nodes
    workflow.add_node("recommend_crops", run_crop_model_node)
    
    # Define edges
    workflow.set_entry_point("recommend_crops")
    workflow.add_edge("recommend_crops", END)
    
    return workflow.compile()

# Singleton instance of the graph
agri_graph = create_agri_graph()
