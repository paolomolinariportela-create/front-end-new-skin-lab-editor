import React, { useState, useRef, useEffect } from 'react';
import ToolsGrid from '../components/ToolsGrid';

// URL REAL do seu backend na Railway
const BACKEND_URL = "https://web-production-4b8a.up.railway.app"; 

interface DashboardPageProps {
  storeId: string;
}

export default function DashboardPage({ storeId }: DashboardPageProps) {
  // Estados do Chat
  const [messages, setMessages] = useState<any[]>([
    { role: 'ai', text: 'Olá! Sou a IA do NewSkin. Posso te ajudar a consultar ou editar seu estoque.' }
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
    if (!storeId) return;
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'ai', text: '⏳ Iniciando sincronização completa... Buscando produtos na Nuvemshop.' }]);
    
    try {
        const res = await fetch(`${BACKEND_URL}/sync?store_id=${storeId}`, { method: 'POST' });
        const data = await res.json();
        if (res.ok) {
            setMessages(prev => [...prev, { role: 'ai', text: `✅ Sincronização concluída com sucesso! O catálogo foi atualizado.` }]);
        } else {
            throw new Error();
        }
    } catch (err) {
        setMessages(prev => [...prev, { role: 'ai', text: '❌ Erro ao sincronizar. Verifique se o servidor está online.' }]);
    } finally {
        setIsLoading(false);
    }
  };

  // --- MODOS OPERADOR ---
  const activateToolMode = (tool: any) => {
      setActiveTool(tool);
      setMessages(prev => [...prev, { 
          role: 'ai', 
          text: `🔧 Modo ${tool.title} ativado! O que deseja alterar em massa?`,
          system: true 
      }]);
  };

  const deactivateToolMode = () => {
      setActiveTool(null);
      setMessages(prev => [...prev, { role: 'ai', text: `✅ Modo edição encerrado.`, system: true }]);
  };

  // --- ENVIO DO CHAT ---
  const handleSend = async (text: string) => {
    if (!text || !storeId) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            message: text, 
            store_id: storeId,
            context: activeTool ? activeTool.title.toLowerCase() : 'dashboard'
        }) 
      });
      
      if (!response.ok) throw new Error();
      
      const data = await response.json();
      setMessages(prev => [...prev, { 
          role: 'ai', 
          text: data.response, 
          type: data.action, 
          command: data.command 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Erro de conexão com o servidor. Verifique o backend.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- EXECUÇÃO DE COMANDOS (BOTÃO APROVAR) ---
  const executeCommand = async (command: any) => {
      if (!command?.changes) return alert("Erro no formato do comando.");
      
      const c = command.changes[0];
      const confirm = window.confirm(`🚀 Confirmar alteração real na Nuvemshop?\n\nAção: ${c.action}\nCampo: ${c.field}\nValor: ${c.value}`);
      
      if (!confirm) return;

      setMessages(prev => [...prev, { role: 'ai', text: '⏳ Processando alteração na nuvem...' }]);

      try {
          const res = await fetch(`${BACKEND_URL}/apply-changes`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ store_id: storeId, command: command })
          });

          const result = await res.json();
          if (res.ok) {
             setMessages(prev => [...prev, { role: 'ai', text: `✅ Sucesso! Resposta: "${result.message}"` }]);
          } else {
             setMessages(prev => [...prev, { role: 'ai', text: '❌ Erro ao aplicar alteração.' }]);
          }
      } catch (err) {
          alert("Erro de conexão.");
      }
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
        {/* ÁREA CENTRAL (CHAT) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            
            {/* BARRA DE MODO OPERADOR */}
            {activeTool && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: '#282A2C', borderBottom: `2px solid ${activeTool.color}`, padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ fontSize: '24px' }}>{activeTool.icon}</div>
                        <div>
                            <div style={{ fontSize: '10px', color: '#A8C7FA', fontWeight: 'bold', textTransform: 'uppercase' }}>MODO OPERADOR ATIVO</div>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>Editando {activeTool.title}</div>
                        </div>
                    </div>
                    <button onClick={deactivateToolMode} style={{ background: '#F4433620', border: '1px solid #F44336', color: '#F44336', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                        ✖ Encerrar Edição
                    </button>
                </div>
            )}

            {/* LISTA DE MENSAGENS */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '40px', paddingTop: activeTool ? '100px' : '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: '700px' }}>
                    {messages.map((m, i) => (
                        <div key={i} style={{ marginBottom: '30px', textAlign: m.role === 'user' ? 'right' : 'left' }}>
                            {!m.system && <div style={{ fontSize: '12px', color: '#8E918F', marginBottom: '8px', marginLeft: '10px' }}>{m.role === 'ai' ? 'NewSkin AI ✨' : 'Você'}</div>}
                            
                            <div style={{ 
                                display: 'inline-block', padding: '18px 24px', borderRadius: '24px', 
                                backgroundColor: m.system ? '#282A2C' : (m.role === 'user' ? '#004A77' : 'transparent'), 
                                color: '#E3E3E3', border: m.system ? '1px dashed #555' : 'none',
                                maxWidth: '90%', textAlign: m.system ? 'center' : 'left', width: m.system ? '100%' : 'auto'
                            }}>
                                <div style={{ marginBottom: m.command ? '15px' : '0' }}>{m.text}</div>
                                
                                {m.command && (
                                    <div style={{ backgroundColor: '#131314', border: '1px solid #444', borderRadius: '12px', padding: '20px', marginTop: '15px', textAlign: 'left' }}>
                                        <div style={{ fontSize: '14px', color: '#E3E3E3', marginBottom: '15px' }}>
                                            <div style={{ color: activeTool?.color || '#A8C7FA', fontWeight: 'bold', marginBottom: '5px' }}>⚡ AÇÃO PROPOSTA</div>
                                            <div>{m.command.changes[0].action} <b>{m.command.changes[0].field}</b></div>
                                            <div>Valor: <span style={{ color: '#4CAF50' }}>{m.command.changes[0].value}</span></div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => executeCommand(m.command)} style={{ flex: 1, padding: '10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>✅ APROVAR</button>
                                            <button onClick={() => alert("Cancelado")} style={{ flex: 1, padding: '10px', background: 'transparent', color: '#F44336', border: '1px solid #F44336', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>❌ CANCELAR</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && <div style={{ textAlign: 'left', color: '#888', fontSize: '12px', marginLeft: '20px' }}>Digitando...</div>}
                    <div ref={chatEndRef} />
                </div>
            </div>

            {/* INPUT DE TEXTO */}
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '700px' }}>
                    <input 
                        type="text" 
                        value={inputValue} 
                        onChange={(e) => setInputValue(e.target.value)} 
                        onKeyPress={(e) => e.key === 'Enter' && handleSend(inputValue)} 
                        placeholder={activeTool ? `O que deseja fazer com ${activeTool.title}?` : "Pergunte à IA..."} 
                        style={{ width: '100%', padding: '22px 25px', borderRadius: '100px', border: activeTool ? `2px solid ${activeTool.color}` : '1px solid #444', backgroundColor: '#1E1F20', color: '#E3E3E3', outline: 'none' }} 
                    />
                    <button onClick={() => handleSend(inputValue)} style={{ position: 'absolute', right: '10px', top: '10px', background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>➤</button>
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
                <h3 style={{ fontSize: '12px', color: '#888', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase' }}>FERRAMENTAS BULK</h3>
                <ToolsGrid activeTool={activeTool} onActivate={activateToolMode} />
            </div>
        </aside>
    </div>
  );
}
