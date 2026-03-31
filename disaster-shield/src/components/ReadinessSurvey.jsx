import React, { useState, useEffect } from 'react';
import { Shield, Droplets, Zap, ArrowUpCircle, X } from 'lucide-react';

const ReadinessSurvey = ({ onSave, activeDisaster }) => {
  const [survey, setSurvey] = useState({
    floor: 0,
    has_power_backup: false,
    supplies_days: 0
  });

  const [modalConfig, setModalConfig] = useState(null); // { type: 'floor' | 'supplies', isOpen: false }
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('disaster_readiness');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSurvey(parsed);
        if (onSave) onSave(parsed);
      }
    } catch (e) {
      console.error("Failed to parse readiness storage", e);
    }
  }, []);

  const calculateScore = () => {
    let score = 0;
    if (survey.floor > 1) score += 20;
    if (survey.supplies_days >= 7) score += 40;
    else if (survey.supplies_days > 0) score += (survey.supplies_days / 7) * 40;
    if (survey.has_power_backup) score += 40;
    return Math.min(100, Math.round(score));
  };

  const updateSurvey = (newSurvey) => {
    const updated = { ...survey, ...newSurvey };
    setSurvey(updated);
    localStorage.setItem('disaster_readiness', JSON.stringify(updated));
    if (onSave) onSave(updated);
  };

  const handleTogglePower = () => {
    updateSurvey({ has_power_backup: !survey.has_power_backup });
  };

  const openModal = (type) => {
    setInputValue(survey[type === 'floor' ? 'floor' : 'supplies_days'].toString());
    setModalConfig({ type, isOpen: true });
  };

  const handleModalSave = () => {
    const val = parseInt(inputValue) || 0;
    if (modalConfig.type === 'floor') {
      updateSurvey({ floor: val });
    } else {
      updateSurvey({ supplies_days: val });
    }
    setModalConfig(null);
  };

  const score = calculateScore();

  return (
    <div style={{ padding: '24px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', position: 'relative' }}>
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Shield size={20} color="#6366F1" /> Readiness Checklist
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Upper Floor Access */}
        <div 
          onClick={() => openModal('floor')}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', cursor: 'pointer', transition: '0.2s', border: '1px solid transparent' }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ArrowUpCircle size={18} color="#8B5CF6" />
            <span style={{ fontSize: '14px', color: '#E2E8F0' }}>Upper Floor Access</span>
          </div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: survey.floor > 1 ? '#34C759' : '#FCD34D' }}>
            {survey.floor > 0 ? `Floor ${survey.floor}` : 'Ground/None'}
          </div>
        </div>

        {/* Water/Food Stock */}
        <div 
          onClick={() => openModal('supplies')}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', cursor: 'pointer', transition: '0.2s', border: '1px solid transparent' }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Droplets size={18} color="#38BDF8" />
            <span style={{ fontSize: '14px', color: '#E2E8F0' }}>Water/Food Stock</span>
          </div>
           <div style={{ fontSize: '14px', fontWeight: 'bold', color: survey.supplies_days >= 7 ? '#34C759' : (survey.supplies_days > 0 ? '#FCD34D' : '#EF4444') }}>
            {survey.supplies_days} Days
          </div>
        </div>

        {/* Power Backup Toggle */}
        <div 
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', transition: '0.2s' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap size={18} color="#FCD34D" />
            <span style={{ fontSize: '14px', color: '#E2E8F0' }}>Power Backup</span>
          </div>
          
          {/* Custom Toggle Switch */}
          <div 
            onClick={handleTogglePower}
            style={{ 
              width: '44px', height: '24px', borderRadius: '12px', 
              background: survey.has_power_backup ? '#34C759' : 'rgba(255,255,255,0.1)',
              position: 'relative', cursor: 'pointer', transition: 'background-color 0.3s'
            }}
          >
            <div style={{
              width: '20px', height: '20px', borderRadius: '50%', background: 'white',
              position: 'absolute', top: '2px', left: survey.has_power_backup ? '22px' : '2px',
              transition: 'left 0.3s'
            }} />
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
           <span style={{ fontSize: '12px', color: '#94A3B8' }}>Overall Preparedness</span>
           <span style={{ fontSize: '12px', fontWeight: 'bold', color: score >= 80 ? '#34C759' : (score >= 40 ? '#FCD34D' : '#EF4444') }}>{score}%</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ 
            width: `${score}%`, height: '100%', 
            background: score >= 80 ? '#34C759' : (score >= 40 ? '#FCD34D' : '#EF4444'),
            transition: 'width 0.5s ease-out, background-color 0.5s ease-out'
          }} />
        </div>
      </div>

      {/* Modal Overlay */}
      {modalConfig?.isOpen && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(6, 11, 24, 0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '24px', zIndex: 10
        }}>
          <div style={{ background: '#1E293B', padding: '24px', borderRadius: '16px', width: '250px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600' }}>
                {modalConfig.type === 'floor' ? 'Floor Level' : 'Days of Supplies'}
              </h4>
              <X size={18} style={{ cursor: 'pointer', color: '#94A3B8' }} onClick={() => setModalConfig(null)} />
            </div>
            
            <input 
              type="number" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{ 
                width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid #374151', 
                borderRadius: '8px', color: 'white', marginBottom: '16px', boxSizing: 'border-box',
                outline: 'none'
              }}
              autoFocus
            />
            
            <button 
               onClick={handleModalSave}
               style={{ width: '100%', padding: '12px', background: '#6366F1', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer', transition: '0.2s' }}
               onMouseOver={(e) => e.currentTarget.style.background = '#4F46E5'}
               onMouseOut={(e) => e.currentTarget.style.background = '#6366F1'}
            >
              Save
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReadinessSurvey;
