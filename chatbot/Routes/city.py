from fastapi import APIRouter
from pydantic import BaseModel
from services.city_service import simulate_city

router = APIRouter()

class CityData(BaseModel):
    population: int
    cars: int
    factories: int
    trees: int
    energy_usage: int

@router.post("/simulate-city")
async def simulate_city_endpoint(data: CityData):
    result = simulate_city(data.dict())
    return result