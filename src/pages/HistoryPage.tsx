import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { History, RotateCcw, CheckCircle, XCircle, Clock } from 'lucide-react';

// URL do Backend (ajuste se necessário)
const API_URL = "https://king-urban-ai-production.up.railway.app"; 

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
      const response = await axios.get(`${API_URL}/history/${storeId}`);
      setLogs(response.data);
    } catch (error) {
      console.error("Erro ao buscar histórico", error);
    } finally {
      setLoading(false);
    }
  };

  // Função de Reverter
  const handleRevert = async (logId: number) => {
    if (!confirm("Tem certeza que deseja desfazer essa alteração? Isso vai aplicar a lógica inversa nos produtos.")) return;

    setProcessingId(logId);
    try {
      await axios.post(`${API_URL}/history/revert/${logId}`);
      alert("Reversão iniciada! O processo está rodando em segundo plano.");
      // Atualiza a lista após 2 segundos para dar tempo do status mudar
      setTimeout(fetchHistory, 2000);
    } catch (error) {
      alert("Erro ao tentar reverter.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="p-10 text-white">Carregando histórico...</div>;

  return (
    <div className="p-6 bg-[#111] min-h-screen text-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <History className="w-8 h-8 text-blue-400" />
        <h1 className="text-2xl font-bold text-white">Histórico de Ações</h1>
      </div>

      <div className="overflow-x-auto bg-[#1a1a1a] rounded-lg border border-gray-800 shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#222] text-gray-400 border-b border-gray-700">
              <th className="p-4 font-semibold">Data</th>
              <th className="p-4 font-semibold">Ação Executada</th>
              <th className="p-4 font-semibold text-center">Afetados</th>
              <th className="p-4 font-semibold text-center">Status</th>
              <th className="p-4 font-semibold text-right">Opções</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Nenhuma alteração registrada ainda.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-800 hover:bg-[#252525] transition-colors">
                  <td className="p-4 text-sm text-gray-400">
                    {new Date(log.created_at).toLocaleString('pt-BR')}
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-white">{log.action_summary}</span>
                    <div className="text-xs text-gray-500 mt-1 max-w-md truncate">
                      {log.full_command}
                    </div>
                  </td>
                  <td className="p-4 text-center font-bold text-blue-300">
                    {log.affected_count}
                  </td>
                  <td className="p-4 text-center">
                    {log.status === 'SUCCESS' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-900/30 text-green-400 text-xs border border-green-800">
                        <CheckCircle size={12} /> Sucesso
                      </span>
                    )}
                    {log.status === 'REVERTED' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-orange-900/30 text-orange-400 text-xs border border-orange-800">
                        <RotateCcw size={12} /> Revertido
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {log.status === 'SUCCESS' && (
                      <button
                        onClick={() => handleRevert(log.id)}
                        disabled={processingId === log.id}
                        className={`
                          flex items-center gap-2 ml-auto px-3 py-1.5 rounded text-sm font-medium transition-all
                          ${processingId === log.id 
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                            : 'bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900'}
                        `}
                      >
                        {processingId === log.id ? (
                          <> <Clock size={14} className="animate-spin"/> Processando </>
                        ) : (
                          <> <RotateCcw size={14} /> Desfazer </>
                        )}
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
