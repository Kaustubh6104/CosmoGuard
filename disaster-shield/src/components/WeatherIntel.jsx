import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { Cloud, AlertTriangle, CheckCircle2 } from 'lucide-react';

const fetchWeather = async (lat, lng) => {
  if (!lat || !lng) throw new Error("Location not available");
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
  );
  if (!response.ok) throw new Error('Failed to fetch weather data');
  const data = await response.json();
  
  // Format data for Recharts
  return data.daily.time.map((time, index) => {
    const maxTemp = data.daily.temperature_2m_max[index];
    const precipitation = data.daily.precipitation_sum[index];
    // Define high risk arbitrarily as > 35C OR heavy rain > 20mm
    const isHighRisk = maxTemp > 35 || precipitation > 20;

    return {
      date: new Date(time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
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
      <div style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>{label}</p>
        <p style={{ color: '#F87171', fontSize: '12px' }}>High: {data.max_temp}°C</p>
        <p style={{ color: '#38BDF8', fontSize: '12px' }}>Low: {data.min_temp}°C</p>
        {data.isHighRisk && (
          <p style={{ color: '#F87171', fontSize: '12px', marginTop: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertTriangle size={14} /> High Risk Conditions
          </p>
        )}
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
    refetchInterval: 30 * 60 * 1000, // 30 minutes
  });

  if (isLoading) {
    return (
      <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', height: '400px', display: 'flex', flexDirection: 'column' }}>
         <h2 style={{ fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <Cloud size={20} color="#6366F1" /> 7-Day Weather Intel
        </h2>
        {/* Skeleton lines */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
          {[...Array(5)].map((_, i) => (
             <div key={i} style={{ height: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out', width: `${Math.random() * 40 + 60}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '24px', border: '1px solid rgba(239, 68, 68, 0.2)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
        <AlertTriangle size={32} color="#EF4444" />
        <p>Failed to load weather intel.</p>
        <button onClick={() => refetch()} style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', cursor: 'pointer' }}>Retry</button>
      </div>
    );
  }

  if (!weatherData) return null;

  return (
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
      
      <div style={{ height: '250px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weatherData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="max_temp" stroke="#F87171" strokeWidth={3} dot={{ fill: '#F87171', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="min_temp" stroke="#38BDF8" strokeWidth={3} dot={{ fill: '#38BDF8', strokeWidth: 2, r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
        {weatherData.map((day, i) => (
          <div key={i} style={{ 
            flexShrink: 0, 
            padding: '12px', 
            borderRadius: '12px', 
            background: day.isHighRisk ? 'rgba(239, 68, 68, 0.1)' : 'rgba(52, 197, 89, 0.1)',
            border: `1px solid ${day.isHighRisk ? 'rgba(239, 68, 68, 0.2)' : 'rgba(52, 197, 89, 0.2)'}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px'
          }}>
            <p style={{ fontSize: '10px', color: '#94A3B8' }}>{day.date.split(',')[0]}</p>
            {day.isHighRisk ? <AlertTriangle size={16} color="#EF4444" /> : <CheckCircle2 size={16} color="#34C759" />}
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: day.isHighRisk ? '#EF4444' : '#34C759' }}>
               {day.max_temp}°
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherIntel;
