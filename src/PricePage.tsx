import React from 'react';

// Definimos o que a página espera receber
interface PricePageProps {
  onBack: () => void;
  storeId: string | null;
}

export default function PricePage({ onBack, storeId }: PricePageProps) {
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', color: '#E3E3E3' }}>
      
      {/* Botão de Voltar */}
      <button 
        onClick={onBack} 
        style={{ background: '#333', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}
      >
        ← Voltar ao Dashboard
      </button>

      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
        <div style={{ fontSize: '40px', background: '#4CAF5020', padding: '15px', borderRadius: '12px', color: '#4CAF50', border: '1px solid #4CAF5040' }}>
          💲
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>Ajuste de Preços</h1>
          <p style={{ color: '#888', margin: 0 }}>
            {/* AQUI ESTÁ A CORREÇÃO: Usamos o storeId explicitamente para o erro sumir */}
            Configurando produtos da loja: <span style={{ color: '#A8C7FA' }}>{storeId || '...'}</span>
          </p>
        </div>
      </div>

      {/* Filtros Estilo Hextom */}
      <div style={{ backgroundColor: '#1E1F20', border: '1px solid #444', borderRadius: '16px', padding: '30px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '25px', color: '#A8C7FA', fontSize: '14px', textTransform: 'uppercase' }}>
          Passo 1: Selecionar Produtos
        </h3>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#282A2C', padding: '20px', borderRadius: '12px' }}>
          <select style={selectStyle}>
            <option>Título do Produto</option>
            <option>SKU</option>
          </select>
          <select style={selectStyle}>
            <option>Contém</option>
            <option>É igual a</option>
          </select>
          <input type="text" placeholder="Valor..." style={{ ...selectStyle, flex: 1, background: '#131314' }} />
          <button style={{ padding: '12px 30px', background: '#4285F4', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
            Preview
          </button>
        </div>
      </div>
    </div>
  );
}

// Estilos tipados para evitar erros de CSS
const selectStyle: React.CSSProperties = { 
  padding: '12px', 
  borderRadius: '8px', 
  background: '#131314', 
  color: 'white', 
  border: '1px solid #555', 
  outline: 'none',
  fontSize: '14px'
};
