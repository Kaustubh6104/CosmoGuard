"""
Flood Prediction API Route
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import httpx

router = APIRouter()

class FloodRequest(BaseModel):
    lat: float
    lng: float
    use_ml: bool = True

@router.post("/flood")
async def predict_flood(request: FloodRequest):
    """
    Predict flood probability for given location
    
    Uses:
    - LSTM for rainfall time-series
    - XGBoost for multi-feature classification
    - SHAP for explainability
    
    Returns 48-hour early warning with factor contributions
    """
    # Fetch weather data
    url = f"https://api.open-meteo.com/v1/forecast?latitude={request.lat}&longitude={request.lng}&current_weather=true&hourly=relativehumidity_2m&daily=precipitation_sum&timezone=Asia%2FKolkata&forecast_days=3"
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            weather = response.json()
        
        rainfall_3d = sum(weather.get('daily', {}).get('precipitation_sum', [0,0,0])[:3])
        humidity = weather.get('hourly', {}).get('relativehumidity_2m', [70])[0]
        
        weather_data = {
            'rainfall_3d': rainfall_3d,
            'humidity': humidity
        }
        
    except Exception as e:
        raise HTTPException(500, f"Weather API error: {str(e)}")
    
    # Use ML predictor
    from ml_modules.flood_predictor import flood_predictor
    prediction = flood_predictor.predict(request.lat, request.lng, weather_data)
    
    return {
        **prediction,
        'location': {'lat': request.lat, 'lng': request.lng},
        'weather_data': weather_data,
        'model': 'LSTM + XGBoost Hybrid',
        'data_sources': ['Open-Meteo', 'CWC', 'GIS']
    }

@router.get("/flood/historical/{city}")
async def get_flood_history(city: str):
    """Get historical flood data for a city"""
    # Mock data - in production, query database
    historical_data = {
        "Mumbai": [
            {"date": "2024-07-26", "severity": "high", "rainfall": 315},
            {"date": "2023-07-18", "severity": "medium", "rainfall": 145},
            {"date": "2022-06-12", "severity": "low", "rainfall": 78}
        ],
        "Patna": [
            {"date": "2024-08-15", "severity": "high", "rainfall": 285},
            {"date": "2023-09-20", "severity": "high", "rainfall": 312},
            {"date": "2022-07-08", "severity": "medium", "rainfall": 156}
        ]
    }
    
    return {
        'city': city,
        'historical_floods': historical_data.get(city, []),
        'total_events': len(historical_data.get(city, []))
    }
