import os
import base64
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

import os
api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key)


def analyze_pollution(image_bytes: bytes) -> dict:
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
                        "text": """Analyze this image for environmental pollution. Provide:
1. Pollution Type (Air/Water/Soil/Waste/None)
2. Severity Level (Low/Medium/High/Critical)
3. Pollution Percentage (0-100%)
4. Main Cause
5. Health Impact
6. Recommended Solutions

Be scientific and specific."""
                    }
                ]
            }
        ]
    )

    return {"analysis": response.choices[0].message.content}