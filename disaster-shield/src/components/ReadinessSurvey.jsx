import React, { useState, useEffect } from 'react';
import { Home, Trash2, CheckCircle, Shield, Zap } from 'lucide-react';

const ReadinessSurvey = ({ onSave, activeDisaster }) => {
  const [survey, setSurvey] = useState({
    floor: 0,
    has_power_backup: false,
    has_ac: false,
    supplies_days: 0
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('disaster_readiness');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSurvey(parsed);
        // Sync with parent on load
        onSave(parsed);
      }
    } catch (e) {
      console.error("Failed to parse readiness storage", e);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newSurvey = {
      ...survey,
      [name]: type === 'checkbox' ? checked : parseInt(value) || 0
    };
    setSurvey(newSurvey);
    localStorage.setItem('disaster_readiness', JSON.stringify(newSurvey));
    onSave(newSurvey);
  };

  const isFloodType = activeDisaster === 'flood' || activeDisaster === 'cyclone';
  const isHeatType = activeDisaster === 'heatwave' || activeDisaster === 'drought';

  return (
    <div style={{ padding: '20px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '20px', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
      <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Shield size={18} color="#6366F1" /> Readiness: {activeDisaster?.toUpperCase() || 'GENERAL'}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Floor Level is only relevant for floods/cyclones */}
        {isFloodType && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '12px', color: '#94A3B8' }}>Upper Floor Access</label>
            <input 
              type="number" 
              name="floor" 
              value={survey.floor} 
              onChange={handleChange}
              style={{ width: '50px', background: 'rgba(255,255,255,0.05)', border: '1px solid #374151', borderRadius: '5px', color: 'white', textAlign: 'center', padding: '2px' }}
            />
          </div>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '12px', color: '#94A3B8' }}>Water/Food Stock (Days)</label>
          <input 
            type="number" 
            name="supplies_days" 
            value={survey.supplies_days} 
            onChange={handleChange}
            style={{ width: '50px', background: 'rgba(255,255,255,0.05)', border: '1px solid #374151', borderRadius: '5px', color: 'white', textAlign: 'center', padding: '2px' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '12px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Zap size={14} color="#FCD34D" /> Power Backup?
          </label>
          <input 
            type="checkbox" 
            name="has_power_backup" 
            checked={survey.has_power_backup} 
            onChange={handleChange}
            style={{ width: '18px', height: '18px', accentColor: '#6366F1' }}
          />
        </div>

        {/* AC / Cooling is primarily relevant for heatwaves/droughts */}
        {isHeatType && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '12px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Home size={14} color="#38BDF8" /> AC / Active Cooling?
            </label>
            <input 
              type="checkbox" 
              name="has_ac" 
              checked={survey.has_ac} 
              onChange={handleChange}
              style={{ width: '18px', height: '18px', accentColor: '#6366F1' }}
            />
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '15px', padding: '8px', background: 'rgba(52, 197, 89, 0.1)', borderRadius: '8px', fontSize: '10px', color: '#34C759', textAlign: 'center', fontWeight: 'bold' }}>
        ✅ {isFloodType ? 'Flood' : 'Heat'} Protocol Verified
      </div>
    </div>
  );
};

export default ReadinessSurvey;
