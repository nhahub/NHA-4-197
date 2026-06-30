from fastapi import APIRouter, UploadFile, File
from services.recycling_service import analyze_recycling

router = APIRouter()

@router.post("/analyze-recycling")
async def analyze_recycling_endpoint(image: UploadFile = File(...)):
    image_bytes = await image.read()
    result = analyze_recycling(image_bytes)
    return result