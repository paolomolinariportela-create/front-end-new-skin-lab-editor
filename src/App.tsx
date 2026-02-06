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
  
  // Lista de Produtos (Aba Produtos)
  const [productsList, setProductsList] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Stats e Chat
  const [storeStats, setStoreStats] = useState({ name: 'Carregando...', products: 0, categories: 0 });
  const [messages, setMessages] = useState<any[]>([{ role: 'ai', text: 'Olá! Sou a IA do NewSkin. Posso te ajudar com preços, títulos ou dúvidas sobre seu estoque.' }]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Auto-scroll para o chat
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
      setMessages([{ role: 'ai', text: '⚠️ Atenção: Não encontrei o ID da loja na URL.' }]);
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
                // Apenas atualiza status se já não tiver atualizado
                if(isSyncing) {
                   setMessages(prev => [...prev, { role: 'ai', text: `Conectado! ${data.total_produtos_banco} produtos prontos para edição.` }]);
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
      } catch (error) {
          console.error("Erro produtos", error);
      } finally {
          setLoadingProducts(false);
      }
  };

  useEffect(() => {
    if (!storeId || !isSyncing) return;
    const interval = setInterval(() => checkStoreStatus(storeId), 5000);
    return () => clearInterval(interval);
  }, [storeId, isSyncing]);

  // ==========================================
  // 3. FUNÇÕES DO EXCEL (TABELA)
  // ==========================================
  const handleInputChange = (id: string, field: string, value: any) => {
      setHasChanges(true);
      setProductsList(prevList => 
          prevList.map(p => p.id === id ? { ...p, [field]: value } : p)
      );
  };

  const handleEditVariant = (productId: string, variantIndex: number, currentPrice: number) => {
      const newPrice = window.prompt("Novo preço para esta variante:", currentPrice.toString());
      if (newPrice) {
          setHasChanges(true);
          setProductsList(prevList => prevList.map(p => {
              if (p.id === productId) {
                  const updatedVariants = [...p.variants_json];
                  updatedVariants[variantIndex] = { ...updatedVariants[variantIndex], price: parseFloat(newPrice) };
                  return { ...p, variants_json: updatedVariants };
              }
              return p;
          }));
      }
  };

  const renderVariants = (product: any) => {
      const jsonVariants = product.variants_json;
      if (!jsonVariants || jsonVariants.length === 0) return <span style={{color: '#666', fontSize: '11px'}}>Padrão</span>;

      return (
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', maxWidth: '300px', paddingBottom: '5px', whiteSpace: 'nowrap' }}>
              {jsonVariants.map((v: any, i: number) => {
                  const name = v.values ? v.values.map((val:any) => val.pt).join('/') : 'Único';
                  return (
                      <div key={i} onClick={() => handleEditVariant(product.id, i, v.price || product.price)} 
                        style={{ fontSize: '10px', background: '#333', padding: '4px 6px', borderRadius: '4px', color: '#E3E3E3', border: '1px solid #444', cursor: 'pointer', minWidth: '60px', textAlign: 'center' }}
                        title="Clique para editar preço desta variante">
                          <div style={{ fontWeight: 'bold' }}>{name}</div>
                          <div style={{ color: '#34A853' }}>R$ {v.price || product.price}</div>
                      </div>
                  );
              })}
          </div>
      );
  };

  // ==========================================
  // 4. CHAT E IA (COM A LISTA COMPLETA RESTAURADA)
  // ==========================================
  const hextomCards = [
    { title: "Inventory", desc: "Shipping & Stock", color: "#00BCD4", icon: "📦" }, 
    { title: "Price", desc: "Update prices", color: "#4CAF50", icon: "💲" },
    { title: "Compare At", desc: "Sales price", color: "#FF9800", icon: "⚖️" }, 
    { title: "Tag", desc: "Manage tags", color: "#009688", icon: "🏷️" }, 
    { title: "Title", desc: "SEO & Names", color: "#673AB7", icon: "📝" }, 
    { title: "Description", desc: "HTML Content", color: "#9E9E9E", icon: "📄" }, 
    { title: "Product Type", desc: "Categories", color: "#F44336", icon: "🗂️" }, 
    { title: "Vendor", desc: "Brands", color: "#FF5722", icon: "🏭" }, 
    { title: "Weight", desc: "Shipping calc", color: "#E91E63", icon: "⚖️" }, 
    { title: "Variants", desc: "Options", color: "#2196F3", icon: "🔢" }, 
    { title: "Availability", desc: "Visibility", color: "#FFC107", icon: "👁️" }, 
    { title: "Template", desc: "Layouts", color: "#795548", icon: "📐" } 
  ];

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

      const suggestions = data.suggestions || [];

      setMessages(prev => [...prev, { 
          role: 'ai', 
          text: data.response, 
          type: data.action, 
          data: data.data,
          suggestions: suggestions,
          command: data.command // O Plano da IA vem aqui
      }]);

    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Erro de conexão com o servidor.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeCommand = (command: any) => {
      // Aqui vamos conectar com o backend para aplicar de verdade
      alert(`🚀 APLICANDO ALTERAÇÃO EM MASSA!\n\n${command.type} -> ${JSON.stringify(command.params)}\n\n(Isso enviaria o comando para o Backend processar)`);
  };

  // ==========================================
  // 5. RENDERIZAÇÃO
  // ==========================================
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Inter', system-ui, sans-serif", backgroundColor: '#131314', color: '#E3E3E3', overflow: 'hidden' }}>
      
      {/* SIDEBAR ESQUERDA */}
      <aside style={{ width: '260px', minWidth: '260px', backgroundColor: '#1E1F20', borderRight: '1px solid #444746', padding: '24px', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
        <h2 style={{ background: 'linear-gradient(90deg, #4285F4, #9B72CB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800', fontSize: '24px', marginBottom: '20px', letterSpacing: '-1px' }}>NewSkin Lab</h2>
        
        <div style={{ padding: '20px', backgroundColor: '#282A2C', borderRadius: '16px', border: '1px solid #444746', marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#C4C7C5', letterSpacing: '1px' }}>STATUS</span>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: isSyncing ? '#A8C7FA' : '#34A853', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isSyncing ? '' : <span style={{ width: '8px', height: '8px', backgroundColor: '#34A853', borderRadius: '50%', display: 'inline-block' }}></span>}
                {isSyncing ? 'SYNC...' : 'ONLINE'}
              </span>
            </div>
            <div style={{ width: '100%', height: '4px', backgroundColor: '#444746', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ width: `${syncProgress}%`, height: '100%', backgroundColor: syncProgress < 100 ? '#4285F4' : '#34A853', transition: 'width 0.3s' }}></div>
            </div>
            <div style={{ fontSize: '13px', color: '#E3E3E3', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{storeStats.name}</div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <div onClick={() => setActiveTab('dashboard')} style={{ padding: '12px', backgroundColor: activeTab === 'dashboard' ? '#004A77' : 'transparent', borderRadius: '50px', color: activeTab === 'dashboard' ? '#A8C7FA' : '#C4C7C5', fontWeight: '600', paddingLeft: '20px', cursor: 'pointer', transition: 'all 0.2s' }}>✨ Dashboard</div>
            <div onClick={() => setActiveTab('products')} style={{ padding: '12px', backgroundColor: activeTab === 'products' ? '#004A77' : 'transparent', borderRadius: '50px', color: activeTab === 'products' ? '#A8C7FA' : '#C4C7C5', paddingLeft: '20px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}>📦 Produtos</div>
        </nav>
      </aside>

      {/* ÁREA CENTRAL */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', height: '100vh', overflow: 'hidden' }}>
        
        {/* --- ABA DASHBOARD (CHAT) --- */}
        {activeTab === 'dashboard' && (
            <>
                <div style={{ flex: 1, overflowY: 'auto', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '700px' }}>
                        {messages.map((m, i) => (
                        <div key={i} style={{ marginBottom: '30px', textAlign: m.role === 'user' ? 'right' : 'left' }}>
                            <div style={{ fontSize: '12px', color: '#8E918F', marginBottom: '8px', marginLeft: '10px' }}>{m.role === 'ai' ? 'NewSkin AI ✨' : 'Você'}</div>
                            
                            <div style={{ 
                                display: 'inline-block', 
                                padding: '18px 24px', 
                                borderRadius: '24px', 
                                backgroundColor: m.role === 'user' ? '#282A2C' : 'transparent', 
                                color: '#E3E3E3', 
                                border: m.role === 'user' ? 'none' : 'none', 
                                maxWidth: '90%',
                                textAlign: 'left',
                                lineHeight: '1.6'
                            }}>
                                <div style={{ marginBottom: (m.command || m.suggestions) ? '15px' : '0' }}>{m.text}</div>

                                {/* AÇÃO INTELIGENTE (ActionCard) */}
                                {m.command && (
                                    <div style={{ 
                                        backgroundColor: '#1E1F20', 
                                        border: '1px solid #4285F4', 
                                        borderRadius: '12px', 
                                        padding: '20px', 
                                        marginTop: '15px',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#A8C7FA', fontWeight: 'bold', fontSize: '14px' }}>
                                            <span>⚡ AÇÃO IDENTIFICADA</span>
                                        </div>
                                        
                                        <div style={{ fontSize: '14px', color: '#E3E3E3', marginBottom: '20px', padding: '10px', background: '#282A2C', borderRadius: '8px' }}>
                                            {m.command.type === 'update_price' && (
                                                <>
                                                   Mudar Preço: <strong style={{ color: '#34A853' }}>{m.command.params.operation.toUpperCase()}</strong><br/>
                                                   Valor: <strong>{m.command.params.value} {m.command.params.type === 'percentage' ? '%' : 'R$'}</strong>
                                                </>
                                            )}
                                            {m.command.type === 'edit_title' && (
                                                <>
                                                   Editar Título: <strong style={{ color: '#F4B400' }}>{m.command.params.action.toUpperCase()}</strong><br/>
                                                   Texto: <strong>"{m.command.params.text}"</strong>
                                                </>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button 
                                                onClick={() => executeCommand(m.command)}
                                                style={{ flex: 1, padding: '12px', background: '#4285F4', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
                                                onMouseOver={(e) => e.currentTarget.style.background = '#3367D6'}
                                                onMouseOut={(e) => e.currentTarget.style.background = '#4285F4'}
                                            >
                                                ✅ APROVAR
                                            </button>
                                            <button 
                                                onClick={() => alert("Cancelado!")}
                                                style={{ flex: 1, padding: '12px', background: 'transparent', color: '#F44336', border: '1px solid #F44336', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                                ❌ CANCELAR
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* SUGESTÕES */}
                                {m.suggestions && m.suggestions.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                                        {m.suggestions.map((s: string, idx: number) => (
                                            <button key={idx} onClick={() => handleSend(s)} style={{ background: 'transparent', border: '1px solid #4285F4', color: '#A8C7FA', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer' }}>{s}</button>
                                        ))}
                                    </div>
                                )}

                                {m.type === 'preview_list' && (
                                    <PreviewCard products={m.data} onConfirm={() => alert("Em breve!")} onCancel={() => {}} />
                                )}
                            </div>
                        </div>
                        ))}
                        {isLoading && <div style={{ textAlign: 'left', marginLeft: '20px', color: '#888', fontStyle: 'italic' }}>NewSkin AI está pensando...</div>}
                        <div ref={chatEndRef} />
                    </div>
                </div>

                <div style={{ padding: '20px 40px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '700px' }}>
                        <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend(inputValue)} placeholder="Pergunte à IA (ex: Aumente 10% nos preços)..." disabled={isLoading} style={{ width: '100%', padding: '22px 25px', borderRadius: '100px', border: '1px solid #444746', backgroundColor: '#1E1F20', color: '#E3E3E3', outline: 'none', fontSize: '16px', paddingRight: '60px' }} />
                        <button onClick={() => handleSend(inputValue)} style={{ position: 'absolute', right: '10px', top: '10px', backgroundColor: '#E3E3E3', color: '#131314', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>➤</button>
                    </div>
                </div>
            </>
        )}

        {/* --- ABA PRODUTOS (EXCEL VIEW) --- */}
        {activeTab === 'products' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px', backgroundColor: '#131314' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>Catálogo (Modo Edição)</h1>
                        {hasChanges && <button onClick={() => alert("Em breve: Salvar no Banco")} style={{ background: '#34A853', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>💾 Salvar Alterações</button>}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input 
                            placeholder="🔍 Buscar produto..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && fetchProducts(storeId!, searchTerm)}
                            style={{ padding: '8px 12px', borderRadius: '6px', background: '#282A2C', border: '1px solid #444746', color: 'white', outline: 'none', width: '250px' }}
                        />
                        <button onClick={() => fetchProducts(storeId!, searchTerm)} style={{ padding: '0 15px', borderRadius: '6px', background: '#4285F4', color: 'white', border: 'none', cursor: 'pointer' }}>Filtrar</button>
                    </div>
                </div>

                <div style={{ flex: 1, overflow: 'auto', background: '#1E1F20', borderRadius: '12px', border: '1px solid #444746' }}>
                    <table style={{ width: '100%', minWidth: '1800px', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ position: 'sticky', top: 0, background: '#282A2C', zIndex: 5 }}>
                            <tr>
                                <th style={{ padding: '12px', width: '60px', color: '#aaa', fontSize: '11px', borderBottom: '1px solid #444' }}>IMG</th>
                                <th style={{ padding: '12px', minWidth: '250px', color: '#aaa', fontSize: '11px', borderBottom: '1px solid #444' }}>NOME (EDITÁVEL)</th>
                                <th style={{ padding: '12px', width: '120px', color: '#aaa', fontSize: '11px', borderBottom: '1px solid #444' }}>SKU</th>
                                <th style={{ padding: '12px', minWidth: '300px', color: '#aaa', fontSize: '11px', borderBottom: '1px solid #444' }}>VARIANTES (CLIQUE P/ PREÇO)</th>
                                <th style={{ padding: '12px', width: '100px', color: '#aaa', fontSize: '11px', borderBottom: '1px solid #444' }}>PREÇO</th>
                                <th style={{ padding: '12px', width: '100px', color: '#aaa', fontSize: '11px', borderBottom: '1px solid #444' }}>PROMO</th>
                                <th style={{ padding: '12px', width: '80px', color: '#aaa', fontSize: '11px', borderBottom: '1px solid #444' }}>ESTOQUE</th>
                                <th style={{ padding: '12px', width: '80px', color: '#aaa', fontSize: '11px', borderBottom: '1px solid #444' }}>PESO (kg)</th>
                                <th style={{ padding: '12px', width: '80px', color: '#aaa', fontSize: '11px', borderBottom: '1px solid #444' }}>LARG</th>
                                <th style={{ padding: '12px', width: '80px', color: '#aaa', fontSize: '11px', borderBottom: '1px solid #444' }}>ALT</th>
                                <th style={{ padding: '12px', width: '80px', color: '#aaa', fontSize: '11px', borderBottom: '1px solid #444' }}>PROF</th>
                                <th style={{ padding: '12px', minWidth: '300px', color: '#aaa', fontSize: '11px', borderBottom: '1px solid #444' }}>DESCRIÇÃO (HTML)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingProducts ? (
                                <tr><td colSpan={12} style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Carregando catálogo...</td></tr>
                            ) : productsList.map((p) => (
                                <tr key={p.id} style={{ borderBottom: '1px solid #282A2C' }}>
                                    <td style={{ padding: '10px' }}>
                                        <img src={p.image_url || 'https://via.placeholder.com/40'} style={{ width: '35px', height: '35px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #333' }} />
                                    </td>
                                    <td style={{ padding: '0' }}>
                                        <input 
                                            value={p.name || ''} 
                                            onChange={(e) => handleInputChange(p.id, 'name', e.target.value)}
                                            style={{ width: '100%', background: 'transparent', border: 'none', color: '#E3E3E3', padding: '12px', fontSize: '13px' }}
                                        />
                                    </td>
                                    <td style={{ padding: '0' }}>
                                        <input 
                                            value={p.sku || ''} 
                                            onChange={(e) => handleInputChange(p.id, 'sku', e.target.value)}
                                            style={{ width: '100%', background: 'transparent', border: 'none', color: '#888', padding: '12px', fontSize: '12px' }}
                                        />
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        {renderVariants(p)}
                                    </td>
                                    <td style={{ padding: '0' }}>
                                        <input 
                                            type="number"
                                            value={p.price || ''} 
                                            onChange={(e) => handleInputChange(p.id, 'price', e.target.value)}
                                            style={{ width: '100%', background: 'transparent', border: 'none', color: '#34A853', fontWeight: 'bold', padding: '12px', fontSize: '13px' }}
                                        />
                                    </td>
                                    <td style={{ padding: '0' }}>
                                        <input 
                                            type="number"
                                            value={p.promotional_price || ''} 
                                            onChange={(e) => handleInputChange(p.id, 'promotional_price', e.target.value)}
                                            placeholder="-"
                                            style={{ width: '100%', background: 'transparent', border: 'none', color: '#F44336', padding: '12px', fontSize: '13px' }}
                                        />
                                    </td>
                                    <td style={{ padding: '0' }}>
                                        <input 
                                            type="number"
                                            value={p.stock || 0} 
                                            onChange={(e) => handleInputChange(p.id, 'stock', e.target.value)}
                                            style={{ width: '100%', background: 'transparent', border: 'none', color: p.stock > 0 ? '#A8C7FA' : '#666', padding: '12px', fontSize: '13px' }}
                                        />
                                    </td>
                                    {/* Dimensões */}
                                    <td style={{ padding: '0' }}><input type="number" value={p.weight || ''} onChange={(e) => handleInputChange(p.id, 'weight', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: '#aaa', padding: '12px', fontSize: '12px' }}/></td>
                                    <td style={{ padding: '0' }}><input type="number" value={p.width || ''} onChange={(e) => handleInputChange(p.id, 'width', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: '#aaa', padding: '12px', fontSize: '12px' }}/></td>
                                    <td style={{ padding: '0' }}><input type="number" value={p.height || ''} onChange={(e) => handleInputChange(p.id, 'height', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: '#aaa', padding: '12px', fontSize: '12px' }}/></td>
                                    <td style={{ padding: '0' }}><input type="number" value={p.depth || ''} onChange={(e) => handleInputChange(p.id, 'depth', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: '#aaa', padding: '12px', fontSize: '12px' }}/></td>
                                    
                                    <td style={{ padding: '0' }}>
                                        <input 
                                            value={p.description ? p.description.substring(0, 50) + '...' : ''} 
                                            onChange={(e) => handleInputChange(p.id, 'description', e.target.value)}
                                            style={{ width: '100%', background: 'transparent', border: 'none', color: '#666', padding: '12px', fontSize: '11px', fontStyle: 'italic' }}
                                            title="Descrição completa é HTML. Edição segura em breve."
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ marginTop: '10px', textAlign: 'right', fontSize: '12px', color: '#666' }}>Mostrando {productsList.length} itens</div>
            </div>
        )}

      </main>

      {/* SIDEBAR DIREITA (FERRAMENTAS BULK - RESTAURADA!) */}
      {activeTab === 'dashboard' && (
        <aside style={{ width: '340px', minWidth: '340px', backgroundColor: '#131314', borderLeft: '1px solid #444746', padding: '24px', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#C4C7C5', marginBottom: '20px', letterSpacing: '1px', textTransform: 'uppercase' }}>Ferramentas Bulk</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {hextomCards.map((card, index) => (
                <button key={index} onClick={() => handleSend(`Executar ferramenta: ${card.title}`)} style={{ padding: '16px', backgroundColor: '#1E1F20', border: `1px solid ${card.color}40`, borderRadius: '16px', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', overflow: 'hidden', minHeight: '120px' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: card.color }}></div>
                    <div style={{ fontSize: '24px' }}>{card.icon}</div>
                    <div><div style={{ fontWeight: '600', fontSize: '14px', color: '#E3E3E3' }}>{card.title}</div><div style={{ fontSize: '11px', color: '#8E918F' }}>{card.desc}</div></div>
                </button>
            ))}
            </div>
        </aside>
      )}

    </div>
  );
}
