import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import IndiaMap from "./components/IndiaMap";
import WeatherPanel from "./components/WeatherPanel";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Navigation from "./components/Navigation";

const RC = {high:"#FF3B30",medium:"#FF9500",low:"#34C759"};

function RiskMapPage() {
  const [dis, setDis] = useState("flood");
  const [tab, setTab] = useState("map");
  const [selected, setSelected] = useState(null);
  const [userLoc, setUserLoc] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  const DISASTERS = [
    {id:"cyclone",icon:"🌀",label:"Cyclone",col:"#818CF8"},
    {id:"flood",icon:"🌊",label:"Flood",col:"#38BDF8"},
    {id:"drought",icon:"☀️",label:"Drought",col:"#FCD34D"}
  ];
  
  useEffect(() => {
    const fetchZones = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/v1/user/zones-risk?disaster_type=${dis}`);
        const data = await res.json();
        setPoints(data.points || []);
      } catch (err) {
        console.error("Error fetching map risks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchZones();
  }, [dis]);

  const dObj = DISASTERS.find(x => x.id === dis);

  const toggleTrack = () => {
    if (!tracking) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setTracking(true);
          },
          () => {
            alert("Error: Location access denied.");
          }
        );
      } else {
        alert("Geolocation not supported.");
      }
    } else {
      setUserLoc(null);
      setTracking(false);
    }
  };

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
        <aside style={{
          width: "180px",
          background: "rgba(255,255,255,.015)",
          borderRight: "1px solid rgba(255,255,255,.05)",
          padding: "12px 8px",
          overflowY: "auto",
          flexShrink: 0
        }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3, background: "rgba(255,255,255,.04)", padding: 3, borderRadius: 10, marginBottom: '20px' }}>
            {DISASTERS.map(d => (
              <button
                key={d.id}
                onClick={() => { setDis(d.id); setSelected(null); }}
                style={{
                  flex: '1 1 40%',
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  background: dis === d.id ? `${d.col}22` : "transparent",
                  border: dis === d.id ? `1px solid ${d.col}55` : "1px solid transparent",
                  color: dis === d.id ? d.col : "#4b5563",
                  borderRadius: 7,
                  padding: "6px 5px",
                  cursor: "pointer",
                  fontSize: '9px',
                  fontWeight: 600
                }}
              >
                {d.icon} {d.label}
              </button>
            ))}
          </div>

          <button
            onClick={toggleTrack}
            style={{
              width: '100%',
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              background: tracking ? "rgba(52,197,89,.15)" : "rgba(255,255,255,.06)",
              border: tracking ? "1px solid rgba(52,197,89,.4)" : "1px solid rgba(255,255,255,.1)",
              color: tracking ? "#34C759" : "#94a3b8",
              borderRadius: 8,
              padding: "8px",
              cursor: "pointer",
              fontSize: 10,
              fontWeight: 600,
              marginBottom: '20px'
            }}
          >
            {tracking ? "📍 Tracking" : "🔍 Track Me"}
          </button>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <p style={{ color: "#374151", fontSize: 8, fontWeight: 600, paddingLeft: 3 }}>LIVE STATS</p>
            {[
              { l: "Risk Zones", v: loading ? "..." : points.length, c: "#EF4444" },
              { l: "High Risk", v: loading ? "..." : points.filter(p => p.risk === "high").length, c: "#FF3B30" },
              { l: "Monitored", v: 3, c: "#6366F1" }
            ].map(s => (
              <div key={s.l} style={{ background: "rgba(255,255,255,.025)", borderRadius: 8, padding: "7px 10px" }}>
                <div style={{ color: s.c, fontWeight: 700, fontSize: 16 }}>{s.v}</div>
                <div style={{ color: "#374151", fontSize: 9 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </aside>

        <main style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          padding: "16px",
          gap: 12
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ background: `${dObj.col}20`, color: dObj.col, fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 8 }}>
              {dObj.icon} {dis.toUpperCase()} RISK
            </span>
            <span style={{ background: "rgba(255,255,255,.03)", color: "#94A3B8", fontSize: 10, padding: "4px 12px", borderRadius: 8 }}>
              {loading ? "Fetching live risk data..." : "Click on locations for detailed ML assessments"}
            </span>
          </div>

          <div style={{ flex: 1, borderRadius: 16, border: "1px solid rgba(255,255,255,.05)", overflow: "hidden" }}>
            <IndiaMap
              points={points}
              onSelect={p => { setSelected(p); setTab("map"); }}
              selectedId={selected?.id}
              userLocation={userLoc}
            />
          </div>
        </main>

        {(tab === "weather" || selected) && (
          <aside style={{
            width: "300px",
            background: "rgba(6, 11, 24, 0.98)",
            borderLeft: "1px solid rgba(255,255,255,.05)",
            padding: 20,
            overflowY: "auto",
            zIndex: 10
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 700 }}>
                {tab === "weather" ? "Live Weather + ML" : "Zone Details"}
              </h2>
              <button 
                onClick={() => { setSelected(null); setTab("map"); }}
                style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 20 }}
              >✕</button>
            </div>

            {tab === "weather" && <WeatherPanel city={selected?.city} disasterType={dis} />}

            {tab === "map" && selected && (
              <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                <div style={{ background: "rgba(99,102,241,.05)", borderRadius: 12, padding: 16, border: "1px solid rgba(99,102,241,.15)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                      <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 16 }}>{selected.city}</div>
                      <div style={{ color: RC[selected.risk], fontSize: 12, marginTop: 2 }}>{selected.label} ({selected.actual_percentage}%)</div>
                    </div>
                    <span style={{ background: `${RC[selected.risk]}22`, color: RC[selected.risk], fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 6, height: 'fit-content' }}>
                      {selected.risk.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => setTab("weather")}
                    style={{ width: "100%", background: "#6366F122", border: "1px solid #6366F144", color: "#C4B5FD", borderRadius: 10, padding: "10px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                  >🛰️ View ML Forecast</button>
                </div>
              </div>
            )}
          </aside>
        )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [weatherHistory, setWeatherHistory] = useState([]);
  const [riskData, setRiskData] = useState(null);
  const [evacuation, setEvacuation] = useState(null);
  const [survey, setSurvey] = useState(() => {
    const s = localStorage.getItem('disaster_readiness');
    return s ? JSON.parse(s) : { floor: 0, has_power_backup: false, has_ac: false, supplies_days: 0 };
  });

  const navigate = useNavigate();
  const location = useLocation();
  const isMapRoute = location.pathname === '/map';

  const fetchData = async (u, s) => {
    if (!u) return;
    try {
      const q = `&floor=${s.floor}&has_power_backup=${s.has_power_backup}&has_ac=${s.has_ac}&supplies_days=${s.supplies_days}`;
      const [histRes, riskRes, evacRes] = await Promise.all([
        fetch(`http://localhost:8000/api/v1/user/weather-history?lat=${u.lat}&lng=${u.lng}`),
        fetch(`http://localhost:8000/api/v1/user/risk-analysis?lat=${u.lat}&lng=${u.lng}`),
        fetch(`http://localhost:8000/api/v1/user/evacuation?lat=${u.lat}&lng=${u.lng}${q}`)
      ]);

      if (histRes.ok && riskRes.ok && evacRes.ok) {
        const [hist, risk, evac] = await Promise.all([
          histRes.json(), riskRes.json(), evacRes.json()
        ]);
        setWeatherHistory(hist.history || []);
        setRiskData(risk);
        setEvacuation(evac);
      }
    } catch (err) {
      console.error("Error fetching global data:", err);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchData(parsedUser, survey);
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const updatedUser = { 
              ...parsedUser, 
              lat: pos.coords.latitude, 
              lng: pos.coords.longitude 
            };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            fetchData(updatedUser, survey);
          },
          (err) => console.log("Geo error:", err)
        );
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (user) fetchData(user, survey);
  }, [survey]);

  const getActiveDisaster = () => {
    if (!riskData) return 'flood';
    const dRisks = [
      { id: 'drought', v: riskData.drought_risk },
      { id: 'flood', v: riskData.flood_risk },
      { id: 'heatwave', v: riskData.heatwave_risk },
      { id: 'cyclone', v: riskData.cyclone_risk }
    ];
    return dRisks.reduce((max, x) => x.v > max.v ? x : max, dRisks[0]).id;
  };

  if (!ready) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060B18', color: '#E2E8F0' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ border: '4px solid rgba(255,255,255,.1)', borderTop: '4px solid #6366F1', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
          <p style={{ fontSize: '14px', fontWeight: '500', letterSpacing: '1px' }}>SHIELDING...</p>
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
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "#060B18",
      fontFamily: "'Inter', sans-serif",
      color: "#E2E8F0",
      display: "flex",
      overflow: "hidden"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow-x: hidden; background: #060B18; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,.2); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {user && !isMapRoute && (
        <Navigation 
          user={user} 
          riskData={riskData} 
          survey={survey} 
          activeDisaster={getActiveDisaster()} 
        />
      )}

      {user && isMapRoute && (
        <button 
          onClick={() => navigate('/dashboard')}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            zIndex: 1000,
            background: 'rgba(6, 11, 24, 0.8)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: '600',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(6, 11, 24, 0.8)'}
        >
          <LayoutDashboard size={18} color="#6366F1" /> Back to Dashboard
        </button>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: isMapRoute ? 'hidden' : 'auto' }}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Auth setAuthUser={setUser} />} />
          <Route 
            path="/dashboard" 
            element={user ? (
              <Dashboard 
                user={user} 
                onLogout={handleLogout} 
                weatherHistory={weatherHistory}
                riskData={riskData}
                evacuation={evacuation}
                survey={survey}
                setSurvey={setSurvey}
                activeDisaster={getActiveDisaster()}
              />
            ) : <Navigate to="/login" />} 
          />
          <Route path="/map" element={user ? <RiskMapPage /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </div>
  );
}