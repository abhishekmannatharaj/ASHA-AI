from ml.predictor import predict_health_risk
from ml.sanity_rules import rule_based_risk


RISK_MAP = {"Low": 1, "Medium": 2, "High": 3}
REVERSE_RISK_MAP = {1: "Low", 2: "Medium", 3: "High"}


def evaluate_patient_risk(visits: list[dict]) -> dict:
    """
    visits: list of visit records (latest first)

    Returns:
    - overall_risk
    - trend
    - visit_risks (per visit with date)
    """

    if not visits:
        return {
            "overall_risk": "Unknown",
            "trend": "No data",
            "visit_risks": []
        }

    visit_risks = []
    numeric_risks = []

    # 🔹 Predict risk per visit
    for visit in visits:
        try:
            risk = predict_health_risk(visit)
        except Exception:
            risk = rule_based_risk(visit)

        numeric_value = RISK_MAP.get(risk, 2)

        visit_risks.append({
            "visit_date": visit.get("visit_date"),
            "risk": risk
        })

        numeric_risks.append(numeric_value)

    # 🔹 Overall risk = latest visit risk
    overall_risk = visit_risks[0]["risk"]

    # 🔹 Trend detection
    if len(numeric_risks) == 1:
        trend = "Single visit"
    else:
        recent = numeric_risks[0]
        previous_avg = sum(numeric_risks[1:]) / (len(numeric_risks) - 1)

        if recent > previous_avg:
            trend = "Increasing"
        elif recent < previous_avg:
            trend = "Decreasing"
        else:
            trend = "Stable"

    return {
        "overall_risk": overall_risk,
        "trend": trend,
        "visit_risks": visit_risks
    }
