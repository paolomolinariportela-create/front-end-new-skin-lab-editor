import React, { useState, useEffect } from 'react';

export default function NewSkinApp() {
  // Estados Simulados (No futuro virão da sua API)
  const [isSyncing, setIsSyncing] = useState(true);
  const [syncProgress, setSyncProgress] = useState(0);
  const [totalProducts, setTotalProducts] = useState(1250);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Olá! Já estou mapeando sua loja. Enquanto isso, você já pode me dar ordens ou explorar as ferramentas abaixo.' }
  ]);
  const [inputValue, setInputValue] = useState('');

  // Simulação de progresso de sincronização
  useEffect(() => {
    if (syncProgress < 100) {
      const timer = setTimeout(() => setSyncProgress(prev => prev + 1), 100);
      return () => clearTimeout(timer);
    } else {
      setIsSyncing(false);
    }
  }, [syncProgress]);

  const actions = [
    { title: "💰 Preços", cmd: "Aumentar preços em 10%...", color: "#34A853" },
    { title: "📝 Títulos", cmd: "Adicionar 'PROMO' nos títulos...", color: "#673AB7" },
    { title: "📦 Estoque", cmd: "Zerar produtos sem foto...", color: "#00A8E8" },
    { title: "🏷️ Tags", cmd: "Add tag 'Inverno'...", color: "#FF9800" },
  ];

  const handleSend = (text: string) => {
    if (!text) return;
    setMessages([...messages, { role: 'user', text }]);
    setInputValue('');
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: 'Recebido! Vou processar essa alteração assim que a sincronização terminar.' }]);
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f3f4f6' }}>
      
      {/* SIDEBAR ESTILO GEMINI/DASHBOARD */}
      <aside style={{ width: '280px', backgroundColor: '#fff', borderRight: '1px solid #e5e7eb', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ color: '#2563eb', fontWeight: '800', fontSize: '22px', marginBottom: '30px', letterSpacing: '-1px' }}>NewSkin Lab</h2>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ padding: '12px', backgroundColor: '#eff6ff', borderRadius: '10px', color: '#2563eb', fontWeight: '600' }}>🏠 Dashboard</div>
            <div style={{ padding: '12px', color: '#64748b', cursor: 'pointer' }}>📦 Ver Produtos</div>
            <div style={{ padding: '12px', color: '#64748b', cursor: 'pointer' }}>📜 Histórico de IA</div>
            <div style={{ padding: '12px', color: '#64748b', cursor: 'pointer' }}>⚙️ Configurações</div>
          </nav>

          {/* STATUS DA SINCRONIZAÇÃO */}
          <div style={{ marginTop: '30px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>SINCRONIA</span>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#2563eb' }}>{syncProgress}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${syncProgress}%`, height: '100%', backgroundColor: '#2563eb', transition: 'width 0.3s' }}></div>
            </div>
            <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '8px' }}>
              {isSyncing ? `Mapeando ${totalProducts} itens...` : 'Loja 100% Sincronizada'}
            </p>
          </div>
        </div>

        {/* DADOS DA LOJA E PLANO (RODAPÉ DA SIDEBAR) */}
        <div style={{ borderTop: '1px solid #e5e7eb', pt: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '10px 0' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#2563eb', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>K</div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>King Urban 🤴</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>ID: 2938420</div>
            </div>
          </div>
          
          <div style={{ padding: '12px', backgroundColor: '#fff7ed', borderRadius: '8px', border: '1px solid #ffedd5' }}>
            <div style={{ fontSize: '11px', color: '#9a3412', fontWeight: 'bold', textTransform: 'uppercase' }}>Plano Atual</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', color: '#c2410c' }}>Gratuito</span>
              <button style={{ fontSize: '10px', backgroundColor: '#c2410c', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>UPGRADE</button>
            </div>
          </div>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* CHAT LOG */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: '750px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: '24px', textAlign: m.role === 'user' ? 'right' : 'left' }}>
                <div style={{ 
                  display: 'inline-block', 
                  padding: '16px 20px', 
                  borderRadius: m.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px', 
                  backgroundColor: m.role === 'user' ? '#2563eb' : '#fff', 
                  color: m.role === 'user' ? '#fff' : '#1e293b', 
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  border: m.role === 'ai' ? '1px solid #e2e8f0' : 'none',
                  maxWidth: '85%'
                }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ padding: '20px 40px 40px 40px' }}>
          <div style={{ maxWidth: '750px', margin: '0 auto' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
              {actions.map(a => (
                <button 
                  key={a.title} 
                  onClick={() => handleSend(a.cmd)}
                  style={{ padding: '12px', border: 'none', borderRadius: '12px', backgroundColor: a.color, color: '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                  {a.title}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend(inputValue)}
                placeholder="Ex: Aumentar preço dos moletons em 5%..." 
                style={{ width: '100%', padding: '20px 25px', borderRadius: '100px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', outline: 'none', fontSize: '16px' }} 
              />
              <button 
                onClick={() => handleSend(inputValue)}
                style={{ position: 'absolute', right: '10px', backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold' }}>
                Enviar
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
