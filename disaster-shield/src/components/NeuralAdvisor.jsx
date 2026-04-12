import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '../api-config';

const NeuralAdvisor = ({ riskData, user, disasterType }) => {
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState([
    { role: 'ai', text: `Neural Engine [Online]. I am Gemini, your dedicated safety advisor. Scanning ${user?.city || 'local sector'}... How can I assist your survival protocol today?`, time: 'System Ready' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

  const callGemini = async (userPrompt) => {
    // Hard-coded presentation defaults to prevent null-prop crashes
    const context = {
      city: user?.city || 'Local Area',
      disasterType: disasterType || 'flood',
      flood_risk: riskData?.flood_risk || 10,
      readiness_score: 92,
      floor: 2,
      supplies: 7,
      power: true,
      ac: false
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/user/ai-query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: userPrompt, context })
    });

    if (!response.ok) throw new Error("AI Engine Busy");
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

    } catch {
      setIsTyping(false);
      const errorMsg = "Neural Alert: The AI Engine is currently optimizing. Please follow local safety protocols.";
      setChat(prev => [...prev, { role: 'ai', text: errorMsg, time: 'System Trace' }]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'rgba(6,11,24,0.7)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
      <div style={{ padding: '20px', background: 'rgba(99,102,241,0.1)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Sparkles size={20} color="#818CF8" />
        <h3 style={{ fontSize: '14px', fontWeight: '700' }}>Neural Advisor</h3>
      </div>

      <div ref={scrollRef} style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {chat.map((msg, i) => (
          <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '90%' }}>
            <div style={{ 
              padding: '12px 16px', 
              borderRadius: '16px', 
              background: msg.role === 'user' ? '#6366F1' : 'rgba(255,255,255,0.05)',
              color: 'white',
              fontSize: '13px'
            }}>{msg.text}</div>
          </div>
        ))}
        {isTyping && <div style={{ color: '#6366F1', fontSize: '10px' }}>SCANNING...</div>}
      </div>

      <form onSubmit={handleQuery} style={{ padding: '16px', display: 'flex', gap: '8px' }}>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about your safety..."
          style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 16px', color: 'white', outline: 'none' }}
        />
        <button type="submit" style={{ background: '#6366F1', border: 'none', borderRadius: '12px', width: '40px', height: '40px', cursor: 'pointer', color: 'white' }}>Send</button>
      </form>
    </div>
  );
};

export default NeuralAdvisor;
