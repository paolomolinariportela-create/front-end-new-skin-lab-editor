// src/PricePage.tsx

export default function PricePage({ onBack, storeId }: { onBack: () => void, storeId: string | null }) {
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', color: '#E3E3E3', height: '100vh', overflowY: 'auto' }}>
      
      {/* Botão de Voltar */}
      <button 
        onClick={onBack} 
        style={{ background: '#333', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}
      >
        ← Voltar ao Dashboard
      </button>

      {/* Cabeçalho da Página */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
        <div style={{ fontSize: '40px', background: '#4CAF5020', padding: '15px', borderRadius: '12px', color: '#4CAF50', border: '1px solid #4CAF5040' }}>
          💲
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>Ajuste de Preços em Massa</h1>
          <p style={{ color: '#888', margin: 0 }}>
            {storeId ? `Conectado à loja: ${storeId}` : 'Carregando identificação da loja...'}
          </p>
        </div>
      </div>

      {/* Conteúdo: Passo 1 (Filtros Estilo Hextom) */}
      <div style={{ backgroundColor: '#1E1F20', border: '1px solid #444', borderRadius: '16px', padding: '30px', marginBottom: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '25px', color: '#A8C7FA', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Passo 1: Selecionar Produtos
        </h3>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', background: '#282A2C', padding: '20px', borderRadius: '12px' }}>
          <select style={selectStyle}>
            <option>Título do Produto</option>
            <option>SKU</option>
            <option>Categoria</option>
          </select>

          <select style={selectStyle}>
            <option>Contém</option>
            <option>É igual a</option>
            <option>Começa com</option>
          </select>

          <input 
            type="text" 
            placeholder="Digite o termo de busca..." 
            style={{ ...selectStyle, flex: 1, background: '#131314' }} 
          />

          <button style={{ padding: '12px 30px', background: '#4285F4', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            Buscar
          </button>
        </div>
      </div>

      {/* Conteúdo: Passo 2 (Ações) */}
      <div style={{ backgroundColor: '#1E1F20', border: '1px solid #444', borderRadius: '16px', padding: '30px', opacity: 0.6 }}>
        <h3 style={{ marginTop: 0, color: '#666', fontSize: '14px', textTransform: 'uppercase' }}>
          Passo 2: Configurar Reajuste
        </h3>
        <p style={{ color: '#555' }}>Realize a busca no Passo 1 para liberar as opções de edição.</p>
      </div>

    </div>
  );
}

const selectStyle = { 
  padding: '12px', 
  borderRadius: '8px', 
  background: '#131314', 
  color: 'white', 
  border: '1px solid #555', 
  outline: 'none',
  fontSize: '14px'
};
