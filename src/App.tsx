import { useState, useEffect, useRef } from 'react';

// ==========================================
// CONFIGURAÇÃO
// ==========================================
const BACKEND_URL = "https://web-production-4b8a.up.railway.app"; 

export default function NewSkinApp() {
  // Estados Gerais
  const [storeId, setStoreId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([{ role: 'ai', text: 'Olá! Sou seu assistente. Diga o que precisa (ex: "Mudar preço") e eu abro a ferramenta certa para você.' }]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado dos Modais (Qual ferramenta está aberta?)
  const [activeModal, setActiveModal] = useState<string | null>(null); // 'price', 'title', etc.
  
  // Dados pré-preenchidos pela IA (O "Garçom" trouxe isso)
  const [toolParams, setToolParams] = useState<any>({});

  // Stats da Loja
  const [storeStats, setStoreStats] = useState({ name: 'Carregando...', products: 0 });
  const [isSyncing, setIsSyncing] = useState(true);

  // Auto-scroll do chat
  const chatEndRef = useRef<null | HTMLDivElement>(null);
  useEffect(() => scrollToBottom(), [messages]);
  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // ==========================================
  // 1. INICIALIZAÇÃO
  // ==========================================
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

  // ==========================================
  // 2. CHAT ENGINE (IA NAVEGADORA)
  // ==========================================
  const handleSend = async (text: string) => {
    if (!text || !storeId) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, store_id: storeId }) 
      });
      const data = await response.json();

      // A IA respondeu texto comum
      setMessages(prev => [...prev, { role: 'ai', text: data.response }]);

      // A IA detectou uma ferramenta! ABRIR MODAL IMEDIATAMENTE
      if (data.command) {
          const type = data.command.type; // ex: 'update_price'
          const params = data.command.params; // ex: { value: 10, search_term: 'Nike' }
          
          if (type === 'update_price' || type === 'apply_sale') {
              openTool('price', params);
          } else if (type === 'edit_title') {
              openTool('title', params);
          }
      }

    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Erro de conexão.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 3. GERENCIADOR DE MODAIS (CARDS)
  // ==========================================
  const openTool = (toolName: string, initialData: any = {}) => {
      setToolParams(initialData); // Preenche o formulário com o que a IA ouviu
      setActiveModal(toolName);   // Abre a janela
  };

  const closeModal = () => {
      setActiveModal(null);
      setToolParams({});
  };

  // Função que envia o comando final (do Modal) para o Backend
  const executeToolAction = async (finalParams: any) => {
      if (!storeId) return;
      
      // Feedback visual
      alert("🚀 Enviando comando...");
      closeModal(); // Fecha o modal

      try {
          // Mapeia para a ferramenta correta no backend
          // Se o usuário escolheu "Oferta" no modal, usamos apply_sale. Se Preço, update_price.
          const toolType = finalParams.mode === 'sale' ? 'apply_sale' : 'update_price';

          // Limpa params desnecessários antes de enviar
          const payload = {
              store_id: storeId,
              tool_type: toolType,
              params: {
                  ...finalParams,
                  // Garante compatibilidade com o backend
                  discount_value: finalParams.value, 
                  discount_type: finalParams.type
              }
          };

          const response = await fetch(`${BACKEND_URL}/execute_tool`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });

          if (response.ok) {
              setMessages(prev => [...prev, { role: 'ai', text: `✅ Comando enviado! As alterações estão sendo processadas em segundo plano.` }]);
          } else {
              alert("Erro ao executar.");
          }
      } catch (e) { alert("Erro de conexão"); }
  };

  // ==========================================
  // 4. COMPONENTES VISUAIS (CARDS)
  // ==========================================
  
  // O Modal de Preço (Estilo Hextom)
  const PriceModal = () => {
      const [mode, setMode] = useState<'price' | 'sale'>('price'); // Abas
      const [val, setVal] = useState(toolParams.value || 0);
      const [type, setType] = useState(toolParams.type || 'percentage');
      const [search, setSearch] = useState(toolParams.search_term || '');
      const [op, setOp] = useState(toolParams.operation || 'increase');

      return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
              <div style={{ width: '500px', backgroundColor: '#1E1F20', borderRadius: '16px', border: '1px solid #444', padding: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
                  
                  {/* Cabeçalho */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                      <h2 style={{ margin: 0, fontSize: '20px', color: '#E3E3E3' }}>Gerenciador de Preços</h2>
                      <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#888', fontSize: '20px', cursor: 'pointer' }}>✕</button>
                  </div>

                  {/* Abas de Modo (AQUI ESTÁ A MÁGICA DA CLAREZA) */}
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', background: '#282A2C', padding: '4px', borderRadius: '8px' }}>
                      <button onClick={() => setMode('price')} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', background: mode === 'price' ? '#4CAF50' : 'transparent', color: mode === 'price' ? 'white' : '#888', fontWeight: 'bold', cursor: 'pointer' }}>
                          💲 Alterar Preço Base
                      </button>
                      <button onClick={() => setMode('sale')} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', background: mode === 'sale' ? '#FF9800' : 'transparent', color: mode === 'sale' ? 'black' : '#888', fontWeight: 'bold', cursor: 'pointer' }}>
                          🏷️ Criar Promoção
                      </button>
                  </div>

                  {/* Conteúdo Dinâmico */}
                  <div style={{ marginBottom: '20px' }}>
                      {mode === 'price' ? (
                          <div style={{ color: '#ccc', fontSize: '13px', marginBottom: '10px' }}>
                              Ajusta o preço principal do produto. Ideal para reajustes de custo ou aumentos.
                          </div>
                      ) : (
                          <div style={{ color: '#ccc', fontSize: '13px', marginBottom: '10px' }}>
                              Move o preço atual para "DE" e cria um novo preço "POR" com desconto.
                          </div>
                      )}

                      {/* Inputs */}
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                          {mode === 'price' && (
                              <select value={op} onChange={(e) => setOp(e.target.value)} style={{ padding: '10px', background: '#333', border: '1px solid #555', color: 'white', borderRadius: '6px' }}>
                                  <option value="increase">Aumentar (+)</option>
                                  <option value="decrease">Diminuir (-)</option>
                                  <option value="set_fixed">Definir Fixo (=)</option>
                              </select>
                          )}
                          <input type="number" value={val} onChange={(e) => setVal(e.target.value)} placeholder="Valor" style={{ flex: 1, padding: '10px', background: '#333', border: '1px solid #555', color: 'white', borderRadius: '6px' }} />
                          <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: '10px', background: '#333', border: '1px solid #555', color: 'white', borderRadius: '6px' }}>
                              <option value="percentage">%</option>
                              <option value="fixed">R$</option>
                          </select>
                      </div>

                      {/* Filtro */}
                      <div style={{ marginBottom: '5px' }}>
                          <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '5px' }}>Aplicar apenas em produtos contendo:</label>
                          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ex: Nike (Deixe vazio para todos)" style={{ width: '100%', padding: '10px', background: '#333', border: '1px solid #555', color: 'white', borderRadius: '6px' }} />
                      </div>
                  </div>

                  {/* Ação */}
                  <button 
                      onClick={() => executeToolAction({ mode, operation: op, value: val, type, search_term: search })}
                      style={{ width: '100%', padding: '14px', background: '#4285F4', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
                      {mode === 'price' ? 'APLICAR NOVO PREÇO' : 'APLICAR OFERTA AGORA'}
                  </button>
              </div>
          </div>
      );
  };

  // ==========================================
  // 5. RENDERIZAÇÃO PRINCIPAL
  // ==========================================
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Inter', sans-serif", backgroundColor: '#131314', color: '#E3E3E3' }}>
      
      {/* MODAL OVERLAY */}
      {activeModal === 'price' && <PriceModal />}

      {/* SIDEBAR */}
      <aside style={{ width: '260px', backgroundColor: '#1E1F20', borderRight: '1px solid #444', padding: '24px' }}>
        <h2 style={{ background: 'linear-gradient(90deg, #4285F4, #9B72CB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800', fontSize: '24px', marginBottom: '30px' }}>NewSkin Lab</h2>
        
        {/* Status */}
        <div style={{ padding: '15px', background: '#282A2C', borderRadius: '12px', marginBottom: '20px', border: '1px solid #444' }}>
            <div style={{ fontSize: '11px', color: '#aaa', fontWeight: 'bold' }}>STATUS DA LOJA</div>
            <div style={{ color: isSyncing ? '#A8C7FA' : '#34A853', fontWeight: 'bold', marginTop: '5px' }}>{isSyncing ? '🔄 Sincronizando...' : '🟢 Online'}</div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>{storeStats.products} produtos</div>
        </div>

        {/* Menu Ferramentas (Cards Laterais) */}
        <div style={{ fontSize: '12px', color: '#888', fontWeight: 'bold', marginBottom: '10px' }}>FERRAMENTAS RÁPIDAS</div>
        <div onClick={() => openTool('price')} style={{ padding: '12px', background: '#282A2C', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer', border: '1px solid #444', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>💲</span>
            <div>
                <div style={{ fontWeight: 'bold' }}>Gerenciar Preços</div>
                <div style={{ fontSize: '10px', color: '#888' }}>Ofertas e Reajustes</div>
            </div>
        </div>
        <div onClick={() => alert("Em breve")} style={{ padding: '12px', background: '#282A2C', borderRadius: '8px', cursor: 'pointer', border: '1px solid #444', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>📝</span>
            <div>
                <div style={{ fontWeight: 'bold' }}>Editor de Títulos</div>
                <div style={{ fontSize: '10px', color: '#888' }}>SEO e Prefixos</div>
            </div>
        </div>
      </aside>

      {/* CHAT AREA */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '100%', maxWidth: '700px' }}>
                  {messages.map((m, i) => (
                      <div key={i} style={{ marginBottom: '20px', textAlign: m.role === 'user' ? 'right' : 'left' }}>
                          <div style={{ display: 'inline-block', padding: '15px 20px', borderRadius: '20px', background: m.role === 'user' ? '#333' : 'transparent', color: '#ddd', maxWidth: '80%', lineHeight: '1.5' }}>
                              {m.text}
                          </div>
                      </div>
                  ))}
                  {isLoading && <div style={{ color: '#666', fontStyle: 'italic' }}>Pensando...</div>}
              </div>
          </div>

          {/* INPUT */}
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '700px' }}>
                  <input 
                      value={inputValue} 
                      onChange={(e) => setInputValue(e.target.value)} 
                      onKeyPress={(e) => e.key === 'Enter' && handleSend(inputValue)}
                      placeholder="Ex: Dar 10% de desconto em tudo..." 
                      style={{ width: '100%', padding: '20px', borderRadius: '50px', background: '#1E1F20', border: '1px solid #444', color: 'white', outline: 'none' }} 
                  />
                  <button onClick={() => handleSend(inputValue)} style={{ position: 'absolute', right: '10px', top: '10px', height: '40px', width: '40px', borderRadius: '50%', border: 'none', background: '#E3E3E3', cursor: 'pointer' }}>➤</button>
              </div>
          </div>
      </main>
    </div>
  );
}
