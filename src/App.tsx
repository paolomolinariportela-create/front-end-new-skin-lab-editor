import { useState, useEffect } from 'react';

export default function NewSkinApp() {
  // Estados
  const [isSyncing, setIsSyncing] = useState(true);
  const [syncProgress, setSyncProgress] = useState(0);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Olá! Sou a IA da King Urban. Selecione uma ferramenta ao lado ou me peça algo aqui.' }
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

  // Cards baseados na imagem do Hextom (Cores e Funções)
  const hextomCards = [
    { title: "Inventory", desc: "Shipping & Stock", color: "#00BCD4", icon: "📦" }, // Cyan
    { title: "Price", desc: "Update prices", color: "#4CAF50", icon: "💲" }, // Green
    { title: "Compare At", desc: "Sales price", color: "#FF9800", icon: "⚖️" }, // Orange
    { title: "Tag", desc: "Manage tags", color: "#009688", icon: "🏷️" }, // Teal
    { title: "Title", desc: "SEO & Names", color: "#673AB7", icon: "📝" }, // Purple
    { title: "Description", desc: "HTML Content", color: "#9E9E9E", icon: "📄" }, // Grey
    { title: "Product Type", desc: "Categories", color: "#F44336", icon: "🗂️" }, // Red
    { title: "Vendor", desc: "Brands", color: "#FF5722", icon: "🏭" }, // Deep Orange
    { title: "Weight", desc: "Shipping calc", color: "#E91E63", icon: "⚖️" }, // Pink
    { title: "Variants", desc: "Options", color: "#2196F3", icon: "🔢" }, // Blue
    { title: "Availability", desc: "Visibility", color: "#FFC107", icon: "👁️" }, // Amber
    { title: "Template", desc: "Layouts", color: "#795548", icon: "📐" } // Brown
  ];

  const handleSend = (text: string) => {
    if (!text) return;
    setMessages([...messages, { role: 'user', text }]);
    setInputValue('');
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: `Entendido. Acessando o módulo "${text}" para processar sua solicitação...` }]);
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Inter', system-ui, sans-serif", backgroundColor: '#131314', color: '#E3E3E3', overflow: 'hidden' }}>
      
      {/* 1. COLUNA ESQUERDA (SIDEBAR) */}
      <aside style={{ width: '260px', minWidth: '260px', backgroundColor: '#1E1F20', borderRight: '1px solid #444746', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 10 }}>
        <div>
          <h2 style={{ background: 'linear-gradient(90deg, #4285F4, #9B72CB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800', fontSize: '24px', marginBottom: '40px', letterSpacing: '-1px' }}>NewSkin Lab</h2>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ padding: '12px', backgroundColor: '#004A77', borderRadius: '50px', color: '#A8C7FA', fontWeight: '600', paddingLeft: '20px' }}>✨ Dashboard</div>
            <div style={{ padding: '12px', color: '#C4C7C5', cursor: 'pointer', paddingLeft: '20px' }}>📦 Produtos</div>
            <div style={{ padding: '12px', color: '#C4C7C5', cursor: 'pointer', paddingLeft: '20px' }}>📜 Histórico</div>
            <div style={{ padding: '12px', color: '#C4C7C5', cursor: 'pointer', paddingLeft: '20px' }}>⚙️ Configurações</div>
          </nav>

          {/* STATUS SINC */}
          <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#282A2C', borderRadius: '16px', border: '1px solid #444746' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#C4C7C5', letterSpacing: '1px' }}>STATUS</span>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: isSyncing ? '#A8C7FA' : '#34A853', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isSyncing ? '' : <span style={{ width: '8px', height: '8px', backgroundColor: '#34A853', borderRadius: '50%', display: 'inline-block' }}></span>}
                {isSyncing ? 'SINCRONIZANDO...' : 'ONLINE'}
              </span>
            </div>
            
            <div style={{ width: '100%', height: '4px', backgroundColor: '#444746', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ width: `${syncProgress}%`, height: '100%', backgroundColor: syncProgress < 100 ? '#4285F4' : '#34A853', transition: 'width 0.3s' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #444746', paddingTop: '12px' }}>
                <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '10px', color: '#8E918F', marginBottom: '2px' }}>PRODUTOS</div>
                    <div style={{ fontSize: '13px', color: '#E3E3E3', fontWeight: 'bold' }}>1.250</div>
                </div>
                <div style={{ width: '1px', height: '20px', backgroundColor: '#444746' }}></div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: '#8E918F', marginBottom: '2px' }}>ATUALIZADO</div>
                    <div style={{ fontSize: '13px', color: '#E3E3E3', fontWeight: 'bold' }}>13:20</div>
                </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #444746', paddingTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '35px', height: '35px', backgroundColor: '#A8C7FA', borderRadius: '50%', color: '#001D35', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>K</div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#E3E3E3' }}>King Urban</div>
              <div style={{ fontSize: '11px', color: '#C4C7C5' }}>Pro Plan</div>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. COLUNA CENTRAL (CHAT E INPUT) */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', height: '100vh' }}>
        
        {/* Log do Chat */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: '700px' }}>
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
                  maxWidth: '80%',
                  lineHeight: '1.6',
                  fontSize: '16px'
                }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input Flutuante Central */}
        <div style={{ padding: '20px 40px 40px 40px', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', maxWidth: '700px' }}>
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend(inputValue)}
                placeholder="Pergunte à IA ou use os cards ao lado..." 
                style={{ 
                    width: '100%', 
                    padding: '22px 25px', 
                    borderRadius: '100px', 
                    border: '1px solid #444746', 
                    backgroundColor: '#1E1F20',
                    color: '#E3E3E3',
                    outline: 'none', 
                    fontSize: '16px',
                    paddingRight: '60px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
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
        </div>
      </main>

      {/* 3. COLUNA DIREITA (CARDS HEXTOM) */}
      <aside style={{ width: '340px', minWidth: '340px', backgroundColor: '#131314', borderLeft: '1px solid #444746', padding: '24px', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#C4C7C5', marginBottom: '20px', letterSpacing: '1px', textTransform: 'uppercase' }}>Ferramentas Bulk</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {hextomCards.map((card, index) => (
            <button 
              key={index}
              onClick={() => handleSend(`Abrir ferramenta: ${card.title}`)}
              style={{ 
                padding: '16px', 
                backgroundColor: '#1E1F20', 
                border: `1px solid ${card.color}40`, // Borda sutil com a cor do card
                borderRadius: '16px', 
                cursor: 'pointer', 
                textAlign: 'left',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#282A2C';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 4px 12px ${card.color}20`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#1E1F20';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Barra de cor superior estilo Hextom */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: card.color }}></div>
              
              <div style={{ fontSize: '24px' }}>{card.icon}</div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px', color: '#E3E3E3' }}>{card.title}</div>
                <div style={{ fontSize: '11px', color: '#8E918F' }}>{card.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </aside>

    </div>
  );
}
