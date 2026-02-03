import React, { useState } from 'react';

// Componente de Cartão de Estatística
const StatCard = ({ title, value, icon }: { title: string, value: string, icon: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="text-gray-500 text-sm font-medium">{title}</div>
    <div className="flex items-center justify-between mt-2">
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <span className="text-2xl">{icon}</span>
    </div>
  </div>
);

const App = () => {
  const [view, setView] = useState('dashboard');

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Olá, King Urban 🤴</h1>
              <p className="text-gray-500 mt-2">Aqui está o que está acontecendo na sua loja hoje.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Produtos Sincronizados" value="1,240" icon="📦" />
              <StatCard title="Alterações Pendentes" value="12" icon="⏳" />
              <StatCard title="Economia de Tempo" value="4.5h" icon="⚡" />
            </div>

            <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl">
              <h3 className="text-blue-800 font-semibold text-lg">Dica da IA ✨</h3>
              <p className="text-blue-700 mt-1">Você tem 15 produtos sem descrição. Deseja que eu gere descrições otimizadas para SEO para eles?</p>
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">Gerar Agora</button>
            </div>
          </div>
        );
      case 'editor':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h1 className="text-2xl font-bold">Editor de Lote</h1>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-bottom border-gray-200">
                  <tr>
                    <th className="p-4 font-semibold text-gray-600">Produto</th>
                    <th className="p-4 font-semibold text-gray-600">Preço</th>
                    <th className="p-4 font-semibold text-gray-600">Estoque</th>
                    <th className="p-4 font-semibold text-gray-600 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[1, 2, 3].map((i) => (
                    <tr key={i} className="hover:bg-gray-50 transition">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg"></div>
                        <span className="font-medium">Camiseta King Urban v{i}</span>
                      </td>
                      <td className="p-4">R$ 89,90</td>
                      <td className="p-4 text-gray-500">45 un</td>
                      <td className="p-4 text-right">
                        <button className="text-blue-600 font-medium hover:underline">Editar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'billing':
        return (
          <div className="max-w-4xl mx-auto py-10 animate-in zoom-in-95 duration-500">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-extrabold text-gray-900">O plano ideal para sua escala</h1>
              <p className="text-gray-500 mt-4 text-lg">Comece grátis, mude quando precisar.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col">
                <h3 className="text-xl font-bold">Gratuito</h3>
                <div className="text-4xl font-black my-4">R$ 0</div>
                <ul className="space-y-3 mb-8 text-gray-600 flex-1">
                  <li>✅ 50 Edições/mês</li>
                  <li>✅ Sincronização básica</li>
                  <li>❌ Sem comandos de IA</li>
                </ul>
                <button className="w-full py-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition">Plano Atual</button>
              </div>
              <div className="bg-white p-8 rounded-3xl border-2 border-blue-600 shadow-xl flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 rounded-bl-xl text-xs font-bold">POPULAR</div>
                <h3 className="text-xl font-bold">Pro IA</h3>
                <div className="text-4xl font-black my-4">R$ 89,90<span className="text-lg font-normal text-gray-400">/mês</span></div>
                <ul className="space-y-3 mb-8 text-gray-600 flex-1">
                  <li>✅ Edições Ilimitadas</li>
                  <li>✅ Comando de Voz e Texto</li>
                  <li>✅ Suporte 24h</li>
                </ul>
                <button className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition">Assinar Agora</button>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#FBFBFB] text-gray-900 font-sans">
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-gray-100 p-6 flex flex-col justify-between">
        <div className="space-y-8">
          <div className="text-2xl font-black tracking-tighter text-blue-600">NewSkin Lab</div>
          <nav className="space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
              { id: 'editor', label: 'Editor de Lote', icon: '📦' },
              { id: 'billing', label: 'Assinatura', icon: '💳' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  view === item.id ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span>{item.icon}</span> {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">KU</div>
          <div className="text-sm">
            <p className="font-bold leading-none">King Urban</p>
            <p className="text-gray-400 text-xs mt-1">ID: 6913785</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="flex-1 overflow-y-auto px-12 py-12">
          {renderContent()}
        </div>

        {/* INPUT ESTILO GEMINI */}
        <div className="px-12 pb-10">
          <div className="max-w-4xl mx-auto relative group">
            <input
              type="text"
              placeholder="Pergunte ou dê uma ordem para a IA..."
              className="w-full px-8 py-5 rounded-3xl border border-gray-200 shadow-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-lg pr-20"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
