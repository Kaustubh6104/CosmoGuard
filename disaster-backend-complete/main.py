"""
DisasterShield Complete Backend
Multi-Hazard Prediction System for India
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.database import engine
from app.models import Base
from app.routes import flood, landslide, heatwave, cyclone, drought, combined, auth, personalized

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DisasterShield Complete API",
    description="Advanced Multi-Hazard Disaster Prediction System",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://cosmo-guard-x2jf.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(personalized.router, prefix="/api/v1/user", tags=["Personalized Data"])
app.include_router(flood.router, prefix="/api/v1/predict", tags=["Flood"])
app.include_router(landslide.router, prefix="/api/v1/predict", tags=["Landslide"])
app.include_router(heatwave.router, prefix="/api/v1/predict", tags=["Heatwave"])
app.include_router(cyclone.router, prefix="/api/v1/predict", tags=["Cyclone"])
app.include_router(drought.router, prefix="/api/v1/predict", tags=["Drought"])
app.include_router(combined.router, prefix="/api/v1", tags=["Combined Analysis"])

@app.get("/")
def root():
    return {
        "message": "DisasterShield Complete API v2.0",
        "modules": [
            "Flood Prediction (LSTM + XGBoost)",
            "Landslide Prediction (Random Forest)",
            "Heatwave Forecast (LSTM Regression)",
            "Cyclone Path Prediction (ConvLSTM)",
            "Drought Severity (XGBoost + NDVI)",
            "Personalized Risk Analysis"
        ],
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "modules_loaded": 5,
        "data_sources": ["IMD", "NASA POWER", "CWC", "Sentinel-2", "NOAA"]
    }

import os

if __name__ == "__main__":
    # Use the port assigned by the hosting provider (e.g., Render/Heroku)
    # Default to 8000 for local development
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False if os.environ.get("PORT") else True)
