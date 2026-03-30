// API Configuration for DisasterShield
// Standardizes connectivity between Frontend and Backend

export const API_BASE_URL = 
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000'
    : 'https://disaster-shield-api.onrender.com'; // Actual Render URL

export const GEMINI_API_KEY = "AIzaSyAWk6ZPZame61vSX5yIM1onSKIRSWxFyow";
export const GEMINI_MODEL = "gemini-1.5-flash";
