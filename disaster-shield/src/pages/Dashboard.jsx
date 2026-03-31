import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Cloud, Sun, Droplets, AlertTriangle, Wind, Info, 
  Map as MapIcon, LogOut, Navigation, Newspaper, Shield,
  Activity, MapPin, Clock, Bell
} from 'lucide-react';

import ReadinessSurvey from '../components/ReadinessSurvey';
import WeatherIntel from '../components/WeatherIntel';
import { API_BASE_URL } from '../api-config';

const Dashboard = ({ user, onLogout, evacuation, survey, setSurvey, activeDisaster }) => {
  const handleNavigate = () => {
    if (evacuation?.safe_zone) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${evacuation.safe_zone.lat},${evacuation.safe_zone.lng}`;
      window.open(url, '_blank');
    }
  };

  const fetchPredictions = async () => {
    if (!user?.lat || !user?.lng) throw new Error("Location required");
    // Some backend endpoints might expect different body schemas, but predict-all typically expects lat/lng
    const res = await fetch(`${API_BASE_URL}/api/v1/predict-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: user.lat, lng: user.lng, days_forward: 7 })
    });
    if (!res.ok) throw new Error("Prediction API Failed");
    return res.json();
  };

  const { data: predictions, isLoading: loadingPredictions } = useQuery({
    queryKey: ['predictions', user?.lat, user?.lng],
    queryFn: fetchPredictions,
    enabled: !!user?.lat && !!user?.lng,
    refetchInterval: 30 * 60 * 1000 // 30 mins
  });

  // Calculate Neural Safety Readiness
  let neuralScore = 10;
  let highestRiskVal = 0;
  let highestRiskType = 'General';
  let activeAlertsCount = 0;
  let actionSteps = [
    "Stay informed and monitor weather updates.",
    "Review your readiness checklist.",
    "Ensure your emergency kit is fully stocked."
  ];

  if (predictions?.predictions) {
    const pValues = Object.entries(predictions.predictions).map(([key, val]) => {
      const p = val.risk_percentage || 0;
      if (p > highestRiskVal) {
        highestRiskVal = p;
        highestRiskType = key;
        actionSteps = val.recommended_actions || actionSteps;
      }
      if (p > 60) activeAlertsCount++;
      return p;
    });

    if (pValues.length > 0) {
      const avg = pValues.reduce((a, b) => a + b, 0) / pValues.length;
      neuralScore = Math.max(0, Math.round(100 - avg));
    }
  }

  const getSafetyStatus = () => {
    if (highestRiskVal > 80) return { text: "CRITICAL: Immediate Action", color: "#EF4444" };
    if (highestRiskVal > 60) return { text: "CAUTION: Evacuation Alert", color: "#FCD34D" };
    return { text: "SAFE: Normal Conditions", color: "#34C759" };
  };

  const safetyInfo = getSafetyStatus();

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
          <h1 style={{ fontSize: '18px', fontWeight: '700' }}>DisasterShield Dashboard</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '14px', fontWeight: '600' }}>{user?.username}</p>
            <p style={{ fontSize: '12px', color: '#6366F1' }}>{user?.city} • 📍 {user?.lat?.toFixed(2)}, {user?.lng?.toFixed(2)}</p>
          </div>
          <button onClick={onLogout} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#EF4444', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: '0.2s' }} onMouseOver={(e) => e.currentTarget.style.background='rgba(239, 68, 68, 0.2)'} onMouseOut={(e) => e.currentTarget.style.background='rgba(239, 68, 68, 0.1)'}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Quick Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          <div style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05))', borderRadius: '20px', border: '1px solid rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'transform 0.2s', ':hover': { transform: 'scale(1.02)' } }}>
            <div style={{ padding: '12px', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '12px' }}><Activity size={24} color="#8B5CF6" /></div>
            <div>
              <p style={{ fontSize: '12px', color: '#94A3B8' }}>Current Risk</p>
              <p style={{ fontSize: '20px', fontWeight: '700', color: safetyInfo.color }}>{Math.round(highestRiskVal)}%</p>
            </div>
          </div>
          <div style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(245, 158, 11, 0.05))', borderRadius: '20px', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'transform 0.2s' }}>
            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '12px' }}><Bell size={24} color="#EF4444" /></div>
            <div>
              <p style={{ fontSize: '12px', color: '#94A3B8' }}>Active Alerts</p>
              <p style={{ fontSize: '20px', fontWeight: '700', color: '#F87171' }}>{activeAlertsCount}</p>
            </div>
          </div>
          <div style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(52, 197, 89, 0.1), rgba(16, 185, 129, 0.05))', borderRadius: '20px', border: '1px solid rgba(52, 197, 89, 0.2)', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'transform 0.2s' }}>
            <div style={{ padding: '12px', background: 'rgba(52, 197, 89, 0.2)', borderRadius: '12px' }}><MapPin size={24} color="#34C759" /></div>
            <div>
              <p style={{ fontSize: '12px', color: '#94A3B8' }}>Your Location</p>
              <p style={{ fontSize: '16px', fontWeight: '700', color: '#6EE7B7' }}>{user?.city}</p>
            </div>
          </div>
          <div style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(14, 165, 233, 0.05))', borderRadius: '20px', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'transform 0.2s' }}>
            <div style={{ padding: '12px', background: 'rgba(56, 189, 248, 0.2)', borderRadius: '12px' }}><Clock size={24} color="#38BDF8" /></div>
            <div>
              <p style={{ fontSize: '12px', color: '#94A3B8' }}>Last Updated</p>
              <p style={{ fontSize: '16px', fontWeight: '700', color: '#BAE6FD' }}>Just now</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '32px' }}>
          
          {/* Left Column: Readiness & Score */}
          <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <ReadinessSurvey onSave={setSurvey} activeDisaster={activeDisaster} />
            
            <div style={{ padding: '32px 24px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.1))', borderRadius: '24px', border: '1px solid rgba(139, 92, 246, 0.2)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: `radial-gradient(circle, ${safetyInfo.color}11 0%, transparent 60%)`, animation: 'pulse 4s infinite' }} />
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#818CF8', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px', position: 'relative' }}>Neural Safety Readiness</p>
              
              {loadingPredictions ? (
                <div style={{ fontSize: '56px', fontWeight: '800', color: '#64748B', position: 'relative' }}>--%</div>
              ) : (
                <div style={{ fontSize: '56px', fontWeight: '800', color: '#E2E8F0', textShadow: `0 0 30px ${safetyInfo.color}66`, lineHeight: 1, position: 'relative' }}>
                  {neuralScore}%
                </div>
              )}
              
              <p style={{ fontSize: '14px', color: safetyInfo.color, marginTop: '12px', fontWeight: '700', position: 'relative' }}>
                {safetyInfo.text}
              </p>
            </div>
          </div>

          {/* Right Column: Charts & Analytics */}
          <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            <WeatherIntel lat={user?.lat} lng={user?.lng} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              
              {/* Live Protocol Control */}
              <div style={{ padding: '24px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '24px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Navigation size={20} color="#6366F1" /> Live Protocol
                  </span>
                  <button style={{ background: 'transparent', border: '1px solid #6366F1', color: '#6366F1', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', cursor: 'pointer' }}>View All</button>
                </h2>
                
                {loadingPredictions ? (
                   <p style={{ color: '#64748B', fontSize: '14px', padding: '16px 0', textAlign: 'center' }}>Syncing with neural pathways...</p>
                ) : (
                  <div>
                    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: activeAlertsCount > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(52, 197, 89, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Bell size={24} color={activeAlertsCount > 0 ? '#EF4444' : '#34C759'} />
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>Active Risk Count</p>
                        <p style={{ fontSize: '18px', fontWeight: '800', color: activeAlertsCount > 0 ? '#EF4444' : '#34C759' }}>
                          {activeAlertsCount} Alert{activeAlertsCount !== 1 ? 's' : ''} Identified
                        </p>
                      </div>
                    </div>

                    {!evacuation?.status?.includes('Safe') && evacuation ? (
                      <button 
                        onClick={handleNavigate}
                        style={{ width: '100%', padding: '14px', background: '#6366F1', border: 'none', borderRadius: '14px', color: 'white', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' }}>
                        <Navigation size={20} /> Open Guidance Maps
                      </button>
                    ) : (
                      <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(52, 197, 89, 0.1)', color: '#34C759', fontSize: '12px', textAlign: 'center', fontWeight: '700' }}>
                        🏠 Sector analysis verifies home safety. No evacuation pending.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Protocol */}
              <div style={{ padding: '24px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Shield size={20} color="#6366F1" /> {highestRiskType.charAt(0).toUpperCase() + highestRiskType.slice(1)} Action Protocol
                </h2>
                {loadingPredictions ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[1,2,3].map(i => <div key={i} style={{ height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}/>)}
                  </div>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {actionSteps.slice(0, 3).map((inst, idx) => (
                      <li key={idx} style={{ fontSize: '13px', color: '#94A3B8', display: 'flex', gap: '12px', lineHeight: '1.5', alignItems: 'flex-start' }}>
                        <div style={{ width: '24px', height: '24px', background: 'rgba(99,102,241,0.1)', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#818CF8', fontWeight: '700' }}>{idx + 1}</div>
                        <span style={{ paddingTop: '2px' }}>{inst}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
