import React, { useState } from 'react';

// URL do Backend
const BACKEND_URL = "https://web-production-4b8a.up.railway.app"; 

interface LoginPageProps {
  onLoginSuccess: (token: string, storeId: string) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [storeId, setStoreId] = useState('');
  const [password, setPassword] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // --- OPÇÃO 1: LOGIN VIA NUVEMSHOP (Recomendado/OAuth) ---
  const handleNuvemshopLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
        const res = await fetch(`${BACKEND_URL}/auth/nuvemshop/url`);
        if (!res.ok) throw new Error("Falha ao iniciar autenticação.");
        
        const data = await res.json();
        
        // Redireciona para a Nuvemshop
        window.location.href = data.url;
        
    } catch (error) {
        console.error(error);
        setErrorMsg("Erro ao conectar com Nuvemshop.");
        setIsLoading(false);
    }
  };

  // --- OPÇÃO 2: LOGIN CLÁSSICO (ID/Senha) ---
  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
        const res = await fetch(`${BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ store_id: storeId, password: password })
        });

        const data = await res.json();

        if (res.ok && data.access_token) {
            onLoginSuccess(data.access_token, data.store_id);
        } else {
            setErrorMsg(data.detail || "Falha no login. Verifique os dados.");
        }
    } catch (error) {
        console.error(error);
        setErrorMsg("Erro de conexão com o servidor.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        
        {/* LOGO E CABEÇALHO */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🤖</div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#fff' }}>NewSkin AI</h1>
          <p style={{ color: '#888', margin: '5px 0 0 0', fontSize: '14px' }}>Gestão Inteligente de E-commerce</p>
        </div>

        {/* OPÇÃO 1: BOTÃO GRANDE NUVEMSHOP */}
        <button 
            onClick={handleNuvemshopLogin}
            disabled={isLoading}
            style={nuvemshopButtonStyle}
        >
            {isLoading ? 'Conectando...' : '🛍️ Entrar com Nuvemshop'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: '#555' }}>
            <div style={{ flex: 1, height: '1px', background: '#333' }}></div>
            <span style={{ padding: '0 10px', fontSize: '12px' }}>OU ACESSO MANUAL</span>
            <div style={{ flex: 1, height: '1px', background: '#333' }}></div>
        </div>

        {/* OPÇÃO 2: FORMULÁRIO */}
        <form onSubmit={handleManualLogin}>
            <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>ID da Loja</label>
                <input 
                    type="text" 
                    value={storeId}
                    onChange={(e) => setStoreId(e.target.value)}
                    placeholder="Ex: 123456"
                    style={inputStyle}
                    required
                />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Senha de Acesso</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={inputStyle}
                />
            </div>

            {errorMsg && (
                <div style={{ padding: '10px', backgroundColor: 'rgba(244, 67, 54, 0.1)', color: '#F44336', borderRadius: '6px', fontSize: '13px', marginBottom: '15px', textAlign: 'center' }}>
                    {errorMsg}
                </div>
            )}

            <button 
                type="submit" 
                disabled={isLoading}
                style={loginButtonStyle}
            >
                {isLoading ? 'Verificando...' : 'Acessar Painel'}
            </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#666' }}>
            Protegido por criptografia bancária SSL/TLS.
        </p>
      </div>
    </div>
  );
}

// --- ESTILOS CSS-IN-JS ---

const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#0a0a0a',
    fontFamily: 'sans-serif'
};

const cardStyle: React.CSSProperties = {
    backgroundColor: '#131314',
    padding: '40px',
    borderRadius: '16px',
    border: '1px solid #333',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    color: '#aaa',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase'
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #333',
    backgroundColor: '#1E1F20',
    color: 'white',
    outline: 'none',
    fontSize: '14px',
    marginBottom: '5px'
};

const nuvemshopButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#0b57d0',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '15px',
    cursor: 'pointer',
    transition: 'background 0.2s'
};

const loginButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px',
    borderRadius: '8px',
    border: '1px solid #4CAF50',
    backgroundColor: 'transparent',
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s'
};
