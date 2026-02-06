import { useState, useEffect, useRef } from 'react';
import PreviewCard from './PreviewCard';

const BACKEND_URL = "https://web-production-4b8a.up.railway.app"; 

export default function NewSkinApp() {
  // ==========================================
  // 1. ESTADOS
  // ==========================================
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [storeId, setStoreId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const [syncProgress, setSyncProgress] = useState(0);
  
  // --- ESTADO NOVO: FERRAMENTA ATIVA NO CHAT ---
  const [activeTool, setActiveTool] = useState<any>(null); // Guarda o objeto do card clicado (ex: {title: 'Price', ...})

  // Dados e Listas
  const [productsList, setProductsList] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false); 
  const [searchTerm, setSearchTerm] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Chat & Stats
  const [storeStats, setStoreStats] = useState({ name: 'Carregando...', products: 0, categories: 0 });
  const [messages, setMessages] = useState<any[]>([{ role: 'ai', text: 'Olá! Sou a IA do NewSkin. Posso te ajudar com dúvidas sobre seu estoque.' }]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const chatEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ==========================================
  // 2. LÓGICA DE CARREGAMENTO
  // ==========================================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('store_id');

    if (id) {
      setStoreId(id);
      checkStoreStatus(id);
    } else {
      setMessages([{ role: 'ai', text: '⚠️ Atenção: Não encontrei o ID da loja.' }]);
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'products' && storeId) {
        fetchProducts(storeId);
    }
  }, [activeTab, storeId]);

  const checkStoreStatus = (id: string) => {
      fetch(`${BACKEND_URL}/admin/status/${id}`)
        .then(res => res.json())
        .then(data => {
            setStoreStats({
                name: data.loja_nome || `Loja ${id}`,
                products: data.total_produtos_banco || 0,
                categories: data.total_categorias_banco || 0
            });

            if (data.ultimo_erro === "SYNC_CONCLUIDO") {
                if(isSyncing) {
                   setMessages(prev => [...prev, { role: 'ai', text: `Conectado! ${data.total_produtos_banco} produtos no banco.` }]);
                   setSyncProgress(100);
                   setIsSyncing(false); 
                }
            } else {
                setSyncProgress(old => old < 90 ? old + 10 : old);
                fetch(`${BACKEND_URL}/sync?store_id=${id}`, { method: 'POST' }).catch(console.error);
            }
        })
        .catch(() => fetch(`${BACKEND_URL}/sync?store_id=${id}`, { method: 'POST' }));
  };

  const fetchProducts = async (id: string, search = "") => {
      setLoadingProducts(true);
      try {
          let url = `${BACKEND_URL}/products/${id}?limit=100`;
          if (search) url += `&search=${search}`;
          const res = await fetch(url);
          const data = await res.json();
          setProductsList(data);
      } catch (error) { console.error(error); } finally { setLoadingProducts(false); }
  };

  useEffect(() => {
    if (!storeId || !isSyncing) return;
    const interval = setInterval(() => checkStoreStatus(storeId), 5000);
    return () => clearInterval(interval);
  }, [storeId, isSyncing]);

  // ==========================================
  // 3. FUNÇÕES UX
  // ==========================================
  const handleInputChange = (id: string, field: string, value: any) => {
      setHasChanges(true);
      setProductsList(prevList => prevList.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const renderVariants = (product: any) => {
      // (Lógica de renderização de variantes simplificada para não ocupar espaço, mantenha a sua original se preferir)
      return <span style={{fontSize:'11px', color:'#666'}}>{product.variants_json?.length || 1} variações</span>;
  };

  const hextomCards = [
    { title: "Inventory", desc: "Shipping & Stock", color: "#00BCD4", icon: "📦" }, 
    { title: "Price", desc: "Update prices", color: "#4CAF50", icon: "💲" },
    { title: "Compare At", desc: "Sales price", color: "#FF9800", icon: "⚖️" }, 
    { title: "Tag", desc: "Manage tags", color: "#009688", icon: "🏷️" }, 
    { title: "Title", desc: "SEO & Names", color: "#673AB7", icon: "📝" }, 
    { title: "Description", desc: "HTML Content", color: "#9E9E9E", icon: "📄" }, 
    { title: "Product Type", desc: "Categories", color: "#F44336", icon: "🗂️" }, 
    { title: "Vendor", desc: "Brands", color: "#FF5722", icon: "🏭" }, 
  ];

  // --- ATIVAÇÃO DE MODO ---
  const activateToolMode = (tool: any) => {
      setActiveTool(tool);
      setMessages(prev => [...prev, { 
          role: 'ai', 
          text: `🔧 Modo ${tool.title} ativado! Agora você pode me pedir para alterar ${tool.title.toLowerCase()} em massa.`,
          system: true // Marca visual para diferenciar
      }]);
  };

  const deactivateToolMode = () => {
      setActiveTool(null);
      setMessages(prev => [...prev, { 
          role: 'ai', 
          text: `✅ Modo edição encerrado. Voltei a ser sua assistente de consulta.`,
          system: true
      }]);
  };

  // --- ENVIO DE MENSAGEM ---
  const handleSend = async (text: string) => {
    if (!text || !storeId) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            message: text, 
            store_id: storeId,
            // AQUI ESTÁ O SEGREDO: Enviamos o contexto se uma ferramenta estiver ativa
            context: activeTool ? activeTool.title.toLowerCase() : 'dashboard'
        }) 
      });
      const data = await response.json();
      const suggestions = data.suggestions || [];

      setMessages(prev => [...prev, { 
          role: 'ai', 
          text: data.response, 
          type: data.action, 
          data: data.data,
          suggestions: suggestions,
          command: data.command 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Erro de conexão com o servidor.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeCommand = (command: any) => {
      if (command?.changes) {
          const c = command.changes[0];
          alert(`🚀 EXECUTANDO:\n${c.action} ${c.field} -> ${c.value}`);
      } else {
          alert("Erro no formato do comando.");
      }
  };

  // ==========================================
  // 4. RENDERIZAÇÃO
  // ==========================================
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Inter', sans-serif", backgroundColor: '#131314', color: '#E3E3E3', overflow: 'hidden' }}>
      
      {/* SIDEBAR ESQUERDA */}
      <aside style={{ width: '260px', minWidth: '260px', backgroundColor: '#1E1F20', borderRight: '1px solid #444746', padding: '24px', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
        <h2 style={{ background: 'linear-gradient(90deg, #4285F4, #9B72CB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800', fontSize: '24px', marginBottom: '20px' }}>NewSkin Lab</h2>
        
        {/* Status simplificado */}
        <div style={{ padding: '15px', backgroundColor: '#282A2C', borderRadius: '12px', border: '1px solid #444746', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: isSyncing ? '#A8C7FA' : '#34A853' }}>{isSyncing ? 'SYNC...' : 'ONLINE'}</div>
            <div style={{ fontSize: '14px', marginTop: '5px' }}>{storeStats.products} Produtos</div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <div onClick={() => setActiveTab('dashboard')} style={{ padding: '12px', background: activeTab === 'dashboard' ? '#004A77' : 'transparent', borderRadius: '50px', color: activeTab === 'dashboard' ? '#A8C7FA' : '#C4C7C5', fontWeight: '600', cursor: 'pointer', display: 'flex', gap: '10px' }}><span>✨</span> Dashboard</div>
            <div onClick={() => setActiveTab('products')} style={{ padding: '12px', background: activeTab === 'products' ? '#004A77' : 'transparent', borderRadius: '50px', color: activeTab === 'products' ? '#A8C7FA' : '#C4C7C5', fontWeight: '600', cursor: 'pointer', display: 'flex', gap: '10px' }}><span>📦</span> Produtos</div>
        </nav>
      </aside>

      {/* ÁREA CENTRAL */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', height: '100vh', overflow: 'hidden' }}>
        
        {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', height: '100%' }}>
                
                {/* ÁREA DE CHAT */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    
                    {/* --- BARRA DE CONTEXTO ATIVO (AQUI ESTÁ A MÁGICA) --- */}
                    {activeTool && (
                        <div style={{ 
                            position: 'absolute', top: 0, left: 0, right: 0, 
                            backgroundColor: '#282A2C', borderBottom: `2px solid ${activeTool.color}`, 
                            padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                            zIndex: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' 
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ fontSize: '24px' }}>{activeTool.icon}</div>
                                <div>
                                    <div style={{ fontSize: '10px', color: '#A8C7FA', fontWeight: 'bold', textTransform: 'uppercase' }}>Modo Operador Ativo</div>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>Editando {activeTool.title}</div>
                                </div>
                            </div>
                            <button 
                                onClick={deactivateToolMode} 
                                style={{ background: '#F4433620', border: '1px solid #F44336', color: '#F44336', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                            >
                                ✖ Encerrar Edição
                            </button>
                        </div>
                    )}

                    <div style={{ flex: 1, overflowY: 'auto', padding: '40px', paddingTop: activeTool ? '100px' : '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '100%', maxWidth: '700px' }}>
                            {messages.map((m, i) => (
                                <div key={i} style={{ marginBottom: '30px', textAlign: m.role === 'user' ? 'right' : 'left' }}>
                                    {!m.system && <div style={{ fontSize: '12px', color: '#8E918F', marginBottom: '8px', marginLeft: '10px' }}>{m.role === 'ai' ? 'NewSkin AI ✨' : 'Você'}</div>}
                                    
                                    <div style={{ 
                                        display: 'inline-block', 
                                        padding: '18px 24px', 
                                        borderRadius: '24px', 
                                        backgroundColor: m.system ? '#282A2C' : (m.role === 'user' ? '#004A77' : 'transparent'), 
                                        color: '#E3E3E3', 
                                        border: m.system ? '1px dashed #555' : 'none',
                                        maxWidth: '90%', 
                                        textAlign: m.system ? 'center' : 'left',
                                        width: m.system ? '100%' : 'auto'
                                    }}>
                                        <div style={{ marginBottom: (m.command || m.suggestions) ? '15px' : '0' }}>{m.text}</div>
                                        
                                        {/* Renderização de Comando */}
                                        {m.command && (
                                            <div style={{ backgroundColor: '#131314', border: '1px solid #444', borderRadius: '12px', padding: '20px', marginTop: '15px', textAlign: 'left' }}>
                                                <div style={{ fontSize: '14px', color: '#E3E3E3', marginBottom: '15px' }}>
                                                    {m.command.changes ? (
                                                        <div>
                                                            <div style={{ color: activeTool?.color || '#A8C7FA', fontWeight: 'bold', marginBottom: '5px' }}>⚡ AÇÃO PROPOSTA</div>
                                                            <div>{m.command.changes[0].action} <b>{m.command.changes[0].field}</b></div>
                                                            <div>Valor: <span style={{ color: '#4CAF50' }}>{m.command.changes[0].value}</span></div>
                                                        </div>
                                                    ) : <span>{JSON.stringify(m.command)}</span>}
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <button onClick={() => executeCommand(m.command)} style={{ flex: 1, padding: '10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>✅ APROVAR</button>
                                                    <button onClick={() => alert("Cancelado")} style={{ flex: 1, padding: '10px', background: 'transparent', color: '#F44336', border: '1px solid #F44336', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>❌ CANCELAR</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                    </div>

                    <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
                        <div style={{ position: 'relative', width: '100%', maxWidth: '700px' }}>
                            <input 
                                type="text" 
                                value={inputValue} 
                                onChange={(e) => setInputValue(e.target.value)} 
                                onKeyPress={(e) => e.key === 'Enter' && handleSend(inputValue)} 
                                placeholder={activeTool ? `Digite como quer alterar ${activeTool.title}...` : "Pergunte à IA..."} 
                                style={{ width: '100%', padding: '22px 25px', borderRadius: '100px', border: activeTool ? `2px solid ${activeTool.color}` : '1px solid #444', backgroundColor: '#1E1F20', color: '#E3E3E3', outline: 'none' }} 
                            />
                            <button onClick={() => handleSend(inputValue)} style={{ position: 'absolute', right: '10px', top: '10px', background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>➤</button>
                        </div>
                    </div>
                </div>

                {/* SIDEBAR DIREITA (CARDS) */}
                <aside style={{ width: '340px', minWidth: '340px', backgroundColor: '#131314', borderLeft: '1px solid #444746', padding: '24px', overflowY: 'auto' }}>
                    <h3 style={{ fontSize: '12px', color: '#888', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase' }}>FERRAMENTAS BULK</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {hextomCards.map((card, index) => (
                        <button 
                            key={index} 
                            onClick={() => activateToolMode(card)} // AGORA SÓ ATIVA O MODO, NÃO MUDA PÁGINA
                            style={{ 
                                padding: '16px', 
                                backgroundColor: activeTool?.title === card.title ? `${card.color}20` : '#1E1F20', // Highlight se ativo
                                border: activeTool?.title === card.title ? `2px solid ${card.color}` : `1px solid ${card.color}40`, 
                                borderRadius: '16px', cursor: 'pointer', textAlign: 'left', minHeight: '120px', position: 'relative',
                                opacity: (activeTool && activeTool.title !== card.title) ? 0.5 : 1 // Apaga os outros se um estiver ativo
                            }}
                        >
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: card.color }}></div>
                            <div style={{ fontSize: '24px' }}>{card.icon}</div>
                            <div style={{ fontWeight: '600', fontSize: '14px', marginTop: '5px', color: '#E3E3E3' }}>{card.title}</div>
                        </button>
                    ))}
                    </div>
                </aside>
            </div>
        )}

        {/* PRODUTOS */}
        {activeTab === 'products' && (
            <div style={{ padding: '20px' }}>
                <h1>Catálogo</h1>
                {/* Tabela de produtos aqui */}
            </div>
        )}

      </main>
    </div>
  );
}
