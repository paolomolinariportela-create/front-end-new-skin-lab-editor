import { useState } from 'react';

export default function PricePage({ storeId, onBack }: any) {
  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <button onClick={onBack} style={backBtnStyle}>← Voltar</button>
      <h1 style={{ color: '#4CAF50' }}>💲 Bulk Edit Price</h1>
      
      {/* Filtros específicos de preço podem ir aqui */}
      <div style={cardStyle}>
        <h3>Passo 1: Filtros de Preço</h3>
        <p>Selecione os produtos que deseja reajustar.</p>
      </div>

      {/* Variantes específicas para PREÇO */}
      <div style={cardStyle}>
        <h3>Passo 2: Configurar Reajuste</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select style={inputStyle}><option>Aumentar</option><option>Diminuir</option></select>
          <input type="number" placeholder="Valor" style={inputStyle} />
          <select style={inputStyle}><option>%</option><option>R$</option></select>
        </div>
      </div>
    </div>
  );
}

const cardStyle = { background: '#1E1F20', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #333' };
const inputStyle = { padding: '10px', borderRadius: '6px', background: '#131314', color: 'white', border: '1px solid #444' };
const backBtnStyle = { background: '#333', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', marginBottom: '20px' };
