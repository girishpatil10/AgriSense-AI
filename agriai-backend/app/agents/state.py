from typing import TypedDict, List, Annotated
import operator

class AgriState(TypedDict):
    """
    Represents the state of the agricultural advisory agent.
    """
    soil_data: dict
    region: str
    season: str
    previous_crops: List[str]
    recommendations: Annotated[List[dict], operator.add]
    rotation_advice: str
    inference_mode: str
    errors: Annotated[List[str], operator.add]
