import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { API_BASE_URL } from '../api-config';

const CommandCenter = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        // Fetch all active zones with high risk
        const types = ['flood', 'cyclone', 'drought'];
        let allPoints = [];
        
        for (const type of types) {
          const res = await fetch(`${API_BASE_URL}/api/v1/user/zones-risk?disaster_type=${type}`);
          const data = await res.json();
          const highRisk = data.points.filter(p => p.risk === 'high').map(p => ({ ...p, type }));
          allPoints = [...allPoints, ...highRisk];
        }
        
        setAlerts(allPoints);
      } catch (err) {
        console.error("Alert Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    const id = setInterval(fetchAlerts, 60000); // Update every minute
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ padding: '24px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} color="#34C759" /> Official Alert Monitor
        </h3>
        {alerts.length > 0 && (
          <span style={{ fontSize: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>
            {alerts.length} CRITICAL SECTORS
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
        {loading && alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#475569', fontSize: '12px' }}>
            <Activity className="animate-spin" size={24} style={{ margin: '0 auto 10px' }} />
            SCANNING ALL INDIA SECTORS...
          </div>
        ) : alerts.length > 0 ? (
          alerts.map((alert, idx) => (
            <div key={idx} style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#E2E8F0' }}>{alert.city}</p>
                <p style={{ fontSize: '10px', color: '#EF4444', textTransform: 'uppercase', fontWeight: 'bold' }}>{alert.type} - {alert.label}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '14px', fontWeight: '800', color: '#EF4444' }}>{alert.actual_percentage}%</p>
                <p style={{ fontSize: '8px', color: '#94A3B8' }}>{alert.lat.toFixed(2)}N, {alert.lng.toFixed(2)}E</p>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#34C759', fontSize: '12px' }}>
            <Zap size={24} style={{ margin: '0 auto 10px' }} />
            NO CRITICAL THREATS DETECTED NATIONWIDE
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '16px', padding: '10px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
        <p style={{ fontSize: '10px', color: '#818CF8', lineHeight: '1.4' }}>
          <strong>Note for Officials:</strong> This monitor automatically aggregates data from multi-point sensor networks. All "high" risk zones are flagged for immediate resource allocation.
        </p>
      </div>
    </div>
  );
};

export default CommandCenter;
