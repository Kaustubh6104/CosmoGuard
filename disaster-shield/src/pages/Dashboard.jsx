import React, { useEffect, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { 
  Cloud, Sun, Droplets, AlertTriangle, Wind, Info, 
  Map as MapIcon, LogOut, Navigation, Newspaper, Shield
} from 'lucide-react';

const Dashboard = ({ user, onLogout }) => {
  const [weatherHistory, setWeatherHistory] = useState([]);
  const [riskData, setRiskData] = useState(null);
  const [news, setNews] = useState([]);
  const [evacuation, setEvacuation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [histRes, riskRes, newsRes, evacRes] = await Promise.all([
          fetch(`http://localhost:8000/api/v1/user/weather-history?lat=${user.lat}&lng=${user.lng}`),
          fetch(`http://localhost:8000/api/v1/user/risk-analysis?lat=${user.lat}&lng=${user.lng}`),
          fetch(`http://localhost:8000/api/v1/user/news?city=${user.city}`),
          fetch(`http://localhost:8000/api/v1/user/evacuation?lat=${user.lat}&lng=${user.lng}`)
        ]);

        const [hist, risk, newsData, evac] = await Promise.all([
          histRes.json(), riskRes.json(), newsRes.json(), evacRes.json()
        ]);

        setWeatherHistory(hist.history || []);
        setRiskData(risk);
        setNews(newsData.news || []);
        setEvacuation(evac);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const risks = [
    { name: 'Drought', value: riskData?.drought_risk || 0, color: '#FCD34D' },
    { name: 'Flood', value: riskData?.flood_risk || 0, color: '#38BDF8' },
    { name: 'Heatwave', value: riskData?.heatwave_risk || 0, color: '#F87171' },
    { name: 'Cyclone', value: riskData?.cyclone_risk || 0, color: '#818CF8' }
  ];

  const handleNavigate = () => {
    if (evacuation?.safe_zone) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${evacuation.safe_zone.lat},${evacuation.safe_zone.lng}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060B18', color: '#E2E8F0' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ border: '4px solid rgba(255,255,255,.1)', borderTop: '4px solid #6366F1', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
          <p>Analyzing localized data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060B18',
      color: '#E2E8F0',
      fontFamily: "'Inter', sans-serif",
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        padding: '16px 32px',
        background: 'rgba(6, 11, 24, 0.8)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🛡️</div>
          <h1 style={{ fontSize: '18px', fontWeight: '700' }}>DisasterShield</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '14px', fontWeight: '600' }}>{user.username}</p>
            <p style={{ fontSize: '12px', color: '#6366F1' }}>{user.city} • 📍 {user.lat.toFixed(2)}, {user.lng.toFixed(2)}</p>
          </div>
          <button onClick={onLogout} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#EF4444', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div style={{ padding: '24px 32px', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
        {/* Risk Overview */}
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={20} color="#6366F1" /> Disaster Risk Profile
            </h2>
            <div style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={risks} layout="vertical">
                  <XAxis type="number" hide domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }} 
                    contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {risks.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {riskData?.overall_alert === 'Critical' && (
              <div style={{ marginTop: '15px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={20} color="#EF4444" />
                <p style={{ color: '#EF4444', fontSize: '13px', fontWeight: '600' }}>Critical Threat Detected in Your Area</p>
              </div>
            )}
          </div>

          <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Newspaper size={20} color="#6366F1" /> Regional News Feed
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {news.map(item => (
                <div key={item.id} style={{ borderLeft: `3px solid ${item.type === 'warning' ? '#EF4444' : '#6366F1'}`, paddingLeft: '12px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '500', lineHeight: '1.4' }}>{item.title}</p>
                  <p style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>{item.source} • {item.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weather History Chart */}
        <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Cloud size={20} color="#6366F1" /> 7-Day Weather Trend
              </h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F87171' }}></div> Max Temp
                </div>
                <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38BDF8' }}></div> Min Temp
                </div>
              </div>
            </div>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weatherHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                  <Line type="monotone" dataKey="max_temp" stroke="#F87171" strokeWidth={3} dot={{ fill: '#F87171' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="min_temp" stroke="#38BDF8" strokeWidth={3} dot={{ fill: '#38BDF8' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Evacuation Control */}
            <div style={{ padding: '24px', background: evacuation?.status.includes('Safe') ? 'rgba(52, 197, 89, 0.05)' : 'rgba(99, 102, 241, 0.05)', borderRadius: '20px', border: `1px solid ${evacuation?.status.includes('Safe') ? 'rgba(52, 197, 89, 0.2)' : 'rgba(99, 102, 241, 0.2)'}` }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Navigation size={20} color={evacuation?.status.includes('Safe') ? '#34C759' : "#6366F1"} /> 
                {evacuation?.status.includes('Safe') ? 'Personal Safety Guide' : 'Smart Evacuation System'}
              </h2>
              {evacuation && (
                <div>
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '16px' }}>
                    <p style={{ fontSize: '12px', color: '#94A3B8' }}>Status</p>
                    <p style={{ fontSize: '15px', fontWeight: '700', color: evacuation.status.includes('Recommended') ? '#EF4444' : (evacuation.status.includes('Safe') ? '#34C759' : '#FCD34D') }}>{evacuation.status}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: evacuation.status.includes('Safe') ? '#34C75922' : '#6366F122', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {evacuation.status.includes('Safe') ? <Shield size={20} color="#34C759" /> : <MapIcon size={20} color="#6366F1" />}
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', color: '#94A3B8' }}>{evacuation.status.includes('Safe') ? 'Current Position' : `Nearest Safe Zone (${evacuation.distance_km}km)`}</p>
                      <p style={{ fontSize: '14px', fontWeight: '600' }}>{evacuation.safe_zone.name}</p>
                    </div>
                  </div>
                  {!evacuation.status.includes('Safe') && (
                    <button 
                      onClick={handleNavigate}
                      style={{ width: '100%', padding: '12px', background: '#6366F1', border: 'none', borderRadius: '10px', color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Navigation size={18} /> Start Navigation
                    </button>
                  )}
                  {evacuation.status.includes('Safe') && (
                    <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(52, 197, 89, 0.1)', color: '#34C759', fontSize: '11px', textAlign: 'center', fontWeight: '600' }}>
                      🏠 No evacuation needed. Follow hydration guidelines.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ padding: '24px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Shield size={20} color="#6366F1" /> Preparation Guide
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {evacuation?.instructions.map((inst, idx) => (
                  <li key={idx} style={{ fontSize: '13px', color: '#94A3B8', display: 'flex', gap: '8px' }}>
                    <div style={{ width: '18px', height: '18px', background: 'rgba(99,102,241,0.1)', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#6366F1' }}>{idx + 1}</div>
                    {inst}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
