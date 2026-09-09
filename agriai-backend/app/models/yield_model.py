import math
import joblib
import numpy as np
import os
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

def predict_yield_fallback(
    crop_name: str,
    area_hectares: float,
    nitrogen: float,
    phosphorus: float,
    potassium: float,
    ph: float,
    moisture: float,
    avg_temp: float,
    avg_precip: float
) -> Dict[str, Any]:
    """
    Simulated yield prediction model fallback.
    """
    base_yields = {
        "wheat": 3500, "rice": 4000, "corn": 5000, "soybean": 2800,
        "sugarcane": 70000, "cotton": 2000, "default": 3000
    }
    
    base = base_yields.get(crop_name.lower(), base_yields["default"])
    
    npk_score = (
        min(nitrogen / 100, 1.2) * 0.4 +
        min(phosphorus / 50, 1.2) * 0.3 +
        min(potassium / 50, 1.2) * 0.3
    )
    
    ph_impact = 1.0 - (abs(ph - 6.5) / 6.5)
    temp_impact = 1.0 - (abs(avg_temp - 25) / 25)
    precip_impact = min(avg_precip / 500, 1.1)
    
    multiplier = (npk_score * 0.5 + ph_impact * 0.2 + temp_impact * 0.15 + precip_impact * 0.15)
    predicted_kg_ha = base * multiplier
    
    uncertainty = 0.1
    low = predicted_kg_ha * (1 - uncertainty)
    high = predicted_kg_ha * (1 + uncertainty)
    
    return {
        "predicted_yield_kg_per_hectare": float(predicted_kg_ha),
        "total_predicted_yield_kg": float(predicted_kg_ha * area_hectares),
        "yield_range": {
            "low": float(low),
            "high": float(high),
            "confidence_level": 0.94
        },
        "key_factors": ["Soil Nutrients", "pH Balance", "Weather Pattern"]
    }

class YieldModel:
    def __init__(self, model_path: str):
        self.model_path = model_path
        self.model = None
        if os.path.exists(model_path):
            try:
                self.model = joblib.load(model_path)
                logger.info("Yield prediction model loaded successfully.")
            except Exception as e:
                logger.error(f"Error loading yield model: {e}")
        else:
            logger.warning(f"Yield model artifact not found at {model_path}. Using fallback logic.")

    def predict(self, features: np.ndarray, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        if self.model:
            try:
                prediction = float(self.model.predict(features)[0])
                area = metadata.get("area_hectares", 1.0) if metadata else 1.0
                return {
                    "predicted_yield_kg_per_hectare": prediction,
                    "total_predicted_yield_kg": prediction * area,
                    "yield_range": {
                        "low": prediction * 0.9,
                        "high": prediction * 1.1,
                        "confidence_level": 0.85
                    },
                    "key_factors": ["Model Features", "Historical Trends"]
                }
            except Exception as e:
                logger.error(f"Error in model prediction: {e}")
        
        if metadata:
            return predict_yield_fallback(**metadata)
            
        return {
            "predicted_yield_kg_per_hectare": 0.0,
            "total_predicted_yield_kg": 0.0,
            "yield_range": {"low": 0.0, "high": 0.0, "confidence_level": 0.0},
            "key_factors": []
        }

def load_yield_model() -> YieldModel:
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    model_path = os.path.join(base_dir, "app", "data", "models", "yield_model.joblib")
    return YieldModel(model_path)
