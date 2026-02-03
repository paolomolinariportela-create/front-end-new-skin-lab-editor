import React, { useState } from 'react';

const App = () => {
  const [view, setView] = useState('dashboard'); // dashboard, products, billing, settings

  // Função para renderizar o conteúdo dinâmico
  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return (
          <div style={contentFadeIn}>
            <h1 style={titleStyle}>Olá, King Urban 🤴</h1>
            <p style={subtitleStyle}>O que vamos otimizar na sua loja hoje?</p>
            <div style={statsGrid}>
              <div style={statCard}><h3>1.240</h3><p>Produtos Ativos</p></div>
              <div style={statCard}><h3>15</h3><p>Sincronizações hoje</p></div>
              <div style={statCard}><h3>R$ 45k</h3><p>Valor em estoque</p></div>
            </div>
          </div>
        );
      case 'billing':
        return (
          <div style={contentFadeIn}>
            <h1 style={titleStyle}>Assinatura e Planos</h1>
            <div style={planCard}>
              <h3>Plano Pro - R$ 89,90/mês</h3>
              <p>Status: <span style={{color: '#34a853'}}>Ativo</span></p>
              <button style={actionButton}>Gerenciar Pagamento</button>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div style={contentFadeIn}>
            <h1 style={titleStyle}>Configurações da Conta</h1>
            <div style={formGroup}>
              <label>Link da Loja</label>
              <input style={inputStyle} defaultValue="kingurban.nuvemshop.com.br" />
              <button style={actionButton}>Salvar Alterações</button>
            </div>
          </div>
        );
      default:
        return <div>Em breve...</div>;
    }
  };

  return (
    <div style={containerStyle}>
      {/* SIDEBAR */}
      <aside style={sidebarStyle}>
        <div>
          <h2 style={logoStyle}>NewSkin Lab</h2>
          <nav>
            <button onClick={() => setView('dashboard')} style={navItem(view === 'dashboard')}>🏠 Início</button>
            <button onClick={() => setView('products')} style={navItem(view === 'products')}>📦 Editor de Lote</button>
            <button onClick={() => setView('billing')} style={navItem(view === 'billing')}>💳 Assinatura</button>
            <button onClick={() => setView('settings')} style={navItem(view === 'settings')}>⚙️ Configurações</button>
          </nav>
        </div>
        <div style={userSection}>
          <div style={avatarStyle}>KU</div>
          <span>King Urban</span>
        </div>
      </aside>

      {/* MAIN AREA */}
      <main style={mainStyle}>
        <div style={contentArea}>
          {renderContent()}
        </div>

        {/* BARRA DE COMANDO ESTILO GEMINI */}
        <div style={commandBarContainer}>
          <div style={commandBar}>
            <input 
              type="text" 
              placeholder="Digite um comando para a IA (ex: 'Baixar estoque em 5 unidades')" 
              style={commandInput} 
            />
            <button style={sendButton}>🚀</button>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- ESTILOS (CSS-in-JS) ---

const containerStyle: React.CSSProperties = { display: 'flex', height: '100vh', backgroundColor: '#F0F2F5', color: '#1F1F1F' };
const sidebarStyle: React.CSSProperties = { width: '280px', backgroundColor: '#FFFFFF', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid #E0E0E0' };
const logoStyle: React.CSSProperties = { fontSize: '22px', fontWeight: 'bold', marginBottom: '40px', color: '#1A73E8' };
const navItem = (active: boolean): React.CSSProperties => ({
  width: '100%', textAlign: 'left', padding: '14px 18px', marginBottom: '8px', borderRadius: '12px', border: 'none', cursor: 'pointer',
  backgroundColor: active ? '#E8F0FE' : 'transparent', color: active ? '#1A73E8' : '#444746', fontWeight: active ? '600' : '500', transition: '0.3s'
});
const mainStyle: React.CSSProperties = { flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' };
const contentArea: React.CSSProperties = { flex: 1, padding: '60px 80px', overflowY: 'auto' };
const titleStyle: React.CSSProperties = { fontSize: '32px', marginBottom: '8px', fontWeight: '500' };
const subtitleStyle: React.CSSProperties = { fontSize: '18px', color: '#5F6368', marginBottom: '40px' };
const statsGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' };
const statCard: React.CSSProperties = { backgroundColor: '#FFF', padding: '24px', borderRadius: '16px', border: '1px solid #E0E0E0' };
const commandBarContainer: React.CSSProperties = { padding: '20px 80px 40px 80px' };
const commandBar: React.CSSProperties = { display: 'flex', backgroundColor: '#FFF', borderRadius: '32px', padding: '8px 16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #E0E0E0' };
const commandInput: React.CSSProperties = { flex: 1, border: 'none', padding: '12px', outline: 'none', fontSize: '16px' };
const sendButton: React.CSSProperties = { backgroundColor: '#1A73E8', color: '#FFF', border: 'none', padding: '10px 20px', borderRadius: '24px', cursor: 'pointer' };
const contentFadeIn: React.CSSProperties = { animation: 'fadeIn 0.5s ease' };
const userSection: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '20px', borderTop: '1px solid #EEE' };
const avatarStyle: React.CSSProperties = { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1A73E8', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' };
const planCard: React.CSSProperties = { backgroundColor: '#FFF', padding: '30px', borderRadius: '20px', border: '2px solid #1A73E8' };
const actionButton: React.CSSProperties = { marginTop: '20px', padding: '12px 24px', backgroundColor: '#1A73E8', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer' };
const formGroup: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' };
const inputStyle: React.CSSProperties = { padding: '12px', borderRadius: '8px', border: '1px solid #CCC' };

export default App;
