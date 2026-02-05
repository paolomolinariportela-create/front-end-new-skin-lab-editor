import { useState, useEffect } from 'react';
import PreviewCard from './PreviewCard';

const BACKEND_URL = "https://web-production-4b8a.up.railway.app"; 

export default function NewSkinApp() {
  // ==========================================
  // 1. ESTADOS (AQUI FICA A MEMÓRIA DO APP)
  // ==========================================
  
  // Controle de Abas (NOVO!)
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' ou 'products'

  const [storeId, setStoreId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const [syncProgress, setSyncProgress] = useState(0);
  
  // Dados do Topo
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
  // 2. LÓGICA DE CARREGAMENTO (USE EFFECT)
  // ==========================================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('store_id');

    if (id) {
      setStoreId(id);

      // Checa status inicial
      fetch(`${BACKEND_URL}/admin/status/${id}`)
        .then(res => res.json())
        .then(data => {
            setStoreStats({
                name: data.loja_nome || `Loja ${id}`,
                products: data.total_produtos_banco || 0,
                categories: data.total_categorias_banco || 0
            });

            if (data.ultimo_erro === "SYNC_CONCLUIDO") {
                setMessages([{ role: 'ai', text: `Loja identificada! Seus dados já estão carregados. Pode começar.` }]);
                setSyncProgress(100);
                setIsSyncing(false); 
            } 
            else {
                setMessages([{ role: 'ai', text: `Iniciando sincronização...` }]);
                fetch(`${BACKEND_URL}/sync?store_id=${id}`, { method: 'POST' }).catch(console.error);
            }
        })
        .catch(() => {
            fetch(`${BACKEND_URL}/sync?store_id=${id}`, { method: 'POST' });
        });
        
    } else {
      setMessages([{ role: 'ai', text: '⚠️ Atenção: Não encontrei o ID da loja.' }]);
      setIsSyncing(false);
    }
  }, []);

  // Monitoramento em Tempo Real
  useEffect(() => {
    if (!storeId || !isSyncing) return;

    const checkStatus = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/admin/status/${storeId}`);
        const data = await res.json();
        
        setStoreStats({
            name: data.loja_nome || `Loja ${storeId}`,
            products: data.total_produtos_banco || 0,
            categories: data.total_categorias_banco || 0
        });

        if (data.ultimo_erro === "SYNC_CONCLUIDO") {
            setSyncProgress(100);
            setIsSyncing(false);
            setMessages(prev => [...prev, { role: 'ai', text: `✅ Sincronização finalizada! ${data.total_produtos_banco} produtos prontos.` }]);
        } else {
            setSyncProgress(old => old < 90 ? old + 5 : old);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [storeId, isSyncing]);

  // ==========================================
  // 3. FUNÇÕES DE AÇÃO (CHAT)
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
    if (!text) return;
    if (!storeId) return alert("Erro: ID da loja não encontrado.");

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
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: '...' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Erro de Conexão.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 4. RENDERIZAÇÃO (O HTML DA TELA)
  // ==========================================
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Inter', system-ui, sans-serif", backgroundColor: '#131314', color: '#E3E3E3', overflow: 'hidden' }}>
      
      {/* --- SIDEBAR ESQUERDA --- */}
      <aside style={{ width: '260px', minWidth: '260px', backgroundColor: '#1E1F20', borderRight: '1px solid #444746', padding: '24px', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
        
        {/* Logo e Status no Topo */}
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

            <div style={{ borderTop: '1px solid #444746', paddingTop: '12px' }}>
                <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '10px', color: '#8E918F', marginBottom: '2px' }}>LOJA</div>
                    <div style={{ fontSize: '13px', color: '#E3E3E3', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{storeStats.name}</div>
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
        </div>

        {/* --- MENU COM CLIQUES FUNCIONANDO --- */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            
            {/* Botão DASHBOARD */}
            <div 
                onClick={() => setActiveTab('dashboard')} // <--- CLIQUE AQUI
                style={{ 
                    padding: '12px', 
                    backgroundColor: activeTab === 'dashboard' ? '#004A77' : 'transparent', // <--- COR MUDA SE ATIVO
                    borderRadius: '50px', 
                    color: activeTab === 'dashboard' ? '#A8C7FA' : '#C4C7C5', 
                    fontWeight: '600', 
                    paddingLeft: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}>
                ✨ Dashboard
            </div>
            
            {/* Botão PRODUTOS */}
            <div 
                onClick={() => setActiveTab('products')} // <--- CLIQUE AQUI
                style={{ 
                    padding: '12px', 
                    backgroundColor: activeTab === 'products' ? '#004A77' : 'transparent', // <--- COR MUDA SE ATIVO
                    borderRadius: '50px', 
                    color: activeTab === 'products' ? '#A8C7FA' : '#C4C7C5', 
                    paddingLeft: '20px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                }}>
                📦 Produtos
            </div>

            <div style={{ padding: '12px', color: '#C4C7C5', cursor: 'pointer', paddingLeft: '20px' }}>📜 Histórico</div>
            <div style={{ padding: '12px', color: '#C4C7C5', cursor: 'pointer', paddingLeft: '20px' }}>⚙️ Configurações</div>
        </nav>
      </aside>


      {/* --- ÁREA CENTRAL (MUDA CONFORME A ABA) --- */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', height: '100vh', overflow: 'hidden' }}>
        
        {/* ######################################################## */}
        {/* OPÇÃO 1: SE FOR ABA DASHBOARD -> MOSTRA O CHAT           */}
        {/* ######################################################## */}
        {activeTab === 'dashboard' && (
            <>
                <div style={{ flex: 1, overflowY: 'auto', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '700px' }}>
                        {messages.map((m, i) => (
                        <div key={i} style={{ marginBottom: '30px', textAlign: m.role === 'user' ? 'right' : 'left' }}>
                            <div style={{ fontSize: '12px', color: '#8E918F', marginBottom: '8px', marginLeft: '10px', marginRight: '10px' }}>
                                {m.role === 'ai' ? 'NewSkin AI ✨' : 'Você'}
                            </div>
                            
                            {m.type === 'preview' ? (
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ display: 'inline-block', padding: '18px 24px', color: '#E3E3E3', maxWidth: '90%' }}>
                                        <div style={{ marginBottom: '10px' }}>{m.text}</div>
                                        <PreviewCard products={m.data} onConfirm={() => alert("Em breve!")} onCancel={() => {}} />
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'inline-block', padding: '18px 24px', borderRadius: '24px', backgroundColor: m.role === 'user' ? '#282A2C' : 'transparent', color: '#E3E3E3', maxWidth: '80%', lineHeight: '1.6', fontSize: '16px' }}>
                                    {m.text}
                                </div>
                            )}
                        </div>
                        ))}
                        {isLoading && <div style={{ marginLeft: '20px', color: '#888' }}>Pensando...</div>}
                    </div>
                </div>

                {/* Input do Chat */}
                <div style={{ padding: '20px 40px 40px 40px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', maxWidth: '700px' }}>
                        <input 
                            type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend(inputValue)}
                            placeholder="Pergunte à IA ou use os cards ao lado..." disabled={isLoading}
                            style={{ width: '100%', padding: '22px 25px', borderRadius: '100px', border: '1px solid #444746', backgroundColor: '#1E1F20', color: '#E3E3E3', outline: 'none', fontSize: '16px', paddingRight: '60px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }} 
                        />
                        <button onClick={() => handleSend(inputValue)} disabled={isLoading} style={{ position: 'absolute', right: '10px', backgroundColor: isLoading ? '#444746' : '#E3E3E3', color: '#131314', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{isLoading ? '...' : '➤'}</button>
                    </div>
                </div>
            </>
        )}

        {/* ######################################################## */}
        {/* OPÇÃO 2: SE FOR ABA PRODUTOS -> MOSTRA A TABELA (NOVO!)  */}
        {/* ######################################################## */}
        {activeTab === 'products' && (
            <div style={{ padding: '40px', height: '100%', overflowY: 'auto' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>📦 Gerenciador de Catálogo</h1>
                
                {/* Barra de Busca Fictícia (por enquanto) */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <input 
                        placeholder="🔍 Buscar por nome, SKU ou categoria..." 
                        style={{ flex: 1, padding: '15px', borderRadius: '8px', background: '#282A2C', border: '1px solid #444746', color: 'white', outline: 'none' }}
                    />
                    <button style={{ padding: '0 20px', borderRadius: '8px', background: '#4285F4', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Filtrar</button>
                </div>

                {/* Área da Tabela */}
                <div style={{ background: '#1E1F20', padding: '40px', borderRadius: '12px', textAlign: 'center', border: '1px solid #444746' }}>
                    <div style={{ fontSize: '40px', marginBottom: '20px' }}>🚧</div>
                    <h3 style={{ color: '#E3E3E3', marginBottom: '10px' }}>Área de Produtos em Construção</h3>
                    <p style={{ color: '#8E918F' }}>
                        O Backend já possui <strong>{storeStats.products} produtos</strong> sincronizados. <br/>
                        Na próxima etapa, vamos conectar a tabela para listar todos eles aqui.
                    </p>
                </div>
            </div>
        )}

      </main>

      {/* --- COLUNA DIREITA (SÓ APARECE NO DASHBOARD) --- */}
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
