import React, { useEffect, useState } from 'react';

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
  token: string;
}

// Modal de Detalhes
function DetailModal({ log, onClose }: { log: HistoryLog, onClose: () => void }) {
  let command: any = {};
  try { command = JSON.parse(log.full_command); } catch (e) { command = {} }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ backgroundColor: '#1E1F20', padding: '25px', borderRadius: '12px', width: '500px', maxWidth: '90%', border: '1px solid #444', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <h3 style={{ color: '#fff', marginTop: 0 }}>Detalhes da Ação #{log.id}</h3>
        <div style={{ backgroundColor: '#131314', padding: '15px', borderRadius: '8px', fontSize: '12px', color: '#aaa', maxHeight: '300px', overflowY: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
          {JSON.stringify(command, null, 2)}
        </div>
        <button onClick={onClose} style={{ marginTop: '20px', width: '100%', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Fechar</button>
      </div>
    </div>
  );
}

// Badge de Status
const StatusBadge = ({ status }: { status: string }) => {
    let color = '#888';
    let bg = '#333';
    let text = status;

    if (status === 'SUCCESS') { color = '#4CAF50'; bg = 'rgba(76, 175, 80, 0.1)'; text = 'SUCESSO'; }
    if (status === 'ERROR') { color = '#F44336'; bg = 'rgba(244, 67, 54, 0.1)'; text = 'ERRO'; }
    if (status === 'SKIPPED') { color = '#FFC107'; bg = 'rgba(255, 193, 7, 0.1)'; text = 'IGNORADO'; }

    return (
        <span style={{ color, backgroundColor: bg, padding: '4px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', border: `1px solid ${color}` }}>
            {text}
        </span>
    );
};

export default function HistoryPage({ storeId, token }: HistoryPageProps) {
  const [logs, setLogs] = useState<HistoryLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<HistoryLog | null>(null);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    if (token) fetchHistory();
  }, [token]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setLogs(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleRevert = async (logId: number) => {
    if (!window.confirm("Atenção: Reverter uma ação pode ter efeitos colaterais. Continuar?")) return;
    
    setProcessingId(logId);
    try {
        const res = await fetch(`${API_URL}/history/${logId}/revert`, { 
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            alert("Reversão iniciada com sucesso!");
            fetchHistory();
        } else {
            alert("Erro ao reverter.");
        }
    } catch (e) {
        alert("Erro de conexão.");
    } finally {
        setProcessingId(null);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', color: '#E3E3E3', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
            <h1 style={{ margin: 0, fontSize: '24px' }}>📜 Histórico de Ações</h1>
            <p style={{ color: '#888', margin: '5px 0 0 0' }}>Auditoria completa de todas as alterações feitas pela IA.</p>
        </div>
        <button onClick={fetchHistory} style={{ padding: '10px 20px', backgroundColor: '#282A2C', border: '1px solid #444', color: 'white', borderRadius: '6px', cursor: 'pointer' }}>
            🔄 Atualizar
        </button>
      </header>

      {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Carregando histórico...</div>
      ) : (
          <div style={{ backgroundColor: '#1E1F20', borderRadius: '12px', border: '1px solid #333', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#282A2C', color: '#aaa', textAlign: 'left' }}>
                  <th style={{ padding: '15px' }}>ID</th>
                  <th style={{ padding: '15px' }}>Ação</th>
                  <th style={{ padding: '15px' }}>Afetados</th>
                  <th style={{ padding: '15px' }}>Status</th>
                  <th style={{ padding: '15px' }}>Data</th>
                  <th style={{ padding: '15px', textAlign: 'right' }}>Opções</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #333', transition: 'background 0.2s' }}>
                      <td style={{ padding: '15px', color: '#666' }}>#{log.id}</td>
                      <td style={{ padding: '15px', fontWeight: 'bold' }}>{log.action_summary}</td>
                      <td style={{ padding: '15px' }}>{log.affected_count} produtos</td>
                      <td style={{ padding: '15px' }}><StatusBadge status={log.status} /></td>
                      <td style={{ padding: '15px', color: '#888' }}>{new Date(log.created_at).toLocaleString('pt-BR')}</td>
                      <td style={{ padding: '15px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setSelectedLog(log)} style={{ background: 'none', border: 'none', color: '#A8C7FA', cursor: 'pointer', fontSize: '12px' }}>Ver JSON</button>
                            {log.status === 'SUCCESS' && (
                               <button 
                                 onClick={() => handleRevert(log.id)}
                                 disabled={!!processingId}
                                 style={{ padding: '4px 10px', backgroundColor: '#333', border: '1px solid #555', color: '#F44336', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                               >
                                 {processingId === log.id ? '⏳' : '↩️ Desfazer'}
                               </button>
                            )}
                        </div>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
      )}

      {selectedLog && <DetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </div>
  );
}
