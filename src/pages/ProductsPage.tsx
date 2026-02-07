import React, { useState, useEffect } from 'react';

// Ajuste a URL se necessário, ou crie um arquivo de config depois
const BACKEND_URL = "https://web-production-4b8a.up.railway.app"; 

interface ProductsPageProps {
  storeId: string | null;
}

export default function ProductsPage({ storeId }: ProductsPageProps) {
  const [productsList, setProductsList] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Busca inicial
  useEffect(() => {
    if (storeId) {
        fetchProducts(storeId);
    }
  }, [storeId]);

  const fetchProducts = async (id: string, search = "") => {
      setLoadingProducts(true);
      try {
          let url = `${BACKEND_URL}/products/${id}?limit=100`;
          if (search) url += `&search=${search}`;
          
          const res = await fetch(url);
          const data = await res.json();
          setProductsList(data);
      } catch (error) { 
          console.error(error); 
          alert("Erro ao buscar produtos.");
      } finally { 
          setLoadingProducts(false); 
      }
  };

  const handleInputChange = (id: string, field: string, value: any) => {
      // Edição visual apenas (para salvar precisa do botão salvar futuramente)
      setProductsList(prevList => prevList.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const renderVariants = (product: any) => {
      return (
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', maxWidth: '300px', paddingBottom: '5px', whiteSpace: 'nowrap' }}>
              {product.variants_json?.map((v: any, i: number) => {
                  const name = v.values ? v.values.map((val:any) => val.pt).join('/') : 'Único';
                  return (
                      <div key={i} 
                        style={{ fontSize: '10px', background: '#333', padding: '4px 6px', borderRadius: '4px', color: '#E3E3E3', border: '1px solid #444', minWidth: '60px', textAlign: 'center' }}
                        title="Variante">
                          <div style={{ fontWeight: 'bold' }}>{name}</div>
                          <div style={{ color: '#34A853' }}>R$ {v.price || product.price}</div>
                      </div>
                  );
              })}
          </div>
      );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px', backgroundColor: '#131314' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>Catálogo</h1>
            <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                    placeholder="🔍 Buscar..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    style={{ padding: '8px 12px', borderRadius: '6px', background: '#282A2C', border: '1px solid #444746', color: 'white' }} 
                />
                <button 
                    onClick={() => storeId && fetchProducts(storeId, searchTerm)} 
                    style={{ padding: '0 15px', borderRadius: '6px', background: '#4285F4', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    Filtrar
                </button>
            </div>
        </div>
        
        <div style={{ flex: 1, overflow: 'auto', background: '#1E1F20', borderRadius: '12px', border: '1px solid #444746' }}>
            <table style={{ width: '100%', minWidth: '1800px', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#282A2C', zIndex: 5 }}>
                    <tr>
                        <th style={{ padding: '12px', color: '#aaa' }}>IMG</th>
                        <th style={{ padding: '12px', color: '#aaa' }}>NOME</th>
                        <th style={{ padding: '12px', color: '#aaa' }}>SKU</th>
                        <th style={{ padding: '12px', color: '#aaa' }}>VARIANTES</th>
                        <th style={{ padding: '12px', color: '#aaa' }}>PREÇO</th>
                        <th style={{ padding: '12px', color: '#aaa' }}>ESTOQUE</th>
                        <th style={{ padding: '12px', color: '#aaa' }}>DESCRIÇÃO</th>
                    </tr>
                </thead>
                <tbody>
                    {loadingProducts ? (
                        <tr><td colSpan={7} style={{textAlign: 'center', padding: '20px', color: '#888'}}>Carregando catálogo...</td></tr>
                    ) : (
                        productsList.map((p) => (
                            <tr key={p.id} style={{ borderBottom: '1px solid #282A2C' }}>
                                <td style={{ padding: '10px' }}><img src={p.image_url} alt="" style={{ width: '35px', borderRadius: '4px' }} /></td>
                                <td style={{ padding: '0' }}><input value={p.name} onChange={(e) => handleInputChange(p.id, 'name', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: '#E3E3E3', padding: '12px' }}/></td>
                                <td style={{ padding: '0' }}><input value={p.sku} onChange={(e) => handleInputChange(p.id, 'sku', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: '#888', padding: '12px' }}/></td>
                                <td style={{ padding: '10px' }}>{renderVariants(p)}</td>
                                <td style={{ padding: '0' }}><input type="number" value={p.price} onChange={(e) => handleInputChange(p.id, 'price', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: '#34A853', fontWeight: 'bold', padding: '12px' }}/></td>
                                <td style={{ padding: '0' }}><input type="number" value={p.stock} onChange={(e) => handleInputChange(p.id, 'stock', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: '#A8C7FA', padding: '12px' }}/></td>
                                <td style={{ padding: '0' }}><input value={p.description?.substring(0,50)} onChange={(e) => handleInputChange(p.id, 'description', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: '#666', padding: '12px' }}/></td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
}
