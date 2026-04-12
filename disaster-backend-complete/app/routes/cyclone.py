"""
DisasterShield Cyclone Prediction Route
Uses MSL pressure and coastal proximity for wind-based hazard detection.
"""
import math
from fastapi import APIRouter
from pydantic import BaseModel
import httpx

router = APIRouter()

class CycloneRequest(BaseModel):
    lat: float
    lng: float

@router.post("/cyclone")
async def predict_cyclone(request: CycloneRequest):
    """Predicts cyclone intensity based on MSL pressure and coastal proximity."""
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
    
    # Distance from coast check - Continuous Scaling Logic
    # Major coastal nodes: Mumbai (19, 72), Chennai (13, 80), Kolkata (22, 88), Kochi (10, 76)
    coastal_nodes = [(19.0, 72.8), (13.1, 80.3), (22.5, 88.4), (9.9, 76.3), (21.0, 72.0)]
    min_dist = min([((request.lat - c_lat)**2 + (request.lng - c_lng)**2)**0.5 for (c_lat, c_lng) in coastal_nodes])
    
    # Gaussian decay for coastal influence (sigma = 3.0 degrees ~ 330km)
    coast_influence = math.exp(-(min_dist**2 / (2 * 2.5**2)))
    is_coastal = min_dist < 1.5 # Boolean for summary but we use the influence for math
    
    # IMD-based Cyclone Logic: Pressure drop at sea level
    # Normal is ~1013. Severe cyclones are < 990.
    pressure_drop = max(0, 1013 - msl_pressure)
    
    # Calculate base risk based on pressure and wind
    base_risk = (pressure_drop * 4) + (wind_gusts * 0.5)
    
    # Apply continuous coastal scaling (no hard cut-offs)
    # Inland regions maintain some risk but significantly scaled down
    final_risk = base_risk * (0.2 + 0.8 * coast_influence)
    
    # Determine category
    if final_risk > 80:
        intensity = "Very Severe Cyclonic Storm"
        category = 3
    elif final_risk > 45:
        intensity = "Severe Cyclonic Storm"
        category = 2
    elif final_risk > 20:
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
            "risk_percentage": round(final_risk, 1),
            "alert_level": "RED" if category >= 2 else "YELLOW" if category == 1 else "GREEN"
        }
    }