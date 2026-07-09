import re

from services.config import require_client, CHAT_MODEL

SYSTEM_PROMPT = """
You are Eco AI Advisor, a smart environmental assistant.
Always respond in English.

IMPORTANT RULES:
- Return plain text only.
- Never use Markdown formatting.
- Do not use bold, *italic*, headings (#), tables, or markdown bullets.
- Do not surround words with asterisks.
- Write clear and natural sentences.

You help with:
- Analyzing environmental pollution.
- Recycling guidance.
- Simulating city impact on the environment.
- Practical eco-friendly solutions.

Be scientifically accurate and use numbers and statistics whenever possible.
"""


def clean_response(text: str) -> str:
    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text)
    text = re.sub(r"\*(.*?)\*", r"\1", text)
    text = re.sub(r"^#+\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"^\s*[-*]\s+", "- ", text, flags=re.MULTILINE)
    return text.strip()


def chat(messages: list) -> str:
    client = require_client()
    response = client.chat.completions.create(
        model=CHAT_MODEL,
        messages=[{"role": "system", "content": SYSTEM_PROMPT}, *messages],
        temperature=0.5,
    )
    text = response.choices[0].message.content
    return clean_response(text)
