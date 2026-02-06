// src/PricePage.tsx
export default function PricePage({ onBack, storeId }: { onBack: () => void, storeId: string | null }) {
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', color: '#E3E3E3' }}>
      <button 
        onClick={onBack} 
        style={{ background: '#333', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px' }}
      >
        ← Voltar ao Dashboard
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <span style={{ fontSize: '32px' }}>💲</span>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>Gerenciador de Preços</h1>
          <p style={{ color: '#888', margin: 0 }}>Loja ID: {storeId || 'Desconectada'}</p>
        </div>
      </div>

      {/* Estrutura de Filtros estilo Hextom */}
      <div style={{ background: '#1E1F20', padding: '30px', borderRadius: '16px', border: '1px solid #444' }}>
        <h3 style={{ marginTop: 0, color: '#A8C7FA' }}>Passo 1: Selecionar Produtos</h3>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <select style={inputStyle}>
            <option>Título do Produto</option>
            <option>SKU</option>
          </select>
          <input type="text" placeholder="Contém..." style={{ ...inputStyle, flex: 1 }} />
          <button style={{ padding: '10px 25px', background: '#4285F4', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
            Preview
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = { padding: '12px', borderRadius: '8px', background: '#131314', color: 'white', border: '1px solid #555' };
