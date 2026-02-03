import React, { useEffect, useState } from "react";
// Importação centralizada para evitar erros de diretório
import { ErrorBoundary, connect, iAmReady, getStoreInfo, getSessionToken } from "@tiendanube/nexo";
import nexo from "./nexoClient";

const App: React.FC = () => {
  const [isConnect, setIsConnect] = useState(false);
  const [store, setStore] = useState<any>(null);

  useEffect(() => {
    // 1. Tenta conectar ao Admin (Padrão Nexo)
    connect(nexo)
      .then(async () => {
        setIsConnect(true);
        iAmReady(nexo); // 2. Avisa que está pronto
        
        // 3. Busca info da loja
        const storeInfo = await getStoreInfo(nexo);
        setStore(storeInfo);
      })
      .catch(() => {
        // Se falhar (como no localhost), liberamos a tela para você ver o design
        setIsConnect(true); 
      });
  }, []);

  return (
    <ErrorBoundary nexo={nexo}>
      <div style={{ 
        padding: '40px', 
        fontFamily: 'sans-serif', 
        background: '#f4f4f4', 
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h1 style={{ color: '#007bff' }}>🤴 King Urban</h1>
          <p>Editor de Lotes Profissional</p>
          <hr style={{ border: '0.5px solid #eee', margin: '20px 0' }} />
          
          {store ? (
            <p>Conectado à loja: <strong>{store.name}</strong></p>
          ) : (
            <p style={{ color: '#888' }}>Modo de Visualização (Offline)</p>
          )}

          <button 
            onClick={async () => {
              const token = await getSessionToken(nexo);
              alert("Token JWT obtido! Pronto para falar com o Python.");
              console.log("Token:", token);
            }}
            style={{ 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              padding: '12px 20px', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Sincronizar com Servidor
          </button>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;