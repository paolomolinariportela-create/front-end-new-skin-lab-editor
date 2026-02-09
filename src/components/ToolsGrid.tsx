import React from 'react';

// Dados das ferramentas (estáticos)
const hextomCards = [
    { title: "Estoque", desc: "Shipping & Stock", color: "#00BCD4", icon: "📦" }, 
    { title: "Preço", desc: "Update prices", color: "#4CAF50", icon: "💲" },
    { title: "Promocional", desc: "Sales price", color: "#FF9800", icon: "⚖️" }, 
    { title: "Tag", desc: "Manage tags", color: "#009688", icon: "🏷️" }, 
    { title: "Títulos", desc: "SEO & Names", color: "#673AB7", icon: "📝" }, 
    { title: "Descrição", desc: "HTML Content", color: "#9E9E9E", icon: "📄" }, 
    { title: "Variações", desc: "Categories", color: "#F44336", icon: "🗂️" }, 
    { title: "Marcas", desc: "Brands", color: "#FF5722", icon: "🏭" }, 
    { title: "Status", desc: "status", color: "#FF5722", icon: "🏭" },
    { title: "Codigos", desc: "Codigos", color: "#FF9800", icon: "⚖️" },
    { title: "Logistica", desc: "Logistica", color: "#9E9E9E", icon: "📄" },
    { title: "Google", desc: "Google", color: "#F44336", icon: "🗂️" }, 
    { title: "Relacionados", desc: "Relacionados", color: "#FF9800", icon: "⚖️" },
];

interface ToolsGridProps {
  activeTool: any;
  onActivate: (tool: any) => void;
}

export default function ToolsGrid({ activeTool, onActivate }: ToolsGridProps) {
  return (
    <aside style={{ width: '340px', minWidth: '340px', backgroundColor: '#131314', borderLeft: '1px solid #444746', padding: '24px', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '12px', color: '#888', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase' }}>FERRAMENTAS BULK</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {hextomCards.map((card, index) => (
            <button 
                key={index} 
                onClick={() => onActivate(card)} 
                style={{ 
                    padding: '16px', 
                    backgroundColor: activeTool?.title === card.title ? `${card.color}20` : '#1E1F20', 
                    border: activeTool?.title === card.title ? `2px solid ${card.color}` : `1px solid ${card.color}40`, 
                    borderRadius: '16px', cursor: 'pointer', textAlign: 'left', minHeight: '120px', position: 'relative',
                    opacity: (activeTool && activeTool.title !== card.title) ? 0.5 : 1
                }}
            >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: card.color }}></div>
                <div style={{ fontSize: '24px' }}>{card.icon}</div>
                <div style={{ fontWeight: '600', fontSize: '14px', marginTop: '5px', color: '#E3E3E3' }}>{card.title}</div>
            </button>
        ))}
        </div>
    </aside>
  );
}
