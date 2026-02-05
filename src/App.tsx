import { useState, useEffect } from 'react';

export default function NewSkinApp() {
  // Estados
  const [isSyncing, setIsSyncing] = useState(true);
  const [syncProgress, setSyncProgress] = useState(0);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Olá! Sou a IA da King Urban. O que vamos ajustar hoje?' }
  ]);
  const [inputValue, setInputValue] = useState('');

  // Simulação de progresso
  useEffect(() => {
    if (syncProgress < 100) {
      const timer = setTimeout(() => setSyncProgress(prev => prev + 1), 80);
      return () => clearTimeout(timer);
    } else {
      setIsSyncing(false);
    }
  }, [syncProgress]);

  const actions = [
    { title: "💰 Preços", cmd: "Aumentar preços em 10%...", color: "#34A853", icon: "💰" },
    { title: "📝 Títulos", cmd: "Adicionar 'PROMO' nos títulos...", color: "#A142F4", icon: "📝" },
    { title: "📦 Estoque", cmd: "Zerar produtos sem foto...", color: "#24C1E0", icon: "📦" },
    { title: "🏷️ Tags", cmd: "Add tag 'Inverno'...", color: "#FA7B17", icon: "🏷️" },
  ];

  const handleSend = (text: string) => {
    if (!text) return;
    setMessages([...messages, { role: 'user', text }]);
    setInputValue('');
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: 'Entendido. Estou processando sua solicitação na base de dados...' }]);
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Inter', system-ui, sans-serif", backgroundColor: '#131314', color: '#E3E3E3' }}>
      
      {/* SIDEBAR ESCURA */}
      <aside style={{ width: '280px', backgroundColor: '#1E1F20', borderRight: '1px solid #444746', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ background: 'linear-gradient(90deg, #4285F4, #9B72CB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800', fontSize: '24px', marginBottom: '40px', letterSpacing: '-1px' }}>NewSkin Lab</h2>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ padding: '12px', backgroundColor: '#004A77', borderRadius: '50px', color: '#A8C7FA', fontWeight: '600', paddingLeft: '20px' }}>✨ Dashboard</div>
            <div style={{ padding: '12px', color: '#C4C7C5', cursor: 'pointer', paddingLeft: '20px' }}>📦 Produtos</div>
            <div style={{ padding: '12px', color: '#C4C7C5', cursor: 'pointer', paddingLeft: '20px' }}>📜 Histórico</div>
            <div style={{ padding: '12px', color: '#C4C7C5', cursor: 'pointer', paddingLeft: '20px' }}>⚙️ Configurações</div>
          </nav>

          {/* STATUS SINC DARK */}
          <div style={{ marginTop: '40px', padding: '16px', backgroundColor: '#282A2C', borderRadius: '16px', border: '1px solid #444746' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#C4C7C5', letterSpacing: '1px' }}>STATUS</span>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#A8C7FA' }}>{isSyncing ? 'SINCRONIZANDO...' : 'ONLINE'}</span>
            </div>
            <div style={{ width: '100%', height: '4px', backgroundColor: '#444746', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${syncProgress}%`, height: '100%', backgroundColor: syncProgress < 100 ? '#4285F4' : '#34A853', transition: 'width 0.3s' }}></div>
            </div>
            <p style={{ fontSize: '10px', color: '#8E918F', marginTop: '8px', textAlign: 'right' }}>
              {syncProgress}% Concluído
            </p>
          </div>
        </div>

        {/* RODAPÉ SIDEBAR */}
        <div style={{ borderTop: '1px solid #444746', paddingTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '35px', height: '35px', backgroundColor: '#A8C7FA', borderRadius: '50%', color: '#001D35', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>K</div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#E3E3E3' }}>King Urban</div>
              <div style={{ fontSize: '11px', color: '#C4C7C5' }}>Pro Plan</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        
        {/* CHAT AREA */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: '800px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: '30px', textAlign: m.role === 'user' ? 'right' : 'left' }}>
                <div style={{ fontSize: '12px', color: '#8E918F', marginBottom: '8px', marginLeft: '10px', marginRight: '10px' }}>
                    {m.role === 'ai' ? 'NewSkin AI ✨' : 'Você'}
                </div>
                <div style={{ 
                  display: 'inline-block', 
                  padding: '18px 24px', 
                  borderRadius: '24px', 
                  backgroundColor: m.role === 'user' ? '#282A2C' : 'transparent', 
                  color: '#E3E3E3', 
                  border: m.role === 'user' ? 'none' : 'none',
                  maxWidth: '85%',
                  lineHeight: '1.6',
                  fontSize: '16px'
                }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER ACTIONS E INPUT */}
        <div style={{ padding: '20px 40px 50px 40px', background: 'linear-gradient(to top, #131314 80%, transparent)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            
            {/* CARDS ESTILO GEMINI/HEXTOM */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
              {actions.map(a => (
                <button 
                  key={a.title} 
                  onClick={() => handleSend(a.cmd)}
                  style={{ 
                    padding: '16px', 
                    border: '1px solid #444746', 
                    borderRadius: '16px', 
                    backgroundColor: '#1E1F20', 
                    color: '#E3E3E3', 
                    cursor: 'pointer', 
                    textAlign: 'left',
                    transition: '0.2s',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#282A2C'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1E1F20'}
                >
                    <div style={{ fontSize: '18px', marginBottom: '8px' }}>{a.icon}</div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: a.color }}>{a.title}</div>
                </button>
              ))}
            </div>

            {/* INPUT FLUTUANTE */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend(inputValue)}
                placeholder="Pergunte à IA ou digite um comando..." 
                style={{ 
                    width: '100%', 
                    padding: '22px 25px', 
                    borderRadius: '100px', 
                    border: '1px solid #444746', 
                    backgroundColor: '#1E1F20',
                    color: '#E3E3E3',
                    outline: 'none', 
                    fontSize: '16px',
                    paddingRight: '60px'
                }} 
              />
              <button 
                onClick={() => handleSend(inputValue)}
                style={{ 
                    position: 'absolute', 
                    right: '10px', 
                    backgroundColor: '#E3E3E3', 
                    color: '#131314', 
                    border: 'none', 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                ➤
              </button>
            </div>
            <div style={{ textAlign: 'center', marginTop: '15px', color: '#8E918F', fontSize: '11px' }}>
                A IA pode cometer erros. Verifique informações importantes.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
