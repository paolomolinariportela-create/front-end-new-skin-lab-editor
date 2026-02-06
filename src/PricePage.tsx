import React from 'react';

interface PricePageProps {
  onBack: () => void;
  storeId: string | null;
}

export default function PricePage({ storeId }: PricePageProps) {
  return (
    // ALTERAÇÃO AQUI: Mudamos maxWidth para '100%' e removemos o margin auto
    <div style={{ padding: '40px', width: '100%', height: '100%', color: '#E3E3E3', boxSizing: 'border-box' }}>
      
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
        <div style={{ fontSize: '40px', background: '#4CAF5020', padding: '15px', borderRadius: '12px', color: '#4CAF50', border: '1px solid #4CAF5040' }}>
          💲
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>Bulk Edit Price</h1>
          <p style={{ color: '#888', margin: 0 }}>
            Configurando produtos da loja: <span style={{ color: '#A8C7FA' }}>{storeId || '...'}</span>
          </p>
        </div>
      </div>

      {/* Passo 1 */}
      <div style={{ backgroundColor: '#1E1F20', border: '1px solid #444', borderRadius: '16px', padding: '30px', marginBottom: '20px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#E3E3E3', fontSize: '16px', fontWeight: 'bold' }}>
          Passo 1: Filtros de Preço
        </h3>
        <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>Selecione os produtos que deseja reajustar.</p>
        
        {/* Container dos inputs esticado */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#282A2C', padding: '20px', borderRadius: '12px', flexWrap: 'wrap' }}>
          <select style={selectStyle}>
            <option>Título do Produto</option>
            <option>SKU</option>
          </select>
          <select style={selectStyle}>
            <option>Contém</option>
            <option>É igual a</option>
          </select>
          {/* O input flex: 1 vai fazer ele ocupar todo o espaço sobrando da tela larga */}
          <input type="text" placeholder="Valor..." style={{ ...selectStyle, flex: 1, minWidth: '200px', background: '#131314' }} />
          <button style={{ padding: '12px 30px', background: '#4285F4', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            Filtrar
          </button>
        </div>
      </div>

      {/* Passo 2 */}
      <div style={{ backgroundColor: '#1E1F20', border: '1px solid #444', borderRadius: '16px', padding: '30px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#E3E3E3', fontSize: '16px', fontWeight: 'bold' }}>
          Passo 2: Configurar Reajuste
        </h3>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
          <select style={selectStyle}>
            <option>Aumentar</option>
            <option>Diminuir</option>
            <option>Definir valor exato</option>
          </select>
          <input type="number" placeholder="Valor" style={{ ...selectStyle, width: '150px', background: '#131314' }} />
          <select style={{ ...selectStyle, width: '80px' }}>
            <option>%</option>
            <option>R$</option>
          </select>
          
          {/* Empurra o botão para a direita extrema */}
          <div style={{ flex: 1 }}></div> 

          <button style={{ padding: '12px 30px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            Aplicar em Massa
          </button>
        </div>
      </div>

    </div>
  );
}

const selectStyle: React.CSSProperties = { 
  padding: '12px', 
  borderRadius: '8px', 
  background: '#131314', 
  color: 'white', 
  border: '1px solid #555', 
  outline: 'none',
  fontSize: '14px'
};
