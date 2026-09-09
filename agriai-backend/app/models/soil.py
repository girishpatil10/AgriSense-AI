"""
Soil analysis model inference wrapper for offline-trained scikit-learn artifact.
"""
from __future__ import annotations

from dataclasses import dataclass
import numpy as np

_N_LOW = 40.0
_P_LOW = 35.0
_K_LOW = 35.0

_RECS = {
    "nitrogen_low": "Nitrogen is deficient — apply urea (46-0-0) or ammonium nitrate at 50-80 kg/ha.",
    "phosphorus_low": "Phosphorus is deficient — apply DAP (18-46-0) or SSP at 40-60 kg/ha.",
    "potassium_low": "Potassium is deficient — apply MOP (0-0-60) or SOP at 30-50 kg/ha.",
    "ph_acidic": "Soil is acidic (pH < 5.5) — apply agricultural lime at 1-2 t/ha to raise pH.",
    "ph_alkaline": "Soil is alkaline (pH > 7.5) — apply elemental sulfur at 200-500 kg/ha to lower pH.",
    "moisture_low": "Soil moisture is low — increase irrigation frequency or use mulching.",
    "moisture_high": "Soil moisture is high — improve drainage to prevent waterlogging and root rot.",
    "optimal": "Soil nutrient levels are within optimal ranges. Maintain current management practices.",
}

@dataclass
class SoilPrediction:
    soil_type: str
    confidence: float
    deficiencies: list[str]
    recommendations: list[str]

def _build_deficiencies(n: float, p: float, k: float) -> list[str]:
    result = []
    if n < _N_LOW:
        result.append("nitrogen")
    if p < _P_LOW:
        result.append("phosphorus")
    if k < _K_LOW:
        result.append("potassium")
    return result

def _build_recommendations(deficiencies: list[str], ph: float, moisture: float) -> list[str]:
    recs: list[str] = []
    if "nitrogen" in deficiencies:
        recs.append(_RECS["nitrogen_low"])
    if "phosphorus" in deficiencies:
        recs.append(_RECS["phosphorus_low"])
    if "potassium" in deficiencies:
        recs.append(_RECS["potassium_low"])
    if ph < 5.5:
        recs.append(_RECS["ph_acidic"])
    elif ph > 7.5:
        recs.append(_RECS["ph_alkaline"])
    if moisture < 20:
        recs.append(_RECS["moisture_low"])
    elif moisture > 85:
        recs.append(_RECS["moisture_high"])
    if not recs:
        recs.append(_RECS["optimal"])
    return recs

def run_soil_prediction(nitrogen: float, phosphorus: float, potassium: float, ph: float, moisture: float) -> SoilPrediction:
    from app.models.loader import get_model
    artifact = get_model("soil_npk")
    model = artifact["model"]
    labels = artifact["labels"]
    
    X = np.array([[nitrogen, phosphorus, potassium, ph, moisture]], dtype=np.float32)
    proba = model.predict_proba(X)[0]
    soil_idx = int(np.argmax(proba))
    soil_type = labels[soil_idx]
    confidence = round(float(proba[soil_idx]), 4)
    
    deficiencies = _build_deficiencies(nitrogen, phosphorus, potassium)
    recommendations = _build_recommendations(deficiencies, ph, moisture)
    
    return SoilPrediction(
        soil_type=soil_type,
        confidence=confidence,
        deficiencies=deficiencies,
        recommendations=recommendations,
    )
