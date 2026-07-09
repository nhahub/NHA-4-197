import base64

from services.config import require_client, VISION_MODEL


def analyze_pollution(image_bytes: bytes) -> dict:
    client = require_client()
    image_base64 = base64.b64encode(image_bytes).decode("utf-8")

    response = client.chat.completions.create(
        model=VISION_MODEL,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"},
                    },
                    {
                        "type": "text",
                        "text": """Analyze this image for environmental pollution. Provide:
1. Pollution Type (Air/Water/Soil/Waste/None)
2. Severity Level (Low/Medium/High/Critical)
3. Pollution Percentage (0-100%)
4. Main Cause
5. Health Impact
6. Recommended Solutions

Be scientific and specific. Return plain text only, no Markdown formatting.""",
                    },
                ],
            }
        ],
    )

    return {"analysis": response.choices[0].message.content}
