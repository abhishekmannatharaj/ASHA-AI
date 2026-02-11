# ml/predictor.py

import joblib
import pandas as pd
from ml.features import FEATURE_COLUMNS
from ml.sanity_rules import validate_ranges

# Load trained model and label encoder
MODEL_PATH = "models/health_risk_xgb.pkl"
ENCODER_PATH = "models/risk_label_encoder.pkl"

model = joblib.load(MODEL_PATH)
label_encoder = joblib.load(ENCODER_PATH)

# Human-readable risk mapping
RISK_MAP = {
    0: "Low",
    1: "Medium",
    2: "High"
}


def predict_health_risk(raw_data: dict) -> dict:
    """
    Predicts health risk from structured numeric data.
    Returns risk level and confidence score.
    """

    # 1️⃣ Validate input ranges
    validate_ranges(raw_data)

    # 2️⃣ Prepare input dataframe
    input_data = {col: float(raw_data[col]) for col in FEATURE_COLUMNS}
    X = pd.DataFrame([input_data])

    # 3️⃣ Predict probabilities
    probabilities = model.predict_proba(X)[0]
    class_index = probabilities.argmax()

    # 4️⃣ Decode risk label
    encoded_label = label_encoder.inverse_transform([class_index])[0]
    risk_label = RISK_MAP[encoded_label]

    return {
        "risk": risk_label,
        "score": round(float(probabilities[class_index]), 2),
        "probabilities": [round(float(p), 2) for p in probabilities]
    }
