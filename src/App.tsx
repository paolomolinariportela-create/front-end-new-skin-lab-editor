import { useState, useEffect, useRef } from 'react';
import PreviewCard from './PreviewCard';
import PricePage from './pages/PricePage'; // Certifique-se que o arquivo está nesta pasta

const BACKEND_URL = "https://web-production-4b8a.up.railway.app"; 

export default function NewSkinApp() {
  // ==========================================
  // 1. ESTADOS
  // ==========================================
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [storeId, setStoreId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const [syncProgress, setSyncProgress] = useState(0);
  
  // --- NOVO: CONTROLE DE PÁGINA DE FERRAMENTA ---
  const [currentToolPage, setCurrentToolPage] = useState<string | null>(null);

  // Lista de Produtos
  const [productsList, setProductsList] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false); 
  const [searchTerm, setSearchTerm] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Stats
  const [storeStats, setStoreStats] = useState({ name: 'Carregando...', products: 0, categories: 0 });
  const [messages, setMessages] = useState<any[]>([{ role: 'ai', text: 'Olá! Sou a IA do NewSkin. Posso te ajudar com preços, títulos ou dúvidas sobre seu estoque.' }]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const chatEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Só rola para baixo se não estiver numa página de ferramenta
    if (!currentToolPage) scrollToBottom();
  }, [messages, currentToolPage]);

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
          command: data.command 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Erro de conexão com o servidor.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // CORREÇÃO: Atualizado para ler o novo JSON sem quebrar
  const executeCommand = (command: any) => {
      // Tenta ler formato novo (changes array)
      if (command?.changes && command.changes.length > 0) {
          const c = command.changes[0];
          alert(`🚀 EXECUTANDO PLANO:\n\nAção: ${c.action}\nCampo: ${c.field}\nValor: ${c.value}\nEscopo: ${command.scope}`);
      } else {
          // Fallback formato antigo
          alert(`🚀 COMANDO: ${JSON.stringify(command)}`);
      }
  };

  // ==========================================
  // 4. RENDERIZAÇÃO
  // ==========================================
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Inter', system-ui, sans-serif", backgroundColor: '#131314', color: '#E3E3E3', overflow: 'hidden' }}>
      
      {/* SIDEBAR ESQUERDA (FIXA) */}
      <aside style={{ width: '260px', minWidth: '260px', backgroundColor: '#1E1F20', borderRight: '1px solid #444746', padding: '24px', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
        
        <h2 style={{ background: 'linear-gradient(90deg, #4285F4, #9B72CB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800', fontSize: '24px', marginBottom: '20px', letterSpacing: '-1px' }}>NewSkin Lab</h2>
        
        {/* CARD DE STATUS */}
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

            <div style={{ borderTop: '1px solid #444746', paddingTop: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', color: '#8E918F', marginBottom: '2px' }}>LOJA</div>
                <div style={{ fontSize: '14px', color: '#E3E3E3', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {storeStats.name}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ fontSize: '10px', color: '#8E918F', marginBottom: '2px' }}>PRODUTOS</div>
                    <div style={{ fontSize: '14px', color: '#A8C7FA', fontWeight: 'bold' }}>{storeStats.products}</div>
                </div>
                <div style={{ width: '1px', backgroundColor: '#444746', height: '25px' }}></div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: '#8E918F', marginBottom: '2px' }}>CATEGORIAS</div>
                    <div style={{ fontSize: '14px', color: '#A8C7FA', fontWeight: 'bold' }}>{storeStats.categories}</div>
                </div>
            </div>
        </div>

        {/* MENU */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <div onClick={() => { setActiveTab('dashboard'); setCurrentToolPage(null); }} style={{ padding: '12px', backgroundColor: (activeTab === 'dashboard' && !currentToolPage) ? '#004A77' : 'transparent', borderRadius: '50px', color: (activeTab === 'dashboard' && !currentToolPage) ? '#A8C7FA' : '#C4C7C5', fontWeight: '600', paddingLeft: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}><span>✨</span> Dashboard</div>
            <div onClick={() => { setActiveTab('products'); setCurrentToolPage(null); }} style={{ padding: '12px', backgroundColor: activeTab === 'products' ? '#004A77' : 'transparent', borderRadius: '50px', color: activeTab === 'products' ? '#A8C7FA' : '#C4C7C5', paddingLeft: '20px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}><span>📦</span> Produtos</div>
            <div onClick={() => alert("Em breve")} style={{ padding: '12px', color: '#C4C7C5', paddingLeft: '20px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}><span>📜</span> Histórico</div>
            <div onClick={() => alert("Em breve")} style={{ padding: '12px', color: '#C4C7C5', paddingLeft: '20px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}><span>💎</span> Planos</div>
            <div onClick={() => alert("Em breve")} style={{ padding: '12px', color: '#C4C7C5', paddingLeft: '20px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}><span>💬</span> Fale Conosco</div>
        </nav>
      </aside>

      {/* ÁREA CENTRAL - DINÂMICA */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', height: '100vh', overflow: 'hidden' }}>
        
        {/* ROTEAMENTO: PREÇO vs DASHBOARD */}
        {activeTab === 'dashboard' && currentToolPage === 'Price' ? (
            <PricePage onBack={() => setCurrentToolPage(null)} storeId={storeId} />
        ) : (
            <>
                {activeTab === 'dashboard' && (
                    <div style={{ display: 'flex', height: '100%' }}>
                        {/* CHAT CENTRAL */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ width: '100%', maxWidth: '700px' }}>
                                {messages.map((m, i) => (
                                <div key={i} style={{ marginBottom: '30px', textAlign: m.role === 'user' ? 'right' : 'left' }}>
                                    <div style={{ fontSize: '12px', color: '#8E918F', marginBottom: '8px', marginLeft: '10px' }}>{m.role === 'ai' ? 'NewSkin AI ✨' : 'Você'}</div>
                                    <div style={{ display: 'inline-block', padding: '18px 24px', borderRadius: '24px', backgroundColor: m.role === 'user' ? '#282A2C' : 'transparent', color: '#E3E3E3', border: m.role === 'user' ? 'none' : 'none', maxWidth: '90%', textAlign: 'left' }}>
                                        <div style={{ marginBottom: (m.command || m.suggestions) ? '15px' : '0' }}>{m.text}</div>
                                        
                                        {/* --- CORREÇÃO TELA PRETA: Renderização Segura do JSON Novo --- */}
                                        {m.command && (
                                            <div style={{ backgroundColor: '#1E1F20', border: '1px solid #4285F4', borderRadius: '12px', padding: '20px', marginTop: '15px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#A8C7FA', fontWeight: 'bold' }}><span>⚡ AÇÃO PLANEJADA</span></div>
                                                <div style={{ fontSize: '14px', color: '#E3E3E3', marginBottom: '20px', padding: '10px', background: '#282A2C', borderRadius: '8px' }}>
                                                    {m.command.changes ? (
                                                        // Renderiza JSON NOVO (Lista de mudanças)
                                                        <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
                                                            <div><strong>Ação:</strong> {m.command.changes[0]?.action} {m.command.changes[0]?.field}</div>
                                                            <div><strong>Valor Alvo:</strong> {m.command.changes[0]?.value}</div>
                                                            <div style={{fontSize:'12px', color:'#888'}}>Escopo: {m.command.scope}</div>
                                                        </div>
                                                    ) : (
                                                        // Renderiza Fallback (ou JSON antigo)
                                                        <span>{m.command.type || "Comando complexo recebido."}</span>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <button onClick={() => executeCommand(m.command)} style={{ flex: 1, padding: '12px', background: '#4285F4', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>✅ APROVAR</button>
                                                    <button onClick={() => alert("Cancelado")} style={{ flex: 1, padding: '12px', background: 'transparent', color: '#F44336', border: '1px solid #F44336', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>❌ CANCELAR</button>
                                                </div>
                                            </div>
                                        )}
                                        {/* ----------------------------------------------------------- */}

                                        {m.suggestions && <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>{m.suggestions.map((s: string, idx: number) => <button key={idx} onClick={() => handleSend(s)} style={{ background: 'transparent', border: '1px solid #4285F4', color: '#A8C7FA', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer' }}>{s}</button>)}</div>}
                                        {m.type === 'preview_list' && <PreviewCard products={m.data} onConfirm={() => alert("Em breve!")} onCancel={() => {}} />}
                                    </div>
                                </div>
                                ))}
                                {isLoading && <div style={{ textAlign: 'left', marginLeft: '20px', color: '#888' }}>NewSkin AI está pensando...</div>}
                                <div ref={chatEndRef} />
                            </div>

                            <div style={{ marginTop: 'auto', width: '100%', display: 'flex', justifyContent: 'center', paddingBottom: '20px' }}>
                                <div style={{ position: 'relative', width: '100%', maxWidth: '700px' }}>
                                    <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend(inputValue)} placeholder="Pergunte à IA..." disabled={isLoading} style={{ width: '100%', padding: '22px 25px', borderRadius: '100px', border: '1px solid #444746', backgroundColor: '#1E1F20', color: '#E3E3E3', outline: 'none' }} />
                                    <button onClick={() => handleSend(inputValue)} style={{ position: 'absolute', right: '10px', top: '10px', backgroundColor: '#E3E3E3', color: '#131314', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer' }}>➤</button>
                                </div>
                            </div>
                        </div>

                        {/* SIDEBAR DIREITA (CARDS) */}
                        <aside style={{ width: '340px', minWidth: '340px', backgroundColor: '#131314', borderLeft: '1px solid #444746', padding: '24px', overflowY: 'auto' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#C4C7C5', marginBottom: '20px', letterSpacing: '1px', textTransform: 'uppercase' }}>Ferramentas Bulk</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {hextomCards.map((card, index) => (
                                <button 
                                    key={index} 
                                    onClick={() => card.title === 'Price' ? setCurrentToolPage('Price') : handleSend(`Executar ferramenta: ${card.title}`)} 
                                    style={{ padding: '16px', backgroundColor: '#1E1F20', border: `1px solid ${card.color}40`, borderRadius: '16px', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', overflow: 'hidden', minHeight: '120px' }}
                                >
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: card.color }}></div>
                                    <div style={{ fontSize: '24px' }}>{card.icon}</div>
                                    <div><div style={{ fontWeight: '600', fontSize: '14px', color: '#E3E3E3' }}>{card.title}</div><div style={{ fontSize: '11px', color: '#8E918F' }}>{card.desc}</div></div>
                                </button>
                            ))}
                            </div>
                        </aside>
                    </div>
                )}

                {/* TAB DE PRODUTOS */}
                {activeTab === 'products' && (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px', backgroundColor: '#131314' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>Catálogo</h1>{hasChanges && <button style={{ background: '#34A853', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px' }}>💾 Salvar</button>}</div>
                            <div style={{ display: 'flex', gap: '10px' }}><input placeholder="🔍 Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', background: '#282A2C', border: '1px solid #444746', color: 'white' }} /><button onClick={() => fetchProducts(storeId!, searchTerm)} style={{ padding: '0 15px', borderRadius: '6px', background: '#4285F4', color: 'white', border: 'none' }}>Filtrar</button></div>
                        </div>
                        <div style={{ flex: 1, overflow: 'auto', background: '#1E1F20', borderRadius: '12px', border: '1px solid #444746' }}>
                            <table style={{ width: '100%', minWidth: '1800px', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ position: 'sticky', top: 0, background: '#282A2C', zIndex: 5 }}>
                                    <tr><th style={{ padding: '12px', color: '#aaa' }}>IMG</th><th style={{ padding: '12px', color: '#aaa' }}>NOME</th><th style={{ padding: '12px', color: '#aaa' }}>SKU</th><th style={{ padding: '12px', color: '#aaa' }}>VARIANTES</th><th style={{ padding: '12px', color: '#aaa' }}>PREÇO</th><th style={{ padding: '12px', color: '#aaa' }}>ESTOQUE</th><th style={{ padding: '12px', color: '#aaa' }}>DESCRIÇÃO</th></tr>
                                </thead>
                                <tbody>
                                    {loadingProducts ? (
                                        <tr><td colSpan={7} style={{textAlign: 'center', padding: '20px', color: '#888'}}>Carregando catálogo...</td></tr>
                                    ) : (
                                        productsList.map((p) => (
                                            <tr key={p.id} style={{ borderBottom: '1px solid #282A2C' }}>
                                                <td style={{ padding: '10px' }}><img src={p.image_url} style={{ width: '35px', borderRadius: '4px' }} /></td>
                                                <td style={{ padding: '0' }}><input value={p.name} onChange={(e) => handleInputChange(p.id, 'name', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: '#E3E3E3', padding: '12px' }}/></td>
                                                <td style={{ padding: '0' }}><input value={p.sku} onChange={(e) => handleInputChange(p.id, 'sku', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: '#888', padding: '12px' }}/></td>
                                                <td style={{ padding: '10px' }}>{renderVariants(p)}</td>
                                                <td style={{ padding: '0' }}><input type="number" value={p.price} onChange={(e) => handleInputChange(p.id, 'price', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: '#34A853', fontWeight: 'bold', padding: '12px' }}/></td>
                                                <td style={{ padding: '0' }}><input type="number" value={p.stock} onChange={(e) => handleInputChange(p.id, 'stock', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: '#A8C7FA', padding: '12px' }}/></td>
                                                <td style={{ padding: '0' }}><input value={p.description?.substring(0,50)} onChange={(e) => handleInputChange(p.id, 'description', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: '#666', padding: '12px' }}/></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </>
        )}

      </main>
    </div>
  );
}
