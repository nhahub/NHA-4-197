import os
from groq import Groq
from dotenv import load_dotenv

from pathlib import Path
load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

import os
api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key)

SYSTEM_PROMPT = """You are Eco AI Advisor, a smart environmental assistant.
Always respond in English.
You help with:
- Analyzing environmental pollution
- Recycling guidance
- Simulating city impact on the environment
- Practical eco-friendly solutions
Be scientifically accurate and use numbers and statistics when possible."""

def chat(messages: list) -> str:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "system", "content": SYSTEM_PROMPT}] + messages
    )
    return response.choices[0].message.content