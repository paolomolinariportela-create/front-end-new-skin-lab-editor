import React, { useState, useEffect } from 'react';

const BACKEND_URL = "https://web-production-4b8a.up.railway.app"; 

interface ProductsPageProps {
  storeId: string;
  token: string;
}

export default function ProductsPage({ storeId, token }: ProductsPageProps) {
  const [productsList, setProductsList] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (token) fetchProducts();
  }, [token]);

  const fetchProducts = async (search = "") => {
      setLoadingProducts(true);
      try {
          let url = `${BACKEND_URL}/products?limit=100`;
          if (search) url += `&search=${search}`;
          
          const res = await fetch(url, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              }
          });

          if (res.ok) {
              const data = await res.json();
              setProductsList(data);
          }
      } catch (error) {
          console.error("Erro ao buscar produtos:", error);
      } finally {
          setLoadingProducts(false);
      }
  };

  const handleInputChange = (id: string, field: string, value: string) => {
      setProductsList(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  // Renderiza variações como etiquetas bonitas
  const renderVariants = (product: any) => {
      const vars = product.variants || [];
      if (vars.length === 0) return <span style={{ color: '#555', fontSize: '12px' }}>Sem variações</span>;
      
      const values = [...new Set(vars.flatMap((v: any) => v.values.map((val: any) => val.pt)))];
      return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {values.slice(0, 4).map((v: any, idx: number) => (
                  <span key={idx} style={{ backgroundColor: '#333', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', color: '#ccc' }}>
                      {v}
                  </span>
              ))}
              {values.length > 4 && <span style={{ fontSize: '10px', color: '#888' }}>+{values.length - 4}</span>}
          </div>
      );
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', color: '#E3E3E3', fontFamily: 'sans-serif' }}>
        
        {/* HEADER E BUSCA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 style={{ margin: 0, fontSize: '24px' }}>📦 Catálogo de Produtos</h1>
            <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                    type="text" 
                    placeholder="Buscar por nome ou SKU..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#1E1F20', color: 'white', width: '300px' }}
                />
                <button onClick={() => fetchProducts(searchTerm)} style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                    🔍 Buscar
                </button>
            </div>
        </div>

        {/* TABELA DE DADOS */}
        <div style={{ backgroundColor: '#1E1F20', borderRadius: '12px', border: '1px solid #333', overflow: 'hidden' }}>
            {loadingProducts ? (
                <div style={{ padding: '50px', textAlign: 'center', color: '#888' }}>Carregando inventário...</div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#282A2C', color: '#aaa', textAlign: 'left' }}>
                                <th style={{ padding: '12px' }}>IMG</th>
                                <th style={{ padding: '12px' }}>Produto</th>
                                <th style={{ padding: '12px' }}>SKU</th>
                                <th style={{ padding: '12px' }}>Variações</th>
                                <th style={{ padding: '12px' }}>Preço (R$)</th>
                                <th style={{ padding: '12px' }}>Estoque</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productsList.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid #333', transition: 'background 0.1s' }}>
                                    <td style={{ padding: '10px' }}>
                                        {p.images && p.images[0] ? (
                                            <img src={p.images[0].src} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                        ) : (
                                            <div style={{ width: '40px', height: '40px', backgroundColor: '#333', borderRadius: '4px' }} />
                                        )}
                                    </td>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{p.name.pt}</td>
                                    <td style={{ padding: '10px', color: '#888' }}>{p.handle || '-'}</td>
                                    <td style={{ padding: '10px' }}>{renderVariants(p)}</td>
                                    <td style={{ padding: '10px', color: '#4CAF50', fontWeight: 'bold' }}>
                                        {/* Input editável simples para demo */}
                                        <input 
                                            value={p.price || 0} 
                                            onChange={(e) => handleInputChange(p.id, 'price', e.target.value)}
                                            style={{ width: '80px', background: 'transparent', border: 'none', color: '#4CAF50', fontWeight: 'bold' }}
                                        />
                                    </td>
                                    <td style={{ padding: '10px', color: p.stock === 0 ? '#F44336' : '#A8C7FA' }}>
                                        {p.stock || 0}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    </div>
  );
}
