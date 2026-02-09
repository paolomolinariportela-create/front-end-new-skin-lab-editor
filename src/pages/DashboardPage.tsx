import React, { useState, useRef, useEffect } from 'react';
import ToolsGrid from '../components/ToolsGrid';

// URL REAL do seu backend na Railway
const BACKEND_URL = "https://web-production-4b8a.up.railway.app"; 

interface DashboardPageProps {
  storeId: string;
  token: string;
}

// Ações Rápidas para facilitar a vida do lojista
const QUICK_ACTIONS = [
    { label: "🏷️ Mudar Preço", text: "Alterar o preço dos produtos para..." },
    { label: "📦 Zerar Estoque", text: "Definir estoque como 0 na categoria..." },
    { label: "🔍 SEO Auto", text: "Otimizar o SEO de todos os produtos..." },
    { label: "🎨 Add Cor", text: "Adicionar a cor..." },
];

export default function DashboardPage({ storeId, token }: DashboardPageProps) {
  const [messages, setMessages] = useState<any[]>([
    { role: 'ai', text: 'Olá! Sou a IA do KingUrban. Posso te ajudar a gerenciar seu estoque, preços e SEO.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTool, setActiveTool] = useState<any>(null); 
  
  const chatEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- SINCRONIZAÇÃO ---
  const handleSyncManual = async () => {
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'ai', text: '⏳ Iniciando sincronização... Aguarde.' }]);
    
    try {
        const res = await fetch(`${BACKEND_URL}/sync`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'ai', text: `✅ Sincronização concluída! ${data.total_products} produtos atualizados.` }]);
    } catch (error) {
        setMessages(prev => [...prev, { role: 'ai', text: '❌ Erro ao sincronizar. Tente novamente.' }]);
    } finally {
        setIsLoading(false);
    }
  };

  const activateToolMode = (tool: any) => {
    setActiveTool(tool);
    setInputValue(`Quero usar a ferramenta ${tool.name}...`);
  };

  const deactivateToolMode = () => {
    setActiveTool(null);
    setInputValue('');
  };

  // --- ENVIO DE MENSAGEM ---
  const handleSend = async (text = inputValue) => {
    if (!text.trim()) return;

    // Adiciona mensagem do usuário
    const newMsg = { role: 'user', text };
    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'X-Store-ID': storeId, // Mantido para compatibilidade
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: text })
      });

      const data = await res.json();
      
      // Adiciona resposta da IA (pode conter um comando para aprovação)
      setMessages(prev => [...prev, { 
          role: 'ai', 
          text: data.plan_summary || data.response || "Comando processado.", 
          command: data.command // O Plano de Voo vem aqui
      }]);

    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: '❌ Erro de conexão com o cérebro da IA.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- EXECUÇÃO DO COMANDO (O Botão Vermelho) ---
  const executeCommand = async (command: any) => {
      // Feedback visual imediato
      setIsLoading(true);
      setMessages(prev => [...prev, { role: 'ai', text: '🚀 Executando alterações na loja... Por favor, não feche a página.' }]);

      try {
        const res = await fetch(`${BACKEND_URL}/execute`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ plan: command })
        });

        const result = await res.json();
        
        if (result.status === 'success') {
            setMessages(prev => [...prev, { role: 'ai', text: `✅ Sucesso! ${result.affected_count || 'Vários'} produtos foram alterados.` }]);
        } else {
            setMessages(prev => [...prev, { role: 'ai', text: `⚠️ Algo deu errado: ${result.message}` }]);
        }
      } catch (error) {
          setMessages(prev => [...prev, { role: 'ai', text: '❌ Falha crítica na execução.' }]);
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#131314', color: '#E3E3E3', fontFamily: 'sans-serif' }}>
        
        {/* ÁREA PRINCIPAL DO CHAT */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            
            {/* HEADER COM STATUS */}
            <header style={{ padding: '20px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E1F20' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        🤖 KingUrban AI 
                        {activeTool && <span style={{ fontSize: '12px', backgroundColor: '#4CAF50', color: 'white', padding: '2px 8px', borderRadius: '12px' }}>Modo: {activeTool.name}</span>}
                    </h2>
                    <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Conectado à loja: {storeId}</p>
                </div>
                {activeTool && <button onClick={deactivateToolMode} style={{ background: 'none', border: '1px solid #555', color: '#aaa', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer' }}>Sair do Modo Ferramenta</button>}
            </header>

            {/* LISTA DE MENSAGENS */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {messages.map((m, i) => (
                    <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                        
                        {/* BALÃO DE TEXTO */}
                        <div style={{ 
                            padding: '15px', 
                            borderRadius: '12px', 
                            backgroundColor: m.role === 'user' ? '#0b57d0' : '#282A2C', 
                            color: m.role === 'user' ? 'white' : '#E3E3E3',
                            borderBottomRightRadius: m.role === 'user' ? '0' : '12px',
                            borderBottomLeftRadius: m.role === 'ai' ? '0' : '12px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                            whiteSpace: 'pre-wrap'
                        }}>
                            {m.text}
                        </div>

                        {/* CARTÃO DE CONFIRMAÇÃO (PREVIEW) */}
                        {m.command && (
                            <div style={{ marginTop: '10px', padding: '15px', backgroundColor: '#1E1F20', border: '1px solid #4CAF50', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: '#4CAF50', fontWeight: 'bold' }}>
                                    <span>🚀</span> PLANO DE AÇÃO PRONTO
                                </div>
                                <div style={{ fontSize: '13px', color: '#ccc', marginBottom: '15px', paddingLeft: '10px', borderLeft: '2px solid #444' }}>
                                    O sistema preparou alterações em massa. Revise o resumo acima antes de aprovar.
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button 
                                        onClick={() => executeCommand(m.command)}
                                        disabled={isLoading}
                                        style={{ flex: 1, padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        ✅ APROVAR EXECUÇÃO
                                    </button>
                                    <button 
                                        onClick={() => setMessages(prev => [...prev, { role: 'ai', text: 'Operação cancelada pelo usuário.' }])}
                                        disabled={isLoading}
                                        style={{ flex: 1, padding: '10px', backgroundColor: 'transparent', color: '#F44336', border: '1px solid #F44336', borderRadius: '6px', cursor: 'pointer' }}
                                    >
                                        ❌ CANCELAR
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                
                {/* INDICADOR DE DIGITANDO... */}
                {isLoading && (
                    <div style={{ alignSelf: 'flex-start', padding: '10px 20px', backgroundColor: '#282A2C', borderRadius: '20px', fontSize: '12px', color: '#aaa', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span className="typing-dot">●</span><span className="typing-dot">●</span><span className="typing-dot">●</span> Processando
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* ÁREA DE INPUT + AÇÕES RÁPIDAS */}
            <div style={{ padding: '20px', backgroundColor: '#1E1F20', borderTop: '1px solid #333' }}>
                
                {/* SUGESTÕES RÁPIDAS (CHIPS) */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', overflowX: 'auto', paddingBottom: '5px' }}>
                    {QUICK_ACTIONS.map((qa, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setInputValue(qa.text)}
                            style={{ 
                                padding: '6px 12px', 
                                backgroundColor: '#282A2C', 
                                border: '1px solid #444', 
                                color: '#A8C7FA', 
                                borderRadius: '20px', 
                                fontSize: '12px', 
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#333'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#282A2C'}
                        >
                            {qa.label}
                        </button>
                    ))}
                </div>

                {/* CAMPO DE TEXTO */}
                <div style={{ position: 'relative' }}>
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={activeTool ? `Comando para ${activeTool.name}...` : "Digite seu comando (ex: Aumentar preço em 10%)..."}
                        disabled={isLoading}
                        style={{ 
                            width: '100%', 
                            padding: '15px', 
                            paddingRight: '50px',
                            borderRadius: '12px', 
                            border: activeTool ? '2px solid #4CAF50' : '1px solid #444', 
                            backgroundColor: '#131314', 
                            color: '#E3E3E3', 
                            outline: 'none',
                            fontSize: '14px'
                        }} 
                    />
                    <button 
                        onClick={() => handleSend()} 
                        disabled={isLoading}
                        style={{ 
                            position: 'absolute', 
                            right: '10px', 
                            top: '50%', 
                            transform: 'translateY(-50%)', 
                            background: 'transparent', 
                            border: 'none', 
                            color: inputValue ? '#4CAF50' : '#555', 
                            fontSize: '20px', 
                            cursor: inputValue ? 'pointer' : 'default' 
                        }}
                    >
                        ➤
                    </button>
                </div>
            </div>
        </main>

        {/* SIDEBAR DIREITA (Ferramentas) */}
        <aside style={{ width: '300px', backgroundColor: '#18191A', borderLeft: '1px solid #333', padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <button 
                onClick={handleSyncManual}
                disabled={isLoading}
                style={{ 
                    width: '100%', padding: '12px', borderRadius: '8px', 
                    backgroundColor: isLoading ? '#333' : '#4CAF50', 
                    color: 'white', border: 'none', 
                    cursor: isLoading ? 'wait' : 'pointer', 
                    fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' 
                }}
            >
                {isLoading ? '⏳ ...' : '🔄 Sincronizar Tudo'}
            </button>

            <h3 style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', marginBottom: '10px' }}>Ferramentas Disponíveis</h3>
            <ToolsGrid activeTool={activeTool} onActivate={activateToolMode} />
        </aside>
    </div>
  );
}
