import os
import random
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report
from datetime import datetime

SOIL_TYPES = ["Sandy", "Loamy", "Clay", "Silty", "Peaty", "Chalky"]

def generate_tabular_dataset(samples_per_class=200):
    rng = random.Random(42)
    X, y = [], []
    # (soil_idx, N_mean, N_std, P_mean, P_std, K_mean, K_std, pH_mean, pH_std, M_mean, M_std)
    profiles = [
        (0, 25, 10, 20, 8,  25, 10, 6.2, 0.5, 20, 8),   # Sandy
        (1, 65, 12, 60, 10, 65, 12, 6.8, 0.4, 55, 10),  # Loamy
        (2, 45, 12, 45, 10, 75, 12, 6.5, 0.5, 70, 10),  # Clay
        (3, 55, 12, 65, 10, 55, 10, 6.6, 0.4, 60, 10),  # Silty
        (4, 75, 10, 50, 10, 50, 10, 5.2, 0.5, 80, 8),   # Peaty
        (5, 50, 12, 50, 10, 50, 10, 7.8, 0.4, 45, 10),  # Chalky
    ]
    for soil_idx, nm, ns, pm, ps, km, ks, phm, phs, mm, ms in profiles:
        for _ in range(samples_per_class):
            n = max(0.0, min(100.0, rng.gauss(nm, ns)))
            p = max(0.0, min(100.0, rng.gauss(pm, ps)))
            k = max(0.0, min(100.0, rng.gauss(km, ks)))
            ph = max(0.0, min(14.0, rng.gauss(phm, phs)))
            m = max(0.0, min(100.0, rng.gauss(mm, ms)))
            X.append([n, p, k, ph, m])
            y.append(soil_idx)
    return np.array(X, dtype=np.float32), np.array(y, dtype=np.int32)

def main():
    print("Generating synthetic soil dataset...")
    X, y = generate_tabular_dataset(500)
    
    # Simple train-test split manually
    np.random.seed(42)
    indices = np.random.permutation(len(X))
    split = int(0.8 * len(X))
    train_idx, test_idx = indices[:split], indices[split:]
    
    X_train, X_test = X[train_idx], X[test_idx]
    y_train, y_test = y[train_idx], y[test_idx]

    print("Training RandomForest classifier...")
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)),
    ])
    pipeline.fit(X_train, y_train)

    print("Evaluating model...")
    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {acc:.4f}")
    print(classification_report(y_test, y_pred, target_names=SOIL_TYPES))

    # Prepare artifact
    artifact = {
        "model": pipeline,
        "labels": SOIL_TYPES,
        "features": ["nitrogen", "phosphorus", "potassium", "ph", "moisture"],
        "metadata": {
            "version": "1.0",
            "created_at": datetime.utcnow().isoformat(),
            "accuracy": acc
        }
    }

    # Save artifact
    os.makedirs("artifacts", exist_ok=True)
    artifact_path = os.path.join("artifacts", "soil_model_v1.joblib")
    joblib.dump(artifact, artifact_path)
    print(f"Model saved to {artifact_path}")

if __name__ == "__main__":
    main()
