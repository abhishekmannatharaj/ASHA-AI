from ml.predictor import predict_health_risk
from ml.sanity_rules import validate_ranges
from llm.llama_runtime import call_llama


def start_askbot(stored_data: dict) -> str:
    """
    INITIAL HEALTH ASSESSMENT
    """
    print("🟢 AskBot started for patient data:", stored_data)

    try:
        validate_ranges(stored_data)
        risk = predict_health_risk(stored_data)
    except Exception:
        risk = "Medium"

    prompt = f"""
You are a health assistant.

Patient data:
{stored_data}

Predicted health risk level: {risk}

Rules:
- Explain what this risk means
- Give general preventive advice
- If risk is HIGH, say: "Consult a doctor immediately"
- Do NOT diagnose
- Do NOT recommend medicines
- Simple language
"""

    response = call_llama(prompt)

    return f"""
🩺 Health Risk Assessment

Risk Level: {risk}

{response}
"""


def askbot(user_text: str) -> str:
    """
    FOLLOW-UP CHAT
    """
    prompt = f"""
You are a helpful assistant.

User question:
{user_text}

Rules:
- Health → general advice only
- No diagnosis
- No medicines
"""

    return call_llama(prompt)
