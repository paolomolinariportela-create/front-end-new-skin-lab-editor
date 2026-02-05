import { useState, useEffect } from 'react';
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
  
  // Estado para a Lista de Produtos
  const [productsList, setProductsList] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [storeStats, setStoreStats] = useState({
      name: 'Carregando...',
      products: 0,
      categories: 0
  });

  const [messages, setMessages] = useState<any[]>([
    { role: 'ai', text: 'Olá! Conectando à sua loja...' }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
                setMessages([{ role: 'ai', text: `Loja identificada! Seus dados já estão carregados.` }]);
                setSyncProgress(100);
                setIsSyncing(false); 
            } else {
                setMessages([{ role: 'ai', text: `Iniciando sincronização...` }]);
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
          console.error("Erro ao buscar produtos", error);
      } finally {
          setLoadingProducts(false);
      }
  };

  useEffect(() => {
    if (!storeId || !isSyncing) return;
    const interval = setInterval(() => checkStoreStatus(storeId), 3000);
    return () => clearInterval(interval);
  }, [storeId, isSyncing]);

  // ==========================================
  // 3. FUNÇÕES DE INTERAÇÃO (NOVO)
  // ==========================================
  
  // Função que simula a edição ao clicar na variante
  const handleEditVariant = (productName: string, variant: any) => {
      // Monta o nome da variante (Ex: "G / Azul")
      const variantName = variant.values.map((v:any) => v.pt).join(' / ') || 'Padrão';
      
      // Abre um prompt simples (depois podemos fazer um modal bonito)
      const newPrice = window.prompt(
          `Editar Variante: ${productName} - ${variantName}\n\nPreço Atual: R$ ${variant.price}\nEstoque Atual: ${variant.stock}\n\nDigite o novo preço para testar (Ex: 99.90):`, 
          variant.price
      );

      if (newPrice) {
          alert(`📝 Simulação: Preço da variante "${variantName}" alterado para R$ ${newPrice}.\n(Na próxima etapa conectaremos isso ao backend para salvar de verdade!)`);
          // Aqui futuramente chamaremos fetch(PUT /products/variant...)
      }
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

      if (data.action === 'preview_list' && data.data) {
          setMessages(prev => [...prev, { role: 'ai', text: data.response, type: 'preview', data: data.data }]);
      } else if (data.response) {
        setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Erro de Conexão.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Função auxiliar para renderizar variantes com SCROLL HORIZONTAL
  const renderVariants = (product: any) => {
      const jsonVariants = product.variants_json;
      if (!jsonVariants || jsonVariants.length === 0) return <span style={{color: '#666'}}>Padrão</span>;

      return (
          <div style={{ 
              display: 'flex', 
              gap: '8px', 
              overflowX: 'auto', // <--- MÁGICA DO SCROLL
              maxWidth: '350px', // Limita largura para forçar scroll se tiver muitos
              paddingBottom: '5px',
              whiteSpace: 'nowrap'
          }}>
              {jsonVariants.map((v: any, i: number) => {
                  // Monta o nome (Ex: "G / Azul")
                  const name = v.values ? v.values.map((val:any) => val.pt).join('/') : 'Único';
                  
                  return (
                      <div 
                        key={i} 
                        onClick={() => handleEditVariant(product.name, v)} // <--- CLIQUE PARA EDITAR
                        style={{ 
                            fontSize: '11px', 
                            background: '#333', 
                            padding: '4px 8px', 
                            borderRadius: '6px', 
                            color: '#E3E3E3',
                            border: '1px solid #444',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            minWidth: '60px',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#444'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#333'}
                        title="Clique para editar esta variante"
                      >
                          <span style={{ fontWeight: 'bold', marginBottom: '2px' }}>{name}</span>
                          <span style={{ color: '#34A853' }}>R$ {v.price || product.price}</span>
                          <span style={{ color: '#888', fontSize: '9px' }}>Estoque: {v.stock || 0}</span>
                      </div>
                  );
              })}
          </div>
      );
  };

  // ==========================================
  // 4. RENDERIZAÇÃO
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
            <div style={{ fontSize: '13px', color: '#E3E3E3', fontWeight: 'bold' }}>{storeStats.name}</div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <div onClick={() => setActiveTab('dashboard')} style={{ padding: '12px', backgroundColor: activeTab === 'dashboard' ? '#004A77' : 'transparent', borderRadius: '50px', color: activeTab === 'dashboard' ? '#A8C7FA' : '#C4C7C5', fontWeight: '600', paddingLeft: '20px', cursor: 'pointer' }}>✨ Dashboard</div>
            <div onClick={() => setActiveTab('products')} style={{ padding: '12px', backgroundColor: activeTab === 'products' ? '#004A77' : 'transparent', borderRadius: '50px', color: activeTab === 'products' ? '#A8C7FA' : '#C4C7C5', paddingLeft: '20px', cursor: 'pointer', fontWeight: '600' }}>📦 Produtos</div>
        </nav>
      </aside>

      {/* ÁREA CENTRAL */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', height: '100vh', overflow: 'hidden' }}>
        
        {/* --- ABA DASHBOARD --- */}
        {activeTab === 'dashboard' && (
            <>
                <div style={{ flex: 1, overflowY: 'auto', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '700px' }}>
                        {messages.map((m, i) => (
                        <div key={i} style={{ marginBottom: '30px', textAlign: m.role === 'user' ? 'right' : 'left' }}>
                            <div style={{ fontSize: '12px', color: '#8E918F', marginBottom: '8px', marginLeft: '10px' }}>{m.role === 'ai' ? 'NewSkin AI ✨' : 'Você'}</div>
                            {m.type === 'preview' ? (
                                <div style={{ textAlign: 'left' }}><div style={{ display: 'inline-block', padding: '18px 24px', color: '#E3E3E3' }}><div style={{ marginBottom: '10px' }}>{m.text}</div><PreviewCard products={m.data} onConfirm={() => alert("Em breve!")} onCancel={() => {}} /></div></div>
                            ) : (
                                <div style={{ display: 'inline-block', padding: '18px 24px', borderRadius: '24px', backgroundColor: m.role === 'user' ? '#282A2C' : 'transparent', color: '#E3E3E3', border: m.role === 'user' ? 'none' : 'none', maxWidth: '80%' }}>{m.text}</div>
                            )}
                        </div>
                        ))}
                        {isLoading && <div style={{ marginLeft: '20px', color: '#888' }}>Pensando...</div>}
                    </div>
                </div>
                <div style={{ padding: '20px 40px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '700px' }}>
                        <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend(inputValue)} placeholder="Pergunte à IA..." disabled={isLoading} style={{ width: '100%', padding: '22px 25px', borderRadius: '100px', border: '1px solid #444746', backgroundColor: '#1E1F20', color: '#E3E3E3', outline: 'none' }} />
                        <button onClick={() => handleSend(inputValue)} style={{ position: 'absolute', right: '10px', top: '10px', backgroundColor: '#E3E3E3', color: '#131314', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer' }}>➤</button>
                    </div>
                </div>
            </>
        )}

        {/* --- ABA PRODUTOS (TABELA COMPLETA COM SCROLL) --- */}
        {activeTab === 'products' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '30px', backgroundColor: '#131314' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: 'bold' }}>Gerenciador de Catálogo</h1>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input 
                            placeholder="🔍 Buscar produto..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && fetchProducts(storeId!, searchTerm)}
                            style={{ padding: '10px 15px', borderRadius: '8px', background: '#282A2C', border: '1px solid #444746', color: 'white', outline: 'none', width: '300px' }}
                        />
                        <button onClick={() => fetchProducts(storeId!, searchTerm)} style={{ padding: '0 20px', borderRadius: '8px', background: '#4285F4', color: 'white', border: 'none', cursor: 'pointer' }}>Filtrar</button>
                    </div>
                </div>

                <div style={{ flex: 1, overflow: 'auto', background: '#1E1F20', borderRadius: '12px', border: '1px solid #444746' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ position: 'sticky', top: 0, background: '#282A2C', zIndex: 5 }}>
                            <tr>
                                <th style={{ padding: '15px', color: '#8E918F', fontSize: '12px', borderBottom: '1px solid #444746' }}>IMAGEM</th>
                                <th style={{ padding: '15px', color: '#8E918F', fontSize: '12px', borderBottom: '1px solid #444746' }}>PRODUTO</th>
                                <th style={{ padding: '15px', color: '#8E918F', fontSize: '12px', borderBottom: '1px solid #444746' }}>SKU BASE</th>
                                <th style={{ padding: '15px', color: '#8E918F', fontSize: '12px', borderBottom: '1px solid #444746', width: '40%' }}>VARIANTES (Role para o lado ➡️)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingProducts ? (
                                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Carregando catálogo...</td></tr>
                            ) : productsList.map((p) => (
                                <tr key={p.id} style={{ borderBottom: '1px solid #282A2C' }}>
                                    <td style={{ padding: '12px 15px' }}>
                                        <img src={p.image_url || 'https://via.placeholder.com/40'} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', backgroundColor: '#333' }} />
                                    </td>
                                    <td style={{ padding: '12px 15px', fontWeight: '500', color: '#E3E3E3' }}>{p.name}</td>
                                    <td style={{ padding: '12px 15px', color: '#888', fontSize: '13px' }}>{p.sku || '-'}</td>
                                    <td style={{ padding: '12px 15px' }}>
                                        {/* RENDERIZA LISTA HORIZONTAL DE VARIANTES */}
                                        {renderVariants(p)}
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

      {/* SIDEBAR DIREITA */}
      {activeTab === 'dashboard' && (
        <aside style={{ width: '340px', minWidth: '340px', backgroundColor: '#131314', borderLeft: '1px solid #444746', padding: '24px', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#C4C7C5', marginBottom: '20px', letterSpacing: '1px', textTransform: 'uppercase' }}>Ferramentas Bulk</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {hextomCards.map((card, index) => (
                <button key={index} onClick={() => handleSend(`Executar ferramenta: ${card.title}`)} style={{ padding: '16px', backgroundColor: '#1E1F20', border: `1px solid ${card.color}40`, borderRadius: '16px', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', overflow: 'hidden' }}>
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
