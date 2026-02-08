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
  const [token, setToken] = useState<string | null>(null); // <--- NOVO: Estado do Token
  
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
      // Tenta pegar o ID da URL
      const params = new URLSearchParams(window.location.search);
      const urlStoreId = params.get('store_id');
      
      // Tenta pegar um token que já esteja salvo (para não precisar logar toda vez)
      const savedToken = localStorage.getItem('newskin_token');

      if (urlStoreId) {
        // Se tem ID na URL, fazemos o LOGIN para pegar o Token
        handleLogin(urlStoreId);
      } else if (savedToken) {
        // Se já tem token salvo, usamos ele direto
        setToken(savedToken);
        // Opcional: Decodificar o token para pegar o ID, mas o backend vai confirmar depois
        setIsSyncing(true); 
      } else {
        setIsSyncing(false);
      }
    };

    initApp();
  }, []);

  // Função de Login (Troca ID por Token)
  const handleLogin = async (id: string) => {
    try {
      console.log("🔐 Tentando autenticar loja:", id);
      const res = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_id: id })
      });

      const data = await res.json();

      if (res.ok && data.access_token) {
        // Sucesso!
        setToken(data.access_token);
        setStoreId(id);
        localStorage.setItem('newskin_token', data.access_token); // Salva no navegador
        console.log("✅ Login realizado com sucesso!");
        
        // Limpa a URL para ninguém ver o ID (Opcional, mas seguro)
        window.history.replaceState({}, document.title, "/");
      } else {
        setAuthError("Falha no login: Loja não autorizada.");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      setAuthError("Erro de conexão com o servidor.");
    }
  };

  // ==========================================
  // 3. MONITORAMENTO DE STATUS (COM TOKEN)
  // ==========================================

  useEffect(() => {
    // Só roda se tivermos o TOKEN
    if (!token) return;

    // Função de checagem
    const checkStatus = () => {
      // NOTA: A rota mudou. Antes era /admin/status/{id}, agora é só /admin/status
      // O ID vai escondido dentro do cabeçalho Authorization
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
            categories: data.total_categorias_banco || 0
        });

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

  const handleLogout = () => {
      setToken(null);
      setStoreId(null);
      localStorage.removeItem('newskin_token');
      setAuthError(null);
  };

  // ==========================================
  // 4. RENDERIZAÇÃO
  // ==========================================
  
  // Se houver erro de login, mostra tela de erro
  if (authError) {
      return (
        <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#131314', color: '#fff', flexDirection: 'column' }}>
            <h2>🚫 Acesso Negado</h2>
            <p>{authError}</p>
            <button onClick={() => window.location.reload()} style={{ marginTop: 20, padding: '10px 20px', cursor: 'pointer' }}>Tentar Novamente</button>
        </div>
      );
  }

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
        
        {/* Caso não tenha Token nem ID */}
        {!token && !storeId && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                <h3>🔐 Aguardando Autenticação...</h3>
                <p>Se nada acontecer, adicione <code>?store_id=SEU_ID</code> na URL.</p>
            </div>
        )}

        {/* Renderiza a página baseada na aba ativa - AGORA PASSANDO O TOKEN */}
        {token && (
            <>
                {activeTab === 'dashboard' && (
                    <DashboardPage storeId={storeId || ''} token={token} />
                )}
                
                {activeTab === 'products' && (
                    <ProductsPage storeId={storeId || ''} token={token} />
                )}
                
                {activeTab === 'history' && (
                    <HistoryPage storeId={storeId || ''} token={token} />
                )}
            </>
        )}

      </main>
    </div>
  );
}
