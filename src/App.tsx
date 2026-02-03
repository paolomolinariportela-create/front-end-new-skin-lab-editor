import React, { useState } from 'react';

const App = () => {
  const [view, setView] = useState('dashboard'); // Estado que controla o que aparece na tela

  // Renderizador de Telas
  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return (
          <div style={fadeIn}>
            <h1 style={h1Style}>Dashboard Geral</h1>
            <p style={pStyle}>Bem-vindo ao NewSkin Lab. Veja o resumo da sua operação.</p>
            <div style={grid3}>
              <div style={cardStyle}><h4>Total de Vendas</h4><p style={statStyle}>R$ 12.450</p></div>
              <div style={cardStyle}><h4>Sincronizações</h4><p style={statStyle}>142</p></div>
              <div style={cardStyle}><h4>Saúde do Inventário</h4><p style={statStyle}>98%</p></div>
            </div>
          </div>
        );
      case 'editor':
        return (
          <div style={fadeIn}>
            <h1 style={h1Style}>Editor de Lote</h1>
            <p style={pStyle}>Edite centenas de produtos simultaneamente com rapidez.</p>
            <div style={tableContainer}>
              <table style={tableStyle}>
                <thead>
                  <tr style={thRowStyle}>
                    <th>Produto</th>
                    <th>Preço Atual</th>
                    <th>Novo Preço</th>
                    <th>Estoque</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} style={tdRowStyle}>
                      <td>Produto Exemplo #{i}</td>
                      <td>R$ 99,90</td>
                      <td><input type="text" placeholder="R$ 0,00" style={miniInput} /></td>
                      <td>45 unidades</td>
                      <td><button style={btnTable}>Atualizar</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'billing':
        return (
          <div style={fadeIn}>
            <h1 style={h1Style}>Planos e Faturamento</h1>
            <div style={grid2}>
              <div style={planCard(false)}>
                <h3>Plano Básico</h3>
                <h2>R$ 49,90/mês</h2>
                <button style={btnSecondary}>Mudar de Plano</button>
              </div>
              <div style={planCard(true)}>
                <div style={popularBadge}>MAIS USADO</div>
                <h3>Plano Pro (IA)</h3>
                <h2>R$ 89,90/mês</h2>
                <button style={btnPrimary}>Assinar Agora</button>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div style={fadeIn}>
            <h1 style={h1Style}>Configurações</h1>
            <div style={cardStyle}>
              <h3>Conexões de Plataforma</h3>
              <p>Nuvemshop: <span style={{color: 'green'}}>● Conectado</span></p>
              <p>Loja Integrada: <span style={{color: 'gray'}}>○ Desconectado</span></p>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div style={appContainer}>
      {/* SIDEBAR ESTILO GEMINI/SaaS MODERNO */}
      <aside style={sidebarStyle}>
        <div>
          <div style={logoArea}>NewSkin Lab</div>
          <nav>
            <button onClick={() => setView('dashboard')} style={navBtn(view === 'dashboard')}>🏠 Dashboard</button>
            <button onClick={() => setView('editor')} style={navBtn(view === 'editor')}>📦 Editor de Lote</button>
            <button onClick={() => setView('billing')} style={navBtn(view === 'billing')}>💳 Assinatura</button>
            <button onClick={() => setView('settings')} style={navBtn(view === 'settings')}>⚙️ Configurações</button>
          </nav>
        </div>
        <div style={userCard}>
          <div style={avatar}>KU</div>
          <div><strong>King Urban</strong><br/><small>Store ID: 6913785</small></div>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO */}
      <main style={mainContent}>
        <section style={viewWrapper}>{renderView()}</section>

        {/* INPUT DE IA (GEMINI STYLE) */}
        <div style={inputArea}>
          <div style={iaBar}>
            <input type="text" placeholder="Peça para a IA: 'Aumentar 10% de todos os preços'..." style={iaInput} />
            <button style={iaBtn}>✨ Enviar</button>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- SISTEMA DE DESIGN (CSS-in-JS) ---
const appContainer: React.CSSProperties = { display: 'flex', height: '100vh', fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: '#fcfcfc' };
const sidebarStyle: React.CSSProperties = { width: '280px', borderRight: '1px solid #eee', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#fff' };
const logoArea: React.CSSProperties = { fontSize: '22px', fontWeight: 'bold', color: '#1a73e8', marginBottom: '40px' };
const navBtn = (active: boolean): React.CSSProperties => ({
  width: '100%', padding: '12px 16px', borderRadius: '10px', border: 'none', textAlign: 'left', marginBottom: '8px', cursor: 'pointer',
  backgroundColor: active ? '#e8f0fe' : 'transparent', color: active ? '#1a73e8' : '#444', fontWeight: active ? '600' : '400', transition: '0.2s'
});
const mainContent: React.CSSProperties = { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' };
const viewWrapper: React.CSSProperties = { flex: 1, padding: '40px 60px', overflowY: 'auto' };
const h1Style: React.CSSProperties = { fontSize: '28px', marginBottom: '10px' };
const pStyle: React.CSSProperties = { color: '#666', marginBottom: '30px' };
const cardStyle: React.CSSProperties = { backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' };
const grid3: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' };
const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' };
const statStyle: React.CSSProperties = { fontSize: '24px', fontWeight: 'bold', marginTop: '10px' };
const inputArea: React.CSSProperties = { padding: '20px 60px 40px' };
const iaBar: React.CSSProperties = { display: 'flex', backgroundColor: '#fff', padding: '10px', borderRadius: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #eee' };
const iaInput: React.CSSProperties = { flex: 1, border: 'none', padding: '10px 20px', outline: 'none', fontSize: '16px' };
const iaBtn: React.CSSProperties = { backgroundColor: '#1a73e8', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer' };
const tableContainer: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #eee', overflow: 'hidden' };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const thRowStyle: React.CSSProperties = { backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee' };
const tdRowStyle: React.CSSProperties = { borderBottom: '1px solid #f0f0f0' };
const miniInput: React.CSSProperties = { padding: '6px', borderRadius: '6px', border: '1px solid #ddd', width: '80px' };
const btnTable: React.CSSProperties = { padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#1a73e8', color: '#fff', cursor: 'pointer' };
const fadeIn = { animation: 'fadeIn 0.4s ease-in-out' };
const userCard: React.CSSProperties = { display: 'flex', gap: '12px', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '20px' };
const avatar: React.CSSProperties = { width: '40px', height: '40px', backgroundColor: '#1a73e8', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' };
const planCard = (pop: boolean): React.CSSProperties => ({ padding: '30px', borderRadius: '20px', border: pop ? '2px solid #1a73e8' : '1px solid #eee', position: 'relative', backgroundColor: '#fff' });
const popularBadge: React.CSSProperties = { position: 'absolute', top: '-12px', right: '20px', backgroundColor: '#1a73e8', color: '#fff', padding: '4px 12px', borderRadius: '10px', fontSize: '12px' };
const btnPrimary: React.CSSProperties = { width: '100%', padding: '12px', backgroundColor: '#1a73e8', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', marginTop: '20px' };
const btnSecondary: React.CSSProperties = { width: '100%', padding: '12px', backgroundColor: '#f1f3f4', color: '#444', border: 'none', borderRadius: '10px', cursor: 'pointer', marginTop: '20px' };

export default App;
