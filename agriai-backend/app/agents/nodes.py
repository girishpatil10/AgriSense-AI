from app.agents.state import AgriState
from app.models.crop import predict_crop_llm
from app.services.crop_rules_engine import get_rule_based_recommendations

async def run_crop_model_node(state: AgriState):
    """
    Node to run the crop recommendation model (LLM with rule fallback).
    """
    try:
        result = await predict_crop_llm(
            soil_data=state["soil_data"],
            region=state["region"],
            season=state["season"],
            previous_crops=state["previous_crops"]
        )
        return {
            "recommendations": result["recommended_crops"],
            "rotation_advice": result["rotation_advice"],
            "inference_mode": "llm"
        }
    except Exception as e:
        # Fallback to rules if LLM fails
        result = get_rule_based_recommendations(
            soil_data=state["soil_data"],
            season=state["season"],
            previous_crops=state["previous_crops"]
        )
        return {
            "recommendations": result["recommended_crops"],
            "rotation_advice": result["rotation_advice"],
            "inference_mode": "rule_based",
            "errors": [f"LLM Error: {str(e)}"]
        }
