from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from Routes.chatbot import router as chatbot_router
from Routes.pollution import router as pollution_router
from Routes.recycling import router as recycling_router
from Routes.city import router as city_router
app = FastAPI(title="Eco AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chatbot_router, prefix="/api")
app.include_router(pollution_router, prefix="/api")
app.include_router(recycling_router, prefix="/api")
app.include_router(city_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Eco AI API is running!"}