import { useState, useEffect } from 'react';

// === IMPORTAÇÃO DOS COMPONENTES E PÁGINAS ===
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import HistoryPage from './pages/HistoryPage';
import LoginPage from './LoginPage'; // <--- 1. IMPORTAÇÃO DA NOVA TELA DE LOGIN

// URL do Backend
const BACKEND_URL = "https://web-production-4b8a.up.railway.app"; 

export default function NewSkinApp() {
  // ==========================================
  // 1. ESTADOS GLOBAIS
  // ==========================================
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [storeId, setStoreId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  // Dados para a Sidebar (Status da Loja)
  const [isSyncing, setIsSyncing] = useState(true);
  const [syncProgress, setSyncProgress] = useState(0);
  const [storeStats, setStoreStats] = useState({ name: 'Carregando...', products: 0, categories: 0 });
  const [authError, setAuthError] = useState<string | null>(null);

  // ==========================================
  // 2. LÓGICA DE AUTENTICAÇÃO E INICIALIZAÇÃO
  // ==========================================
  
  useEffect(() => {
    const initApp = async () => {
      // Tenta pegar o ID da URL (caso venha de um redirecionamento antigo)
      const params = new URLSearchParams(window.location.search);
      const urlStoreId = params.get('store_id');
      const urlToken = params.get('token'); // Se vier do callback da Nuvemshop
      
      // Tenta pegar um token que já esteja salvo
      const savedToken = localStorage.getItem('newskin_token');
      const savedStoreId = localStorage.getItem('newskin_store_id');

      if (urlToken && urlStoreId) {
          // Caso 1: Redirecionamento Pós-Login Nuvemshop (Callback)
          handleLoginSuccess(urlToken, urlStoreId);
          // Limpa a URL para segurança
          window.history.replaceState({}, document.title, "/");
      } 
      else if (savedToken && savedStoreId) {
        // Caso 2: Sessão Restaurada
        setToken(savedToken);
        setStoreId(savedStoreId);
        setIsSyncing(true); 
      } 
      else if (urlStoreId) {
        // Caso 3: URL antiga apenas com ID (Tenta login manual no background, raro)
        // Melhor deixar cair no LoginPage para segurança
        setIsSyncing(false);
      } 
      else {
        // Caso 4: Usuário novo -> Vai para LoginPage
        setIsSyncing(false);
      }
    };

    initApp();
  }, []);

  // Função Centralizada de Sucesso no Login
  const handleLoginSuccess = (newToken: string, newStoreId: string) => {
      setToken(newToken);
      setStoreId(newStoreId);
      localStorage.setItem('newskin_token', newToken);
      localStorage.setItem('newskin_store_id', newStoreId);
      console.log("✅ Autenticado com sucesso!");
      setAuthError(null);
  };

  const handleLogout = () => {
      setToken(null);
      setStoreId(null);
      localStorage.removeItem('newskin_token');
      localStorage.removeItem('newskin_store_id');
      setAuthError(null);
      // Redireciona para home limpa
      window.history.replaceState({}, document.title, "/");
  };

  // ==========================================
  // 3. MONITORAMENTO DE STATUS (COM TOKEN)
  // ==========================================

  useEffect(() => {
    // Só roda se tivermos o TOKEN
    if (!token) return;

    // Função de checagem
    const checkStatus = () => {
      fetch(`${BACKEND_URL}/admin/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // <--- A CHAVE MESTRA AQUI
          'Content-Type': 'application/json'
        }
      })
      .then(res => {
        if (res.status === 401) {
            // Se der erro 401, o token venceu. Desloga.
            handleLogout();
            return null;
        }
        return res.json();
      })
      .then(data => {
        if (!data) return;

        setStoreStats({
            name: data.loja_nome || 'Minha Loja',
            products: data.total_produtos_banco || 0,
            categories: data.total_categorias_banco || 0 // Ajuste se seu backend retornar outro campo
        });

        // Lógica de progresso visual
        if (data.total_produtos_banco > 0) {
             setSyncProgress(100);
             setIsSyncing(false); 
        } else {
             setIsSyncing(true);
             setSyncProgress(old => old < 90 ? old + 5 : old);
        }
      })
      .catch((err) => {
        console.log("Aguardando backend...", err);
      });
    };

    // Roda agora e a cada 5 segundos
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);

  }, [token]);

  // ==========================================
  // 4. RENDERIZAÇÃO
  // ==========================================
  
  // Se não tem token, mostra a NOVA TELA DE LOGIN
  if (!token) {
      return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Se houver erro crítico de auth (token inválido), o useEffect acima já desloga.

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Inter', sans-serif", backgroundColor: '#131314', color: '#E3E3E3', overflow: 'hidden' }}>
      
      {/* MENU LATERAL */}
      <Sidebar 
          storeStats={storeStats}
          isSyncing={isSyncing}
          syncProgress={syncProgress}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout} // Passamos a função de logout para o sidebar (se ele tiver botão)
      />

      {/* ÁREA PRINCIPAL */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', height: '100vh', overflow: 'hidden' }}>
        
        {/* Renderiza a página baseada na aba ativa - PASSANDO O TOKEN */}
        
        {activeTab === 'dashboard' && (
            <DashboardPage storeId={storeId || ''} token={token} />
        )}
        
        {activeTab === 'products' && (
            <ProductsPage storeId={storeId || ''} token={token} />
        )}
        
        {activeTab === 'history' && (
            <HistoryPage storeId={storeId || ''} token={token} />
        )}

      </main>
    </div>
  );
}
