from fastapi import APIRouter, UploadFile, File
from services.pollution_service import analyze_pollution

router = APIRouter()

@router.post("/analyze-pollution")
async def analyze_pollution_endpoint(image: UploadFile = File(...)):
    image_bytes = await image.read()
    result = analyze_pollution(image_bytes)
    return result