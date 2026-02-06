import React, { useState, useEffect } from 'react';

const BACKEND_URL = "https://web-production-4b8a.up.railway.app"; 

interface PricePageProps {
  onBack: () => void;
  storeId: string | null;
}

export default function PricePage({ onBack, storeId }: PricePageProps) {
  // ==============================
  // 1. ESTADOS (A Memória da Página)
  // ==============================
  const [allProducts, setAllProducts] = useState<any[]>([]); // Todos os produtos do banco
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]); // Apenas os que passaram no filtro
  const [loading, setLoading] = useState(false);

  // Estados dos Filtros
  const [filterType, setFilterType] = useState('all'); // 'all', 'title', 'sku'
  const [operator, setOperator] = useState('contains'); // 'contains', 'not_contains', 'equals'
  const [searchValue, setSearchValue] = useState('');

  // ==============================
  // 2. BUSCAR DADOS (Ao abrir a página)
  // ==============================
  useEffect(() => {
    if (storeId) {
      fetchProducts();
    }
  }, [storeId]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Trazemos 500 produtos para o editor
      const res = await fetch(`${BACKEND_URL}/products/${storeId}?limit=500`);
      const data = await res.json();
      setAllProducts(data);
      setFilteredProducts(data); // Começa mostrando tudo
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // 3. LÓGICA DE FILTRAGEM (O Cérebro)
  // ==============================
  const handleFilter = () => {
    if (filterType === 'all') {
      setFilteredProducts(allProducts);
      return;
    }

    const result = allProducts.filter(p => {
      // Normaliza para minusculo para a busca não falhar por CAPS LOCK
      const field = filterType === 'title' ? (p.name || '').toLowerCase() : (p.sku || '').toLowerCase();
      const term = searchValue.toLowerCase();

      if (operator === 'contains') return field.includes(term);
      if (operator === 'not_contains') return !field.includes(term);
      if (operator === 'equals') return field === term;
      
      return true;
    });

    setFilteredProducts(result);
  };

  return (
    <div style={{ padding: '40px', width: '100%', height: '100%', color: '#E3E3E3', boxSizing: 'border-box', overflowY: 'auto' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ fontSize: '40px', background: '#4CAF5020', padding: '15px', borderRadius: '12px', color: '#4CAF50', border: '1px solid #4CAF5040' }}>
            💲
            </div>
            <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>Bulk Edit Price</h1>
            <p style={{ color: '#888', margin: 0 }}>
                Editando <span style={{ color: '#A8C7FA', fontWeight: 'bold' }}>{filteredProducts.length}</span> produtos de {allProducts.length}
            </p>
            </div>
        </div>
        <button onClick={onBack} style={{ background: 'transparent', border: '1px solid #444', color: '#888', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
            Voltar
        </button>
      </div>

      {/* === PASSO 1: OS FILTROS === */}
      <div style={{ backgroundColor: '#1E1F20', border: '1px solid #444', borderRadius: '16px', padding: '30px', marginBottom: '20px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#E3E3E3', fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Passo 1: Selecionar Produtos
        </h3>
        <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>Defina quais produtos serão afetados pela mudança de preço.</p>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#282A2C', padding: '20px', borderRadius: '12px', flexWrap: 'wrap' }}>
          
          {/* SELETOR 1: TIPO */}
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)} 
            style={selectStyle}
          >
            <option value="all">Todos os Produtos</option>
            <option value="title">Título do Produto</option>
            <option value="sku">SKU</option>
          </select>

          {/* SELETOR 2 E INPUT (Só aparecem se não for "Todos") */}
          {filterType !== 'all' && (
            <>
                <select 
                    value={operator} 
                    onChange={(e) => setOperator(e.target.value)}
                    style={selectStyle}
                >
                    <option value="contains">Contém</option>
                    <option value="not_contains">Não contém</option>
                    <option value="equals">É igual a</option>
                </select>

                <input 
                    type="text" 
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Digite aqui..." 
                    style={{ ...selectStyle, flex: 1, minWidth: '200px', background: '#131314' }} 
                />
            </>
          )}

          <button 
            onClick={handleFilter} 
            style={{ padding: '12px 30px', background: '#4285F4', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginLeft: filterType === 'all' ? '0' : 'auto' }}
          >
            {loading ? 'Carregando...' : '🔍 Filtrar'}
          </button>
        </div>
      </div>

      {/* === PREVIEW DOS RESULTADOS (TABELA) === */}
      <div style={{ backgroundColor: '#1E1F20', border: '1px solid #444', borderRadius: '16px', padding: '30px', marginBottom: '20px', maxHeight: '400px', overflowY: 'auto' }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#A8C7FA', fontSize: '14px' }}>
            Resultados do Filtro ({filteredProducts.length})
        </h3>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#282A2C' }}>
                <tr>
                    <th style={{ textAlign: 'left', padding: '10px', color: '#888' }}>IMG</th>
                    <th style={{ textAlign: 'left', padding: '10px', color: '#888' }}>NOME</th>
                    <th style={{ textAlign: 'left', padding: '10px', color: '#888' }}>SKU</th>
                    <th style={{ textAlign: 'left', padding: '10px', color: '#888' }}>PREÇO ATUAL</th>
                </tr>
            </thead>
            <tbody>
                {filteredProducts.slice(0, 50).map(p => ( 
                    <tr key={p.id} style={{ borderBottom: '1px solid #333' }}>
                        <td style={{ padding: '10px' }}><img src={p.image_url} width="30" style={{borderRadius: '4px'}} /></td>
                        <td style={{ padding: '10px' }}>{p.name}</td>
                        <td style={{ padding: '10px', color: '#888' }}>{p.sku}</td>
                        <td style={{ padding: '10px', color: '#34A853' }}>R$ {p.price}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        {filteredProducts.length > 50 && <div style={{textAlign: 'center', padding: '10px', color: '#666'}}>...e mais {filteredProducts.length - 50} produtos</div>}
      </div>

      {/* === PASSO 2: AÇÃO === */}
      <div style={{ backgroundColor: '#1E1F20', border: '1px solid #444', borderRadius: '16px', padding: '30px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#E3E3E3', fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Passo 2: Configurar Reajuste
        </h3>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
          <select style={selectStyle}>
            <option>Aumentar Preço</option>
            <option>Diminuir Preço</option>
            <option>Definir Valor Fixo</option>
          </select>
          <input type="number" placeholder="10" style={{ ...selectStyle, width: '150px', background: '#131314' }} />
          <select style={{ ...selectStyle, width: '80px' }}>
            <option>%</option>
            <option>R$</option>
          </select>
          
          <div style={{ flex: 1 }}></div> 

          <button style={{ padding: '12px 30px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            Aplicar em {filteredProducts.length} Produtos
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
