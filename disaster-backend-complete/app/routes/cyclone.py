from fastapi import APIRouter
from pydantic import BaseModel
import httpx

router = APIRouter()

class CycloneRequest(BaseModel):
    lat: float
    lng: float

@router.post("/cyclone")
async def predict_cyclone(request: CycloneRequest):
    # Fetching LIVE data (using Mean Sea Level pressure for accuracy)
    # Surface pressure in cities like Pune is low due to altitude, causing false cyclone alarms.
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={request.lat}&longitude={request.lng}"
        f"&current=wind_speed_10m,wind_gusts_10m,pressure_msl"
        f"&timezone=Asia%2FKolkata"
    )
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url)
        data = response.json()
    
    current = data.get('current', {})
    wind_gusts = current.get('wind_gusts_10m', 0)
    msl_pressure = current.get('pressure_msl', 1013)
    
    # Distance from coast check (Scale: Pune 18.5N, 73.8E is ~100km inland)
    # Coastal bounds roughly: Longitude < 74 (West) or > 80 (East) below 25N
    is_coastal = (request.lat < 25) and (request.lng < 74 or request.lng > 80)
    
    # IMD-based Cyclone Logic: Pressure drop at sea level
    # Normal is ~1013. Severe cyclones are < 990.
    pressure_drop = max(0, 1013 - msl_pressure)
    
    # Calculate base risk based on pressure and wind
    base_risk = (pressure_drop * 4) + (wind_gusts * 0.5)
    
    # Apply inland penalty (cyclones lose power inland)
    if not is_coastal:
        base_risk = base_risk * 0.25 # 75% reduction for inland regions
    
    # Determine category
    if base_risk > 80:
        intensity = "Very Severe Cyclonic Storm"
        category = 3
    elif base_risk > 45:
        intensity = "Severe Cyclonic Storm"
        category = 2
    elif base_risk > 20:
        intensity = "Cyclonic Storm / Depression"
        category = 1
    else:
        intensity = "Normal Weather"
        category = 0

    return {
        "live_data": {
            "wind_gusts_kmh": wind_gusts,
            "msl_pressure_hpa": msl_pressure,
            "is_coastal_sector": is_coastal
        },
        "prediction": {
            "intensity": intensity,
            "category": category,
            "risk_percentage": round(base_risk, 1),
            "alert_level": "RED" if category >= 2 else "YELLOW" if category == 1 else "GREEN"
        }
    }