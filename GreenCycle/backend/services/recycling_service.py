import base64

from services.config import require_client, VISION_MODEL


def analyze_recycling(image_bytes: bytes) -> dict:
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
                        "text": """Analyze this image and identify waste/recyclable materials. Provide:
1. Waste Type (Plastic/Paper/Glass/Metal/Electronic/Organic/Mixed)
2. Recycling Code (if plastic)
3. Recyclable (Yes/No)
4. Decomposition Time
5. Recycling Method
6. Environmental Impact if not recycled
7. Nearest Recycling Tip

Be specific and practical. Return plain text only, no Markdown formatting.""",
                    },
                ],
            }
        ],
    )

    return {"analysis": response.choices[0].message.content}
