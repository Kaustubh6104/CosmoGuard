import React, { useEffect, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { 
  Cloud, Sun, Droplets, AlertTriangle, Wind, Info, 
  Map as MapIcon, LogOut, Navigation, Newspaper, Shield
} from 'lucide-react';

import NeuralAdvisor from '../components/NeuralAdvisor';
import ReadinessSurvey from '../components/ReadinessSurvey';

const Dashboard = ({ user, onLogout, weatherHistory, riskData, evacuation, survey, setSurvey, activeDisaster }) => {
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

  const readinessScore = Math.min(100, (survey.floor > 1 ? 40 : 10) + (survey.supplies_days * 10) + (survey.has_power_backup ? 20 : 0) + (survey.has_ac ? 10 : 0));

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
          <button onClick={onLogout} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#EF4444', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '32px' }}>
        {/* Left Column: Readiness & Score */}
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <ReadinessSurvey onSave={setSurvey} activeDisaster={activeDisaster} />
          
          <div style={{ padding: '32px 24px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.1))', borderRadius: '24px', border: '1px solid rgba(139, 92, 246, 0.2)', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#818CF8', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Neural Safety Readiness</p>
            <div style={{ fontSize: '56px', fontWeight: '800', color: '#E2E8F0', textShadow: '0 0 30px rgba(139, 92, 246, 0.4)', lineHeight: 1 }}>
              {readinessScore}%
            </div>
            <p style={{ fontSize: '14px', color: readinessScore > 70 ? '#34C759' : '#FCD34D', marginTop: '12px', fontWeight: '600' }}>
              {readinessScore > 70 ? "OPTIMIZED: Shelter in Place" : "CAUTION: Evacuation Alert"}
            </p>
          </div>
        </div>

        {/* Right Column: Charts & Analytics */}
        <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Cloud size={20} color="#6366F1" /> 7-Day Weather Intel
              </h2>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F87171' }}></div> High
                </div>
                <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38BDF8' }}></div> Low
                </div>
              </div>
            </div>
            <div style={{ height: '320px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            {/* Evacuation Control */}
            <div style={{ padding: '24px', background: evacuation?.status?.includes('Safe') ? 'rgba(52, 197, 89, 0.05)' : 'rgba(99, 102, 241, 0.05)', borderRadius: '24px', border: `1px solid ${evacuation?.status?.includes('Safe') ? 'rgba(52, 197, 89, 0.2)' : 'rgba(99, 102, 241, 0.2)'}` }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Navigation size={20} color={evacuation?.status?.includes('Safe') ? '#34C759' : "#6366F1"} /> 
                Live Protocol
              </h2>
              {evacuation ? (
                <div>
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', marginBottom: '20px' }}>
                    <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>Status Recommendation</p>
                    <p style={{ fontSize: '18px', fontWeight: '800', color: evacuation?.status?.includes('Recommended') ? '#EF4444' : (evacuation?.status?.includes('Safe') ? '#34C759' : '#FCD34D') }}>{evacuation?.status}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: evacuation?.status?.includes('Safe') ? '#34C75922' : '#6366F122', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {evacuation?.status?.includes('Safe') ? <Shield size={24} color="#34C759" /> : <MapIcon size={24} color="#6366F1" />}
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', color: '#94A3B8' }}>{evacuation?.status?.includes('Safe') ? 'Optimal Position' : `Target Safe Zone (${evacuation?.distance_km || 0}km)`}</p>
                      <p style={{ fontSize: '16px', fontWeight: '700' }}>{evacuation?.safe_zone?.name || 'Local Sector'}</p>
                    </div>
                  </div>
                  {!evacuation?.status?.includes('Safe') ? (
                    <button 
                      onClick={handleNavigate}
                      style={{ width: '100%', padding: '14px', background: '#6366F1', border: 'none', borderRadius: '14px', color: 'white', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' }}>
                      <Navigation size={20} /> Open Guidance Maps
                    </button>
                  ) : (
                    <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(52, 197, 89, 0.1)', color: '#34C759', fontSize: '12px', textAlign: 'center', fontWeight: '700' }}>
                      🏠 Sector analysis verifies home safety.
                    </div>
                  )}
                </div>
              ) : <p style={{ color: '#64748B' }}>Syncing with neural pathways...</p>}
            </div>

            <div style={{ padding: '24px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Shield size={20} color="#6366F1" /> Action Protocol
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {evacuation?.instructions?.map((inst, idx) => (
                  <li key={idx} style={{ fontSize: '13px', color: '#94A3B8', display: 'flex', gap: '10px', lineHeight: '1.5' }}>
                    <div style={{ width: '20px', height: '20px', background: 'rgba(99,102,241,0.1)', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#6366F1', fontWeight: '700' }}>{idx + 1}</div>
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
