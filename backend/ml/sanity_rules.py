# ml/sanity_rules.py

def validate_ranges(data: dict):
    """
    Basic sanity checks for health data.
    Raises ValueError if input is clearly invalid.
    """

    if not (0 < data.get("age", 0) < 120):
        raise ValueError("Age value is not valid")

    if not (10 < data.get("bmi", 0) < 80):
        raise ValueError("BMI value is not valid")

    if not (60 < data.get("systolic_bp", 0) < 250):
        raise ValueError("Systolic BP value is not valid")

    if not (40 < data.get("diastolic_bp", 0) < 150):
        raise ValueError("Diastolic BP value is not valid")

    if not (40 < data.get("sugar", 0) < 500):
        raise ValueError("Sugar level value is not valid")

    if not (30 < data.get("heart_rate", 0) < 220):
        raise ValueError("Heart rate value is not valid")

    if data.get("ecg_flag", 0) not in (0, 1):
        raise ValueError("ECG flag must be 0 or 1")


# ==========================================================
# 🟢 RULE-BASED FALLBACK RISK ENGINE
# ==========================================================
def rule_based_risk(data: dict) -> str:
    """
    Simple rule-based risk prediction.
    Used when ML model fails or data is limited.
    """

    try:
        validate_ranges(data)
    except Exception:
        return "Medium"  # Safe default

    risk_score = 0

    # Blood pressure
    if data.get("systolic_bp", 0) >= 160 or data.get("diastolic_bp", 0) >= 100:
        risk_score += 2
    elif data.get("systolic_bp", 0) >= 140 or data.get("diastolic_bp", 0) >= 90:
        risk_score += 1

    # Blood sugar
    if data.get("sugar", 0) >= 200:
        risk_score += 2
    elif data.get("sugar", 0) >= 140:
        risk_score += 1

    # BMI
    if data.get("bmi", 0) >= 35:
        risk_score += 2
    elif data.get("bmi", 0) >= 30:
        risk_score += 1

    # ECG abnormality
    if data.get("ecg_flag", 0) == 1:
        risk_score += 2

    # Final risk mapping
    if risk_score >= 5:
        return "High"
    elif risk_score >= 3:
        return "Medium"
    else:
        return "Low"
