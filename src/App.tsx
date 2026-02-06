import { useState, useEffect } from 'react';

// ==========================================
// CONFIGURAÇÃO & TIPOS
// ==========================================
const BACKEND_URL = "https://web-production-4b8a.up.railway.app"; 

interface Task {
  id: number;
  time: string;
  status: 'Running' | 'Finished' | 'Failed';
  details: string;
  items: string;
}

export default function NewSkinHextomClone() {
  // --- ESTADOS ---
  const [storeId, setStoreId] = useState<string | null>(null);
  const [activePage, setActivePage] = useState('dashboard'); // 'dashboard', 'price', 'history', etc.
  const [storeStats, setStoreStats] = useState({ name: 'Carregando...', products: 0 });
  
  // Estado Simulado de Histórico (Depois conectamos no banco)
  const [tasks, setTasks] = useState<Task[]>([
      { id: 102, time: 'Hoje 14:30', status: 'Finished', details: 'Update Price (Increase 10%)', items: '4495 products' },
      { id: 101, time: 'Ontem 09:15', status: 'Finished', details: 'Sale (Decrease 5%)', items: '120 products' }
  ]);

  // --- INICIALIZAÇÃO ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('store_id');
    if (id) {
      setStoreId(id);
      fetchStats(id);
    }
  }, []);

  const fetchStats = (id: string) => {
      fetch(`${BACKEND_URL}/admin/status/${id}`)
        .then(res => res.json())
        .then(data => setStoreStats({ name: data.loja_nome || 'Loja', products: data.total_produtos_banco || 0 }));
  };

  // Função para adicionar tarefa ao histórico visual e disparar backend
  const startTask = async (toolType: string, params: any, description: string) => {
      if (!storeId) return;
      
      // 1. Adiciona ao histórico visual como "Running"
      const newTask: Task = {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          status: 'Running',
          details: description,
          items: 'Calculando...'
      };
      setTasks(prev => [newTask, ...prev]);
      setActivePage('history'); // Redireciona para o histórico igual o Hextom

      // 2. Dispara Backend
      try {
          await fetch(`${BACKEND_URL}/execute_tool`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ store_id: storeId, tool_type: toolType, params: params })
          });
          
          // Simula conclusão após 2s (Na vida real, usariamos websocket ou polling)
          setTimeout(() => {
              setTasks(prev => prev.map(t => t.id === newTask.id ? { ...t, status: 'Finished', items: `${storeStats.products} products` } : t));
          }, 3000);

      } catch (e) {
          setTasks(prev => prev.map(t => t.id === newTask.id ? { ...t, status: 'Failed' } : t));
      }
  };

  // ==========================================
  // COMPONENTES DE PÁGINA
  // ==========================================

  // 1. SIDEBAR (Navegação Lateral Fixa)
  const Sidebar = () => (
      <aside style={{ width: '60px', backgroundColor: '#0f1422', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', zIndex: 100 }}>
          <div title="Dashboard" onClick={() => setActivePage('dashboard')} style={{ marginBottom: '20px', cursor: 'pointer', color: activePage === 'dashboard' ? 'white' : '#687489' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
          <div title="Preço" onClick={() => setActivePage('price')} style={{ marginBottom: '20px', cursor: 'pointer', color: activePage === 'price' ? '#4CAF50' : '#687489' }}>
              <span style={{ fontWeight: 'bold', fontSize: '18px' }}>$</span>
          </div>
          <div title="Histórico" onClick={() => setActivePage('history')} style={{ marginBottom: '20px', cursor: 'pointer', color: activePage === 'history' ? '#FFC107' : '#687489' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
      </aside>
  );

  // 2. DASHBOARD (Grid de Cards coloridos igual Hextom)
  const DashboardPage = () => (
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333', marginBottom: '20px' }}>Start Editing Products</h1>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              
              {/* Card de Preço (Verde) */}
              <div onClick={() => setActivePage('price')} style={cardStyle('#4CAF50')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>Price</div>
                      <span style={{ fontSize: '30px', opacity: 0.3, marginLeft: 'auto' }}>$</span>
                  </div>
                  <div style={{ color: 'white', fontSize: '12px', opacity: 0.9 }}>Update prices, create sales, set fixed values.</div>
                  <div style={{ marginTop: '15px', textAlign: 'center', background: 'rgba(0,0,0,0.1)', padding: '5px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Edit ➜</div>
              </div>

              {/* Card de Título (Roxo) */}
              <div onClick={() => alert("Em breve")} style={cardStyle('#673AB7')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>Title</div>
                      <span style={{ fontSize: '30px', opacity: 0.3, marginLeft: 'auto' }}>A</span>
                  </div>
                  <div style={{ color: 'white', fontSize: '12px', opacity: 0.9 }}>Edit product names, SEO, capitalization.</div>
                  <div style={{ marginTop: '15px', textAlign: 'center', background: 'rgba(0,0,0,0.1)', padding: '5px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Edit ➜</div>
              </div>

              {/* Card de Compare At (Laranja) */}
              <div onClick={() => setActivePage('price')} style={cardStyle('#FF9800')}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>Compare At</div>
                      <span style={{ fontSize: '30px', opacity: 0.3, marginLeft: 'auto' }}>⚖️</span>
                  </div>
                  <div style={{ color: 'white', fontSize: '12px', opacity: 0.9 }}>Manage original prices for sales visibility.</div>
                  <div style={{ marginTop: '15px', textAlign: 'center', background: 'rgba(0,0,0,0.1)', padding: '5px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Edit ➜</div>
              </div>

              {/* Card de Inventário (Azul) */}
              <div onClick={() => alert("Em breve")} style={cardStyle('#00BCD4')}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>Inventory</div>
                      <span style={{ fontSize: '30px', opacity: 0.3, marginLeft: 'auto' }}>📦</span>
                  </div>
                  <div style={{ color: 'white', fontSize: '12px', opacity: 0.9 }}>Manage stock levels and tracking.</div>
                  <div style={{ marginTop: '15px', textAlign: 'center', background: 'rgba(0,0,0,0.1)', padding: '5px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Edit ➜</div>
              </div>
          </div>
      </div>
  );

  // 3. PÁGINA DE PREÇO (EDITOR COMPLETO)
  const PriceEditorPage = () => {
      const [filterName, setFilterName] = useState('');
      const [actionType, setActionType] = useState('update_price'); // 'update_price' ou 'apply_sale'
      const [operation, setOperation] = useState('increase');
      const [value, setValue] = useState('');
      const [unit, setUnit] = useState('percentage');

      const handleStart = () => {
          if(!value) return alert("Digite um valor");
          
          let tool = actionType;
          let params: any = { search_term: filterName };

          if (tool === 'update_price') {
              params = { ...params, operation, value: parseFloat(value), type: unit };
          } else {
              params = { ...params, mode: 'sale', discount_value: parseFloat(value), discount_type: unit };
          }

          startTask(tool, params, `${tool === 'apply_sale' ? 'Sale' : 'Update Price'} (${value}${unit === 'percentage' ? '%' : ''})`);
      };

      return (
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              {/* Header da Ferramenta */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                  <div style={{ width: '40px', height: '40px', background: '#4CAF50', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '20px' }}>$</div>
                  <div>
                      <h1 style={{ margin: 0, fontSize: '18px', color: '#333' }}>Bulk Edit Price</h1>
                      <div style={{ fontSize: '12px', color: '#666' }}>Update product price and compare-at price</div>
                  </div>
              </div>

              {/* STEP 1: FILTRO */}
              <div style={stepContainerStyle}>
                  <div style={stepHeaderStyle}>
                      <span style={{ fontWeight: 'bold' }}>Step 1:</span> Filter Products
                  </div>
                  <div style={{ padding: '20px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Product Title contains:</label>
                      <input 
                          type="text" 
                          value={filterName}
                          onChange={(e) => setFilterName(e.target.value)}
                          placeholder="All products (leave blank)" 
                          style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} 
                      />
                      <div style={{ fontSize: '11px', color: '#888', marginTop: '5px' }}>
                          Preview: {filterName ? 'Filtering by name...' : `All ${storeStats.products} products will be edited.`}
                      </div>
                  </div>
              </div>

              {/* STEP 2: AÇÃO */}
              <div style={stepContainerStyle}>
                  <div style={stepHeaderStyle}>
                      <span style={{ fontWeight: 'bold' }}>Step 2:</span> Choose Editing Action
                  </div>
                  <div style={{ padding: '20px' }}>
                      <div style={{ marginBottom: '15px' }}>
                          <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>I want to:</label>
                          <select 
                              value={actionType} 
                              onChange={(e) => setActionType(e.target.value)}
                              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', background: 'white' }}>
                              <option value="update_price">Adjust Base Price (Reajuste)</option>
                              <option value="apply_sale">Create Sale / Promotion (De/Por)</option>
                          </select>
                      </div>

                      {actionType === 'update_price' && (
                          <div style={{ display: 'flex', gap: '10px' }}>
                              <select value={operation} onChange={(e) => setOperation(e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                                  <option value="increase">Increase (+)</option>
                                  <option value="decrease">Decrease (-)</option>
                                  <option value="set_fixed">Set Fixed (=)</option>
                              </select>
                              <input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="10" style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
                              <select value={unit} onChange={(e) => setUnit(e.target.value)} style={{ flex: 0.5, padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                                  <option value="percentage">%</option>
                                  <option value="fixed">R$</option>
                              </select>
                          </div>
                      )}

                      {actionType === 'apply_sale' && (
                          <div style={{ padding: '15px', background: '#fff3e0', border: '1px solid #ffe0b2', borderRadius: '4px' }}>
                              <div style={{ fontSize: '13px', marginBottom: '10px', color: '#e65100' }}>
                                  This will move the current price to "Compare At" and apply a discount.
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span>Decrease price by</span>
                                  <input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="10" style={{ width: '80px', padding: '8px', border: '1px solid #ddd' }} />
                                  <select value={unit} onChange={(e) => setUnit(e.target.value)} style={{ padding: '8px', border: '1px solid #ddd' }}>
                                      <option value="percentage">%</option>
                                      <option value="fixed">R$</option>
                                  </select>
                              </div>
                          </div>
                      )}
                  </div>
              </div>

              {/* BOTÃO START */}
              <button 
                  onClick={handleStart}
                  style={{ 
                      backgroundColor: '#3f51b5', color: 'white', padding: '15px 30px', border: 'none', borderRadius: '4px', 
                      fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', float: 'right', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' 
                  }}>
                  START BULK EDITING NOW
              </button>
          </div>
      );
  };

  // 4. PÁGINA DE HISTÓRICO (TASKS)
  const HistoryPage = () => (
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333', marginBottom: '20px' }}>Tasks / History</h1>
          
          <div style={{ background: 'white', border: '1px solid #ddd', borderRadius: '4px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                      <tr style={{ background: '#f5f5f5', borderBottom: '1px solid #ddd', textAlign: 'left' }}>
                          <th style={{ padding: '12px', fontSize: '12px', color: '#666' }}>Created Time</th>
                          <th style={{ padding: '12px', fontSize: '12px', color: '#666' }}>Status</th>
                          <th style={{ padding: '12px', fontSize: '12px', color: '#666' }}>Editing</th>
                          <th style={{ padding: '12px', fontSize: '12px', color: '#666' }}>Edited Products</th>
                      </tr>
                  </thead>
                  <tbody>
                      {tasks.map(task => (
                          <tr key={task.id} style={{ borderBottom: '1px solid #eee' }}>
                              <td style={{ padding: '15px', fontSize: '13px' }}>{task.time}</td>
                              <td style={{ padding: '15px' }}>
                                  <span style={{ 
                                      padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                                      background: task.status === 'Running' ? '#e3f2fd' : (task.status === 'Finished' ? '#e8f5e9' : '#ffebee'),
                                      color: task.status === 'Running' ? '#2196f3' : (task.status === 'Finished' ? '#4caf50' : '#f44336')
                                  }}>
                                      {task.status === 'Running' ? '🔄 Running' : task.status}
                                  </span>
                              </td>
                              <td style={{ padding: '15px', fontSize: '13px' }}>{task.details}</td>
                              <td style={{ padding: '15px', fontSize: '13px' }}>{task.items}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
  );

  // ==========================================
  // RENDERIZAÇÃO PRINCIPAL
  // ==========================================
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Roboto, sans-serif', backgroundColor: '#f4f6f8' }}>
        <Sidebar />
        
        <main style={{ flex: 1, padding: '30px' }}>
            {activePage === 'dashboard' && <DashboardPage />}
            {activePage === 'price' && <PriceEditorPage />}
            {activePage === 'history' && <HistoryPage />}
        </main>
    </div>
  );
}

// --- ESTILOS AUXILIARES (CSS-in-JS simples) ---
const cardStyle = (color: string) => ({
    backgroundColor: color,
    borderRadius: '8px',
    padding: '24px',
    cursor: 'pointer',
    color: 'white',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
    minHeight: '180px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between'
});

const stepContainerStyle = {
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
};

const stepHeaderStyle = {
    padding: '15px 20px',
    background: '#f9fafb',
    borderBottom: '1px solid #ddd',
    fontSize: '14px',
    color: '#333'
};
