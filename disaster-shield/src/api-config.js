// API Configuration for DisasterShield
// Standardizes connectivity between Frontend and Backend

export const API_BASE_URL =
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' || 
  window.location.hostname.startsWith('192.168.')
    ? `http://${window.location.hostname}:8000`
    : 'https://disaster-shield-backend.onrender.com';

