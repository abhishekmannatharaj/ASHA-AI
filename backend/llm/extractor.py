def build_extraction_prompt(user_text: str) -> str:
    """
    Builds a prompt to extract structured health data
    from multilingual user input.
    """

    return f"""
You are a data extraction assistant.

The user input may be written in any language
(Tamil, Kannada, Hindi, English, etc.).

Your task:
- Extract health-related values
- Detect the language of the input
- Return ONLY valid JSON
- Do NOT explain anything
- Do NOT add extra text

Required JSON fields:
- age (number or null)
- bmi (number or null)
- systolic_bp (number or null)
- diastolic_bp (number or null)
- sugar (number or null)
- heart_rate (number or null)
- ecg_flag (0 or 1 or null)
- language (language name in English, e.g., "Tamil", "Kannada", "English")

If a value is missing, use null.

User input:
\"\"\"{user_text}\"\"\"
"""
