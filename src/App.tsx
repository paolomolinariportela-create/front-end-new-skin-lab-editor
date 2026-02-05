import React, { useState } from 'react';

export default function NewSkinApp() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Olá! Sou a IA do NewSkin Lab. O que vamos ajustar na sua loja hoje?' }
  ]);
  const [inputValue, setInputValue] = useState('');

  const actions = [
    { title: "💰 Preços", cmd: "Quero aumentar os preços em 10%...", color: "#34A853" },
    { title: "📝 Títulos", cmd: "Adicionar 'PROMO' nos títulos dos produtos...", color: "#673AB7" },
    { title: "📦 Estoque", cmd: "Zerar produtos que estão sem foto...", color: "#00A8E8" },
    { title: "🏷️ Tags", cmd: "Adicionar a tag 'Verão' na categoria Masculino...", color: "#FF9800" },
  ];

  const handleSend = (text: string) => {
    if (!text) return;
    setMessages([...messages, { role: 'user', text }]);
    setInputValue('');
    // Aqui no futuro ligaremos com o seu backend Python
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: 'Entendido! Analisando seus produtos na Nuvemshop para aplicar essa mudança...' }]);
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb' }}>
      
      {/* SIDEBAR LATERAL */}
      <aside style={{ width: '260px', backgroundColor: '#fff', borderRight: '1px solid #e5e7eb', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ color: '#2563eb', fontWeight: '800', fontSize: '22px', marginBottom: '40px', letterSpacing: '-1px' }}>NewSkin Lab</h2>
        
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ padding: '12px', backgroundColor: '#eff6ff', borderRadius: '10px', color: '#2563eb', fontWeight: '600', cursor: 'pointer' }}>🏠 Dashboard</div>
          <div style={{ padding: '12px', color: '#64748b', cursor: 'pointer' }}>📦 Editor de Produtos</div>
          <div style={{ padding: '12px', color: '#64748b', cursor: 'pointer' }}>📊 Histórico de IA</div>
          <div style={{ padding: '12px', color: '#64748b', cursor: 'pointer' }}>💳 Assinatura</div>
        </nav>

        <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>LOJA CONECTADA</div>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>King Urban 🤴</div>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        
        {/* CHAT LOG */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: '700px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: '24px', textAlign: m.role === 'user' ? 'right' : 'left' }}>
                <div style={{ 
                  display: 'inline-block', 
                  padding: '14px 20px', 
                  borderRadius: m.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px', 
                  backgroundColor: m.role === 'user' ? '#2563eb' : '#fff', 
                  color: m.role === 'user' ? '#fff' : '#1e293b', 
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  border: m.role === 'ai' ? '1px solid #e2e8f0' : 'none',
                  maxWidth: '80% line-height: 1.5'
                }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER: CARDS + INPUT */}
        <div style={{ padding: '20px 40px 40px 40px', background: 'linear-gradient(transparent, #f9fafb 20%)' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            
            {/* CARDS ESTILO HEXTOM */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
              {actions.map(a => (
                <button 
                  key={a.title} 
                  onClick={() => handleSend(a.cmd)}
                  style={{ 
                    padding: '12px', 
                    border: 'none', 
                    borderRadius: '12px', 
                    backgroundColor: a.color, 
                    color: '#fff', 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    fontSize: '13px',
                    transition: 'transform 0.1s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {a.title}
                </button>
              ))}
            </div>

            {/* BARRA DE INPUT ESTILO GEMINI */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend(inputValue)}
                placeholder="Dê uma ordem para a IA (Ex: Aumentar preços)..." 
                style={{ 
                  width: '100%', 
                  padding: '18px 25px', 
                  borderRadius: '100px', 
                  border: '1px solid #e2e8f0', 
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
                  outline: 'none',
                  fontSize: '16px'
                }} 
              />
              <button 
                onClick={() => handleSend(inputValue)}
                style={{ position: 'absolute', right: '10px', backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold' }}>
                Enviar
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
