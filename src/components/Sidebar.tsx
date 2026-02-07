import React from 'react';

interface SidebarProps {
  storeStats: { name: string; products: number; categories: number };
  isSyncing: boolean;
  syncProgress: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ 
  storeStats, 
  isSyncing, 
  syncProgress, 
  activeTab, 
  setActiveTab 
}: SidebarProps) {
  
  return (
    <aside style={{ width: '260px', minWidth: '260px', backgroundColor: '#1E1F20', borderRight: '1px solid #444746', padding: '24px', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
       
       <h2 style={{ background: 'linear-gradient(90deg, #4285F4, #9B72CB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800', fontSize: '24px', marginBottom: '20px', letterSpacing: '-1px' }}>NewSkin Lab</h2>
       
       {/* Status Card */}
       <div style={{ padding: '20px', backgroundColor: '#282A2C', borderRadius: '16px', border: '1px solid #444746', marginBottom: '30px' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
             <span style={{ fontSize: '11px', fontWeight: '600', color: '#C4C7C5', letterSpacing: '1px' }}>STATUS</span>
             <span style={{ fontSize: '11px', fontWeight: 'bold', color: isSyncing ? '#A8C7FA' : '#34A853', display: 'flex', alignItems: 'center', gap: '6px' }}>
               {isSyncing ? '' : <span style={{ width: '8px', height: '8px', backgroundColor: '#34A853', borderRadius: '50%', display: 'inline-block' }}></span>}
               {isSyncing ? 'SYNC...' : 'ONLINE'}
             </span>
           </div>
           
           <div style={{ width: '100%', height: '4px', backgroundColor: '#444746', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
             <div style={{ width: `${syncProgress}%`, height: '100%', backgroundColor: syncProgress < 100 ? '#4285F4' : '#34A853', transition: 'width 0.3s' }}></div>
           </div>

           <div style={{ borderTop: '1px solid #444746', paddingTop: '12px', marginBottom: '12px' }}>
               <div style={{ fontSize: '10px', color: '#8E918F', marginBottom: '2px' }}>LOJA</div>
               <div style={{ fontSize: '14px', color: '#E3E3E3', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                   {storeStats.name}
               </div>
           </div>

           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
               <div>
                   <div style={{ fontSize: '10px', color: '#8E918F', marginBottom: '2px' }}>PRODUTOS</div>
                   <div style={{ fontSize: '14px', color: '#A8C7FA', fontWeight: 'bold' }}>{storeStats.products}</div>
               </div>
               <div style={{ width: '1px', backgroundColor: '#444746', height: '25px' }}></div>
               <div style={{ textAlign: 'right' }}>
                   <div style={{ fontSize: '10px', color: '#8E918F', marginBottom: '2px' }}>CATEGORIAS</div>
                   <div style={{ fontSize: '14px', color: '#A8C7FA', fontWeight: 'bold' }}>{storeStats.categories}</div>
               </div>
           </div>
       </div>

       {/* Menu de Navegação */}
       <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
           <div onClick={() => setActiveTab('dashboard')} style={{ padding: '12px', backgroundColor: activeTab === 'dashboard' ? '#004A77' : 'transparent', borderRadius: '50px', color: activeTab === 'dashboard' ? '#A8C7FA' : '#C4C7C5', fontWeight: '600', paddingLeft: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}><span>✨</span> Dashboard</div>
           <div onClick={() => setActiveTab('products')} style={{ padding: '12px', backgroundColor: activeTab === 'products' ? '#004A77' : 'transparent', borderRadius: '50px', color: activeTab === 'products' ? '#A8C7FA' : '#C4C7C5', paddingLeft: '20px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}><span>📦</span> Produtos</div>
           <div onClick={() => setActiveTab('history')} style={{ padding: '12px', backgroundColor: activeTab === 'history' ? '#004A77' : 'transparent', borderRadius: '50px', color: activeTab === 'history' ? '#A8C7FA' : '#C4C7C5', paddingLeft: '20px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}><span>📜</span> Histórico</div>
           <div onClick={() => alert("Em breve")} style={{ padding: '12px', color: '#C4C7C5', paddingLeft: '20px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}><span>💎</span> Planos</div>
           <div onClick={() => alert("Em breve")} style={{ padding: '12px', color: '#C4C7C5', paddingLeft: '20px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}><span>💬</span> Fale Conosco</div>
       </nav>
    </aside>
  );
}
