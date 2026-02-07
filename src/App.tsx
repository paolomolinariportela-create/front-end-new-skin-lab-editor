import { useState, useEffect } from 'react';

// === IMPORTAÇÃO DOS COMPONENTES E PÁGINAS ===
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import HistoryPage from './pages/HistoryPage';

// URL do Backend (Mantive a que você enviou no snippet)
const BACKEND_URL = "https://web-production-4b8a.up.railway.app"; 

export default function NewSkinApp() {
  // ==========================================
  // 1. ESTADOS GLOBAIS (Apenas o essencial)
  // ==========================================
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [storeId, setStoreId] = useState<string | null>(null);
  
  // Dados para a Sidebar (Status da Loja)
  const [isSyncing, setIsSyncing] = useState(true);
  const [syncProgress, setSyncProgress] = useState(0);
  const [storeStats, setStoreStats] = useState({ name: 'Carregando...', products: 0, categories: 0 });

  // ==========================================
  // 2. LÓGICA DE INICIALIZAÇÃO E SYNC
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

  // Loop de verificação de Status (Mantém a barra lateral atualizada)
  useEffect(() => {
    if (!storeId || !isSyncing) return;
    const interval = setInterval(() => checkStoreStatus(storeId), 5000);
    return () => clearInterval(interval);
  }, [storeId, isSyncing]);

  // Função que busca dados da loja (Nome, contagem de produtos, status do sync)
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
                // Simula progresso se estiver rodando
                setSyncProgress(old => old < 90 ? old + 10 : old);
                // Força o sync se necessário
                fetch(`${BACKEND_URL}/sync?store_id=${id}`, { method: 'POST' }).catch(console.error);
            }
        })
        .catch(() => {
            // Tenta disparar sync se falhar status
            fetch(`${BACKEND_URL}/sync?store_id=${id}`, { method: 'POST' });
        });
  };

  // ==========================================
  // 3. RENDERIZAÇÃO LIMPA
  // ==========================================
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Inter', sans-serif", backgroundColor: '#131314', color: '#E3E3E3', overflow: 'hidden' }}>
      
      {/* MENU LATERAL (Componente Isolado) */}
      <Sidebar 
          storeStats={storeStats}
          isSyncing={isSyncing}
          syncProgress={syncProgress}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
      />

      {/* ÁREA PRINCIPAL (Roteador de Páginas) */}
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
