import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Cloud, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

const fetchWeather = async (lat, lng) => {
  if (!lat || !lng) throw new Error("Location not available");
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
  );
  if (!response.ok) throw new Error('Failed to fetch weather data');
  const data = await response.json();
  
  return data.daily.time.map((time, index) => {
    const maxTemp = data.daily.temperature_2m_max[index];
    const precipitation = data.daily.precipitation_sum[index];
    const isHighRisk = maxTemp > 35 || precipitation > 20;

    return {
      date: (() => {
        try {
          return format(new Date(time), 'EEE, MMM d');
        } catch {
          return time;
        }
      })(),

      max_temp: maxTemp,
      min_temp: data.daily.temperature_2m_min[index],
      precipitation: precipitation,
      isHighRisk
    };
  });
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '12px' }}>{label}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <p style={{ color: '#F87171', fontSize: '11px' }}>High: {data.max_temp}°C</p>
          <p style={{ color: '#38BDF8', fontSize: '11px' }}>Low: {data.min_temp}°C</p>
          {data.isHighRisk && (
            <p style={{ color: '#F87171', fontSize: '11px', marginTop: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertTriangle size={14} /> High Risk
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const WeatherIntel = ({ lat, lng }) => {
  const { data: weatherData, isLoading, isError, refetch } = useQuery({
    queryKey: ['weatherForecast', lat, lng],
    queryFn: () => fetchWeather(lat, lng),
    enabled: !!lat && !!lng,
    staleTime: 30 * 60 * 1000,     // Requirement: Update every 30 minutes
    refetchInterval: 30 * 60 * 1000 // Requirement: Update every 30 minutes
  });

  if (isLoading) {
    return (
      <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', height: '350px' }}>
         <h2 style={{ fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <Cloud size={20} color="#6366F1" /> 7-Day Weather Intel
        </h2>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {[...Array(6)].map((_, i) => (
             <div key={i} style={{ height: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', animation: 'pulse 1.5s infinite ease-in-out' }} />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '24px', border: '1px solid rgba(239, 68, 68, 0.2)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
        <AlertTriangle size={32} color="#EF4444" />
        <p style={{ fontSize: '14px', color: '#CBD5E1' }}>Meteorological Sensor Failure</p>
        <button onClick={() => refetch()} style={{ padding: '8px 16px', background: '#EF444422', color: '#EF4444', border: '1px solid #EF444444', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Retry Sync</button>
      </div>
    );
  }

  if (!weatherData) return null;

  return (
    <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Cloud size={20} color="#6366F1" /> 7-Day Weather Intel
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ fontSize: '10px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F87171' }}></div> High Risk
          </div>
          <div style={{ fontSize: '10px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34C759' }}></div> Safe
          </div>
        </div>
      </div>
      
      <div style={{ height: '200px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weatherData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 9 }} axisLine={false} tickLine={false} hide />
            <YAxis tick={{ fill: '#64748B', fontSize: 9 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="max_temp" stroke="#F87171" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#F87171' }} />
            <Line type="monotone" dataKey="min_temp" stroke="#38BDF8" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#38BDF8' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px' }}>
        {weatherData.map((day, i) => (
          <div key={i} style={{ 
            flexShrink: 0, 
            padding: '10px', 
            borderRadius: '12px', 
            background: day.isHighRisk ? 'rgba(239, 68, 68, 0.08)' : 'rgba(52, 197, 89, 0.08)',
            border: `1px solid ${day.isHighRisk ? 'rgba(239, 68, 68, 0.15)' : 'rgba(52, 197, 89, 0.15)'}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            minWidth: '65px'
          }}>
            <p style={{ fontSize: '9px', color: '#94A3B8', fontWeight: '500' }}>{day.date.split(',')[0]}</p>
            {day.isHighRisk ? <AlertTriangle size={14} color="#EF4444" /> : <CheckCircle2 size={14} color="#34C759" />}
            <p style={{ fontSize: '12px', fontWeight: '700', color: day.isHighRisk ? '#EF4444' : '#34C759' }}>
               {Math.round(day.max_temp)}°
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherIntel;

