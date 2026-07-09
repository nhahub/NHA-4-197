"""
Shared configuration for all GreenCycle services.

Loads the .env file once (from the backend project root) and exposes
a single configured Groq client + the API key, so every service file
does it the same way instead of duplicating (and sometimes getting
wrong) the dotenv path logic.
"""
import os
from pathlib import Path
from dotenv import load_dotenv
from groq import Groq

# backend/services/config.py -> parent (services) -> parent (backend) -> .env
BACKEND_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=BACKEND_ROOT / ".env")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    # Don't crash import at module load time (so the API can still start
    # and return clean errors from the endpoints), but make it loud.
    print(
        "[GreenCycle] WARNING: GROQ_API_KEY is not set. "
        "Create backend/.env with GROQ_API_KEY=... (see .env.example)."
    )

client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

CHAT_MODEL = "llama-3.3-70b-versatile"
VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"


def require_client() -> Groq:
    if client is None:
        raise RuntimeError(
            "GROQ_API_KEY is missing or invalid. Set it in backend/.env and restart the server."
        )
    return client
