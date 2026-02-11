import subprocess

def call_llama(prompt: str) -> str:
    """
    Call Ollama llama3 model safely on Windows
    """
    try:
        result = subprocess.run(
            ["ollama", "run", "llama3"],
            input=prompt,
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=120
        )

        output = result.stdout.strip()

        if not output:
            return "Sorry, I couldn't generate a response right now."

        return output

    except Exception as e:
        return f"Error calling language model: {str(e)}"
