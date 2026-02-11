def build_explanation_prompt(data: dict, prediction: dict, language: str) -> str:
    """
    Builds a safe, non-diagnostic health explanation prompt
    in the user's language.
    """

    return f"""
You are a health assistant.

IMPORTANT RULES:
- Respond in {language}
- Do NOT diagnose diseases
- Do NOT suggest medicines or tablets
- Do NOT alarm the user
- Give only general, preventive health guidance

Health summary (based on stored data):
- Age: {data.get('age')}
- Body mass index (BMI): {data.get('bmi')}
- Blood pressure: {data.get('systolic_bp')}/{data.get('diastolic_bp')}
- Sugar level: {data.get('sugar')}
- Heart rate: {data.get('heart_rate')}
- ECG indicator: {"Abnormal" if data.get('ecg_flag') == 1 else "Normal"}

Overall health risk level: {prediction.get('risk')}

Your task:
1. Explain what this risk level generally means
2. Mention which health values are outside the normal range (if any)
3. Give general lifestyle and preventive advice such as:
   - regular monitoring
   - balanced diet
   - physical activity
   - stress management
   - avoiding smoking
4. Encourage consulting a healthcare professional for personalized guidance

Keep the tone calm, supportive, and easy to understand.
"""
