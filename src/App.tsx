import { useState, useEffect } from 'react';

// === IMPORTAÇÃO DOS COMPONENTES E PÁGINAS ===
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import HistoryPage from './pages/HistoryPage';

// URL do Backend
const BACKEND_URL = "https://web-production-4b8a.up.railway.app"; 

export default function NewSkinApp() {
  // ==========================================
  // 1. ESTADOS GLOBAIS
  // ==========================================
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [storeId, setStoreId] = useState<string | null>(null);
  
  // Dados para a Sidebar (Status da Loja)
  const [isSyncing, setIsSyncing] = useState(true);
  const [syncProgress, setSyncProgress] = useState(0);
  const [storeStats, setStoreStats] = useState({ name: 'Carregando...', products: 0, categories: 0 });

  // ==========================================
  // 2. LÓGICA DE INICIALIZAÇÃO E MONITORAMENTO
  // ==========================================
  
  // Captura o ID da Loja na URL
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

  // Loop de verificação de Status (Apenas LEITURA, sem disparar ações)
  useEffect(() => {
    if (!storeId) return;
    // Verifica a cada 5 segundos
    const interval = setInterval(() => checkStoreStatus(storeId), 5000);
    return () => clearInterval(interval);
  }, [storeId]);

  // Função que busca dados da loja
  const checkStoreStatus = (id: string) => {
      fetch(`${BACKEND_URL}/admin/status/${id}`)
        .then(res => res.json())
        .then(data => {
            setStoreStats({
                name: data.loja_nome || `Loja ${id}`,
                products: data.total_produtos_banco || 0,
                categories: data.total_categorias_banco || 0
            });

            // Lógica visual da barra de progresso
            if (data.total_produtos_banco > 0) {
                 // Se já tem produtos, consideramos online/concluído
                 setSyncProgress(100);
                 setIsSyncing(false); 
            } else {
                 // Se ainda está vazio, mostra que está carregando visualmente
                 setIsSyncing(true);
                 setSyncProgress(old => old < 90 ? old + 5 : old);
            }
        })
        .catch(() => {
            // Se der erro no status, apenas loga no console, NÃO tenta sincronizar de novo
            console.log("Aguardando backend...");
        });
  };

  // ==========================================
  // 3. RENDERIZAÇÃO
  // ==========================================
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Inter', sans-serif", backgroundColor: '#131314', color: '#E3E3E3', overflow: 'hidden' }}>
      
      {/* MENU LATERAL */}
      <Sidebar 
          storeStats={storeStats}
          isSyncing={isSyncing}
          syncProgress={syncProgress}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
      />

      {/* ÁREA PRINCIPAL */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', height: '100vh', overflow: 'hidden' }}>
        
        {/* Caso não tenha ID na URL */}
        {!storeId && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#F44336' }}>
                ⚠️ Erro: Store ID não encontrado na URL. Adicione ?store_id=SEU_ID ao final do link.
            </div>
        )}

        {/* Renderiza a página baseada na aba ativa */}
        {storeId && (
            <>
                {/* 1. Dashboard com Chat e Ferramentas */}
                {activeTab === 'dashboard' && (
                    <DashboardPage storeId={storeId} />
                )}
                
                {/* 2. Tabela de Produtos */}
                {activeTab === 'products' && (
                    <ProductsPage storeId={storeId} />
                )}
                
                {/* 3. Histórico e Reversão */}
                {activeTab === 'history' && (
                    <HistoryPage storeId={storeId} />
                )}
            </>
        )}

      </main>
    </div>
  );
}
