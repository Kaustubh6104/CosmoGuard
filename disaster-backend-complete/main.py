"""
DisasterShield Complete Backend
Multi-Hazard Prediction System for India
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(
    title="DisasterShield Complete API",
    description="Advanced Multi-Hazard Disaster Prediction System",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routes
from app.routes import flood, landslide, heatwave, cyclone, drought, combined

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
            "Drought Severity (XGBoost + NDVI)"
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

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
