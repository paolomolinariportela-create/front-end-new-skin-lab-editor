import React, { useState, useEffect } from 'react';

const BACKEND_URL = "https://web-production-4b8a.up.railway.app"; 

interface PricePageProps {
  onBack: () => void;
  storeId: string | null;
}

export default function PricePage({ onBack, storeId }: PricePageProps) {
  // ==============================
  // 1. ESTADOS
  // ==============================
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]); // Lista de categorias
  const [loading, setLoading] = useState(false);

  // -- FILTROS --
  const [filterType, setFilterType] = useState('all'); // 'all', 'title', 'sku', 'category'
  const [operator, setOperator] = useState('contains'); 
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // -- AÇÕES DE PREÇO --
  const [actionType, setActionType] = useState('increase'); // 'increase', 'decrease', 'fixed'
  const [amount, setAmount] = useState<string>('0');
  const [unit, setUnit] = useState('percentage'); // 'percentage' (%), 'flat' (R$)
  const [roundStrategy, setRoundStrategy] = useState('none'); // 'none', '99' (x.99), '00' (x.00)

  // ==============================
  // 2. BUSCAR DADOS
  // ==============================
  useEffect(() => {
    if (storeId) {
      fetchProducts();
    }
  }, [storeId]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/products/${storeId}?limit=1000`); // Limite maior para pegar categorias
      const data = await res.json();
      setAllProducts(data);
      setFilteredProducts(data);
      extractCategories(data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Extrai categorias únicas dos produtos para montar o filtro
  const extractCategories = (products: any[]) => {
    const cats = new Set<string>();
    products.forEach(p => {
        // Tenta ler do JSON de categorias ou de uma string simples
        if (p.categories_json && Array.isArray(p.categories_json)) {
            p.categories_json.forEach((c: any) => {
                const name = c.name?.pt || c.name;
                if (name) cats.add(name);
            });
        }
    });
    setUniqueCategories(Array.from(cats).sort());
  };

  // ==============================
  // 3. LÓGICA DE FILTRAGEM
  // ==============================
  const handleFilter = () => {
    let result = allProducts;

    // Filtro por Categoria
    if (filterType === 'category' && selectedCategory) {
        result = result.filter(p => {
            const pCats = p.categories_json?.map((c: any) => c.name?.pt || c.name) || [];
            return pCats.includes(selectedCategory);
        });
    }
    // Filtro por Título ou SKU
    else if (filterType === 'title' || filterType === 'sku') {
        const term = searchValue.toLowerCase();
        result = result.filter(p => {
            const field = filterType === 'title' ? (p.name || '') : (p.sku || '');
            const fieldLower = field.toLowerCase();

            if (operator === 'contains') return fieldLower.includes(term);
            if (operator === 'not_contains') return !fieldLower.includes(term);
            if (operator === 'equals') return fieldLower === term;
            return true;
        });
    }

    setFilteredProducts(result);
  };

  // ==============================
  // 4. CÁLCULO DE PREÇO (SIMULAÇÃO)
  // ==============================
  const calculateNewPrice = (currentPrice: number) => {
    let price = parseFloat(currentPrice.toString());
    const val = parseFloat(amount.replace(',', '.')) || 0;

    if (actionType === 'fixed') {
        price = val;
    } else {
        const delta = unit === 'percentage' ? (price * val / 100) : val;
        if (actionType === 'increase') price += delta;
        if (actionType === 'decrease') price -= delta;
    }

    // Lógica de Arredondamento
    if (roundStrategy === '99') {
        price = Math.floor(price) + 0.99;
    } else if (roundStrategy === '00') {
        price = Math.round(price);
    } else {
        // Mantém 2 casas decimais padrão
        price = Math.round(price * 100) / 100;
    }

    return price < 0 ? 0 : price;
  };

  const handleApply = () => {
    const confirmMsg = `Você está prestes a alterar o preço de ${filteredProducts.length} produtos.\n\nAção: ${actionType === 'increase' ? 'Aumentar' : actionType === 'decrease' ? 'Diminuir' : 'Fixar'}\nValor: ${amount} ${unit === 'percentage' ? '%' : 'R$'}\n\nConfirma?`;
    if (window.confirm(confirmMsg)) {
        alert("Enviando comando para o Backend... (Lógica de API aqui)");
        // Aqui chamaremos a função de bulk update do backend no futuro
    }
  };

  return (
    <div style={{ padding: '40px', width: '100%', height: '100%', color: '#E3E3E3', boxSizing: 'border-box', overflowY: 'auto' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ fontSize: '32px', background: '#4CAF5020', padding: '12px', borderRadius: '12px', color: '#4CAF50' }}>💲</div>
            <div>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Editor de Preços em Massa</h1>
                <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>
                    Editando <span style={{ color: '#A8C7FA', fontWeight: 'bold' }}>{filteredProducts.length}</span> produtos
                </p>
            </div>
        </div>
        <button onClick={onBack} style={{ background: '#282A2C', border: '1px solid #444', color: '#ccc', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Voltar</button>
      </div>

      {/* === PASSO 1: FILTROS AVANÇADOS === */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>Passo 1: Selecionar Produtos</div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* Tipo de Filtro */}
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={selectStyle}>
            <option value="all">Todos os Produtos</option>
            <option value="category">Por Categoria</option>
            <option value="title">Por Título</option>
            <option value="sku">Por SKU</option>
          </select>

          {/* Opções Dinâmicas */}
          {filterType === 'category' && (
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{...selectStyle, minWidth: '200px'}}>
                <option value="">Selecione uma categoria...</option>
                {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}

          {(filterType === 'title' || filterType === 'sku') && (
            <>
                <select value={operator} onChange={(e) => setOperator(e.target.value)} style={selectStyle}>
                    <option value="contains">Contém</option>
                    <option value="not_contains">Não contém</option>
                    <option value="equals">É igual a</option>
                </select>
                <input 
                    type="text" 
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Digite aqui..." 
                    style={{ ...inputStyle, flex: 1, minWidth: '200px' }} 
                />
            </>
          )}

          <button onClick={handleFilter} style={buttonPrimaryStyle}>
            {loading ? 'Carregando...' : '🔍 Filtrar'}
          </button>
        </div>
      </div>

      {/* === PASSO 2: AÇÕES DE PREÇO === */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>Passo 2: Definir Regra de Preço</div>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'end', flexWrap: 'wrap' }}>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                <label style={labelStyle}>Ação</label>
                <select value={actionType} onChange={(e) => setActionType(e.target.value)} style={selectStyle}>
                    <option value="increase">Aumentar (+)</option>
                    <option value="decrease">Diminuir (-)</option>
                    <option value="fixed">Definir Fixo (=)</option>
                </select>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                <label style={labelStyle}>Valor</label>
                <div style={{display: 'flex'}}>
                    <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00" 
                        style={{ ...inputStyle, width: '100px', borderRadius: '8px 0 0 8px', borderRight: 'none' }} 
                    />
                    <select value={unit} onChange={(e) => setUnit(e.target.value)} style={{ ...selectStyle, width: '70px', borderRadius: '0 8px 8px 0', background: '#282A2C' }}>
                        {actionType !== 'fixed' && <option value="percentage">%</option>}
                        <option value="flat">R$</option>
                    </select>
                </div>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                <label style={labelStyle}>Arredondar</label>
                <select value={roundStrategy} onChange={(e) => setRoundStrategy(e.target.value)} style={selectStyle}>
                    <option value="none">Exato (R$ 10,12)</option>
                    <option value="99">Final .99 (R$ 10,99)</option>
                    <option value="00">Final .00 (R$ 11,00)</option>
                </select>
            </div>

            <div style={{flex: 1}}></div>

            <button onClick={handleApply} style={{...buttonPrimaryStyle, backgroundColor: '#34A853', fontSize: '16px', padding: '12px 40px'}}>
                💾 Aplicar Alterações
            </button>
        </div>
      </div>

      {/* === PREVIEW (TABELA) === */}
      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        <div style={{ ...cardHeaderStyle, padding: '20px', borderBottom: '1px solid #444' }}>
            Simulação ({filteredProducts.length} produtos afetados)
        </div>
        
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#282A2C', zIndex: 10 }}>
                    <tr>
                        <th style={thStyle}>PRODUTO</th>
                        <th style={thStyle}>CATEGORIA</th>
                        <th style={thStyle}>PREÇO ATUAL</th>
                        <th style={{...thStyle, color: '#A8C7FA', borderLeft: '1px solid #444'}}>NOVO PREÇO</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProducts.slice(0, 100).map(p => {
                        const newPrice = calculateNewPrice(p.price || 0);
                        const isChanged = newPrice !== p.price;

                        return (
                            <tr key={p.id} style={{ borderBottom: '1px solid #333', background: '#1E1F20' }}>
                                <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <img src={p.image_url} width="35" height="35" style={{borderRadius: '4px', objectFit: 'cover'}} />
                                    <div>
                                        <div style={{fontWeight: '500'}}>{p.name}</div>
                                        <div style={{fontSize: '11px', color: '#888'}}>{p.sku}</div>
                                    </div>
                                </td>
                                <td style={{ padding: '12px', color: '#ccc' }}>
                                    {p.categories_json?.[0]?.name?.pt || '-'}
                                </td>
                                <td style={{ padding: '12px' }}>R$ {p.price?.toFixed(2)}</td>
                                <td style={{ padding: '12px', fontWeight: 'bold', color: isChanged ? '#4CAF50' : '#888', borderLeft: '1px solid #444', background: isChanged ? '#4CAF5010' : 'transparent' }}>
                                    R$ {newPrice.toFixed(2)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {filteredProducts.length > 100 && <div style={{textAlign: 'center', padding: '15px', color: '#666', fontStyle: 'italic'}}>...mostrando os primeiros 100 de {filteredProducts.length}</div>}
        </div>
      </div>

    </div>
  );
}

// === ESTILOS ===
const cardStyle: React.CSSProperties = { backgroundColor: '#1E1F20', border: '1px solid #444', borderRadius: '16px', padding: '25px', marginBottom: '20px' };
const cardHeaderStyle: React.CSSProperties = { marginTop: 0, marginBottom: '20px', color: '#E3E3E3', fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' };
const labelStyle: React.CSSProperties = { fontSize: '12px', color: '#A8C7FA', fontWeight: '600', marginLeft: '2px' };

const selectStyle: React.CSSProperties = { padding: '12px', borderRadius: '8px', background: '#131314', color: 'white', border: '1px solid #555', outline: 'none', fontSize: '14px', height: '45px' };
const inputStyle: React.CSSProperties = { padding: '12px', borderRadius: '8px', background: '#131314', color: 'white', border: '1px solid #555', outline: 'none', fontSize: '14px', height: '45px', boxSizing: 'border-box' };
const buttonPrimaryStyle: React.CSSProperties = { padding: '0 25px', height: '45px', background: '#4285F4', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: '12px', color: '#888', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' };
