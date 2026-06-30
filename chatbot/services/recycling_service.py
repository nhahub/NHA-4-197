import base64
from groq import Groq

import os
api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key)


def analyze_recycling(image_bytes: bytes) -> dict:
    image_base64 = base64.b64encode(image_bytes).decode("utf-8")

    response = client.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_base64}"
                        }
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

Be specific and practical."""
                    }
                ]
            }
        ]
    )

    return {"analysis": response.choices[0].message.content}