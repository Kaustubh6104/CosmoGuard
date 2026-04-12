import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, Shield } from 'lucide-react';
import NeuralAdvisor from './NeuralAdvisor';

const Navigation = ({ user, riskData, activeDisaster }) => {
  return (
    <nav style={{
      width: '320px',
      background: 'rgba(6, 11, 24, 0.95)',
      borderRight: '1px solid rgba(255, 255, 255, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 12px',
      gap: '8px',
      flexShrink: 0,
      height: '100vh',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 12px 24px', marginBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🛡️</div>
        <span style={{ fontWeight: '700', fontSize: '15px', color: '#E2E8F0' }}>DisasterShield</span>
      </div>

      <p style={{ fontSize: '10px', fontWeight: '600', color: '#475569', padding: '0 12px', marginBottom: '8px', letterSpacing: '0.05em' }}>MAIN MENU</p>
      
      <NavLink 
        to="/dashboard" 
        style={({ isActive }) => ({
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 12px',
          borderRadius: '10px',
          textDecoration: 'none',
          color: isActive ? '#6366F1' : '#94A3B8',
          background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
          fontSize: '14px',
          fontWeight: isActive ? '600' : '400',
          transition: 'all 0.2s ease'
        })}
      >
        <LayoutDashboard size={18} /> Dashboard
      </NavLink>

      <NavLink 
        to="/map" 
        style={({ isActive }) => ({
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 12px',
          borderRadius: '10px',
          textDecoration: 'none',
          color: isActive ? '#6366F1' : '#94A3B8',
          background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
          fontSize: '14px',
          fontWeight: isActive ? '600' : '400',
          transition: 'all 0.2s ease'
        })}
      >
        <Map size={18} /> Risk Map
      </NavLink>

      <div style={{ flex: 1, marginTop: '24px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <p style={{ fontSize: '10px', fontWeight: '600', color: '#475569', padding: '0 12px', marginBottom: '12px', letterSpacing: '0.05em' }}>NEURAL ADVISOR</p>
        <div style={{ flex: 1, minHeight: 0 }}>
          <NeuralAdvisor 
            riskData={riskData} 
            user={user} 
            disasterType={activeDisaster || 'flood'} 
          />
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
