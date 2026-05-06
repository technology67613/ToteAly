import React from 'react';
import { ImageIcon, Settings, Trash2, Sparkles, Eye, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: string;
  _id?: string;
  title: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  is_customizable?: boolean;
}

interface AdminInventoryTabProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export const AdminInventoryTab = ({ products, onEdit, onDelete, onNew }: AdminInventoryTabProps) => {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [activeTab, setActiveTab] = React.useState('All Products');

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} iconic products?`)) {
      selectedIds.forEach(id => onDelete(id));
      setSelectedIds([]);
    }
  };

  const filteredProducts = products.filter(p => 
    activeTab === 'All Products' ? true : p.category === activeTab
  );

  const getStockColor = (stock: number) => {
    if (stock > 50) return "bg-emerald-500";
    if (stock > 10) return "bg-amber-500";
    return "bg-rose-500";
  };

  const getStockBadgeColor = (stock: number) => {
    if (stock > 50) return "bg-emerald-50 text-emerald-600";
    if (stock > 10) return "bg-amber-50 text-amber-600";
    return "bg-rose-50 text-rose-600";
  };

  return (
    <div className="space-y-8 relative pb-32">
      <div className="flex justify-between items-center bg-white p-6 rounded-[24px] border border-[var(--admin-border)] shadow-sm">
        <div className="flex gap-3">
          {['All Products', 'Plain Totes', 'Premium', 'Hampers'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeTab === tab ? "bg-[var(--admin-primary)] text-white shadow-lg shadow-[var(--admin-primary)]/20" : "text-[var(--admin-text-muted)] hover:bg-[var(--admin-light)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex gap-4">
           <button 
            onClick={() => setSelectedIds(selectedIds.length === filteredProducts.length ? [] : filteredProducts.map(p => p.id || p._id || ""))}
            className="px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] border border-[var(--admin-border)] hover:bg-[var(--admin-light)] transition-all"
           >
              {selectedIds.length === filteredProducts.length ? "Deselect All" : "Select Page"}
           </button>
           <button 
            onClick={onNew}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--admin-primary)] text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[var(--admin-primary)]/20"
           >
            <Plus size={16} /> New Product
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((p, idx) => {
          const prodId = p.id || p._id || "prod";
          const isSelected = selectedIds.includes(prodId);
          const stockPercentage = Math.min(100, (p.stock / 100) * 100);
          
          return (
          <motion.div 
            key={prodId} 
            onClick={(e) => {
                if (e.shiftKey) toggleSelect(prodId);
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className={`bg-white rounded-[24px] border overflow-hidden group hover:shadow-[0_20px_50px_rgba(139,26,74,0.1)] transition-all duration-500 relative ${isSelected ? 'border-[var(--admin-primary)] ring-2 ring-[var(--admin-primary)]/10' : 'border-[var(--admin-border)]'}`}
          >
             <div 
              onClick={(e) => { e.stopPropagation(); toggleSelect(prodId); }}
              className={`absolute top-4 right-4 z-20 w-6 h-6 rounded-lg border-2 transition-all cursor-pointer flex items-center justify-center ${isSelected ? 'bg-[var(--admin-primary)] border-[var(--admin-primary)]' : 'bg-white/40 backdrop-blur-md border-white/60 hover:border-white'}`}
             >
                {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
             </div>

             <div className="aspect-[4/3] bg-[var(--admin-light)]/50 relative flex items-center justify-center overflow-hidden">
                {p.images?.[0] ? (
                  <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={p.title} />
                ) : (
                  <ImageIcon size={40} className="text-[var(--admin-primary)]/10" />
                )}
                
                 <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--admin-text-primary)] border border-black/5 shadow-sm">
                      {p.category}
                    </span>
                 </div>

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                   <button 
                    onClick={() => onEdit(p)} 
                    className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[var(--admin-primary)] hover:bg-[var(--admin-primary)] hover:text-white transition-all scale-75 group-hover:scale-100 duration-300"
                   >
                    <Settings size={20} />
                   </button>
                   <button 
                    className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[var(--admin-text-primary)] hover:bg-white hover:scale-110 transition-all scale-75 group-hover:scale-100 duration-300 delay-75"
                   >
                    <Eye size={20} />
                   </button>
                   <button 
                    onClick={() => onDelete(prodId)} 
                    className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all scale-75 group-hover:scale-100 duration-300 delay-150"
                   >
                    <Trash2 size={20} />
                   </button>
                </div>
             </div>
             <div className="p-6">
                <div className="flex justify-between items-start mb-5">
                   <div className="flex flex-col gap-1 min-w-0">
                      <h3 className="font-serif text-[16px] font-bold text-[var(--admin-text-primary)] truncate leading-tight group-hover:text-[var(--admin-primary)] transition-colors">{p.title}</h3>
                      <p className="font-serif text-[14px] font-bold text-[var(--admin-text-muted)]">₹{Number(p.price).toLocaleString('en-IN')}</p>
                   </div>
                   <div className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${getStockBadgeColor(p.stock)}`}>
                      {p.stock} Units
                   </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">
                    <span>Stock Level</span>
                    <span>{Math.round(stockPercentage)}%</span>
                  </div>
                  <div className="w-full bg-[var(--admin-light)] h-1.5 rounded-full overflow-hidden">
                     <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stockPercentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full ${getStockColor(p.stock)} transition-colors`} 
                     />
                  </div>
                </div>
             </div>
          </motion.div>
        )})}
      </div>

      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[80] bg-[var(--admin-surface-dark)] text-white px-8 py-4 rounded-[32px] shadow-2xl flex items-center gap-8 border border-white/10 backdrop-blur-xl"
          >
             <div className="flex items-center gap-3 pr-8 border-r border-white/10">
                <div className="w-8 h-8 bg-[var(--admin-primary)] rounded-lg flex items-center justify-center font-bold text-sm">
                   {selectedIds.length}
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-white/60">Selected Artifacts</span>
             </div>
             
             <div className="flex items-center gap-4">
                <button 
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-6 py-2.5 bg-rose-500/10 text-rose-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                >
                   <Trash2 size={16} /> Delete Iconic
                </button>
                <button 
                  className="flex items-center gap-2 px-6 py-2.5 bg-white/5 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                   Archive
                </button>
                <button 
                  onClick={() => setSelectedIds([])}
                  className="px-4 py-2.5 text-white/40 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest"
                >
                   Cancel
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
