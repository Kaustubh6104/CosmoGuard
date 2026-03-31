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
    flood_res = await flood.predict_flood(flood.FloodRequest(lat=request.lat, lng=request.lng))
    drought_res = await drought.predict_drought(drought.DroughtRequest(lat=request.lat, lng=request.lng))
    landslide_res = await landslide.predict_landslide(landslide.LandslideRequest(lat=request.lat, lng=request.lng))
    heatwave_res = await heatwave.predict_heatwave(heatwave.HeatwaveRequest(lat=request.lat, lng=request.lng))
    cyclone_res = await cyclone.predict_cyclone(cyclone.CycloneRequest(lat=request.lat, lng=request.lng))
    
    # Define recommendation mappings
    RECOMMENDATIONS = {
        'flood': [
            "Monitor local water levels and dam releases.",
            "Move expensive equipment and documents to upper floors.",
            "Identify nearest high-ground shelters immediately."
        ],
        'drought': [
            "Implement strict water conservation protocols.",
            "Monitor crop health and local reservoir levels.",
            "Prepare for possible water rationing measures."
        ],
        'landslide': [
            "Monitor for cracks in earth or shifting foundations.",
            "Clear debris from drainage channels around properties.",
            "Avoid low-lying areas during heavy rainfall."
        ],
        'heatwave': [
            "Minimize outdoor activity between 11 AM and 4 PM.",
            "Establish cooling stations and maintain hydration.",
            "Ensure power backup for ventilation systems."
        ],
        'cyclone': [
            "Secure loose outdoor items and trim overhanging branches.",
            "Reinforce windows and check emergency battery supplies.",
            "Evacuate coastal lowlands immediately if advised."
        ]
    }

    predictions = {
        'flood': {
            'risk_percentage': flood_res['probability'],
            'risk_level': flood_res['risk_level'],
            'recommended_actions': RECOMMENDATIONS['flood']
        },
        'drought': {
            'risk_percentage': drought_res['severity_index'],
            'category': drought_res['category'],
            'recommended_actions': RECOMMENDATIONS['drought']
        },
        'landslide': {
            'risk_percentage': landslide_res['probability'],
            'recommended_actions': RECOMMENDATIONS['landslide']
        },
        'heatwave': {
            'risk_percentage': heatwave_res['health_risk'],
            'max_temp': heatwave_res['max_temperature'],
            'recommended_actions': RECOMMENDATIONS['heatwave']
        },
        'cyclone': {
            'risk_percentage': cyclone_res['prediction']['risk_percentage'], 
            'intensity': cyclone_res['prediction']['intensity'],
            'recommended_actions': RECOMMENDATIONS['cyclone']
        }

    }
    
    # Calculate rounded values and determine highest risk
    for k in predictions:
        predictions[k]['risk_percentage'] = round(predictions[k]['risk_percentage'], 1)

    highest_key = max(predictions.keys(), key=lambda k: predictions[k]['risk_percentage'])
    
    return {
        'location': {'lat': request.lat, 'lng': request.lng},
        'predictions': predictions,
        'highest_risk': (highest_key, predictions[highest_key]['risk_percentage'])
    }



