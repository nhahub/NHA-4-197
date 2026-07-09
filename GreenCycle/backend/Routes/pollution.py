from fastapi import APIRouter, UploadFile, File, HTTPException

from services.pollution_service import analyze_pollution

router = APIRouter()

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE_BYTES = 8 * 1024 * 1024  # 8 MB


@router.post("/analyze-pollution")
async def analyze_pollution_endpoint(image: UploadFile = File(...)):
    if image.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{image.content_type}'. Upload a JPEG, PNG, or WEBP image.",
        )

    image_bytes = await image.read()

    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(image_bytes) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="Image is too large. Max size is 8MB.")

    try:
        result = analyze_pollution(image_bytes)
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")
