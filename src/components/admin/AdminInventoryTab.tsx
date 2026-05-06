import React from 'react';
import { ImageIcon, Settings, Trash2, Sparkles, Eye, Plus } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          {['ALL', 'PLAIN', 'BLACK', 'PREMIUM'].map((tab, i) => (
            <button 
              key={tab}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                i === 0 ? "bg-[var(--admin-primary)] text-white shadow-lg shadow-[var(--admin-primary)]/20" : "text-[var(--admin-text-muted)] hover:bg-[var(--admin-light)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button 
          onClick={onNew}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--admin-primary)] text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[var(--admin-primary)]/20"
        >
          <Plus size={16} /> New Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((p, idx) => {
          const prodId = p.id || p._id || "prod";
          const stockPercentage = Math.min(100, (p.stock / 100) * 100);
          
          return (
          <motion.div 
            key={prodId} 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-[24px] border border-[var(--admin-border)] overflow-hidden group hover:shadow-[0_20px_50px_rgba(139,26,74,0.1)] transition-all duration-500"
          >
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
                    {p.is_customizable && (
                       <span className="px-3 py-1.5 bg-[var(--admin-primary)] text-white rounded-lg text-[9px] font-bold uppercase tracking-[0.1em] flex items-center gap-1 shadow-lg shadow-[var(--admin-primary)]/20">
                          <Sparkles size={10} /> Custom
                       </span>
                    )}
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
    </div>
  );
};
