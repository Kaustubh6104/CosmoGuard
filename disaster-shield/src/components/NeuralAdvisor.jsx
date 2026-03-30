import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { API_BASE_URL, GEMINI_API_KEY, GEMINI_MODEL } from '../api-config';

const NeuralAdvisor = ({ riskData, user, disasterType }) => {
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState([
    { role: 'ai', text: `Neural Engine [Online]. I am Gemini, your dedicated safety advisor. Scanning ${user?.city || 'local sector'}... How can I assist your survival protocol today?`, time: 'System Ready' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [surveyData, setSurveyData] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('disaster_readiness');
      if (saved) setSurveyData(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to parse survey data", e);
    }
  }, [riskData]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

  const callGemini = async (userPrompt) => {
    const floodVal = riskData?.flood_risk || 0;
    const droughtVal = riskData?.drought_risk || 0;
    const flr = surveyData?.floor || 0;
    const sup = surveyData?.supplies_days || 0;
    const pwr = surveyData?.has_power_backup || false;
    const ac = surveyData?.has_ac || false;
    
    const score = Math.min(100, (flr > 1 ? 40 : 10) + (sup * 10) + (pwr ? 20 : 0) + (ac ? 10 : 0));

    const response = await fetch(`${API_BASE_URL}/api/v1/user/ai-query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: userPrompt,
        context: {
          city: user?.city,
          disasterType: disasterType,
          flood_risk: floodVal,
          drought_risk: droughtVal,
          readiness_score: score,
          floor: surveyData?.floor,
          supplies: surveyData?.supplies_days,
          power: surveyData?.has_power_backup,
          ac: surveyData?.has_ac
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "BACKEND_ERROR");
    }
    const data = await response.json();
    return data.advice;
  };

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = { role: 'user', text: query, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChat(prev => [...prev, userMsg]);
    const currentQuery = query;
    setQuery('');
    
    setIsTyping(true);

    try {
      const aiResponse = await callGemini(currentQuery);
      setIsTyping(false);

      // Streaming implementation - word by word for premium feel
      const words = aiResponse.split(' ');
      let currentWord = 0;
      
      const streamId = setInterval(() => {
        if (currentWord < words.length) {
          const nextText = words.slice(0, currentWord + 1).join(' ');
          setChat(prev => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'ai_streaming') {
              return [...prev.slice(0, -1), { role: 'ai_streaming', text: nextText, time: 'Now' }];
            }
            return [...prev, { role: 'ai_streaming', text: nextText, time: 'Now' }];
          });
          currentWord++;
        } else {
          clearInterval(streamId);
          setChat(prev => [...prev.slice(0, -1), { role: 'ai', text: aiResponse, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        }
      }, 30);

    } catch (err) {
      console.error("Gemini Error:", err);
      setIsTyping(false);
      
      let errorMsg = `Neural Alert: The AI Engine returned an error [${err.message}]. This usually happens if the API key is restricted or the model is busy.`;
      
      if (err.message.includes("Gemini API Error")) {
        errorMsg = `Gemini API Error: ${err.message}. Please check your Key in the backend config.`;
      }

      setChat(prev => [...prev, { role: 'ai', text: errorMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      background: 'rgba(6,11,24,0.7)', 
      borderRadius: '24px', 
      border: '1px solid rgba(255,255,255,0.08)',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(99, 102, 241, 0.1)'
    }}>
      <div style={{ padding: '20px', background: 'linear-gradient(90deg, rgba(99,102,241,0.15) 0%, rgba(167,139,250,0.15) 100%)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #4285F4, #9B72CB, #D96570)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={20} color="white" />
          </div>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '700', letterSpacing: '0.5px' }}>Neural Advisor</h3>
            <p style={{ fontSize: '10px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', background: '#34C759', borderRadius: '50%' }}></span> Gemini Ultra Live
            </p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {chat.map((msg, i) => (
          <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '90%' }}>
            <div style={{ 
              padding: '12px 16px', 
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', 
              background: msg.role === 'user' ? 'linear-gradient(135deg, #6366F1, #818CF8)' : 'rgba(255,255,255,0.05)',
              border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '13px',
              lineHeight: '1.5'
            }}>{msg.text}</div>
            <p style={{ fontSize: '9px', color: '#475569', marginTop: '4px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>{msg.time}</p>
          </div>
        ))}
        {isTyping && <div style={{ color: '#6366F1', fontSize: '10px', letterSpacing: '2px', fontWeight: 'bold' }}>SCANNING DATA...</div>}
      </div>

      <form onSubmit={handleQuery} style={{ padding: '16px', display: 'flex', gap: '8px' }}>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about your safety..."
          style={{ 
            flex: 1, 
            background: 'rgba(255,255,255,0.03)', 
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '12px', 
            padding: '10px 16px', 
            color: 'white',
            outline: 'none',
            fontSize: '13px'
          }}
        />
        <button type="submit" style={{ background: '#6366F1', border: 'none', borderRadius: '12px', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Send size={18} color="white" />
        </button>
      </form>
    </div>
  );
};

export default NeuralAdvisor;
