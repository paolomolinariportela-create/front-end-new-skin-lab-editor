import React, { useState, useRef, useEffect } from 'react';
import ToolsGrid from '../components/ToolsGrid';

// URL REAL do seu backend na Railway
const BACKEND_URL = "https://web-production-4b8a.up.railway.app"; 

interface DashboardPageProps {
  storeId: string;
  token: string;
}

// ✨ NOVOS BOTÕES DE AÇÃO RÁPIDA (CHIPS)
const QUICK_ACTIONS = [
  { label: "🏷️ Mudar Preço", text: "Alterar o preço dos produtos para..." },
  { label: "📦 Zerar Estoque", text: "Definir estoque como 0 na categoria..." },
  { label: "🔍 SEO Auto", text: "Otimizar o SEO de todos os produtos..." },
  { label: "🎨 Add Cor", text: "Adicionar a cor..." },
];

export default function DashboardPage({ storeId, token }: DashboardPageProps) {
  // Estados do Chat
  const [messages, setMessages] = useState<any[]>([
    { role: 'ai', text: 'Olá! Sou a IA do KingUrban. Posso te ajudar a consultar ou editar seu estoque.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTool, setActiveTool] = useState<any>(null); 
  
  const chatEndRef = useRef<null | HTMLDivElement>(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- FUNÇÃO DE SINCRONIZAÇÃO MANUAL ---
  const handleSyncManual = async () => {
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'ai', text: '⏳ Iniciando sincronização completa... Buscando produtos na Nuvemshop.' }]);
    
    try {
        const res = await fetch(`${BACKEND_URL}/sync`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'ai', text: `✅ Sincronização concluída! ${data.total_products} produtos atualizados no cérebro da IA.` }]);
    } catch (error) {
        setMessages(prev => [...prev, { role: 'ai', text: '❌ Erro ao sincronizar. Verifique sua conexão.' }]);
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

    // 1. Adiciona mensagem do usuário na tela
    const newMsg = { role: 'user', text };
    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 2. Envia para o Backend (Router Inteligente)
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'X-Store-ID': storeId,
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: text })
      });

      const data = await res.json();
      
      // 3. Adiciona resposta da IA na tela
      const aiResponse = { 
          role: 'ai', 
          text: data.plan_summary || data.response || "Comando processado.", 
          command: data.command 
      };
      setMessages(prev => [...prev, aiResponse]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', text: '❌ Erro de conexão com o cérebro da IA.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- EXECUÇÃO DO COMANDO (Quando clica em APROVAR) ---
  const executeCommand = async (command: any) => {
      // Removemos o window.confirm nativo feio. A UI já serviu de confirmação.
      setIsLoading(true);
      setMessages(prev => [...prev, { role: 'ai', text: '🚀 Executando comando na loja... Isso pode levar alguns segundos.' }]);

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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            
            {/* HEADER DO CHAT (Modo Ferramenta) */}
            {activeTool && (
                <div style={{ padding: '10px 20px', backgroundColor: '#1E1F20', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#4CAF50', fontWeight: 'bold' }}>🔧 Modo: {activeTool.name}</span>
                    <button onClick={deactivateToolMode} style={{ background: 'none', border: '1px solid #555', color: '#aaa', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Sair do Modo</button>
                </div>
            )}

            {/* LISTA DE MENSAGENS */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {messages.map((m, i) => (
                    <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                        
                        {/* ✨ BALÃO DE MENSAGEM MELHORADO ✨ */}
                        <div style={{ 
                            padding: '12px 16px', 
                            borderRadius: '12px', 
                            backgroundColor: m.role === 'user' ? '#0b57d0' : '#282A2C', 
                            color: m.role === 'user' ? 'white' : '#E3E3E3',
                            borderBottomRightRadius: m.role === 'user' ? '0' : '12px',
                            borderBottomLeftRadius: m.role === 'ai' ? '0' : '12px',
                            lineHeight: '1.5',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            whiteSpace: 'pre-wrap'
                        }}>
                            {m.text}
                        </div>

                        {/* CARTÃO DE CONFIRMAÇÃO (PREVIEW) */}
                        {m.command && (
                            <div style={{ marginTop: '10px', padding: '15px', backgroundColor: '#1E1F20', border: '1px solid #4CAF50', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: '#4CAF50', fontWeight: 'bold', fontSize: '14px' }}>
                                    <span>🚀</span> PLANO PRONTO
                                </div>
                                <div style={{ fontSize: '12px', color: '#ccc', marginBottom: '15px', paddingLeft: '10px', borderLeft: '2px solid #444' }}>
                                    Revise o resumo acima. Ação irreversível.
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button 
                                        onClick={() => executeCommand(m.command)}
                                        disabled={isLoading}
                                        style={{ flex: 1, padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                                    >
                                        APROVAR
                                    </button>
                                    <button 
                                        onClick={() => setMessages(prev => [...prev, { role: 'ai', text: 'Operação cancelada.' }])}
                                        disabled={isLoading}
                                        style={{ flex: 1, padding: '10px', backgroundColor: 'transparent', color: '#F44336', border: '1px solid #F44336', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                                    >
                                        CANCELAR
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                
                {isLoading && (
                    <div style={{ alignSelf: 'flex-start', padding: '10px 15px', backgroundColor: '#282A2C', borderRadius: '20px', fontSize: '12px', color: '#aaa' }}>
                        Digitando...
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* ÁREA DE INPUT */}
            <div style={{ padding: '20px', borderTop: '1px solid #333', backgroundColor: '#131314' }}>
                
                {/* ✨ SUGESTÕES RÁPIDAS (NOVO) ✨ */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', overflowX: 'auto', paddingBottom: '5px' }}>
                    {QUICK_ACTIONS.map((qa, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setInputValue(qa.text)}
                            style={{ 
                                padding: '6px 12px', 
                                backgroundColor: '#282A2C', 
                                border: '1px solid #444', 
                                color: '#A8C7FA', 
                                borderRadius: '16px', 
                                fontSize: '11px', 
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {qa.label}
                        </button>
                    ))}
                </div>

                <div style={{ position: 'relative' }}>
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={activeTool ? `Comando para ${activeTool.name}...` : "Digite sua solicitação..."}
                        disabled={isLoading}
                        style={{ width: '100%', padding: '15px', paddingRight: '50px', borderRadius: '24px', border: activeTool ? '2px solid #4CAF50' : '1px solid #444', backgroundColor: '#1E1F20', color: '#E3E3E3', outline: 'none' }} 
                    />
                    <button 
                        onClick={() => handleSend(inputValue)} 
                        disabled={isLoading}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: inputValue ? '#4CAF50' : '#555' }}
                    >
                        ➤
                    </button>
                </div>
            </div>
        </div>

        {/* SIDEBAR DIREITA */}
        <aside style={{ width: '340px', minWidth: '340px', backgroundColor: '#131314', borderLeft: '1px solid #444746', padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* BOTÃO DE SYNC MANUAL */}
            <button 
                onClick={handleSyncManual}
                disabled={isLoading}
                style={{ width: '100%', padding: '15px', borderRadius: '12px', backgroundColor: '#282A2C', border: '1px solid #444', color: 'white', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
                <span>🔄</span> Sincronizar Catálogo
            </button>

            <div style={{ borderTop: '1px solid #333', paddingTop: '20px' }}>
                <h3 style={{ fontSize: '12px', color: '#888', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase' }}>Ferramentas Disponíveis</h3>
                {/* Mantendo o componente original do usuário intacto */}
                <ToolsGrid activeTool={activeTool} onActivate={activateToolMode} />
            </div>
        </aside>
    </div>
  );
}
