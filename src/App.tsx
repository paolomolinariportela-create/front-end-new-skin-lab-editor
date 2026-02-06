import { useState, useEffect, useRef } from 'react';
import PreviewCard from './PreviewCard'; // Se não tiver, comente essa linha

const BACKEND_URL = "https://web-production-4b8a.up.railway.app"; 

export default function NewSkinApp() {
  // ==========================================
  // 1. ESTADOS
  // ==========================================
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'editor', 'products'
  const [storeId, setStoreId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const [syncProgress, setSyncProgress] = useState(0);
  
  // Dados
  const [storeStats, setStoreStats] = useState({ name: 'Carregando...', products: 0, categories: 0 });
  const [productsList, setProductsList] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  // Chat IA
  const [messages, setMessages] = useState<any[]>([{ role: 'ai', text: 'Olá! Sou a IA do NewSkin. Posso consultar informações ou você pode usar as ferramentas ao lado.' }]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<null | HTMLDivElement>(null);

  // Editor Hextom
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [filterField, setFilterField] = useState('title');
  const [filterCondition, setFilterCondition] = useState('contains');
  const [filterValue, setFilterValue] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // ==========================================
  // 2. INICIALIZAÇÃO
  // ==========================================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('store_id');
    if (id) {
      setStoreId(id);
      checkStoreStatus(id);
      fetchProducts(id); // Já carrega produtos para o editor
    } else {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages]);
  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

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
                setSyncProgress(100);
                setIsSyncing(false); 
            } else {
                setSyncProgress(90);
                fetch(`${BACKEND_URL}/sync?store_id=${id}`, { method: 'POST' }).catch(console.error);
            }
        });
  };

  const fetchProducts = async (id: string, search = "") => {
      setLoadingProducts(true);
      try {
          let url = `${BACKEND_URL}/products/${id}?limit=500`;
          if (search) url += `&search=${search}`;
          const res = await fetch(url);
          const data = await res.json();
          setProductsList(data);
          setFilteredProducts(data);
      } catch (error) { console.error(error); } finally { setLoadingProducts(false); }
  };

  // ==========================================
  // 3. IA LÓGICA (CHAT)
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
      setMessages(prev => [...prev, { role: 'ai', text: data.response, command: data.command }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Erro de conexão.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 4. EDITOR LÓGICA (HEXTOM)
  // ==========================================
  const openTool = (tool: any) => {
      setSelectedTool(tool);
      setActiveTab('editor');
      // Reset filtros
      setFilterField('title');
      setFilterValue('');
      setShowPreview(false);
  };

  const runPreview = () => {
      setShowPreview(true);
      const lowerVal = filterValue.toLowerCase();
      
      const filtered = productsList.filter(p => {
          let text = "";
          if (filterField === 'title') text = p.name?.toLowerCase() || "";
          if (filterField === 'sku') text = p.sku?.toLowerCase() || "";
          
          if (filterCondition === 'contains') return text.includes(lowerVal);
          if (filterCondition === 'not_contains') return !text.includes(lowerVal);
          if (filterCondition === 'starts_with') return text.startsWith(lowerVal);
          if (filterCondition === 'is') return text === lowerVal;
          return false;
      });
      setFilteredProducts(filtered);
  };

  // ==========================================
  // CONFIGS VISUAIS
  // ==========================================
  const hextomCards = [
    { title: "Price", desc: "Update prices", color: "#4CAF50", icon: "💲" },
    { title: "Compare At", desc: "Sales price", color: "#FF9800", icon: "⚖️" },
    { title: "Inventory", desc: "Stock levels", color: "#00BCD4", icon: "📦" },
    { title: "Title", desc: "SEO & Names", color: "#673AB7", icon: "📝" },
    { title: "Tag", desc: "Manage tags", color: "#009688", icon: "🏷️" },
    { title: "Description", desc: "HTML Content", color: "#9E9E9E", icon: "📄" },
    { title: "Product Type", desc: "Categories", color: "#F44336", icon: "🗂️" },
    { title: "Vendor", desc: "Brands", color: "#FF5722", icon: "🏭" },
  ];

  // ==========================================
  // RENDERIZAÇÃO
  // ==========================================
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Inter', sans-serif", backgroundColor: '#131314', color: '#E3E3E3', overflow: 'hidden' }}>
      
      {/* SIDEBAR ESQUERDA (MANTIDA) */}
      <aside style={{ width: '260px', minWidth: '260px', backgroundColor: '#1E1F20', borderRight: '1px solid #444746', padding: '24px', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
        <h2 style={{ background: 'linear-gradient(90deg, #4285F4, #9B72CB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800', fontSize: '24px', marginBottom: '20px' }}>NewSkin Lab</h2>
        
        {/* Status */}
        <div style={{ padding: '20px', backgroundColor: '#282A2C', borderRadius: '16px', border: '1px solid #444746', marginBottom: '30px' }}>
            <div style={{ fontSize: '11px', color: '#C4C7C5', fontWeight: 'bold' }}>STATUS</div>
            <div style={{ fontSize: '14px', color: isSyncing ? '#A8C7FA' : '#34A853', fontWeight: 'bold', marginTop: '5px' }}>{isSyncing ? 'SYNC...' : 'ONLINE'}</div>
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#ccc' }}>{storeStats.products} Produtos</div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div onClick={() => setActiveTab('dashboard')} style={{ padding: '12px', borderRadius: '50px', background: activeTab === 'dashboard' ? '#004A77' : 'transparent', color: activeTab === 'dashboard' ? '#A8C7FA' : '#ccc', cursor: 'pointer', fontWeight: 'bold' }}>✨ Dashboard</div>
            <div onClick={() => setActiveTab('products')} style={{ padding: '12px', borderRadius: '50px', background: activeTab === 'products' ? '#004A77' : 'transparent', color: activeTab === 'products' ? '#A8C7FA' : '#ccc', cursor: 'pointer', fontWeight: 'bold' }}>📦 Produtos</div>
        </nav>
      </aside>

      {/* ÁREA CENTRAL */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', height: '100vh', overflowY: 'auto' }}>
        
        {/* === MODO 1: DASHBOARD (CHAT + CARDS) === */}
        {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', height: '100%' }}>
                
                {/* CHAT CENTRAL */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px' }}>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '100%', maxWidth: '700px' }}>
                            {messages.map((m, i) => (
                                <div key={i} style={{ marginBottom: '20px', textAlign: m.role === 'user' ? 'right' : 'left' }}>
                                    <div style={{ display: 'inline-block', padding: '15px 20px', borderRadius: '20px', background: m.role === 'user' ? '#282A2C' : 'transparent', border: m.role === 'ai' ? '1px solid #444' : 'none', maxWidth: '85%' }}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                    </div>
                    {/* Input Chat */}
                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10px' }}>
                        <div style={{ position: 'relative', width: '100%', maxWidth: '700px' }}>
                            <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend(inputValue)} placeholder="Pergunte à IA..." disabled={isLoading} style={{ width: '100%', padding: '18px', borderRadius: '50px', background: '#1E1F20', border: '1px solid #444', color: 'white', outline: 'none' }} />
                        </div>
                    </div>
                </div>

                {/* SIDEBAR DIREITA (CARDS) */}
                <aside style={{ width: '320px', backgroundColor: '#131314', borderLeft: '1px solid #444', padding: '20px', overflowY: 'auto' }}>
                    <h3 style={{ fontSize: '12px', color: '#888', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase' }}>FERRAMENTAS BULK</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {hextomCards.map((card, index) => (
                            <button key={index} onClick={() => openTool(card)} style={{ padding: '15px', background: '#1E1F20', border: `1px solid ${card.color}40`, borderRadius: '12px', cursor: 'pointer', textAlign: 'left', minHeight: '110px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div style={{ height: '3px', width: '100%', background: card.color, marginBottom: '10px' }}></div>
                                <div style={{ fontSize: '24px' }}>{card.icon}</div>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#fff' }}>{card.title}</div>
                                    <div style={{ fontSize: '10px', color: '#888' }}>{card.desc}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </aside>
            </div>
        )}

        {/* === MODO 2: EDITOR (FILTROS HEXTOM) === */}
        {activeTab === 'editor' && selectedTool && (
            <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
                
                {/* Header com Botão Voltar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                    <button onClick={() => setActiveTab('dashboard')} style={{ background: '#333', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '20px' }}>←</button>
                    <div style={{ fontSize: '32px', background: `${selectedTool.color}20`, padding: '10px', borderRadius: '10px', color: selectedTool.color }}>{selectedTool.icon}</div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '24px' }}>Editar {selectedTool.title}</h1>
                        <p style={{ color: '#888', margin: 0 }}>Filtre os produtos e escolha a ação.</p>
                    </div>
                </div>

                {/* FILTROS (HEXTOM) */}
                <div style={{ backgroundColor: '#1E1F20', border: '1px solid #444', borderRadius: '12px', padding: '25px', marginBottom: '25px' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#E3E3E3', borderBottom: '1px solid #333', paddingBottom: '15px' }}>Passo 1: Selecionar Produtos</h3>
                    
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{color: '#aaa', fontWeight: 'bold'}}>Filtrar por:</span>
                        
                        <select value={filterField} onChange={(e) => setFilterField(e.target.value)} style={{ padding: '12px', borderRadius: '6px', background: '#2C2E30', color: 'white', border: '1px solid #555', minWidth: '150px' }}>
                            <option value="title">Título</option>
                            <option value="type">Categoria</option>
                            <option value="sku">SKU</option>
                        </select>

                        <select value={filterCondition} onChange={(e) => setFilterCondition(e.target.value)} style={{ padding: '12px', borderRadius: '6px', background: '#2C2E30', color: 'white', border: '1px solid #555' }}>
                            <option value="contains">Contém</option>
                            <option value="not_contains">Não contém</option>
                            <option value="is">É igual a</option>
                        </select>

                        <input type="text" placeholder="Valor..." value={filterValue} onChange={(e) => setFilterValue(e.target.value)} style={{ padding: '12px', borderRadius: '6px', background: '#2C2E30', color: 'white', border: '1px solid #555', flex: 1 }} />

                        <button onClick={runPreview} style={{ padding: '12px 20px', borderRadius: '6px', background: '#4285F4', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Buscar</button>
                    </div>

                    {/* Preview Table */}
                    {showPreview && (
                        <div style={{ marginTop: '20px', background: '#252729', borderRadius: '8px', padding: '15px', maxHeight: '300px', overflowY: 'auto' }}>
                            <div style={{ marginBottom: '10px', fontSize: '13px', color: '#aaa' }}>Encontrados: <strong>{filteredProducts.length}</strong> produtos</div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ color: '#888', textAlign: 'left', borderBottom: '1px solid #333' }}>
                                        <th style={{ padding: '8px' }}>Nome</th>
                                        <th style={{ padding: '8px' }}>Preço</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.slice(0, 10).map(p => (
                                        <tr key={p.id} style={{ borderBottom: '1px solid #333' }}>
                                            <td style={{ padding: '8px' }}>{p.name}</td>
                                            <td style={{ padding: '8px', color: '#4CAF50' }}>R$ {p.price}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* PASSO 2 (PLACEHOLDER) */}
                <div style={{ backgroundColor: '#1E1F20', border: '1px solid #444', borderRadius: '12px', padding: '25px', opacity: 0.7 }}>
                    <h3 style={{ marginTop: 0, color: '#E3E3E3' }}>Passo 2: Configurar {selectedTool.title}</h3>
                    <p style={{ color: '#888' }}>Configure a ação de edição em massa aqui.</p>
                    <button style={{ padding: '10px 20px', background: selectedTool.color, border: 'none', borderRadius: '6px', color: 'white', fontWeight: 'bold', cursor: 'not-allowed' }}>Iniciar Edição</button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}
