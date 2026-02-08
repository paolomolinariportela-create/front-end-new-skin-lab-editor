import React, { useState, useEffect } from 'react';

// Ajuste a URL se necessário
const BACKEND_URL = "https://web-production-4b8a.up.railway.app"; 

interface ProductsPageProps {
  storeId: string;
  token: string; // <--- 🔒 NOVO: O Token é obrigatório agora
}

export default function ProductsPage({ storeId, token }: ProductsPageProps) {
  const [productsList, setProductsList] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Busca inicial assim que tivermos o Token
  useEffect(() => {
    if (token) {
        fetchProducts();
    }
  }, [token]);

  const fetchProducts = async (search = "") => {
      setLoadingProducts(true);
      try {
          // 🔒 MUDANÇA CRÍTICA NA URL:
          // Antes: /products/${storeId}
          // Agora: /products (O ID está escondido dentro do Token)
          let url = `${BACKEND_URL}/products?limit=100`;
          
          if (search) url += `&search=${search}`;
          
          const res = await fetch(url, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` // <--- O CRACHÁ VIP
              }
          });

          if (res.status === 401) {
              alert("Sessão expirada. Recarregue a página.");
              return;
          }

          const data = await res.json();
          // O backend retorna { data: [], total: 0 } ou lista direta dependendo da paginação
          // Se sua API retornar paginado, ajuste aqui. Assumindo lista direta pelo código anterior:
          if (Array.isArray(data)) {
            setProductsList(data);
          } else if (data.data && Array.isArray(data.data)) {
            setProductsList(data.data);
          }
          
      } catch (error) { 
          console.error(error); 
          alert("Erro ao buscar produtos. Verifique a conexão.");
      } finally { 
          setLoadingProducts(false); 
      }
  };

  const handleInputChange = (id: string, field: string, value: any) => {
      // Edição visual apenas (para salvar precisa do botão salvar futuramente)
      setProductsList(prevList => prevList.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const renderVariants = (product: any) => {
      // Parse seguro do JSON se vier como string do banco
      let variants = [];
      try {
        variants = typeof product.variants_json === 'string' 
            ? JSON.parse(product.variants_json) 
            : product.variants_json || [];
      } catch (e) { variants = []; }

      return (
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', maxWidth: '300px', paddingBottom: '5px', whiteSpace: 'nowrap' }}>
              {variants.map((v: any, i: number) => {
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
                    onKeyPress={(e) => e.key === 'Enter' && fetchProducts(searchTerm)}
                    style={{ padding: '8px 12px', borderRadius: '6px', background: '#282A2C', border: '1px solid #444746', color: 'white' }} 
                />
                <button 
                    onClick={() => fetchProducts(searchTerm)} 
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
                        productsList.map((p) => {
                            // Parse das imagens para exibir a primeira
                            let imgUrl = "";
                            try {
                                const imgs = typeof p.images_json === 'string' ? JSON.parse(p.images_json) : p.images_json;
                                if (imgs && imgs.length > 0) imgUrl = imgs[0].src;
                            } catch(e) {}

                            return (
                                <tr key={p.id} style={{ borderBottom: '1px solid #282A2C' }}>
                                    <td style={{ padding: '10px' }}>
                                        {imgUrl && <img src={imgUrl} alt="" style={{ width: '35px', borderRadius: '4px' }} />}
                                    </td>
                                    <td style={{ padding: '0' }}><input value={p.name || ''} onChange={(e) => handleInputChange(p.id, 'name', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: '#E3E3E3', padding: '12px' }}/></td>
                                    <td style={{ padding: '0' }}><input value={p.handle || ''} onChange={(e) => handleInputChange(p.id, 'sku', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: '#888', padding: '12px' }}/></td>
                                    <td style={{ padding: '10px' }}>{renderVariants(p)}</td>
                                    <td style={{ padding: '0' }}><input type="number" value={p.price || 0} onChange={(e) => handleInputChange(p.id, 'price', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: '#34A853', fontWeight: 'bold', padding: '12px' }}/></td>
                                    <td style={{ padding: '0' }}><input type="number" value={p.stock || 0} onChange={(e) => handleInputChange(p.id, 'stock', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: '#A8C7FA', padding: '12px' }}/></td>
                                    <td style={{ padding: '0' }}><input value={p.description_text?.substring(0,50) || ''} onChange={(e) => handleInputChange(p.id, 'description', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: '#666', padding: '12px' }}/></td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
}
