import json
import os
from pydantic import BaseModel
from typing import Dict, Any, Tuple
from app.models.loader import get_model

# Load the fertilizer guide
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
GUIDE_PATH = os.path.join(BASE_DIR, "data", "fertilizer_guide.json")

with open(GUIDE_PATH, "r") as f:
    FERTILIZER_GUIDE = json.load(f)


class FertilizerPrediction(BaseModel):
    fertilizer_type: str
    confidence: float
    base_dosage_kg_per_hectare: float
    application_method: str
    notes: str


def predict_fertilizer_type(
    nitrogen: float,
    phosphorus: float,
    potassium: float,
    ph: float,
    moisture: float,
    crop_name: str
) -> FertilizerPrediction:
    """
    Predicts fertilizer recommendation based on soil and crop parameters.
    """
    # 1. Format input text for classification model
    input_text = (
        f"Nitrogen: {nitrogen}, Phosphorus: {phosphorus}, Potassium: {potassium}, "
        f"Temperature: 25, Humidity: 50, " # Providing dummy temp/humidity if missing
        f"Moisture: {moisture}, Soil Type: Loamy, Crop Type: {crop_name}"
    )

    # 2. Get the model
    try:
        pipeline = get_model("fertilizer")
        
        # 3. Predict
        results = pipeline(input_text)
        
        if not results or not isinstance(results, list):
            raise ValueError("Unexpected output format from fertilizer model")
            
        prediction = results[0]
        fertilizer_type = prediction.get("label", "default").replace("LABEL_", "") # sometimes labels are "LABEL_0", etc. depending on model mapping. DNgigi/FertiliserApplicaiont outputs string classes.
        confidence = prediction.get("score", 0.0)
        
        # fallback for mapping if needed, let's assume the label is the fertilizer name
    except Exception as e:
        # Fallback to default if model fails
        fertilizer_type = "default"
        confidence = 0.0

    # 4. Lookup from guide
    guide_info = FERTILIZER_GUIDE.get(fertilizer_type)
    if not guide_info:
        # Try case-insensitive matching
        for key, value in FERTILIZER_GUIDE.items():
            if key.lower() == fertilizer_type.lower():
                guide_info = value
                fertilizer_type = key
                break
    
    if not guide_info:
        guide_info = FERTILIZER_GUIDE.get("default")
        
    return FertilizerPrediction(
        fertilizer_type=fertilizer_type,
        confidence=confidence,
        base_dosage_kg_per_hectare=guide_info["base_dosage_kg_per_hectare"],
        application_method=guide_info["application_method"],
        notes=guide_info["notes"],
    )
