import React, { useEffect, useState } from 'react';

// URL do Backend
const API_URL = "https://web-production-4b8a.up.railway.app"; 

interface HistoryLog {
  id: number;
  action_summary: string;
  affected_count: number;
  status: string;
  created_at: string;
  full_command: string;
}

interface HistoryPageProps {
  storeId: string;
}

// === COMPONENTE DE MODAL (JANELINHA) ===
function DetailModal({ log, onClose }: { log: HistoryLog, onClose: () => void }) {
  let command: any = {};
  try { command = JSON.parse(log.full_command); } catch (e) { command = {} }

  const change = command.changes ? command.changes[0] : {};
  const filter = command.find_product || {};

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ backgroundColor: '#1E1F20', padding: '30px', borderRadius: '16px', width: '500px', border: '1px solid #444', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '20px', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
          Detalhes da Ação #{log.id}
        </h2>

        <div style={{ display: 'grid', gap: '15px', color: '#E3E3E3' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Tipo de Alteração</div>
            <div style={{ fontSize: '16px' }}>{change.action} em <b>{change.field}</b></div>
          </div>
          
          <div>
            <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Valor Aplicado</div>
            <div style={{ fontSize: '18px', color: '#4CAF50', fontWeight: 'bold' }}>{change.value}</div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Critério de Filtro (Quem foi afetado?)</div>
            <div style={{ backgroundColor: '#131314', padding: '10px', borderRadius: '8px', border: '1px solid #333', marginTop: '5px', fontSize: '14px' }}>
               {filter.title_contains 
                  ? `Produtos contendo no título: "${filter.title_contains}"` 
                  : "Todos os produtos filtrados pela IA"}
            </div>
            <div style={{ fontSize: '12px', color: '#aaa', marginTop: '5px' }}>Total afetado: {log.affected_count} itens</div>
          </div>

          <div>
             <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Comando Técnico (JSON)</div>
             <pre style={{ fontSize: '10px', color: '#666', overflowX: 'auto', marginTop: '5px' }}>
               {log.full_command}
             </pre>
          </div>
        </div>

        <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', backgroundColor: '#444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

// === PÁGINA PRINCIPAL ===
export default function HistoryPage({ storeId }: HistoryPageProps) {
  const [logs, setLogs] = useState<HistoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [selectedLog, setSelectedLog] = useState<HistoryLog | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [storeId]);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/history/${storeId}`);
      const data = await response.json();
      setLogs(data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleRevert = async (logId: number) => {
    if (!window.confirm("⚠️ Atenção: Desfazer essa ação aplicará a lógica inversa (ex: se aumentou, vai diminuir). Continuar?")) return;
    setProcessingId(logId);
    try {
      await fetch(`${API_URL}/history/revert/${logId}`, { method: 'POST' });
      alert("Reversão iniciada! Aguarde alguns segundos.");
      setTimeout(fetchHistory, 2000);
    } catch (error) { alert("Erro ao tentar reverter."); } finally { setProcessingId(null); }
  };

  // Funções Auxiliares de Formatação
  const getCardInfo = (jsonCmd: string) => {
    try {
        const cmd = JSON.parse(jsonCmd);
        const field = cmd.changes[0].field;
        if (field === 'price' || field === 'promotional_price') return { name: 'Price', icon: '💲', color: '#4CAF50' };
        if (field === 'stock') return { name: 'Inventory', icon: '📦', color: '#00BCD4' };
        if (field === 'title' || field === 'description') return { name: 'Content', icon: '📝', color: '#673AB7' };
        return { name: 'Geral', icon: '⚙️', color: '#888' };
    } catch { return { name: '???', icon: '❓', color: '#888' }; }
  };

  const formatAction = (jsonCmd: string) => {
    try {
        const cmd = JSON.parse(jsonCmd);
        const change = cmd.changes[0];
        const filter = cmd.find_product?.title_contains;
        
        let actionText = "";
        if (change.action === 'SET') actionText = `Definiu ${change.field} para ${change.value}`;
        else if (change.action === 'INCREASE_PERCENT') actionText = `Aumentou ${change.value}% no ${change.field}`;
        else if (change.action === 'DECREASE_PERCENT') actionText = `Desconto de ${change.value}% no ${change.field}`;
        else actionText = `${change.action} ${change.value}`;

        return (
            <div>
                <div style={{ fontWeight: '500', color: 'white' }}>{actionText}</div>
                {filter && <div style={{ fontSize: '12px', color: '#888', fontStyle: 'italic' }}>Filtro: "{filter}"</div>}
            </div>
        );
    } catch { return <span style={{color: 'red'}}>Erro ao ler comando</span>; }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>⏳ Carregando histórico...</div>;

  return (
    <div style={{ padding: '24px', backgroundColor: '#131314', minHeight: '100%', color: '#E3E3E3', overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <span style={{ fontSize: '24px' }}>📜</span>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: 0 }}>Histórico de Ações</h1>
      </div>

      <div style={{ overflowX: 'auto', backgroundColor: '#1E1F20', borderRadius: '12px', border: '1px solid #444746' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#282A2C', borderBottom: '1px solid #444746' }}>
              <th style={{ padding: '16px', color: '#aaa', fontSize: '12px', textTransform: 'uppercase' }}>Data</th>
              <th style={{ padding: '16px', color: '#aaa', fontSize: '12px', textTransform: 'uppercase' }}>Card Usado</th>
              <th style={{ padding: '16px', color: '#aaa', fontSize: '12px', textTransform: 'uppercase' }}>Ação Executada</th>
              <th style={{ padding: '16px', color: '#aaa', fontSize: '12px', textTransform: 'uppercase', textAlign: 'center' }}>Afetados</th>
              <th style={{ padding: '16px', color: '#aaa', fontSize: '12px', textTransform: 'uppercase', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '16px', color: '#aaa', fontSize: '12px', textTransform: 'uppercase', textAlign: 'right' }}>Opções</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const card = getCardInfo(log.full_command);
              return (
                <tr key={log.id} style={{ borderBottom: '1px solid #282A2C' }}>
                  {/* DATA */}
                  <td style={{ padding: '16px', fontSize: '13px', color: '#888' }}>
                    {new Date(log.created_at).toLocaleString('pt-BR')}
                  </td>

                  {/* CARD (ICONE) */}
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>{card.icon}</span>
                        <span style={{ fontWeight: 'bold', color: card.color, fontSize: '14px' }}>{card.name}</span>
                    </div>
                  </td>

                  {/* DESCRIÇÃO DA AÇÃO */}
                  <td style={{ padding: '16px' }}>
                     {formatAction(log.full_command)}
                  </td>

                  {/* AFETADOS */}
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                     <div style={{ fontWeight: 'bold', fontSize: '16px', color: 'white' }}>{log.affected_count}</div>
                     <div style={{ fontSize: '10px', color: '#666' }}>PRODUTOS</div>
                  </td>

                  {/* STATUS */}
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    {log.status === 'SUCCESS' ? (
                      <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(52, 168, 83, 0.1)', color: '#34A853', fontSize: '11px', border: '1px solid rgba(52, 168, 83, 0.2)', fontWeight: 'bold' }}>
                        SUCESSO
                      </span>
                    ) : (
                      <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(255, 152, 0, 0.1)', color: '#FF9800', fontSize: '11px', border: '1px solid rgba(255, 152, 0, 0.2)', fontWeight: 'bold' }}>
                        REVERTIDO
                      </span>
                    )}
                  </td>

                  {/* BOTÕES */}
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button 
                            onClick={() => setSelectedLog(log)}
                            style={{ background: 'transparent', border: 'none', color: '#A8C7FA', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}>
                            Ver Detalhes
                        </button>

                        {log.status === 'SUCCESS' && (
                           <button
                             onClick={() => handleRevert(log.id)}
                             disabled={processingId === log.id}
                             style={{
                               padding: '6px 12px', borderRadius: '6px',
                               backgroundColor: processingId === log.id ? '#444' : 'rgba(244, 67, 54, 0.1)',
                               color: processingId === log.id ? '#aaa' : '#F44336',
                               border: '1px solid rgba(244, 67, 54, 0.3)',
                               cursor: processingId === log.id ? 'not-allowed' : 'pointer',
                               fontSize: '12px', fontWeight: 'bold'
                             }}
                           >
                             {processingId === log.id ? '⏳ ...' : '↩️ Desfazer'}
                           </button>
                        )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* RENDERIZA O MODAL SE TIVER ALGO SELECIONADO */}
      {selectedLog && <DetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </div>
  );
}
