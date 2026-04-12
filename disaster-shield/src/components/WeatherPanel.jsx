// WeatherPanel.jsx — Shows live weather + ML prediction for selected city
import { useEffect, useState } from "react";
import { fetchAllWeatherData } from "../services/weatherAPI";
import { predictDisasterRisk } from "../ml/disasterModel";
import { CITY_META } from "../services/cityMeta";

function Metric({ icon, label, value, unit, color }) {
  const display = value !== null && value !== undefined ? value : "—";
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ color: "#6b7280", fontSize: 10, marginBottom: 4 }}>{icon} {label}</div>
      <div style={{ color: color || "#e2e8f0", fontWeight: 700, fontSize: 17 }}>
        {display}
        {value !== null && value !== undefined && <span style={{ fontSize: 11, fontWeight: 400, color: "#6b7280", marginLeft: 3 }}>{unit}</span>}
      </div>
    </div>
  );
}

export default function WeatherPanel({ city, disasterType }) {
  const [data, setData]           = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [fetchTime, setFetchTime] = useState(null);
  const [error, setError]         = useState(null);

  useEffect(() => {
    if (!city) return;
    const meta = CITY_META[city];
    if (!meta) return;

    setTimeout(() => {
      setLoading(true); 
      setError(null); 
      setData(null); 
      setPrediction(null);
    }, 0);
    const t0 = Date.now();

    fetchAllWeatherData(meta.lat, meta.lng)
      .then(weather => {
        setData(weather);
        const pred = predictDisasterRisk(disasterType, weather, meta);
        setPrediction(pred);
        setFetchTime(((Date.now() - t0) / 1000).toFixed(1));
      })
      .catch(() => setError("Network issue — showing cached estimates"))
      .finally(() => setLoading(false));
  }, [city, disasterType]);

  if (!city) return (
    <div style={{ textAlign: "center", padding: "30px 0", color: "#4b5563" }}>
      <div style={{ fontSize: 30, marginBottom: 8 }}>🛰️</div>
      <p style={{ fontSize: 12 }}>Select any city or click the map to fetch live weather + ML prediction</p>
    </div>
  );

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "28px 0" }}>
      <div style={{ width: 36, height: 36, border: "3px solid rgba(99,102,241,0.2)", borderTop: "3px solid #6366F1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "#94a3b8", fontSize: 12 }}>Fetching data for {city}...</p>
      <div style={{ display: "flex", gap: 6 }}>
        {["🌤️ Open-Meteo", "🛰️ NASA POWER"].map(s => (
          <span key={s} style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8", fontSize: 10, padding: "2px 8px", borderRadius: 5 }}>{s}</span>
        ))}
      </div>
    </div>
  );

  const { meteo, nasa } = data || {};
  const lc = { high: "#FF3B30", medium: "#FF9500", low: "#34C759" }[prediction?.riskLevel] || "#6366F1";
  const ci = 2 * Math.PI * 32;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14 }}>{city}</div>
          <div style={{ color: "#374151", fontSize: 10, marginTop: 1 }}>
            {fetchTime ? `✅ Fetched in ${fetchTime}s` : "📦 Cached"}
          </div>
        </div>
        {prediction && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="32" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="7" />
              <circle cx="36" cy="36" r="32" fill="none" stroke={lc} strokeWidth="7"
                strokeDasharray={`${(prediction.riskScore / 100) * ci} ${ci}`}
                strokeDashoffset={ci / 4} strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 4px ${lc})` }} />
              <text x="36" y="33" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">{prediction.riskScore}</text>
              <text x="36" y="46" textAnchor="middle" fill="#94a3b8" fontSize="7">RISK %</text>
            </svg>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: lc, fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>{prediction.riskLevel}</div>
              <div style={{ color: "#374151", fontSize: 9 }}>{prediction.confidence}</div>
            </div>
          </div>
        )}
      </div>

      {error && <div style={{ background: "rgba(255,153,0,0.1)", borderRadius: 7, padding: "7px 10px", color: "#f59e0b", fontSize: 10 }}>⚠️ {error}</div>}

      {prediction && (
        <div style={{ background: `${lc}0f`, borderRadius: 10, padding: 11, border: `1px solid ${lc}30` }}>
          <p style={{ color: "#94a3b8", fontSize: 11, lineHeight: 1.6 }}>🤖 {prediction.interpretation}</p>
        </div>
      )}

      {/* Open-Meteo */}
      {meteo && <>
        <p style={{ color: "#374151", fontSize: 9, fontWeight: 600, letterSpacing: "1px" }}>🌤️ OPEN-METEO — CURRENT</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
          <Metric icon="🌡️" label="Temperature" value={meteo.temp}   unit="°C"   color="#f87171" />
          <Metric icon="💨" label="Wind"        value={meteo.wind}   unit="km/h" color="#60a5fa" />
          <Metric icon="🌧️" label="7d Rain"     value={meteo.rainfall?.reduce((a,b)=>a+(b||0),0).toFixed(1)} unit="mm" color="#38bdf8" />
          <Metric icon="🧭" label="Wind Dir"    value={meteo.windDir} unit="°"   color="#a78bfa" />
        </div>

        {/* 7-day rain bar chart */}
        {meteo.rainfall?.length > 0 && <>
          <p style={{ color: "#374151", fontSize: 9, fontWeight: 600, letterSpacing: "1px" }}>7-DAY FORECAST (mm/day)</p>
          <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 55 }}>
            {meteo.rainfall.slice(0, 7).map((r, i) => {
              const maxR = Math.max(...meteo.rainfall.slice(0,7), 1);
              const h = Math.max(4, (r / maxR) * 44);
              const d = new Date(); d.setDate(d.getDate() + i);
              const c = r > 50 ? "#EF4444" : r > 15 ? "#FF9500" : "#38BDF8";
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <div style={{ color: "#6b7280", fontSize: 8 }}>{r.toFixed(0)}</div>
                  <div style={{ width: "100%", height: h, background: c, borderRadius: "3px 3px 0 0", minHeight: 4 }} />
                  <div style={{ color: "#4b5563", fontSize: 8 }}>{d.toLocaleDateString("en", { weekday: "short" })}</div>
                </div>
              );
            })}
          </div>
        </>}
      </>}

      {/* NASA POWER */}
      {nasa && <>
        <p style={{ color: "#374151", fontSize: 9, fontWeight: 600, letterSpacing: "1px" }}>🛰️ NASA POWER — 30-DAY AVG</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
          <Metric icon="💧" label="Avg Rainfall" value={nasa.avgRainfall}      unit="mm/day" color="#fbbf24" />
          <Metric icon="🌬️" label="Avg Wind"     value={nasa.avgWind}          unit="m/s"   color="#34d399" />
          <Metric icon="🌡️" label="Avg Temp"     value={nasa.avgTemp}          unit="°C"    color="#f87171" />
          <Metric icon="💦" label="Avg Humidity" value={nasa.avgHumidity}      unit="%"     color="#38bdf8" />
        </div>
        <div style={{ background: "rgba(245,158,11,0.08)", borderRadius: 8, padding: "8px 10px", border: "1px solid rgba(245,158,11,0.2)" }}>
          <p style={{ color: "#d97706", fontSize: 10 }}>🛰️ Based on {nasa.dataPoints || "~30"} days of NASA satellite measurements for this location.</p>
        </div>
      </>}

      <div style={{ background: "rgba(99,102,241,0.06)", borderRadius: 8, padding: "8px 10px", border: "1px solid rgba(99,102,241,0.15)" }}>
        <p style={{ color: "#6366F1", fontSize: 10, lineHeight: 1.6 }}>
          🌐 Live data from <b>Open-Meteo</b> + <b>NASA POWER</b>. ML model scores risk using IMD thresholds.
        </p>
      </div>
    </div>
  );
}