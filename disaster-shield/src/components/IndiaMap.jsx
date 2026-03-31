import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../api-config";

export default function IndiaMap({ points, onSelect, userLocation }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const userMarkerRef = useRef(null);
  const clickMarkerRef = useRef(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    if (window.L) { setLeafletLoaded(true); return; }
    if (!document.getElementById("leaflet-css")) {
      const l = document.createElement("link"); l.id = "leaflet-css"; l.rel = "stylesheet"; l.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(l);
    }
    if (!document.getElementById("leaflet-js")) {
      const s = document.createElement("script"); s.id = "leaflet-js"; s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; s.onload = () => setLeafletLoaded(true); document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || !window.L || leafletMap.current) return;
    const L = window.L;
    leafletMap.current = L.map(mapRef.current, { center: [22, 82], zoom: 5, attributionControl: false, zoomControl: true });
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}").addTo(leafletMap.current);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png", { opacity: 0.7 }).addTo(leafletMap.current);

    leafletMap.current.on("click", async (e) => {
      const { lat, lng } = e.latlng;
      const L = window.L;
      
      // Clear previous click marker
      if (clickMarkerRef.current) clickMarkerRef.current.remove();
      
      // Add RED MISSION PIN
      const redIcon = L.divIcon({
        className: 'mission-pin',
        html: '<div style="width:14px;height:14px;background:#EF4444;border:2px solid white;border-radius:50%;box-shadow:0 0 20px #EF4444;animation:pulse-red 1.5s infinite"></div>',
        iconSize: [20, 20]
      });
      clickMarkerRef.current = L.marker([lat, lng], { icon: redIcon }).addTo(leafletMap.current);

      setLoading(true);
      setAnalysis(null);
      
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/predict-all`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat, lng })
        });
        const data = await res.json();
        setAnalysis({ lat: lat.toFixed(3), lng: lng.toFixed(3), ...data });
      } catch (err) {
        console.error("Map Analysis Failed:", err);
      } finally {
        setLoading(false);
      }
    });

    setTimeout(() => leafletMap.current?.invalidateSize(), 500);
  }, [leafletLoaded]);

  // Sync User Location (BLUE)
  useEffect(() => {
    if (!leafletMap.current || !userLocation || !window.L) return;
    const L = window.L;
    if (userMarkerRef.current) userMarkerRef.current.remove();
    const userIcon = L.divIcon({
      className: 'user-marker',
      html: '<div style="width:16px;height:16px;background:#38BDF8;border:3px solid white;border-radius:50%;box-shadow:0 0 15px #38BDF8;animation:pulse-blue 2s infinite"></div>',
      iconSize: [20, 20]
    });
    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(leafletMap.current);
    leafletMap.current.flyTo([userLocation.lat, userLocation.lng], 12);
  }, [userLocation]);

  const clearAnalysis = () => {
    setAnalysis(null);
    if (clickMarkerRef.current) clickMarkerRef.current.remove();
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: "#060B18" }}>
      <style>{`
        @keyframes pulse-blue { 0% { transform: scale(1); opacity:1; } 50% { transform: scale(1.5); opacity:0.5; } 100% { transform: scale(1); opacity:1; } }
        @keyframes pulse-red { 0% { transform: scale(1); box-shadow: 0 0 0px #EF4444; } 50% { transform: scale(1.2); box-shadow: 0 0 20px #EF4444; } 100% { transform: scale(1); box-shadow: 0 0 0px #EF4444; } }
      `}</style>
      
      {!leafletLoaded && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1', fontSize: '11px', fontWeight: 'bold', zIndex: 10, letterSpacing: '2px' }}>
           RE-ESTABLISHING SATELLITE UPLINK...
        </div>
      )}

      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      
      {(loading || analysis) && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(6,11,24,0.98)", padding: '24px 32px', zIndex: 10001, borderTop: "2px solid #EF4444", backdropFilter: 'blur(16px)' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', color: "white", fontWeight: '900', letterSpacing: '0.5px' }}>TARGET SECTOR: {analysis?.lat || '--'} N, {analysis?.lng || '--'} E</h3>
                <p style={{ fontSize: '10px', color: loading ? '#EF4444' : '#34C759', fontWeight: 'bold' }}>⚡ {loading ? 'SCANNING GEOSPATIAL VECTORS...' : 'MISSION BRIEFING LOADED'}</p>
              </div>
              <button onClick={clearAnalysis} style={{ color: "#94A3B8", background: "transparent", border: "none", cursor: "pointer", fontSize: '20px' }}>✕</button>
           </div>

           {loading ? (
             <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ border: '2px solid rgba(239,68,68,0.1)', borderTop: '2px solid #EF4444', borderRadius: '50%', width: '24px', height: '24px', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
             </div>
           ) : (
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {Object.entries(analysis?.predictions || {}).map(([name, pred]) => (
                  <div key={name} style={{ background: "rgba(255,255,255,0.02)", padding: '12px', borderRadius: '12px', border: pred.risk_percentage > 50 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255,255,255,0.05)' }}>
                     <p style={{ fontSize: '8px', color: '#94A3B8', fontWeight: '900', letterSpacing: '1px' }}>{name.toUpperCase()}</p>
                     <p style={{ fontSize: '20px', fontWeight: '900', color: pred.risk_percentage > 50 ? '#EF4444' : '#34C759', margin: '2px 0' }}>{pred.risk_percentage}%</p>
                     <p style={{ fontSize: '10px', color: '#CBD5E1', lineHeight: '1.3', height: '2.6em', overflow: 'hidden' }}>{pred.recommended_actions?.[0]}</p>
                  </div>
                ))}
             </div>
           )}
        </div>
      )}
    </div>
  );
}