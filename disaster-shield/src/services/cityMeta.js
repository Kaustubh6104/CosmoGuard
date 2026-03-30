// ============================================================
// cityMeta.js — Static metadata for Indian cities
// Used as feature inputs to the ML model alongside live data
// Source: IMD, NRSC, Census India historical disaster data
// ============================================================

export const CITY_META = {
  // Format: coastalRisk, riverRisk, elevation (0-1), historicalRisk, avgWind, avgRainfall, humidity
  "Chennai":        { lat:13.08, lng:80.27, coastalRisk:0.92, riverRisk:0.60, elevation:0.1, historicalRisk:0.88, avgWind:35, avgRainfall:4.2, humidity:78 },
  "Visakhapatnam":  { lat:17.69, lng:83.22, coastalRisk:0.95, riverRisk:0.55, elevation:0.1, historicalRisk:0.85, avgWind:42, avgRainfall:3.8, humidity:80 },
  "Bhubaneswar":    { lat:20.30, lng:85.82, coastalRisk:0.75, riverRisk:0.70, elevation:0.2, historicalRisk:0.82, avgWind:38, avgRainfall:5.1, humidity:76 },
  "Kolkata":        { lat:22.57, lng:88.36, coastalRisk:0.70, riverRisk:0.85, elevation:0.05,historicalRisk:0.75, avgWind:28, avgRainfall:6.2, humidity:82 },
  "Kerala Coast":   { lat:10.85, lng:76.27, coastalRisk:0.80, riverRisk:0.65, elevation:0.15,historicalRisk:0.70, avgWind:25, avgRainfall:8.5, humidity:85 },
  "Tamil Nadu":     { lat:11.13, lng:78.66, coastalRisk:0.75, riverRisk:0.60, elevation:0.15,historicalRisk:0.78, avgWind:30, avgRainfall:3.5, humidity:74 },
  "Lucknow":        { lat:26.85, lng:80.95, coastalRisk:0.0,  riverRisk:0.90, elevation:0.15,historicalRisk:0.85, avgWind:18, avgRainfall:9.2, humidity:80 },
  "Patna":          { lat:25.59, lng:85.14, coastalRisk:0.0,  riverRisk:0.98, elevation:0.05,historicalRisk:0.95, avgWind:15, avgRainfall:11.5,humidity:83 },
  "Guwahati":       { lat:26.14, lng:91.74, coastalRisk:0.0,  riverRisk:0.95, elevation:0.1, historicalRisk:0.90, avgWind:20, avgRainfall:13.8,humidity:85 },
  "Mumbai":         { lat:19.08, lng:72.88, coastalRisk:0.88, riverRisk:0.75, elevation:0.05,historicalRisk:0.82, avgWind:22, avgRainfall:12.5,humidity:82 },
  "Delhi":          { lat:28.70, lng:77.10, coastalRisk:0.0,  riverRisk:0.72, elevation:0.2, historicalRisk:0.60, avgWind:16, avgRainfall:5.8, humidity:65 },
  "Ahmedabad":      { lat:23.02, lng:72.57, coastalRisk:0.10, riverRisk:0.30, elevation:0.3, historicalRisk:0.28, avgWind:18, avgRainfall:2.1, humidity:55 },
  "Hyderabad":      { lat:17.39, lng:78.49, coastalRisk:0.0,  riverRisk:0.55, elevation:0.4, historicalRisk:0.55, avgWind:20, avgRainfall:4.8, humidity:62 },
  "Jaipur":         { lat:26.91, lng:75.79, coastalRisk:0.0,  riverRisk:0.15, elevation:0.4, historicalRisk:0.85, avgWind:22, avgRainfall:1.2, humidity:40 },
  "Solapur":        { lat:17.39, lng:75.49, coastalRisk:0.0,  riverRisk:0.20, elevation:0.45,historicalRisk:0.90, avgWind:20, avgRainfall:0.8, humidity:38 },
  "Bellary":        { lat:15.85, lng:74.50, coastalRisk:0.0,  riverRisk:0.18, elevation:0.5, historicalRisk:0.83, avgWind:18, avgRainfall:0.9, humidity:35 },
  "Amravati":       { lat:20.93, lng:77.75, coastalRisk:0.0,  riverRisk:0.22, elevation:0.35,historicalRisk:0.78, avgWind:19, avgRainfall:1.4, humidity:42 },
  "Nagaur":         { lat:27.02, lng:74.22, coastalRisk:0.0,  riverRisk:0.10, elevation:0.5, historicalRisk:0.88, avgWind:24, avgRainfall:0.5, humidity:32 },
  "Udaipur":        { lat:24.59, lng:73.71, coastalRisk:0.0,  riverRisk:0.30, elevation:0.55,historicalRisk:0.58, avgWind:20, avgRainfall:2.2, humidity:45 },
};