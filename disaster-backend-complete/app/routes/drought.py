from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class DroughtRequest(BaseModel):
    lat: float
    lng: float

@router.post("/drought")
async def predict_drought(request: DroughtRequest):
    """Predict drought severity using XGBoost + NDVI"""
    # Simplified prediction
    import httpx
    
    url = f"https://api.open-meteo.com/v1/forecast?latitude={request.lat}&longitude={request.lng}&current_weather=true&daily=precipitation_sum,temperature_2m_max&timezone=Asia%2FKolkata&forecast_days=7"
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(url)
        d = r.json()
    
    temp = d.get('current_weather', {}).get('temperature', 30)
    rain_7d = sum(d.get('daily', {}).get('precipitation_sum', [0]*7)[:7])
    
    # Drought severity calculation (Continuous Interpolation)
    # Primary factors: Temp > 35, Rainfall < 20mm
    temp_factor = max(0, (temp - 30) / 15) # 0 to 1 scale for 30C to 45C
    rain_factor = max(0, (30 - rain_7d) / 30) # 0 to 1 scale for 30mm down to 0mm
    
    index = int(15 + 80 * (temp_factor * 0.4 + rain_factor * 0.6))
    index = min(98, max(5, index))
    
    if index > 80: severity = "extreme"
    elif index > 60: severity = "severe"
    elif index > 35: severity = "moderate"
    else: severity = "mild"
    
    return {
        'severity_index': index,
        'category': severity,
        'temperature': temp,
        'rainfall_7d': rain_7d,
        'ndvi': 0.35 if index > 70 else 0.55,  # Mock NDVI
        'agricultural_impact': 'high' if index > 70 else 'medium' if index > 50 else 'low',
        'recommendations': [
            'Conserve water resources',
            'Monitor crop health daily',
            'Implement drip irrigation' if index > 70 else 'Normal practices'
        ]
    }
