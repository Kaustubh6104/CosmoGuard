from fastapi import APIRouter
from pydantic import BaseModel
import httpx

router = APIRouter()

class CycloneRequest(BaseModel):
    lat: float
    lng: float

@router.post("/cyclone")
async def predict_cyclone(request: CycloneRequest):
    # Fetching LIVE data from Open-Meteo (includes wind gusts and surface pressure)
    # Open-Meteo is free for educational use and doesn't require an API key.
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={request.lat}&longitude={request.lng}"
        f"&current=wind_speed_10m,wind_gusts_10m,surface_pressure"
        f"&timezone=Asia%2FKolkata"
    )
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url)
        if response.status_code != 200:
            return {"error": "Failed to fetch live weather data"}
        data = response.json()
    
    # Extracting real-time values
    current = data.get('current', {})
    wind_speed = current.get('wind_speed_10m', 0)
    wind_gusts = current.get('wind_gusts_10m', 0)
    pressure = current.get('surface_pressure', 1013) # Normal sea level pressure is ~1013 hPa
    
    # IMD-based Cyclone Logic: Pressure drop is a key indicator
    # Severe cyclones typically have pressure < 990 hPa
    is_cyclonic = wind_gusts > 60 or pressure < 1000
    
    if pressure < 980 or wind_gusts > 120:
        intensity = "Very Severe Cyclonic Storm"
        category = 3
    elif pressure < 995 or wind_gusts > 80:
        intensity = "Severe Cyclonic Storm"
        category = 2
    elif is_cyclonic:
        intensity = "Cyclonic Storm / Deep Depression"
        category = 1
    else:
        intensity = "Normal Weather / No Cyclone"
        category = 0

    return {
        "live_data": {
            "wind_speed_kmh": wind_speed,
            "wind_gusts_kmh": wind_gusts,
            "surface_pressure_hpa": pressure
        },
        "prediction": {
            "intensity": intensity,
            "category": category,
            "alert_level": "RED" if category >= 2 else "YELLOW" if category == 1 else "GREEN"
        },
        "recommendations": [
            "Evacuate coastal zones" if category >= 2 else "Stay indoors and monitor news"
        ] if category > 0 else ["No immediate cyclone threat detected"]
    }