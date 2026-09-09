import json
import os
from typing import Dict, Any
from app.models.loader import get_model

# Load treatments data
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
TREATMENTS_FILE = os.path.join(DATA_DIR, "disease_treatments.json")

def load_treatments() -> Dict[str, Any]:
    with open(TREATMENTS_FILE, "r") as f:
        return json.load(f)

TREATMENTS_DB = load_treatments()

def calculate_severity(confidence: float) -> str:
    if confidence > 0.8:
        return "High"
    elif confidence > 0.5:
        return "Medium"
    else:
        return "Low"

def predict_disease_model(image_obj) -> Dict[str, Any]:
    """
    Predict disease from an image object (PIL Image)
    """
    model = get_model("plant_disease")
    
    # Inference
    results = model(image_obj)
    
    # results is usually a list of dicts: [{"label": "...", "score": ...}, ...]
    top_prediction = results[0]
    label = top_prediction["label"]
    confidence = top_prediction["score"]
    
    # Get treatments
    treatment_info = TREATMENTS_DB.get(label, {
        "scientific_name": "Unknown",
        "chemical": "Consult an expert.",
        "biological": "Consult an expert.",
        "cultural": "General plant care."
    })
    
    is_healthy = "healthy" in label.lower()
    
    return {
        "disease_name": label.replace("___", " ").replace("_", " "),
        "scientific_name": treatment_info["scientific_name"],
        "confidence": confidence,
        "severity": calculate_severity(confidence) if not is_healthy else "N/A",
        "affected_area_pct": round(confidence * 100, 2), # Simplified heuristic
        "treatment": {
            "chemical": treatment_info["chemical"],
            "biological": treatment_info["biological"],
            "cultural": treatment_info["cultural"]
        },
        "is_healthy": is_healthy
    }
