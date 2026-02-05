import React from 'react';

// Define o formato dos dados que vêm do Python
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  sku?: string;
}

interface PreviewCardProps {
  products: Product[];
  onConfirm: () => void;
  onCancel: () => void;
}

export default function PreviewCard({ products, onConfirm, onCancel }: PreviewCardProps) {
  if (!products || products.length === 0) return null;

  // Estilos "Dark Mode" para combinar com seu App
  const styles = {
    card: {
      marginTop: '15px',
      backgroundColor: '#1E1F20',
      borderRadius: '12px',
      padding: '16px',
      border: '1px solid #444746',
      width: '100%',
      maxWidth: '450px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      textAlign: 'left' as const
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '12px',
      borderBottom: '1px solid #444746',
      paddingBottom: '8px',
      color: '#E3E3E3',
      fontSize: '13px',
      fontWeight: 'bold'
    },
    item: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px',
      marginBottom: '6px',
      borderRadius: '8px',
      backgroundColor: '#282A2C'
    },
    img: {
      width: '40px',
      height: '40px',
      objectFit: 'cover' as const,
      borderRadius: '6px',
      backgroundColor: '#444746'
    },
    info: {
      flex: 1,
      overflow: 'hidden'
    },
    name: {
      fontSize: '13px',
      color: '#E3E3E3',
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    price: {
      color: '#34A853',
      fontWeight: 'bold' as const,
      fontSize: '12px'
    },
    btnContainer: {
      display: 'flex',
      gap: '10px',
      marginTop: '16px',
      paddingTop: '12px',
      borderTop: '1px solid #444746'
    },
    btnConfirm: {
      flex: 1,
      padding: '10px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '13px',
      backgroundColor: '#4285F4',
      color: '#fff'
    },
    btnCancel: {
      flex: 1,
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid #444746',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '13px',
      backgroundColor: 'transparent',
      color: '#C4C7C5'
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span>🔎 Amostra ({products.length} itens)</span>
        <span style={{ fontSize: '10px', backgroundColor: '#004A77', color: '#A8C7FA', padding: '2px 6px', borderRadius: '4px' }}>Preview</span>
      </div>

      <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
        {products.map((p) => (
          <div key={p.id} style={styles.item}>
            <img src={p.image} alt={p.name} style={styles.img} onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/40'} />
            <div style={styles.info}>
              <div style={styles.name}>{p.name}</div>
              <div style={{ display: 'flex', gap: '10px', fontSize: '11px', marginTop: '2px' }}>
                <span style={{ color: '#8E918F' }}>SKU: {p.sku || '-'}</span>
                <span style={styles.price}>R$ {p.price.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.btnContainer}>
        <button onClick={onCancel} style={styles.btnCancel}>Cancelar</button>
        <button onClick={onConfirm} style={styles.btnConfirm}>Confirmar</button>
      </div>
    </div>
  );
}
