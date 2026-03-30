import { useState, useRef } from "react";
import IndiaMap from "./components/IndiaMap";
import WeatherPanel from "./components/WeatherPanel";

const DISASTER_ZONES = {
  cyclone: [
    { id:1, lat:13.08, lng:80.27, city:"Chennai", risk:"high", intensity:0.92, label:"Category 4 Risk" },
    { id:2, lat:17.69, lng:83.22, city:"Visakhapatnam", risk:"high", intensity:0.88, label:"Cyclone Prone" },
    { id:3, lat:20.30, lng:85.82, city:"Bhubaneswar", risk:"high", intensity:0.85, label:"High Risk Zone" },
    { id:4, lat:22.57, lng:88.36, city:"Kolkata", risk:"medium", intensity:0.65, label:"Moderate Risk" },
  ],
  flood: [
    { id:1, lat:26.85, lng:80.95, city:"Lucknow", risk:"high", intensity:0.90, label:"Flood Plain" },
    { id:2, lat:25.59, lng:85.14, city:"Patna", risk:"high", intensity:0.95, label:"Critical Zone" },
    { id:3, lat:26.14, lng:91.74, city:"Guwahati", risk:"high", intensity:0.88, label:"Brahmaputra Risk" },
    { id:4, lat:22.57, lng:88.36, city:"Kolkata", risk:"high", intensity:0.82, label:"Delta Risk" },
    { id:5, lat:19.08, lng:72.88, city:"Mumbai", risk:"high", intensity:0.85, label:"Coastal Flood" },
  ],
  drought: [
    { id:1, lat:26.91, lng:75.79, city:"Jaipur", risk:"high", intensity:0.88, label:"Arid Zone" },
    { id:2, lat:17.39, lng:75.49, city:"Solapur", risk:"high", intensity:0.92, label:"Drought Prone" },
    { id:3, lat:20.93, lng:77.75, city:"Amravati", risk:"high", intensity:0.80, label:"Vidarbha" },
  ],
};

const RC = {high:"#FF3B30",medium:"#FF9500",low:"#34C759"};

export default function DisasterShield() {
  const [dis, setDis] = useState("flood");
  const [tab, setTab] = useState("map");
  const [selected, setSelected] = useState(null);
  const [userLoc, setUserLoc] = useState(null);
  const [tracking, setTracking] = useState(false);

  const DISASTERS = [
    {id:"cyclone",icon:"🌀",label:"Cyclone",col:"#818CF8"},
    {id:"flood",icon:"🌊",label:"Flood",col:"#38BDF8"},
    {id:"drought",icon:"☀️",label:"Drought",col:"#FCD34D"}
  ];
  
  const TABS = [
    {id:"map",icon:"🌍",label:"Risk Map"},
    {id:"weather",icon:"🛰️",label:"Live Data"},
    {id:"readiness",icon:"🛡️",label:"Readiness"}
  ];

  const dObj = DISASTERS.find(x => x.id === dis);
  const points = DISASTER_ZONES[dis] || [];

  const toggleTrack = () => {
    if (!tracking) {
      setUserLoc({ lat: 19.076, lng: 72.877 });
      setTracking(true);
    } else {
      setUserLoc(null);
      setTracking(false);
    }
  };

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "#060B18",
      fontFamily: "'Inter',-apple-system,sans-serif",
      color: "#E2E8F0",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow: hidden; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,.4); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* HEADER */}
      <header style={{
        background: "rgba(6,11,24,.97)",
        borderBottom: "1px solid rgba(255,255,255,.06)",
        padding: "0 18px",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{
            width: 31,
            height: 31,
            borderRadius: 9,
            background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15
          }}>🛡️</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>DisasterShield</div>
            <div style={{ color: "#6366F1", fontSize: 8, letterSpacing: "2px" }}>INDIA · LIVE</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 3, background: "rgba(255,255,255,.04)", padding: 3, borderRadius: 10 }}>
          {DISASTERS.map(d => (
            <button
              key={d.id}
              onClick={() => { setDis(d.id); setSelected(null); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: dis === d.id ? `${d.col}22` : "transparent",
                border: dis === d.id ? `1px solid ${d.col}55` : "1px solid transparent",
                color: dis === d.id ? d.col : "#4b5563",
                borderRadius: 7,
                padding: "6px 10px",
                cursor: "pointer",
                fontSize: 11,
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
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: tracking ? "rgba(52,197,89,.15)" : "rgba(255,255,255,.06)",
            border: tracking ? "1px solid rgba(52,197,89,.4)" : "1px solid rgba(255,255,255,.1)",
            color: tracking ? "#34C759" : "#94a3b8",
            borderRadius: 8,
            padding: "6px 12px",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 600
          }}
        >
          {tracking ? "📍 Tracking" : "🔍 Track Location"}
        </button>
      </header>

      {/* BODY */}
      <div style={{
        display: "flex",
        flex: 1,
        overflow: "hidden",
        height: "calc(100vh - 56px)",
        position: "relative"
      }}>
        {/* SIDEBAR */}
        <aside style={{
          width: "180px",
          background: "rgba(255,255,255,.015)",
          borderRight: "1px solid rgba(255,255,255,.05)",
          padding: "12px 8px",
          overflowY: "auto",
          flexShrink: 0
        }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "9px 10px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  background: tab === t.id ? "rgba(99,102,241,.18)" : "transparent",
                  color: tab === t.id ? "#C4B5FD" : "#4b5563",
                  borderLeft: tab === t.id ? "3px solid #6366F1" : "3px solid transparent",
                  fontSize: 11,
                  fontWeight: tab === t.id ? 600 : 400,
                  width: "100%",
                  textAlign: "left"
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </nav>

          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 6 }}>
            <p style={{ color: "#374151", fontSize: 8, fontWeight: 600, paddingLeft: 3 }}>LIVE STATS</p>
            {[
              { l: "Risk Zones", v: points.length, c: "#EF4444" },
              { l: "High Risk", v: points.filter(p => p.risk === "high").length, c: "#FF3B30" },
              { l: "Monitored", v: 3, c: "#6366F1" }
            ].map(s => (
              <div key={s.l} style={{ background: "rgba(255,255,255,.025)", borderRadius: 8, padding: "7px 10px" }}>
                <div style={{ color: s.c, fontWeight: 700, fontSize: 19 }}>{s.v}</div>
                <div style={{ color: "#374151", fontSize: 9 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </aside>

        {/* MAP - TAKES ALL REMAINING SPACE */}
        <main style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          padding: "10px 8px",
          gap: 8,
          minWidth: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
            <span style={{
              background: `${dObj.col}20`,
              color: dObj.col,
              fontSize: 10,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 6
            }}>
              {dObj.icon} {dis.toUpperCase()} RISK
            </span>
            <span style={{
              background: "rgba(99,102,241,.1)",
              color: "#818cf8",
              fontSize: 9,
              padding: "3px 9px",
              borderRadius: 5
            }}>
              🖱️ Click anywhere for live weather + disaster prediction
            </span>
          </div>

          <div style={{
            flex: 1,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,.05)",
            overflow: "hidden",
            minHeight: 0
          }}>
            <IndiaMap
              points={points}
              onSelect={p => { setSelected(p); setTab("map"); }}
              selectedId={selected?.id}
              userLocation={userLoc}
            />
          </div>
        </main>

        {/* RIGHT PANEL - ONLY SHOW WHEN NEEDED */}
        {(tab === "weather" || selected) && (
          <aside style={{
            width: "320px",
            background: "rgba(255,255,255,.015)",
            borderLeft: "1px solid rgba(255,255,255,.05)",
            padding: 14,
            overflowY: "auto",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 11
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 700 }}>
                {tab === "weather" ? "Live Weather + ML" : "Zone Details"}
              </h2>
              <button
                onClick={() => { setSelected(null); setTab("map"); }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: 16,
                  padding: 0
                }}
              >
                ✕
              </button>
            </div>

            {tab === "weather" && <WeatherPanel city={selected?.city} disasterType={dis} />}

            {tab === "map" && selected && (
              <div style={{
                background: "rgba(99,102,241,.1)",
                borderRadius: 10,
                padding: 12,
                border: "1px solid rgba(99,102,241,.25)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                  <div>
                    <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14 }}>{selected.city}</div>
                    <div style={{ color: RC[selected.risk], fontSize: 11 }}>{selected.label}</div>
                  </div>
                  <span style={{
                    background: `${RC[selected.risk]}22`,
                    color: RC[selected.risk],
                    fontSize: 9,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 5,
                    textTransform: "uppercase"
                  }}>
                    {selected.risk}
                  </span>
                </div>
                <div style={{ color: "#64748b", fontSize: 9 }}>
                  {selected.lat.toFixed(2)}°N, {selected.lng.toFixed(2)}°E
                </div>
                <button
                  onClick={() => setTab("weather")}
                  style={{
                    width: "100%",
                    background: "rgba(99,102,241,.2)",
                    border: "1px solid rgba(99,102,241,.3)",
                    color: "#C4B5FD",
                    borderRadius: 7,
                    padding: "7px 0",
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 600,
                    marginTop: 10
                  }}
                >
                  🛰️ View Live Weather + ML Prediction
                </button>
              </div>
            )}

            {/* Zone list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <p style={{ color: "#374151", fontSize: 9, fontWeight: 600 }}>ALL {dis.toUpperCase()} ZONES</p>
              {points.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setSelected(p); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    background: selected?.id === p.id ? "rgba(99,102,241,.12)" : "rgba(255,255,255,.02)",
                    border: "1px solid rgba(255,255,255,.04)",
                    borderRadius: 8,
                    padding: "7px 10px",
                    cursor: "pointer",
                    width: "100%",
                    textAlign: "left"
                  }}
                >
                  <div style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: RC[p.risk],
                    flexShrink: 0
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#d1d5db", fontSize: 11, fontWeight: 600 }}>{p.city}</div>
                    <div style={{ color: "#374151", fontSize: 9 }}>{p.label}</div>
                  </div>
                  <div style={{
                    color: RC[p.risk],
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: "uppercase"
                  }}>
                    {p.risk}
                  </div>
                </button>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}