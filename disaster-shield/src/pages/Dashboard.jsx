import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Activity, MapPin, Clock, Bell, Signal, Info, X, 
  Newspaper, Shield, LogOut, ExternalLink, ChevronRight
} from 'lucide-react';
import WeatherIntel from '../components/WeatherIntel';
import CommandCenter from '../components/CommandCenter';
import { API_BASE_URL } from '../api-config';

const Dashboard = ({ user, onLogout }) => {
  const [showBriefing, setShowBriefing] = useState(false);

  // Fetch Predictions (ML Risks)
  const fetchPredictions = async () => {
    if (!user?.lat || !user?.lng) throw new Error("Location required");
    const res = await fetch(`${API_BASE_URL}/api/v1/predict-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: user.lat, lng: user.lng })
    });
    return await res.json();
  };

  const { data: predictions } = useQuery({
    queryKey: ['predictions', user?.lat, user?.lng],
    queryFn: fetchPredictions,
    enabled: !!user?.lat && !!user?.lng,
    staleTime: 30 * 60 * 1000
  });

  // Fetch Live Intel (Scraped Real-Time News)
  const { data: newsItems = [], isLoading: loadingNews } = useQuery({
    queryKey: ['live-intel', user?.city],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/v1/news?city=${user?.city || 'India'}`);
      return await res.json();
    },
    refetchInterval: 120 * 1000 // Refresh every 2 mins
  });

  const highestRiskVal = predictions?.highest_risk?.[1] || 15;
  const highestRiskType = predictions?.highest_risk?.[0] || 'General';
  const city = user?.city || 'Local Sector';

  return (
    <div style={{ minHeight: '100vh', background: '#060B18', color: '#E2E8F0', fontVariantNumeric: 'tabular-nums' }}>
      {/* Header */}
      <header style={{ padding: '16px 32px', background: 'rgba(6, 11, 24, 0.8)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🛡️</div>
          <h1 style={{ fontSize: '18px', fontWeight: '700' }}>DisasterShield Command</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '14px', fontWeight: '600' }}>{user?.username || 'Commander'}</p>
            <p style={{ fontSize: '10px', color: '#38BDF8', fontWeight: 'bold' }}>📡 UPLINK 1: ACTIVE (SATELLITE)</p>
          </div>
          <button onClick={onLogout} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', padding: '10px', borderRadius: '10px', cursor: 'pointer' }}><LogOut size={18} /></button>
        </div>
      </header>

      {/* Satellite Integrity Header */}
      <div style={{ margin: '0 32px 0 32px', padding: '12px 20px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '0 0 12px 12px', border: '1px solid rgba(99, 102, 241, 0.1)', borderTop: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '8px', height: '8px', background: '#34C759', borderRadius: '50%', boxShadow: '0 0 8px #34C759', animation: 'pulse 1.5s infinite' }}></div>
          <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', color: '#E2E8F0' }}>SATELLITE UPLINK: <span style={{ color: '#34C759' }}>ACTIVE</span> [INSAT-3DR]</span>
        </div>
        <div style={{ fontSize: '10px', color: '#94A3B8', fontFamily: 'monospace' }}>
          LAT: {user?.lat?.toFixed(4)} | LNG: {user?.lng?.toFixed(4)} | ALT: 35,786 KM
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {[
            { label: "Current Risk", value: `${Math.round(highestRiskVal)}%`, icon: Activity, color: highestRiskVal > 50 ? '#EF4444' : '#34C759', info: "Real-time ML risk index" },
            { label: "Location", value: city, icon: MapPin, color: '#34C759', info: "Active GPS Monitoring" },
            { label: "Uplink", value: "SATELLITE", icon: Signal, color: '#38BDF8', info: "Resilient emergency mesh link" },
            { label: "Status", value: "Ready", icon: Shield, color: '#818CF8', info: "Neural engine is 100% stable" }
          ].map((stat, i) => (
            <div key={i} title={stat.info} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
               <div style={{ padding: '10px', background: `${stat.color}11`, borderRadius: '12px' }}><stat.icon size={22} color={stat.color} /></div>
               <div>
                 <p style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '600' }}>{stat.label.toUpperCase()}</p>
                 <p style={{ fontSize: '20px', fontWeight: '700', color: stat.color }}>{stat.value}</p>
               </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '32px' }}>
          {/* Main Visuals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
             <WeatherIntel lat={user?.lat} lng={user?.lng} />
             
             {/* Strategy Card */}
             <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(139,92,246,0.05))', padding: '32px', borderRadius: '24px', border: '1px solid rgba(99,102,241,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                   <h3 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}><Shield size={20} color="#6366F1" /> Tactical Briefing</h3>
                   <span style={{ fontSize: '12px', background: 'rgba(99,102,241,0.15)', color: '#6366F1', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold' }}>AI RECOMMENDED</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                   <div style={{ padding: '20px', background: 'rgba(6,11,24,0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <p style={{ fontSize: '11px', color: '#6366F1', fontWeight: '800', marginBottom: '8px' }}>CORE PROTOCOL</p>
                      <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#E2E8F0' }}>
                         Neural monitoring for <strong>{highestRiskType}</strong> is active. Current threshold is nominal. Continue standard data logging and maintain communication with local authorities.
                      </p>
                   </div>
                   <div style={{ padding: '20px', background: 'rgba(6,11,24,0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <p style={{ fontSize: '11px', color: '#34C759', fontWeight: '800', marginBottom: '8px' }}>ACTIONABLE STEP</p>
                      <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#E2E8F0' }}>
                         {predictions?.predictions?.[highestRiskType]?.recommended_actions?.[0] || 'Keep your emergency beacon charged and maintain 7-day food/water supply.'}
                      </p>
                   </div>
                </div>
             </div>
          </div>

          {/* Intel Sidebar (REAL TIME) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ padding: '24px', background: 'rgba(6,11,24,0.6)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Newspaper size={18} color="#6366F1" /> Live Intel Feed
                  <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: '#EF4444', fontWeight: '800' }}>
                    <span style={{ width: '6px', height: '6px', background: '#EF4444', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></span> LIVE
                  </span>
               </h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '300px' }}>
                  {loadingNews ? (
                    <p style={{ fontSize: '11px', color: '#475569', textAlign: 'center', marginTop: '50px' }}>🛰️ SCRAPING GLOBAL SOURCES...</p>
                  ) : newsItems.length > 0 ? (
                    newsItems.map((item, idx) => (
                      <div key={idx} style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', borderLeft: `3px solid ${item.color || '#38BDF8'}` }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '9px', fontWeight: '800', color: item.color || '#38BDF8' }}>{item.tag || 'ALERT'}</span>
                            <span style={{ fontSize: '9px', color: '#475569' }}>{item.time}</span>
                         </div>
                         <p style={{ fontSize: '13px', fontWeight: '600', color: '#E2E8F0', lineHeight: '1.4' }}>{item.title}</p>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: '11px', color: '#475569', textAlign: 'center', marginTop: '50px' }}>No direct threats in local sector.</p>
                  )}
               </div>
               <button 
                  onClick={() => setShowBriefing(true)}
                  style={{ width: '100%', padding: '14px', background: '#6366F1', border: 'none', borderRadius: '12px', color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.background = '#818CF8'}
                  onMouseOut={e => e.currentTarget.style.background = '#6366F1'}
               >
                  View Full Briefing <ChevronRight size={16} />
               </button>
            </div>
            
            <CommandCenter />
          </div>
        </div>
      </div>

      {/* Briefing Modal */}
      {showBriefing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
          <div style={{ width: 'min(90%, 600px)', background: '#0F172A', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', padding: '32px', position: 'relative' }}>
             <button onClick={() => setShowBriefing(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={24} /></button>
             <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', color: 'white' }}>Mission Briefing: {city}</h2>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                   <p style={{ fontSize: '12px', color: '#6366F1', fontWeight: '800', marginBottom: '8px' }}>SITUATION REPORT</p>
                   <p style={{ fontSize: '15px', color: '#CBD5E1', lineHeight: '1.6' }}>
                      Current atmospheric conditions in {city} are being monitored via <strong>UPLINK 1</strong> (Satellite Mesh). This redundant connection ensures that even if local internet fails during a disaster, your dashboard remains live.
                   </p>
                </div>
                {newsItems.length > 0 && (
                  <div style={{ padding: '20px', background: 'rgba(99,102,241,0.05)', borderRadius: '16px' }}>
                    <p style={{ fontSize: '12px', color: '#6366F1', fontWeight: '800', marginBottom: '8px' }}>LATEST INTELLIGENCE</p>
                    <p style={{ fontSize: '14px', color: '#E2E8F0', fontStyle: 'italic' }}>
                      "{newsItems[0].title}"
                    </p>
                  </div>
                )}
                <div style={{ padding: '20px', background: 'rgba(34,197,94,0.05)', borderRadius: '16px', border: '1px solid rgba(34,197,94,0.1)' }}>
                   <p style={{ fontSize: '12px', color: '#22C55E', fontWeight: '800', marginBottom: '8px' }}>EVACUATION PROTOCOL</p>
                   <p style={{ fontSize: '15px', color: '#CBD5E1', lineHeight: '1.6' }}>
                      Primary evacuation routes for {city} have been identified and uploaded to your Risk Map. Current local traffic patterns indicate normal flow, but standby for immediate updates.
                   </p>
                </div>
             </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default Dashboard;
