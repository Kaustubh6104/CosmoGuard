"""
DisasterShield Personalized Risk & Intel Routes
Calculates localized risk based on city history and mitigation.
"""
import datetime
import random
from fastapi import APIRouter, HTTPException
import httpx

router = APIRouter()

# Simulated city infrastructure / government mitigation scores (0 to 1, higher is better prepared)
CITY_MITIGATION = {
    "Patna": 0.75,       # High mitigation due to river embankments/dams
    "Mumbai": 0.60,      # Good drainage but high coastal vulnerability
    "Lucknow": 0.55,
    "Chennai": 0.65,
    "Jaipur": 0.40,
    "Bhubaneswar": 0.70, # High cyclone preparedness
    "Guwahati": 0.45,
    "Kolkata": 0.50,
    "Solapur": 0.35,
    "Amravati": 0.35
}

# Simulated 5-year flood history index (0 to 1, higher means more severe historical frequency)
CITY_HISTORY = {
    "Patna": 0.85, 
    "Mumbai": 0.90,
    "Lucknow": 0.40,
    "Chennai": 0.75,
    "Guwahati": 0.95
}

@router.get("/weather-history")
async def get_weather_history(lat: float, lng: float):
    """Fetches 7-day past weather data for the location."""
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&past_days=7&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            data = response.json()
        if "daily" not in data:
            raise HTTPException(500, "Invalid data from weather API")
        daily = data["daily"]
        history = []
        today_str = str(datetime.date.today())
        for i in range(len(daily["time"])):
            if daily["time"][i] < today_str:
                history.append({
                    "date": daily["time"][i],
                    "max_temp": daily["temperature_2m_max"][i],
                    "min_temp": daily["temperature_2m_min"][i],
                    "precipitation": daily["precipitation_sum"][i]
                })
        return {"history": history[-7:]}
    except (httpx.RequestError, KeyError) as e:
        raise HTTPException(500, f"Error fetching weather history: {str(e)}") from e

@router.get("/risk-analysis")
async def get_risk_analysis(lat: float, lng: float, city: str = "Unknown"):
    """Performs hybrid risk analysis using historical and current weather."""
    history_resp = await get_weather_history(lat, lng)
    history = history_resp.get("history", [])
    if not history: return {"error": "Could not fetch history."}
    
    total_rain = sum(h["precipitation"] for h in history if h["precipitation"] is not None)
    high_temp_days = sum(1 for h in history if h["max_temp"] is not None and h["max_temp"] > 35)
    
    # Hybrid Risk Model: (Weather + History) - Mitigation
    mitigation = CITY_MITIGATION.get(city, 0.30)
    history_factor = CITY_HISTORY.get(city, 0.40)
    
    # Flood logic
    flood_raw = (total_rain / 200) * 80 + (history_factor * 20)
    flood_risk = max(5, int(flood_raw * (1 - mitigation * 0.5))) # Mitigation reduces risk impact
    
    # Drought logic
    drought_raw = (1 - (total_rain / 10)) * 70 + (high_temp_days / 7) * 30
    drought_risk = max(5, int(drought_raw))
    
    heatwave_risk = 95 if high_temp_days >= 6 else (60 if high_temp_days >= 3 else 15)
    cyclone_risk = random.randint(5, 30)

    # Consistent alert threshold
    overall_alert = "Critical" if max([flood_risk, drought_risk, heatwave_risk]) > 60 else "Normal"
        
    return {
        "drought_risk": drought_risk,
        "flood_risk": flood_risk,
        "cyclone_risk": cyclone_risk,
        "heatwave_risk": heatwave_risk,
        "overall_alert": overall_alert,
        "mitigation_score": mitigation,
        "history_context": "High-mitigation infrastructure active in your area." if mitigation > 0.6 else "Standard monitoring active."
    }

@router.get("/news")
async def get_local_news(city: str):
    mock_news = [
        {"id": 1, "title": f"Local authorities in {city} brace for extreme weather shifts", "source": "City Times", "time": "2 hours ago", "type": "warning"},
        {"id": 2, "title": f"{city} implements new water conservation rules", "source": "Daily Herald", "time": "5 hours ago", "type": "info"},
        {"id": 3, "title": "Weather patterns suggest dry spell for the upcoming week", "source": "Meteo India", "time": "1 day ago", "type": "update"}
    ]
    return {"news": mock_news, "city": city}

@router.get("/evacuation")
async def get_evacuation_routes(
    lat: float, 
    lng: float, 
    risk_type: str = "flood", 
    floor: int = 0, 
    has_power_backup: bool = False, 
    has_ac: bool = False,
    supplies_days: int = 0
):
    # pylint: disable=too-many-arguments
    """Calculates evacuation or shelter-in-place instructions."""
    if risk_type == "drought":
        return {
            "status": "Safe to Stay (Precautionary)",
            "safe_zone": { "lat": lat, "lng": lng, "name": "Your Home (Coolest Room)" },
            "distance_km": 0.0,
            "instructions": [
                "Stay Hydrated: Drink plenty of water even if not thirsty.",
                "Avoid Direct Sun: Stay indoors between 12 PM and 4 PM.",
                "Check on Elderly: Ensure neighbors and relatives are safe.",
                "Cooling active: Your AC/Home cooling is sufficient." if has_ac else "Maintain ventilation.",
                "Water Conservation: Priority stock active." if supplies_days > 3 else "Refill stocks now."
            ]
        }
    
    # Logic for Shelter in Place vs Evacuation
    # If flood and user is on high floor with supplies, they are safer at home
    is_well_prepared = (floor > 1 and has_power_backup and supplies_days >= 3)
    
    if risk_type == "flood" and is_well_prepared:
        return {
            "status": "Shelter in Place Recommended",
            "safe_zone": { "lat": lat, "lng": lng, "name": "Your Home (Upper Floors)" },
            "distance_km": 0.0,
            "instructions": [
                "Excellent Readiness: You have sufficient supplies and height advantage.",
                "Turn off main power breaker if water enters ground floor.",
                "Ensure emergency communications (Mobile/Radio) are fully charged.",
                "Monitor official broadcasts for localized spillway alerts.",
                "Avoid using elevators during the storm period."
            ]
        }

    safe_lat = lat + (random.uniform(0.05, 0.1) * random.choice([-1, 1]))
    safe_lng = lng + (random.uniform(0.05, 0.1) * random.choice([-1, 1]))
    return {
        "status": "Evacuation Recommended" if risk_type in ["flood", "cyclone"] else "Shelter in Place",
        "safe_zone": { "lat": round(safe_lat, 4), "lng": round(safe_lng, 4), "name": "High Ground Emergency Shelter" },
        "distance_km": round(random.uniform(5.0, 15.0), 1),
        "instructions": [
            "Pack essential documents, IDs, and first-aid safely.",
            "Carry 3 days of water and non-perishable food.",
            "Evacuate immediately before routes get cut off.",
            "Follow the designated blue evacuation signs."
        ]
    }

@router.get("/zones-risk")
async def get_zones_risk(disaster_type: str = "flood"):
    """Returns coordinates and risk levels for regional hazard zones."""
    zones = {
        "cyclone": [
            { "id": 1, "lat": 13.08, "lng": 80.27, "city": "Chennai", "label": "Category 4 Risk" },
            { "id": 2, "lat": 17.69, "lng": 83.22, "city": "Visakhapatnam", "label": "Cyclone Prone" },
            { "id": 3, "lat": 20.30, "lng": 85.82, "city": "Bhubaneswar", "label": "High Risk Zone" },
            { "id": 4, "lat": 22.57, "lng": 88.36, "city": "Kolkata", "label": "Moderate Risk" }
        ],
        "flood": [
            { "id": 1, "lat": 26.85, "lng": 80.95, "city": "Lucknow", "label": "Flood Plain" },
            { "id": 2, "lat": 25.59, "lng": 85.14, "city": "Patna", "label": "Critical Zone" },
            { "id": 3, "lat": 26.14, "lng": 91.74, "city": "Guwahati", "label": "Brahmaputra Risk" },
            { "id": 4, "lat": 22.57, "lng": 88.36, "city": "Kolkata", "label": "Delta Risk" },
            { "id": 5, "lat": 19.08, "lng": 72.88, "city": "Mumbai", "label": "Coastal Flood" }
        ],
        "drought": [
            { "id": 1, "lat": 26.91, "lng": 75.79, "city": "Jaipur", "label": "Arid Zone" },
            { "id": 2, "lat": 17.39, "lng": 75.49, "city": "Solapur", "label": "Drought Prone" },
            { "id": 3, "lat": 20.93, "lng": 77.75, "city": "Amravati", "label": "Vidarbha" }
        ]
    }
    selected_zones = zones.get(disaster_type, [])
    results = []
    for zone in selected_zones:
        # User defined refined logic (e.g., Patna is better prepared)
        # We simulate this by calling our new logic for each zone
        mitigation = CITY_MITIGATION.get(zone["city"], 0.3)
        history = CITY_HISTORY.get(zone["city"], 0.4)
        
        # Rainfall randomizer for map view
        rain_mock = random.randint(100, 350) if disaster_type == "flood" else 0
        base_risk = int(((rain_mock/400)*70 + history*20) * (1 - mitigation*0.5))
        
        results.append({
            **zone,
            "risk": "high" if base_risk > 60 else ("medium" if base_risk > 30 else "low"),
            "intensity": base_risk / 100,
            "actual_percentage": base_risk
        })
    return {"points": results}

# --- AI NEURAL ENGINE ROUTE ---

GEMINI_API_KEY = "AIzaSyAWk6ZPZame61vSX5yIM1onSKIRSWxFyow"

@router.post("/ai-query")
async def get_ai_advice(payload: dict):
    """
    Securely routes AI queries through the backend.
    """
    user_prompt = payload.get("prompt", "")
    context = payload.get("context", {})
    if not GEMINI_API_KEY:
        raise HTTPException(500, "Gemini API key not configured on server.")

    system_context = f"Context: {context.get('city')}, {context.get('disasterType')}, Risk: {context.get('flood_risk')}%. Stats: Floor {context.get('floor')}, Readiness {context.get('readiness_score')}%."

    # Try models in order
    models_to_try = ["gemini-1.5-flash", "gemini-pro"]
    async with httpx.AsyncClient(timeout=30.0) as client:
        for model in models_to_try:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
                response = await client.post(url, json={
                    "contents": [{ "role": "user", "parts": [{ "text": system_context + "\n\nUser Question: " + user_prompt }] }]
                })
                if response.status_code == 200:
                    data = response.json()
                    return {"advice": data["candidates"][0]["content"]["parts"][0]["text"]}
                print(f"Model {model} failed: {response.text}")
            except (httpx.RequestError, KeyError, IndexError):
                continue
    
    # --- FINAL FAIL-SAFE: Simulated AI Response ---
    # This ensures the bot ALWAYS works for your demo even if the API key is restricted.
    
    score = context.get('readiness_score', 0)
    city = context.get('city', 'Unknown')
    dtype = context.get('disasterType', 'this hazard').capitalize()
    
    if dtype.lower() in ["heatwave", "drought"]:
        advice = f"Neural Engine Offline [Simulation Mode]. {dtype} detected for {city}. Your readiness is {score}%. "
        advice += "Ensure hydration is prioritized and minimize exposure between 12 PM - 4 PM. "
        advice += "I recommend maintaining active cooling cycles." if context.get('ac') else "Prepare passive cooling areas."
    else:
        advice = f"Neural Engine Offline [Simulation Mode]. Scanning {city} for {dtype} impact. Readiness: {score}%. "
        if score < 50:
            advice += "CRITICAL: Evacuation routes are primary. Relocate to high ground immediately."
        else:
            advice += "STABLE: Monitor local drainage levels and maintain upper floor security."

    return {"advice": advice}
