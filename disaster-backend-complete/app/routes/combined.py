from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class CombinedRequest(BaseModel):
    lat: float
    lng: float

@router.post("/predict-all")
async def predict_all_disasters(request: CombinedRequest):
    """Predict all disaster types for a location"""
    from app.routes import flood, drought, landslide, heatwave, cyclone
    
    # Call all predictors
    flood_result = await flood.predict_flood(flood.FloodRequest(lat=request.lat, lng=request.lng))
    drought_result = await drought.predict_drought(drought.DroughtRequest(lat=request.lat, lng=request.lng))
    landslide_result = await landslide.predict_landslide(landslide.LandslideRequest(lat=request.lat, lng=request.lng))
    heatwave_result = await heatwave.predict_heatwave(heatwave.HeatwaveRequest(lat=request.lat, lng=request.lng))
    cyclone_result = await cyclone.predict_cyclone(cyclone.CycloneRequest(lat=request.lat, lng=request.lng))
    
    return {
        'location': {'lat': request.lat, 'lng': request.lng},
        'predictions': {
            'flood': {
                'probability': flood_result['probability'],
                'risk_level': flood_result['risk_level']
            },
            'drought': {
                'severity_index': drought_result['severity_index'],
                'category': drought_result['category']
            },
            'landslide': {
                'probability': landslide_result['probability']
            },
            'heatwave': {
                'health_risk': heatwave_result['health_risk'],
                'max_temp': heatwave_result['max_temperature']
            },
            'cyclone': {
                'intensity': cyclone_result['intensity'],
                'category': cyclone_result['category']
            }
        },
        'highest_risk': max([
            ('flood', flood_result['probability']),
            ('drought', drought_result['severity_index']),
            ('landslide', landslide_result['probability']),
            ('heatwave', heatwave_result['health_risk'])
        ], key=lambda x: x[1])
    }
