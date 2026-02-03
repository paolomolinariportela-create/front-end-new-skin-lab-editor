import React, { useState } from 'react';

const App = () => {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f8f9fa', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar - Menu Lateral */}
      <div style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #e0e0e0', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '30px', color: '#1a73e8' }}>King Urban 🤴</h2>
        
        <nav style={{ flex: 1 }}>
          <button onClick={() => setActiveTab('products')} style={navButtonStyle(activeTab === 'products')}>📦 Produtos</button>
          <button onClick={() => setActiveTab('stock')} style={navButtonStyle(activeTab === 'stock')}>📉 Estoque</button>
          <button onClick={() => setActiveTab('ia')} style={navButtonStyle(activeTab === 'ia')}>✨ IA Assistant</button>
        </nav>

        <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <button style={navButtonStyle(false)}>⚙️ Configurações</button>
          <button style={{ ...navButtonStyle(false), color: '#d93025' }}>🚪 Sair</button>
        </div>
      </div>

      {/* Main Content - Área Central */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px' }}>
        <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '20px', overflowY: 'auto' }}>
          {activeTab === 'products' && (
            <div>
              <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Editor de Produtos</h1>
              <p>Aqui aparecerá a sua lista de produtos da Nuvemshop...</p>
              {/* Tabela de produtos entrará aqui */}
            </div>
          )}
          {activeTab === 'ia' && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#5f6368' }}>
              <h2>Como posso ajudar a editar sua loja hoje?</h2>
              <p>Digite um comando abaixo para fazer alterações em lote.</p>
            </div>
          )}
        </div>

        {/* Input Estilo Gemini (Barra de Comando) */}
        <div style={{ marginTop: '20px', position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Ex: Aumentar preço de todos os bonés em R$ 10..."
            style={{ width: '100%', padding: '18px 25px', borderRadius: '30px', border: '1px solid #dfe1e5', fontSize: '16px', outline: 'none', boxShadow: '0 1px 6px rgba(32,33,36,0.28)' }}
          />
          <button style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: '#1a73e8', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer' }}>Enviar</button>
        </div>
      </div>
    </div>
  );
};

const navButtonStyle = (active: boolean) => ({
  width: '100%',
  textAlign: 'left' as const,
  padding: '12px 15px',
  marginBottom: '5px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: active ? '#e8f0fe' : 'transparent',
  color: active ? '#1a73e8' : '#3c4043',
  fontSize: '15px',
  fontWeight: active ? '600' : '400',
  cursor: 'pointer',
  transition: '0.2s'
});

export default App;
