import { useState, useEffect } from 'react';

// ==========================================
// CONFIGURAÇÃO
// ==========================================
const BACKEND_URL = "https://web-production-4b8a.up.railway.app"; 

// Definição dos Cards (Cores vibrantes estilo Hextom)
const HEXTOM_CARDS = [
    { id: 'price', title: "Price", desc: "Update prices, sales", color: "#43A047", icon: "💲" }, // Verde
    { id: 'compare', title: "Compare At", desc: "Manage sales price", color: "#FB8C00", icon: "⚖️" }, // Laranja
    { id: 'inventory', title: "Inventory", desc: "Shipping & Stock", color: "#00ACC1", icon: "📦" }, // Ciano
    { id: 'tag', title: "Tag", desc: "Manage tags", color: "#00897B", icon: "🏷️" }, // Teal
    { id: 'title', title: "Title", desc: "SEO & Names", color: "#5E35B1", icon: "📝" }, // Roxo
    { id: 'desc', title: "Description", desc: "HTML Content", color: "#757575", icon: "📄" }, // Cinza
    { id: 'type', title: "Product Type", desc: "Categories", color: "#E53935", icon: "🗂️" }, // Vermelho
    { id: 'vendor', title: "Vendor", desc: "Brands", color: "#F4511E", icon: "🏭" }, // Laranja Escuro
    { id: 'weight', title: "Weight", desc: "Shipping calc", color: "#D81B60", icon: "⚖️" }, // Rosa
    { id: 'variants', title: "Variants", desc: "Options", color: "#1E88E5", icon: "🔢" }, // Azul
    { id: 'availability', title: "Availability", desc: "Visibility", color: "#FDD835", icon: "👁️", textColor: '#333' }, // Amarelo
    { id: 'template', title: "Template", desc: "Layouts", color: "#6D4C41", icon: "📐" } // Marrom
];

export default function NewSkinApp() {
  // --- ESTADOS ---
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'editor', 'history', 'products'
  const [selectedTool, setSelectedTool] = useState<any>(null); // Qual card foi clicado?
  
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeStats, setStoreStats] = useState({ name: 'Carregando...', products: 0 });
  const [isSyncing, setIsSyncing] = useState(true);
  
  // Estados do Editor (Wizard)
  const [filterName, setFilterName] = useState('');
  const [actionOperation, setActionOperation] = useState('increase');
  const [actionValue, setActionValue] = useState('');
  const [actionUnit, setActionUnit] = useState('percentage');
  const [isProcessing, setIsProcessing] = useState(false);

  // Lista de Produtos (Tabela)
  const [productsList, setProductsList] = useState<any[]>([]);

  // --- INICIALIZAÇÃO ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('store_id');
    if (id) {
      setStoreId(id);
      checkStoreStatus(id);
    }
  }, []);

  const checkStoreStatus = (id: string) => {
      fetch(`${BACKEND_URL}/admin/status/${id}`)
        .then(res => res.json())
        .then(data => {
            setStoreStats({ name: data.loja_nome || `Loja ${id}`, products: data.total_produtos_banco || 0 });
            if (data.ultimo_erro === "SYNC_CONCLUIDO") setIsSyncing(false);
            else fetch(`${BACKEND_URL}/sync?store_id=${id}`, { method: 'POST' });
        });
  };

  const fetchProducts = async () => {
    if(!storeId) return;
    const res = await fetch(`${BACKEND_URL}/products/${storeId}?limit=50`);
    const data = await res.json();
    setProductsList(data);
  };

  // --- NAVEGAÇÃO ---
  const handleCardClick = (tool: any) => {
      setSelectedTool(tool);
      setActiveView('editor');
      // Resetar formulário
      setFilterName('');
      setActionValue('');
  };

  const handleBack = () => {
      setActiveView('dashboard');
      setSelectedTool(null);
  };

  // --- EXECUÇÃO (SEM IA) ---
  const handleExecute = async () => {
      if (!storeId || !selectedTool) return;
      if (!actionValue) return alert("Por favor, digite um valor.");

      setIsProcessing(true);

      // Mapeia a lógica do formulário visual para o comando do backend
      let toolType = 'update_price';
      let params: any = { search_term: filterName };

      // Se for a ferramenta de "Compare At" ou modo Promoção
      if (selectedTool.id === 'compare' || (selectedTool.id === 'price' && actionOperation === 'sale')) {
          toolType = 'apply_sale';
          params = {
              ...params,
              mode: 'sale',
              discount_value: parseFloat(actionValue),
              discount_type: actionUnit
          };
      } else {
          // Modo Padrão (Preço)
          toolType = 'update_price';
          params = {
              ...params,
              operation: actionOperation,
              value: parseFloat(actionValue),
              type: actionUnit
          };
      }

      try {
          const response = await fetch(`${BACKEND_URL}/execute_tool`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ store_id: storeId, tool_type: toolType, params: params })
          });

          if (response.ok) {
              alert("✅ Tarefa iniciada com sucesso!");
              setActiveView('history'); // Vai para o histórico ver o progresso
          } else {
              alert("❌ Erro ao iniciar tarefa.");
          }
      } catch (e) {
          alert("Erro de conexão.");
      } finally {
          setIsProcessing(false);
      }
  };

  // ==========================================
  // COMPONENTES DE PÁGINA
  // ==========================================

  // 1. DASHBOARD (GRID DE CARDS)
  const DashboardView = () => (
      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '30px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>Ferramentas de Edição em Massa</h1>
              <p style={{ color: '#666' }}>Selecione uma ferramenta para começar a editar seus {storeStats.products} produtos.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {HEXTOM_CARDS.map((card) => (
                  <div 
                    key={card.id} 
                    onClick={() => handleCardClick(card)}
                    style={{ 
                        backgroundColor: card.color, 
                        color: card.textColor || 'white',
                        borderRadius: '8px', 
                        padding: '25px', 
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s',
                        minHeight: '160px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '28px' }}>{card.icon}</span>
                          <span style={{ opacity: 0.8, fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Editar</span>
                      </div>
                      <div>
                          <h3 style={{ margin: '10px 0 5px 0', fontSize: '18px' }}>{card.title}</h3>
                          <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>{card.desc}</p>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  // 2. EDITOR (WIZARD STEP-BY-STEP)
  const EditorView = () => {
      // Se não for ferramenta de preço, mostra aviso
      if (selectedTool.id !== 'price' && selectedTool.id !== 'compare') {
          return (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                  <h2>🚧 Em desenvolvimento</h2>
                  <p>A ferramenta {selectedTool.title} estará disponível em breve.</p>
                  <button onClick={handleBack} style={{ marginTop: '20px', padding: '10px 20px' }}>Voltar</button>
              </div>
          );
      }

      return (
          <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                  <button onClick={handleBack} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}>⬅</button>
                  <div style={{ width: '40px', height: '40px', borderRadius: '5px', backgroundColor: selectedTool.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{selectedTool.icon}</div>
                  <h1 style={{ margin: 0, fontSize: '22px', color: '#333' }}>Editar {selectedTool.title}</h1>
              </div>

              {/* Step 1: Filtro */}
              <div style={cardStyle}>
                  <div style={cardHeaderStyle}>
                      <span style={{ fontWeight: 'bold', color: '#333' }}>PASSO 1:</span> Filtrar Produtos
                  </div>
                  <div style={{ padding: '20px' }}>
                      <label style={labelStyle}>Título do produto contém:</label>
                      <input 
                          type="text" 
                          value={filterName} 
                          onChange={e => setFilterName(e.target.value)} 
                          placeholder="Ex: Camiseta (Deixe vazio para editar TODOS)"
                          style={inputStyle} 
                      />
                      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                          {filterName ? `Editando produtos com "${filterName}" no nome.` : `Editando TODOS os ${storeStats.products} produtos da loja.`}
                      </div>
                  </div>
              </div>

              {/* Step 2: Ação */}
              <div style={cardStyle}>
                  <div style={cardHeaderStyle}>
                      <span style={{ fontWeight: 'bold', color: '#333' }}>PASSO 2:</span> Configurar Alteração
                  </div>
                  <div style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                          <div style={{ flex: 1 }}>
                              <label style={labelStyle}>Ação</label>
                              <select value={actionOperation} onChange={e => setActionOperation(e.target.value)} style={inputStyle}>
                                  <option value="increase">Aumentar Preço (+)</option>
                                  <option value="decrease">Diminuir Preço (-)</option>
                                  <option value="sale">Criar Promoção (De/Por)</option>
                                  <option value="set_fixed">Definir Valor Fixo (=)</option>
                              </select>
                          </div>
                          <div style={{ flex: 1 }}>
                              <label style={labelStyle}>Valor</label>
                              <input type="number" value={actionValue} onChange={e => setActionValue(e.target.value)} placeholder="10" style={inputStyle} />
                          </div>
                          <div style={{ flex: 1 }}>
                              <label style={labelStyle}>Unidade</label>
                              <select value={actionUnit} onChange={e => setActionUnit(e.target.value)} style={inputStyle}>
                                  <option value="percentage">% (Porcentagem)</option>
                                  <option value="fixed">R$ (Reais)</option>
                              </select>
                          </div>
                      </div>
                      
                      {actionOperation === 'sale' && (
                          <div style={{ marginTop: '15px', padding: '15px', background: '#e3f2fd', borderRadius: '4px', color: '#0d47a1', fontSize: '13px' }}>
                              ℹ️ <b>Modo Promoção:</b> O preço atual será movido para "Preço Original" (De) e o novo preço com desconto será aplicado no "Preço de Venda" (Por).
                          </div>
                      )}
                  </div>
              </div>

              {/* Botão Final */}
              <div style={{ textAlign: 'right' }}>
                  <button 
                      onClick={handleExecute}
                      disabled={isProcessing}
                      style={{ 
                          backgroundColor: selectedTool.color, 
                          color: 'white', 
                          padding: '15px 40px', 
                          fontSize: '16px', 
                          fontWeight: 'bold', 
                          border: 'none', 
                          borderRadius: '6px', 
                          cursor: isProcessing ? 'wait' : 'pointer',
                          opacity: isProcessing ? 0.7 : 1,
                          boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                      }}>
                      {isProcessing ? 'Processando...' : 'INICIAR EDIÇÃO EM MASSA'}
                  </button>
              </div>
          </div>
      );
  };

  // 3. HISTÓRICO (TASKS)
  const HistoryView = () => (
      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '20px' }}>Histórico de Tarefas</h1>
          <div style={cardStyle}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                      <tr>
                          <th style={thStyle}>Data</th>
                          <th style={thStyle}>Status</th>
                          <th style={thStyle}>Detalhes</th>
                      </tr>
                  </thead>
                  <tbody>
                      {/* Simulação - Futuramente virá do banco */}
                      <tr>
                          <td style={tdStyle}>Agora</td>
                          <td style={tdStyle}><span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>RODANDO</span></td>
                          <td style={tdStyle}>Atualização de Preço iniciada...</td>
                      </tr>
                  </tbody>
              </table>
          </div>
          <button onClick={() => setActiveView('dashboard')} style={{ marginTop: '20px', padding: '10px 20px' }}>Voltar ao Dashboard</button>
      </div>
  );

  // ==========================================
  // RENDERIZAÇÃO PRINCIPAL
  // ==========================================
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', Roboto, sans-serif", backgroundColor: '#f6f6f7', color: '#333' }}>
        
        {/* SIDEBAR ESCURA */}
        <aside style={{ width: '240px', backgroundColor: '#1c222b', color: '#fff', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #2d3642' }}>
                <h2 style={{ margin: 0, fontSize: '18px', background: 'linear-gradient(90deg, #4285F4, #9B72CB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NewSkin Lab</h2>
            </div>
            
            <div style={{ padding: '20px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6d7175', letterSpacing: '1px' }}>Loja Conectada</div>
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginTop: '5px' }}>{storeStats.name}</div>
                <div style={{ fontSize: '12px', color: isSyncing ? '#ffaa00' : '#00bfa5', marginTop: '5px' }}>
                    {isSyncing ? '● Sincronizando' : '● Online'}
                </div>
            </div>

            <nav>
                <div onClick={() => setActiveView('dashboard')} style={navItemStyle(activeView === 'dashboard')}>🏠 Dashboard</div>
                <div onClick={() => { setActiveView('products'); fetchProducts(); }} style={navItemStyle(activeView === 'products')}>📦 Produtos</div>
                <div onClick={() => setActiveView('history')} style={navItemStyle(activeView === 'history')}>📜 Histórico</div>
            </nav>
        </aside>

        {/* ÁREA PRINCIPAL */}
        <main style={{ flex: 1 }}>
            {activeView === 'dashboard' && <DashboardView />}
            {activeView === 'editor' && <EditorView />}
            {activeView === 'history' && <HistoryView />}
            
            {/* VIEW SIMPLES DE PRODUTOS */}
            {activeView === 'products' && (
                <div style={{ padding: '40px' }}>
                    <h1>Produtos ({storeStats.products})</h1>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        {productsList.length === 0 ? 'Carregando...' : (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {productsList.map(p => (
                                    <li key={p.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>{p.name} - <b style={{color: 'green'}}>R$ {p.price}</b></li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </main>

    </div>
  );
}

// ==========================================
// ESTILOS INLINE (Para manter tudo num arquivo só)
// ==========================================
const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '20px',
    border: '1px solid #dfe3e8'
};

const cardHeaderStyle = {
    padding: '15px 20px',
    borderBottom: '1px solid #dfe3e8',
    backgroundColor: '#fafbfc',
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px'
};

const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#454f5b'
};

const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #c4cdd5',
    fontSize: '14px'
};

const navItemStyle = (isActive: boolean) => ({
    padding: '12px 20px',
    cursor: 'pointer',
    backgroundColor: isActive ? '#2d3642' : 'transparent',
    color: isActive ? 'white' : '#acb0b5',
    fontWeight: isActive ? 'bold' : 'normal',
    borderLeft: isActive ? '4px solid #4285F4' : '4px solid transparent'
});

const thStyle = { padding: '15px', textAlign: 'left' as const, fontSize: '14px', color: '#555' };
const tdStyle = { padding: '15px', borderBottom: '1px solid #eee' };
