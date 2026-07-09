from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.city_service import simulate_city

router = APIRouter()


class CityData(BaseModel):
    population: int = Field(ge=0)
    cars: int = Field(ge=0)
    factories: int = Field(ge=0)
    trees: int = Field(ge=0)
    energy_usage: int = Field(ge=0)


@router.post("/simulate-city")
async def simulate_city_endpoint(data: CityData):
    try:
        result = simulate_city(data.dict())
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
