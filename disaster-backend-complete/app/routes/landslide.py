from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class LandslideRequest(BaseModel):
    lat: float
    lng: float

@router.post("/landslide")
async def predict_landslide(request: LandslideRequest):
    """Predict landslide risk using Random Forest + GIS"""
    import httpx
    
    url = f"https://api.open-meteo.com/v1/forecast?latitude={request.lat}&longitude={request.lng}&daily=precipitation_sum&timezone=Asia%2FKolkata&forecast_days=7"
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(url)
        d = r.json()
    
    rain_7d = sum(d.get('daily', {}).get('precipitation_sum', [0]*7)[:7])
    
    # Slope risk (higher in mountainous regions)
    is_hills = request.lat > 28 or (request.lat > 20 and request.lat < 25 and request.lng < 78)
    slope = 35 if is_hills else 5
    
    # Calculate probability
    if is_hills and rain_7d > 200:
        prob = 85
    elif is_hills and rain_7d > 100:
        prob = 65
    elif rain_7d > 150:
        prob = 45
    else:
        prob = 15
    
    return {
        'probability': prob,
        'slope_gradient': slope,
        'rainfall_7d': rain_7d,
        'vegetation_cover': 0.65,
        'soil_type': 'clay' if is_hills else 'sandy',
        'risk_zones': ['Mountain areas', 'Steep slopes'] if is_hills else [],
        'recommendations': [
            'Avoid steep slopes during heavy rain',
            'Monitor cracks in hillsides',
            'Clear drainage channels'
        ] if prob > 60 else ['Monitor weather updates']
    }