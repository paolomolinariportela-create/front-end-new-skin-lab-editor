import { useState, useEffect, useRef } from 'react';
import PreviewCard from './PreviewCard';

const BACKEND_URL = "https://web-production-4b8a.up.railway.app"; 

export default function NewSkinApp() {
  // ==========================================
  // 1. ESTADOS
  // ==========================================
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [storeId, setStoreId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const [syncProgress, setSyncProgress] = useState(0);
  
  // Lista de Produtos
  const [productsList, setProductsList] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false); // <--- AGORA VAMOS USAR ISSO
  const [searchTerm, setSearchTerm] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Stats
  const [storeStats, setStoreStats] = useState({ name: 'Carregando...', products: 0, categories: 0 });
  const [messages, setMessages] = useState<any[]>([{ role: 'ai', text: 'Olá! Sou a IA do NewSkin. Posso te ajudar com preços, títulos ou dúvidas sobre seu estoque.' }]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const chatEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ==========================================
  // 2. LÓGICA DE CARREGAMENTO
  // ==========================================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('store_id');

    if (id) {
      setStoreId(id);
      checkStoreStatus(id);
    } else {
      setMessages([{ role: 'ai', text: '⚠️ Atenção: Não encontrei o ID da loja.' }]);
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'products' && storeId) {
        fetchProducts(storeId);
    }
  }, [activeTab, storeId]);

  const checkStoreStatus = (id: string) => {
      fetch(`${BACKEND_URL}/admin/status/${id}`)
        .then(res => res.json())
        .then(data => {
            setStoreStats({
                name: data.loja_nome || `Loja ${id}`,
                products: data.total_produtos_banco || 0,
                categories: data.total_categorias_banco || 0
            });

            if (data.ultimo_erro === "SYNC_CONCLUIDO") {
                if(isSyncing) {
                   setMessages(prev => [...prev, { role: 'ai', text: `Conectado! ${data.total_produtos_banco} produtos prontos para edição.` }]);
                   setSyncProgress(100);
                   setIsSyncing(false); 
                }
            } else {
                setSyncProgress(old => old < 90 ? old + 10 : old);
                fetch(`${BACKEND_URL}/sync?store_id=${id}`, { method: 'POST' }).catch(console.error);
            }
        })
        .catch(() => fetch(`${BACKEND_URL}/sync?store_id=${id}`, { method: 'POST' }));
  };

  const fetchProducts = async (id: string, search = "") => {
      setLoadingProducts(true);
      try {
          let url = `${BACKEND_URL}/products/${id}?limit=100`;
          if (search) url += `&search=${search}`;
          const res = await fetch(url);
          const data = await res.json();
          setProductsList(data);
      } catch (error) { console.error(error); } finally { setLoadingProducts(false); }
  };

  useEffect(() => {
    if (!storeId || !isSyncing) return;
    const interval = setInterval(() => checkStoreStatus(storeId), 5000);
    return () => clearInterval(interval);
  }, [storeId, isSyncing]);

  // ==========================================
  // 3. FUNÇÕES UX
  // ==========================================
  const handleInputChange = (id: string, field: string, value: any) => {
      setHasChanges(true);
      setProductsList(prevList => prevList.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleEditVariant = (productId: string, variantIndex: number, currentPrice: number) => {
      const newPrice = window.prompt("Novo preço para esta variante:", currentPrice.toString());
      if (newPrice) {
          setHasChanges(true);
          setProductsList(prevList => prevList.map(p => {
              if (p.id === productId) {
                  const updatedVariants = [...p.variants_json];
                  updatedVariants[variantIndex] = { ...updatedVariants[variantIndex], price: parseFloat(newPrice) };
                  return { ...p, variants_json: updatedVariants };
              }
              return p;
          }));
      }
  };

  const renderVariants = (product: any) => {
      const jsonVariants = product.variants_json;
      if (!jsonVariants || jsonVariants.length === 0) return <span style={{color: '#666', fontSize: '11px'}}>Padrão</span>;
      return (
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', maxWidth: '300px', paddingBot
