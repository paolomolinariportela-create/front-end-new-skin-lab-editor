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

export default function HistoryPage({ storeId }: HistoryPageProps) {
  const [logs, setLogs] = useState<HistoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Busca o histórico ao carregar a página
  useEffect(() => {
    fetchHistory();
  }, [storeId]);

  const fetchHistory = async () => {
    try {
      // Substituindo axios por fetch para manter padrão
      const response = await fetch(`${API_URL}/history/${storeId}`);
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error("Erro ao buscar histórico", error);
    } finally {
      setLoading(false);
    }
  };

  // Função de Reverter
  const handleRevert = async (logId: number) => {
    if (!window.confirm("Tem certeza que deseja desfazer essa alteração? Isso vai aplicar a lógica inversa nos produtos.")) return;

    setProcessingId(logId);
    try {
      await fetch(`${API_URL}/history/revert/${logId}`, { method: 'POST' });
      alert("Reversão iniciada! O processo está rodando em segundo plano.");
      // Atualiza a lista após 2 segundos
      setTimeout(fetchHistory, 2000);
    } catch (error) {
      alert("Erro ao tentar reverter.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="p-10 text-white text-center">⏳ Carregando histórico...</div>;

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
              <th style={{ padding: '16px', color: '#aaa', fontWeight: '600' }}>Data</th>
              <th style={{ padding: '16px', color: '#aaa', fontWeight: '600' }}>Ação Executada</th>
              <th style={{ padding: '16px', color: '#aaa', fontWeight: '600', textAlign: 'center' }}>Afetados</th>
              <th style={{ padding: '16px', color: '#aaa', fontWeight: '600', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '16px', color: '#aaa', fontWeight: '600', textAlign: 'right' }}>Opções</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#888' }}>
                  Nenhuma alteração registrada ainda.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #282A2C' }}>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#aaa' }}>
                    {new Date(log.created_at).toLocaleString('pt-BR')}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: '500', color: 'white' }}>{log.action_summary}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.full_command}
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold', color: '#A8C7FA' }}>
                    {log.affected_count}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    {log.status === 'SUCCESS' && (
                      <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(52, 168, 83, 0.2)', color: '#34A853', fontSize: '12px', border: '1px solid rgba(52, 168, 83, 0.3)' }}>
                        ✅ Sucesso
                      </span>
                    )}
                    {log.status === 'REVERTED' && (
                      <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(255, 152, 0, 0.2)', color: '#FF9800', fontSize: '12px', border: '1px solid rgba(255, 152, 0, 0.3)' }}>
                        ↩️ Revertido
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    {log.status === 'SUCCESS' && (
                      <button
                        onClick={() => handleRevert(log.id)}
                        disabled={processingId === log.id}
                        style={{
                          marginLeft: 'auto',
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '6px 12px', borderRadius: '6px',
                          backgroundColor: processingId === log.id ? '#444' : 'rgba(244, 67, 54, 0.1)',
                          color: processingId === log.id ? '#aaa' : '#F44336',
                          border: processingId === log.id ? '1px solid #444' : '1px solid rgba(244, 67, 54, 0.3)',
                          cursor: processingId === log.id ? 'not-allowed' : 'pointer',
                          fontSize: '13px', fontWeight: '500'
                        }}
                      >
                        {processingId === log.id ? '⏳ ...' : '↩️ Desfazer'}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
