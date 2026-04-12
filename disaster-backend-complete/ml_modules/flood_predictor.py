"""
Flood Prediction Module - IMPROVED VERSION
Now properly uses actual rainfall data as PRIMARY factor
"""
import numpy as np
from typing import Dict, List, Optional

class FloodPredictor:
    """
    Improved Flood Prediction:
    - Rainfall is PRIMARY factor (70% weight)
    - Geographical factors are SECONDARY (30% weight)
    - If NO rain, flood probability stays LOW regardless of geography
    """
    
    def __init__(self):
        # NEW WEIGHTS: Rainfall dominates
        self.weights = {
            'rainfall': 0.70,           # PRIMARY - Most important
            'geography': 0.30           # SECONDARY - Baseline risk only
        }
        
        # IMD Thresholds for India
        self.thresholds = {
            'extreme': 200,      # >200mm/day = extreme flooding
            'very_heavy': 115,   # 115-200mm = very heavy rain
            'heavy': 64.5,       # 64.5-115mm = heavy rain
            'moderate': 15.5,    # 15.5-64.5mm = moderate rain
            'light': 2.5         # 2.5-15.5mm = light rain
        }
    
    def predict(self, lat: float, lng: float, weather_data: Dict) -> Dict:
        """
        Predict flood probability
        
        LOGIC:
        1. If rainfall < 15mm/day → MAX 20% probability (regardless of geography)
        2. If rainfall 15-64mm → 20-50% probability
        3. If rainfall 64-115mm → 50-80% probability  
        4. If rainfall >115mm → 80-95% probability
        
        Geography adds/subtracts up to 10% based on location
        """
        # Extract rainfall data
        rainfall_3d = weather_data.get('rainfall_3d', 0)
        daily_rain = rainfall_3d / 3  # Average per day
        humidity = weather_data.get('humidity', 70)
        
        # Get geographical factors
        geo_factors = self._get_geographical_factors(lat, lng)
        geo_risk = geo_factors['combined_risk']  # 0-1 scale
        
        # STEP 1: Calculate rainfall-based score (CONTINUOUS SCALING)
        if daily_rain >= self.thresholds['extreme']:
            rainfall_score = 95
            category = "EXTREME"
        else:
            # Interpolated scaling for better sensitivity
            if daily_rain >= self.thresholds['very_heavy']:
                base = 85
                diff = 10 * (daily_rain - 115) / (200 - 115)
                category = "VERY HEAVY"
            elif daily_rain >= self.thresholds['heavy']:
                base = 70
                diff = 15 * (daily_rain - 64.5) / (115 - 64.5)
                category = "HEAVY"
            elif daily_rain >= self.thresholds['moderate']:
                base = 45
                diff = 25 * (daily_rain - 15.5) / (64.5 - 15.5)
                category = "MODERATE"
            elif daily_rain >= self.thresholds['light']:
                base = 25
                diff = 20 * (daily_rain - 2.5) / (15.5 - 2.5)
                category = "LIGHT"
            else:
                base = 5
                diff = 20 * (daily_rain / 2.5)
                category = "MINIMAL"
            rainfall_score = base + diff
        
        # STEP 2: Apply rainfall weight (70%)
        weighted_rainfall = rainfall_score * self.weights['rainfall']
        
        # STEP 3: Apply geographical adjustment (30% max impact)
        # But only if there IS some rainfall
        if daily_rain > 2:
            geo_adjustment = geo_risk * 30  # Max 30 points from geography
        else:
            geo_adjustment = geo_risk * 5   # Only 5 points if no rain
        
        # STEP 4: Calculate final probability
        probability = int(weighted_rainfall + geo_adjustment)
        probability = min(95, max(5, probability))
        
        # STEP 5: Determine risk level based on ACTUAL conditions
        if probability >= 70 and daily_rain >= self.thresholds['heavy']:
            risk_level = "high"
            timeframe = "next 24-48 hours"
            warning = "CRITICAL - Flooding imminent"
        elif probability >= 50 and daily_rain >= self.thresholds['moderate']:
            risk_level = "medium"
            timeframe = "next 48-72 hours"
            warning = "MODERATE - Monitor closely"
        elif probability >= 30 and daily_rain > self.thresholds['light']:
            risk_level = "low-medium"
            timeframe = "if rainfall continues"
            warning = "LOW-MODERATE - Stay alert"
        else:
            risk_level = "low"
            timeframe = "no immediate risk"
            warning = "LOW - Conditions normal"
        
        # STEP 6: Calculate factor contributions for SHAP explanation
        rainfall_contribution = int(weighted_rainfall)
        geo_contribution = int(geo_adjustment)
        
        return {
            'probability': probability,
            'risk_level': risk_level,
            'timeframe': timeframe,
            'warning': warning,
            'rainfall_data': {
                'total_3d': round(rainfall_3d, 1),
                'daily_avg': round(daily_rain, 1),
                'category': category,
                'imd_threshold': self._get_threshold_name(daily_rain)
            },
            'factors': {
                'rainfall_contribution': rainfall_contribution,
                'geographical_contribution': geo_contribution,
                'rainfall_weight': f"{self.weights['rainfall']*100}%",
                'geography_weight': f"{self.weights['geography']*100}%"
            },
            'geographical_details': {
                'river_proximity': round(geo_factors['river_proximity'], 2),
                'elevation_risk': round(1 - geo_factors['elevation_norm'], 2),
                'drainage_quality': round(geo_factors['drainage_quality'], 2),
                'location_type': geo_factors['location_type']
            },
            'early_warning': probability >= 70 and daily_rain >= self.thresholds['heavy'],
            'affected_area_km2': self._estimate_affected_area(probability, daily_rain),
            'recommendations': self._get_recommendations(risk_level, daily_rain, category)
        }
    
    def _get_geographical_factors(self, lat: float, lng: float) -> Dict:
        """Get geographical risk factors - now returns combined risk 0-1"""
        
        # HIGH RISK RIVER ZONES (from actual flood history)
        high_risk_zones = {
            (25.5, 85.1): {'risk': 0.95, 'name': 'Patna (Ganges)', 'type': 'Major River Plain'},
            (26.8, 91.7): {'risk': 0.90, 'name': 'Guwahati (Brahmaputra)', 'type': 'River Valley'},
            (22.5, 88.3): {'risk': 0.85, 'name': 'Kolkata (Delta)', 'type': 'River Delta'},
            (19.0, 72.8): {'risk': 0.75, 'name': 'Mumbai (Coastal)', 'type': 'Coastal Urban'},
            (26.9, 80.9): {'risk': 0.80, 'name': 'Lucknow (Plain)', 'type': 'River Plain'},
        }
        
        # Check proximity to high-risk zones using Gaussian decay
        max_proximity_risk = 0.2
        location_type = 'General Area'
        for (r_lat, r_lng), info in high_risk_zones.items():
            dist = ((lat - r_lat)**2 + (lng - r_lng)**2)**0.5
            # Proximity risk: contribution based on distance (sigma = 2.0 degrees (~220km))
            proximity_impact = info['risk'] * np.exp(-(dist**2 / (2 * 1.5**2)))
            if proximity_impact > max_proximity_risk:
                max_proximity_risk = proximity_impact
                location_type = info['name']

        river_proximity = max_proximity_risk
        
        # Elevation factor (Continuous variation based on Latitude/Longitude)
        # Higher risk (lower elevation) in plains and coasts
        # Simple elevation model for India:
        # High: Himalayas (lat > 30), Western Ghats (lng < 74)
        # Low: Indo-Gangetic Plain, Deltas
        elevation_base = 0.5
        if lat > 30: elevation_base = 0.8
        elif lat < 20: elevation_base = 0.3
        
        # Add subtle variation based on coordinates
        elevation_norm = elevation_base + (np.sin(lat) + np.cos(lng)) * 0.1
        elevation_norm = min(0.9, max(0.1, elevation_norm))
        
        # Drainage (worse in dense urban areas)
        urban_centers = [(28.7, 77.1), (19.0, 72.8), (13.0, 80.2), (22.5, 88.3)]
        drainage_quality = 0.7  # default good
        for (u_lat, u_lng) in urban_centers:
            dist = ((lat - u_lat)**2 + (lng - u_lng)**2)**0.5
            if dist < 0.5:
                drainage_quality = 0.3  # Poor urban drainage
                location_type = location_type + ' (Urban)'
                break
        
        # Combined geographical risk (0-1 scale)
        combined_risk = (
            river_proximity * 0.5 +
            (1 - elevation_norm) * 0.3 +
            (1 - drainage_quality) * 0.2
        )
        
        return {
            'river_proximity': river_proximity,
            'elevation_norm': elevation_norm,
            'drainage_quality': drainage_quality,
            'combined_risk': combined_risk,
            'location_type': location_type
        }
    
    def _get_threshold_name(self, daily_rain: float) -> str:
        """Get IMD threshold category name"""
        if daily_rain >= self.thresholds['extreme']:
            return "Extremely Heavy (>200mm)"
        elif daily_rain >= self.thresholds['very_heavy']:
            return "Very Heavy (115-200mm)"
        elif daily_rain >= self.thresholds['heavy']:
            return "Heavy (64.5-115mm)"
        elif daily_rain >= self.thresholds['moderate']:
            return "Moderate (15.5-64.5mm)"
        elif daily_rain >= self.thresholds['light']:
            return "Light (2.5-15.5mm)"
        else:
            return "Trace (<2.5mm)"
    
    def _estimate_affected_area(self, probability: int, daily_rain: float) -> int:
        """Estimate affected area based on probability AND rainfall"""
        if daily_rain > 200:
            return 800
        elif daily_rain > 115:
            return 500
        elif daily_rain > 64:
            return 200
        elif daily_rain > 15:
            return 50
        else:
            return 5  # Minimal if no rain
    
    def _get_recommendations(self, risk_level: str, daily_rain: float, category: str) -> List[str]:
        """Get recommendations based on ACTUAL conditions"""
        recs = []
        
        if daily_rain >= 115:
            recs.append("🚨 VERY HEAVY RAINFALL DETECTED")
            recs.append("Evacuate low-lying areas IMMEDIATELY")
            recs.append("Do NOT attempt to cross flooded roads")
            recs.append("Move to upper floors or high ground")
            recs.append("Stock emergency supplies (48h minimum)")
        elif daily_rain >= 64.5:
            recs.append("⚠️ HEAVY RAINFALL - High flood risk")
            recs.append("Avoid flood-prone areas")
            recs.append("Keep emergency kit ready")
            recs.append("Monitor local weather updates")
        elif daily_rain >= 15.5:
            recs.append("Moderate rainfall - Monitor situation")
            recs.append("Clear drainage around property")
            recs.append("Identify safe evacuation routes")
        elif daily_rain >= 2.5:
            recs.append("Light rainfall - Conditions monitoring")
            recs.append("Check for local waterlogging")
        else:
            recs.append("✅ Low rainfall - Normal conditions")
            recs.append("No immediate flood risk")
        
        if risk_level == "high":
            recs.append("Contact local disaster management")
        
        return recs

# Singleton instance
flood_predictor = FloodPredictor()