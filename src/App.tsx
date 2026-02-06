import { useState, useEffect, useRef } from 'react';

// ==========================================
// CONFIGURAÇÃO
// ==========================================
const BACKEND_URL = "https://web-production-4b8a.up.railway.app"; 

export default function NewSkinApp() {
  // ==========================================
  // 1. ESTADOS
  // ==========================================
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [storeId, setStoreId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const [syncProgress, setSyncProgress] = useState(0);
   
  // Lista de Produtos
  const [productsList, setProductsList] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Stats
  const [storeStats, setStoreStats] = useState({ name: 'Carregando...', products: 0, categories: 0 });
  
  // (ESTADOS DA IA REMOVIDOS AQUI: messages, inputValue, isLoading, chatEndRef)

  // ==========================================
  // 2. LÓGICA DE CARREGAMENTO (MANTIDA)
  // ==========================================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('store_id');

    if (id) {
      setStoreId(id);
      checkStoreStatus(id);
    } else {
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
  // 3. FUNÇÕES UX (PRODUTOS)
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

  // ==========================================
  // CONFIGURAÇÃO DOS CARDS (Hextom Style)
  // ==========================================
  const hextomCards = [
    { title: "Price", desc: "Update prices, create sales (De/Por)", color: "#4CAF50", icon: "💲" },
    { title: "Title", desc: "SEO, Prefixes, Suffixes & Replace", color: "#673AB7", icon: "📝" }, 
    { title: "Inventory", desc: "Manage Stock levels", color: "#00BCD4", icon: "📦" }, 
    { title: "Compare At", desc: "Manage original prices", color: "#FF9800", icon: "⚖️" }, 
    { title: "Description", desc: "HTML Content editor", color: "#9E9E9E", icon: "📄" }, 
    { title: "Tag", desc: "Add or remove product tags", color: "#009688", icon: "🏷️" }, 
    { title: "Product Type", desc: "Organize Categories", color: "#F44336", icon: "🗂️" }, 
    { title: "Vendor", desc: "Manage Brands", color: "#FF5722", icon: "🏭" }, 
    { title: "Variants", desc: "Edit options in bulk", color: "#2196F3", icon: "🔢" }, 
  ];

  // Função temporária para simular o clique no card (já que removemos a IA)
  const handleCardClick = (cardTitle: string) => {
      alert(`Em breve: Abrir ferramenta ${cardTitle} em modo visual (sem IA).`);
      // AQUI NO FUTURO: Abrirá o Modal/Página da ferramenta específica
  };


  // ==========================================
  // 4. RENDERIZAÇÃO PRINCIPAL
  // ==========================================
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Inter', system-ui, sans-serif", backgroundColor: '#131314', color: '#E3E3E3', overflow: 'hidden' }}>
      
      {/* --- SIDEBAR ESQUERDA (MANTIDA INTACTA) --- */}
      <aside style={{ width: '260px', minWidth: '260px', backgroundColor: '#1E1F20', borderRight: '1px solid #444746', padding: '24px', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
        <h2 style={{ background: 'linear-gradient(90deg, #4285F4, #9B72CB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800', fontSize: '24px', marginBottom: '20px', letterSpacing: '-1px' }}>NewSkin Lab</h2>
        
        {/* Status Card */}
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
                <div style={{ fontSize: '14px', color: '#E3E3E3', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{storeStats.name}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div><div style={{ fontSize: '10px', color: '#8E918F', marginBottom: '2px' }}>PRODUTOS</div><div style={{ fontSize: '14px', color: '#A8C7FA', fontWeight: 'bold' }}>{storeStats.products}</div></div>
                <div style={{ width: '1px', backgroundColor: '#444746', height: '25px' }}></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: '10px', color: '#8E918F', marginBottom: '2px' }}>CATEGORIAS</div><div style={{ fontSize: '14px', color: '#A8C7FA', fontWeight: 'bold' }}>{storeStats.categories}</div></div>
            </div>
        </div>

        {/* Menu */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <div onClick={() => setActiveTab('dashboard')} style={{ padding: '12px', backgroundColor: activeTab === 'dashboard' ? '#004A77' : 'transparent', borderRadius: '50px', color: activeTab === 'dashboard' ? '#A8C7FA' : '#C4C7C5', fontWeight: '600', paddingLeft: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}><span>✨</span> Dashboard</div>
            <div onClick={() => setActiveTab('products')} style={{ padding: '12px', backgroundColor: activeTab === 'products' ? '#004A77' : 'transparent', borderRadius: '50px', color: activeTab === 'products' ? '#A8C7FA' : '#C4C7C5', paddingLeft: '20px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}><span>📦</span> Produtos</div>
            <div onClick={() => alert("Em breve")} style={{ padding: '12px', color: '#C4C7C5', paddingLeft: '20px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}><span>📜</span> Histórico</div>
        </nav>
      </aside>

      {/* --- ÁREA CENTRAL (REMODELADA) --- */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', height: '100vh', overflowY: 'auto', backgroundColor: '#131314' }}>
        
        {/* CONTEÚDO DO DASHBOARD (AGORA SÃO OS CARDS) */}
        {activeTab === 'dashboard' && (
            <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#E3E3E3', marginBottom: '10px' }}>Painel de Ferramentas</h1>
                    <p style={{ color: '#8E918F' }}>Selecione uma ferramenta abaixo para iniciar a edição em massa.</p>
                </div>

                {/* GRID DE CARDS CENTRALIZADOS E LARGOS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {hextomCards.map((card, index) => (
                        <button 
                            key={index} 
                            onClick={() => handleCardClick(card.title)}
                            style={{
                                padding: '24px',
                                backgroundColor: '#1E1F20', // Fundo escuro do card
                                border: `1px solid ${card.color}40`, // Borda sutil com a cor do card
                                borderRadius: '16px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center', // Ícone ao lado do texto
                                gap: '20px',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.2s ease',
                                minHeight: '110px'
                            }}
                            onMouseEnter={(e) => { 
                                e.currentTarget.style.backgroundColor = '#282A2C'; 
                                e.currentTarget.style.transform = 'translateY(-3px)';
                                e.currentTarget.style.boxShadow = `0 10px 20px -10px ${card.color}30`;
                            }}
                            onMouseLeave={(e) => { 
                                e.currentTarget.style.backgroundColor = '#1E1F20'; 
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {/* Barra de cor superior */}
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: card.color }}></div>

                            {/* Ícone */}
                            <div style={{ fontSize: '32px', flexShrink: 0 }}>{card.icon}</div>

                            {/* Textos */}
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '700', fontSize: '18px', color: '#E3E3E3', marginBottom: '4px' }}>{card.title}</div>
                                <div style={{ fontSize: '13px', color: '#8E918F' }}>{card.desc}</div>
                            </div>
                            
                            {/* Seta indicativa */}
                            <div style={{ color: card.color, fontSize: '20px', opacity: 0.7 }}>→</div>
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* TAB DE PRODUTOS (MANTIDA IGUAL) */}
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
      </main>

      {/* SIDEBAR DIREITA REMOVIDA AQUI */}

    </div>
  );
}
