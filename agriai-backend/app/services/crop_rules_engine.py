import json
import os
from typing import List, Dict

def load_crop_rules():
    """
    Loads crop suitability rules from the JSON data file.
    """
    path = os.path.join(os.path.dirname(__file__), "..", "data", "crop_rules.json")
    with open(path, "r") as f:
        return json.load(f)

def calculate_suitability(crop: dict, soil_data: dict, season: str, previous_crops: List[str]) -> float:
    """
    Calculates a suitability score (0.0 to 1.0) for a crop based on soil and context.
    """
    # Season filter (Hard constraint)
    if season.capitalize() not in crop["season"]:
        return 0.0
    
    score = 1.0
    
    # NPK scoring
    for nutrient in ["N", "P", "K"]:
        val = soil_data.get(nutrient)
        if val is not None:
            low, high = crop["npk"][nutrient]
            if val < low:
                score *= (val / low)
            elif val > high:
                # Slight penalty for excessive nutrients to prefer optimal balance
                score *= max(0.8, high / val)
    
    # pH scoring
    ph = soil_data.get("ph")
    if ph is not None:
        low, high = crop["ph"]
        if ph < low:
            score *= (ph / low)
        elif ph > high:
            score *= (high / ph)
            
    # Moisture scoring
    moisture = soil_data.get("moisture")
    if moisture is not None:
        low, high = crop["moisture"]
        if moisture < low:
            score *= (moisture / low)
        elif moisture > high:
            score *= (high / moisture)
            
    # Rotation penalty
    previous_crops_lower = [pc.lower() for pc in previous_crops]
    penalty_crops = [c.lower() for c in crop.get("rotation_penalty_crops", [])]
    
    if any(pc in penalty_crops for pc in previous_crops_lower):
        score *= 0.6  # Significant penalty for lack of rotation
        
    return round(max(0.0, min(1.0, score)), 2)

def get_rule_based_recommendations(soil_data: dict, season: str, previous_crops: List[str]):
    """
    Generates crop recommendations using the rule-based engine.
    """
    rules = load_crop_rules()
    recommendations = []
    
    for crop in rules["crops"]:
        score = calculate_suitability(crop, soil_data, season, previous_crops)
        if score > 0.3:  # Only include crops with reasonable suitability
            recommendations.append({
                "crop_name": crop["name"],
                "suitability_score": score,
                "reason": (
                    f"Selected based on {crop['name']}'s suitability for {season} season "
                    f"and current soil nutrient profile (NPK: {soil_data.get('N')}, "
                    f"{soil_data.get('P')}, {soil_data.get('K')})."
                )
            })
            
    recommendations.sort(key=lambda x: x["suitability_score"], reverse=True)
    
    return {
        "recommended_crops": recommendations,
        "rotation_advice": (
            "Ensure you rotate with legumes if previous crops were heavy nitrogen feeders. "
            "Avoid planting the same crop family in consecutive seasons."
        ),
        "inference_mode": "rule_based"
    }
