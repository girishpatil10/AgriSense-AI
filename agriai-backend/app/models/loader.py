import logging
import os
import joblib
from typing import Any
from .yield_model import load_yield_model

from transformers import pipeline

logger = logging.getLogger(__name__)

MODEL_REGISTRY: dict[str, Any] = {}


def load_models() -> None:
    """Load all ML models into MODEL_REGISTRY. Called during app lifespan startup."""
    try:
        # Load offline-trained soil classifier artifact
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        artifact_path = os.path.join(base_dir, "artifacts", "soil_model_v1.joblib")
        if not os.path.exists(artifact_path):
            logger.warning(f"Model artifact not found at {artifact_path}. Creating a dummy model for demo.")
            # Create a dummy model object if missing
            class DummyModel:
                def predict(self, x): return ["Loamy"]
                def predict_proba(self, x): return [[0.9]]
                @property
                def classes_(self): return ["Loamy"]
            MODEL_REGISTRY["soil_npk"] = DummyModel()
        else:
            artifact = joblib.load(artifact_path)
            MODEL_REGISTRY["soil_npk"] = artifact
            logger.info("soil_npk model artifact loaded successfully.")
    except Exception as exc:
        logger.error("Failed to load soil_npk model artifact: %s", exc)

    try:
        # Fertilizer model mock
        logger.info("Loading fertilizer recommendation model (mock)...")
        class MockFertilizerPipeline:
            def __call__(self, text):
                text_lower = text.lower()
                if "wheat" in text_lower: return [{"label": "Urea", "score": 0.85}]
                elif "corn" in text_lower or "maize" in text_lower: return [{"label": "DAP", "score": 0.78}]
                elif "rice" in text_lower: return [{"label": "MOP", "score": 0.82}]
                else: return [{"label": "20-20", "score": 0.75}]
        MODEL_REGISTRY["fertilizer"] = MockFertilizerPipeline()
        logger.info("fertilizer mock model loaded successfully.")
    except Exception as exc:
        logger.error("Failed to load fertilizer model: %s", exc)

    try:
        # Load plant disease detection model
        logger.info("Loading plant disease detection model...")
        MODEL_REGISTRY["plant_disease"] = pipeline(
            "image-classification", 
            model="spandan-mazumder/plant-disease-recognition"
        )
        logger.info("plant_disease model loaded successfully.")
    except Exception as exc:
        logger.error("Failed to load plant_disease model (attempting mock): %s", exc)
        class MockDiseasePipeline:
            def __call__(self, image):
                import random
                results = [
                    {"label": "Tomato___Late_blight", "score": 0.92},
                    {"label": "Tomato___healthy", "score": 0.88},
                    {"label": "Apple___Apple_scab", "score": 0.75},
                    {"label": "Corn_(maize)___Common_rust_", "score": 0.82},
                    {"label": "Tomato___Bacterial_spot", "score": 0.79}
                ]
                return [random.choice(results)]
        MODEL_REGISTRY["plant_disease"] = MockDiseasePipeline()
        logger.info("plant_disease mock model loaded successfully.")

    try:
        # Load yield prediction model
        logger.info("Loading yield prediction model...")
        MODEL_REGISTRY["yield_predict"] = load_yield_model()
        logger.info("yield_predict model loaded successfully.")
    except Exception as exc:
        logger.error("Failed to load yield prediction model: %s", exc)


def get_model(name: str) -> Any:
    model = MODEL_REGISTRY.get(name)
    if model is None:
        raise RuntimeError(f"Model '{name}' is not loaded. Check startup logs.")
    return model
