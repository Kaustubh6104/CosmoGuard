import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import IndiaMap from "./components/IndiaMap";
import WeatherPanel from "./components/WeatherPanel";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Navigation from "./components/Navigation";
import { API_BASE_URL } from "./api-config";

const RC = {high:"#FF3B30",medium:"#FF9500",low:"#34C759"};

function RiskMapPage() {
  const [dis, setDis] = useState("flood");
  const [selected, setSelected] = useState(null);
  const [userLoc, setUserLoc] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [points, setPoints] = useState([]);

  const DISASTERS = [
    {id:"cyclone",icon:"🌀",label:"Cyclone",col:"#818CF8"},
    {id:"flood",icon:"🌊",label:"Flood",col:"#38BDF8"},
    {id:"drought",icon:"☀️",label:"Drought",col:"#FCD34D"}
  ];
  
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/user/zones-risk?disaster_type=${dis}`);
        const data = await res.json();
        setPoints(data.points || []);
      } catch (err) {
        console.error("Error fetching map risks:", err);
      }
    };
    fetchZones();
  }, [dis]);

  // const dObj = DISASTERS.find(x => x.id === dis) || DISASTERS[0];

  const toggleTrack = () => {
    if (!tracking) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setTracking(true);
          },
          () => alert("Location access denied.")
        );
      }
    } else {
      setUserLoc(null);
      setTracking(false);
    }
  };

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <aside style={{ width: "180px", background: "rgba(255,255,255,.015)", borderRight: "1px solid rgba(255,255,255,.05)", padding: "12px 8px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3, background: "rgba(255,255,255,.04)", padding: 3, borderRadius: 10, marginBottom: '20px' }}>
            {DISASTERS.map(d => (
              <button key={d.id} onClick={() => { setDis(d.id); setSelected(null); }} style={{ flex: '1 1 40%', background: dis === d.id ? `${d.col}22` : "transparent", border: dis === d.id ? `1px solid ${d.col}55` : "1px solid transparent", color: dis === d.id ? d.col : "#4b5563", borderRadius: 7, padding: "6px 5px", cursor: "pointer", fontSize: '9px', fontWeight: 600 }}>
                {d.icon} {d.label}
              </button>
            ))}
          </div>
          <button onClick={toggleTrack} style={{ width: '100%', background: tracking ? "rgba(52,197,89,.15)" : "rgba(255,255,255,.06)", color: tracking ? "#34C759" : "#94a3b8", border: '1px solid currentColor', borderRadius: 8, padding: "8px", cursor: "pointer", fontSize: 10, fontWeight: 600 }}>
            {tracking ? "📍 Tracking" : "🔍 Track Me"}
          </button>
        </aside>

        <main style={{ flex: 1, padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ flex: 1, borderRadius: 16, border: "1px solid rgba(255,255,255,.05)", overflow: "hidden" }}>
            <IndiaMap points={points} onSelect={setSelected} selectedId={selected?.id} userLocation={userLoc} />
          </div>
        </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [ready, setReady] = useState(false);
  const [riskData, setRiskData] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const isMapRoute = location.pathname === '/map';

  const fetchData = async (u) => {
    if (!u) return null;
    try {
      const [histRes, riskRes, evacRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/user/weather-history?lat=${u.lat}&lng=${u.lng}`),
        fetch(`${API_BASE_URL}/api/v1/user/risk-analysis?lat=${u.lat}&lng=${u.lng}`),
        fetch(`${API_BASE_URL}/api/v1/user/evacuation?lat=${u.lat}&lng=${u.lng}`)
      ]);

      if (histRes.ok && riskRes.ok && evacRes.ok) {
        const [_hist, risk, _evac] = await Promise.all([histRes.json(), riskRes.json(), evacRes.json()]);
        return risk;
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
    return null;
  };

  useEffect(() => {
    let active = true;
    
    if (user) {
      fetchData(user).then(data => {
        if (active && data) setRiskData(data);
      });
    }

    const timer = setTimeout(() => {
      if (active) setReady(true);
    }, 1500);
    
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [user]);

  const getActiveDisaster = () => {
    if (!riskData) return 'flood';
    const dRisks = [
      { id: 'drought', v: riskData.drought_risk || 0 },
      { id: 'flood', v: riskData.flood_risk || 0 },
      { id: 'heatwave', v: riskData.heatwave_risk || 0 },
      { id: 'cyclone', v: riskData.cyclone_risk || 0 }
    ];
    return dRisks.reduce((max, x) => x.v > max.v ? x : max, dRisks[0]).id;
  };

  if (!ready) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060B18', color: '#E2E8F0' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ border: '4px solid rgba(255,255,255,.1)', borderTop: '4px solid #6366F1', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
          <p style={{ fontSize: '14px', fontWeight: '500', letterSpacing: '2px' }}>SHIELDING...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#060B18", display: "flex", overflow: "hidden" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060B18; font-family: 'Inter', sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {user && !isMapRoute && (
        <Navigation user={user} riskData={riskData} activeDisaster={getActiveDisaster()} />
      )}

      {user && isMapRoute && (
        <button onClick={() => navigate('/dashboard')} style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 1000, background: 'rgba(6,11,24,0.8)', border: '1px solid rgba(99,102,241,0.3)', color: 'white', padding: '12px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' }}>
          <LayoutDashboard size={18} color="#6366F1" style={{ marginRight: '8px' }} /> Back to Dashboard
        </button>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: isMapRoute ? 'hidden' : 'auto' }}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Auth setAuthUser={setUser} />} />
          <Route path="/dashboard" element={user ? <Dashboard user={user} onLogout={handleLogout} activeDisaster={getActiveDisaster()} /> : <Navigate to="/login" />} />
          <Route path="/map" element={user ? <RiskMapPage /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </div>
  );
}