"""
DisasterShield Heatwave Prediction Route
Analyzes temperature forecasts to estimate health risks and alert levels.
"""
import httpx
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class HeatwaveRequest(BaseModel):
    lat: float
    lng: float
    forecast_days: int = 7

@router.post("/heatwave")
async def predict_heatwave(request: HeatwaveRequest):
    """Predict heatwave intensity using temperature forecasts."""
    
    url = f"https://api.open-meteo.com/v1/forecast?latitude={request.lat}&longitude={request.lng}&daily=temperature_2m_max&timezone=Asia%2FKolkata&forecast_days={request.forecast_days}"
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(url)
        d = r.json()
    
    temps = d.get('daily', {}).get('temperature_2m_max', [35]*request.forecast_days)
    
    max_temp = max(temps)
    avg_temp = sum(temps) / len(temps)
    
    # Health risk
    if max_temp > 45:
        health_risk = 95
        category = "extreme"
    elif max_temp > 42:
        health_risk = 75
        category = "severe"
    elif max_temp > 40:
        health_risk = 55
        category = "high"
    else:
        health_risk = 25
        category = "moderate"
    
    return {
        'predicted_temps': [round(t, 1) for t in temps],
        'max_temperature': round(max_temp, 1),
        'avg_temperature': round(avg_temp, 1),
        'health_risk': health_risk,
        'category': category,
        'mortality_index': 'high' if health_risk > 70 else 'moderate' if health_risk > 50 else 'low',
        'vulnerable_areas': ['Urban cores', 'Slum areas', 'Construction sites'] if health_risk > 60 else [],
        'recommendations': [
            'Stay indoors during peak hours (12-4 PM)',
            'Drink plenty of water',
            'Check on elderly neighbors',
            'Avoid strenuous outdoor activity'
        ] if health_risk > 50 else ['Stay hydrated', 'Limit sun exposure']
    }
