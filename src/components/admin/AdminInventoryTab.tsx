import React, { useState } from 'react';
import { 
  ImageIcon, Settings, Trash2, Eye, Plus, 
  LayoutGrid, List, Search, Filter, 
  ArrowUpDown, Package, TrendingDown, TrendingUp,
  MoreVertical, Edit, Archive
} from "lucide-react";
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
  is_featured?: boolean;
}

interface AdminInventoryTabProps {
  products: Product[];
  onEdit: (product: any) => void;
  onDelete: (id: string) => void;
  onView: (product: any) => void;
  onNew: () => void;
}

export const AdminInventoryTab = ({ products, onEdit, onDelete, onView, onNew }: AdminInventoryTabProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('All Products');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSingleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      onDelete(id);
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} premium products? This will permanently remove them from your catalog.`)) {
      selectedIds.forEach(id => onDelete(id));
      setSelectedIds([]);
    }
  };

  const categories = ['All Products', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesTab = activeTab === 'All Products' ? true : p.category === activeTab;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStockColor = (stock: number) => {
    if (stock > 50) return "bg-emerald-500";
    if (stock > 10) return "bg-amber-500";
    return "bg-rose-500";
  };

  const getStockStatus = (stock: number) => {
    if (stock > 50) return "In Stock";
    if (stock > 10) return "Low Stock";
    return "Critical";
  };

  return (
    <div className="space-y-10 relative pb-40">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">Inventory Management</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Curate and optimize your premium product catalog</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={18} />
            </button>
          </div>
          
          <button 
            onClick={onNew}
            className="flex items-center gap-3 px-8 h-[52px] bg-slate-900 text-white rounded-[22px] text-[11px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200"
          >
            <Plus size={18} /> New Masterpiece
          </button>
        </div>
      </div>

      {/* Toolbar & Filters - Single Line Scroller */}
      <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm ring-1 ring-slate-100 overflow-hidden">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-1">
          {categories.map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${
                activeTab === tab 
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content Display */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {filteredProducts.map((p, idx) => {
              const prodId = p.id || p._id || "prod";
              const isSelected = selectedIds.includes(prodId);
              const stockPercentage = Math.min(100, (p.stock / 100) * 100);
              
              return (
                <motion.div 
                  key={prodId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-white rounded-[32px] border overflow-hidden group hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 relative ${isSelected ? 'border-slate-900 ring-4 ring-slate-100' : 'border-slate-100'}`}
                >
                  <div 
                    onClick={() => toggleSelect(prodId)}
                    className={`absolute top-6 right-6 z-20 w-8 h-8 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center ${isSelected ? 'bg-slate-900 border-slate-900' : 'bg-white/40 backdrop-blur-md border-white/60 hover:border-white'}`}
                  >
                    {isSelected && <div className="w-3 h-3 bg-white rounded-sm" />}
                  </div>

                  <div className="aspect-[4/5] bg-slate-50 relative flex items-center justify-center overflow-hidden">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms] ease-out" alt={p.title} />
                    ) : (
                      <ImageIcon size={48} className="text-slate-200" />
                    )}
                    
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-4 backdrop-blur-[4px]">
                        <div className="flex gap-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                           <button onClick={() => onEdit(p)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-xl"><Settings size={20} /></button>
                           <button onClick={() => onView(p)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-xl"><Eye size={20} /></button>
                        </div>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex flex-col gap-1.5 min-w-0">
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">{p.category}</span>
                        <h3 className="font-serif text-lg font-bold text-slate-900 truncate tracking-tight">{p.title}</h3>
                        <p className="text-base font-bold text-slate-900 mt-1">₹{Number(p.price).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-slate-400">Inventory Status</span>
                        <span className={p.stock <= 10 ? "text-rose-500" : "text-slate-900"}>{p.stock} Units</span>
                      </div>
                      <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-slate-100">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${stockPercentage}%` }}
                          className={`h-full ${getStockColor(p.stock)} transition-colors`} 
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm shadow-slate-200/50"
          >
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-left w-16">
                    <div 
                      onClick={() => setSelectedIds(selectedIds.length === filteredProducts.length ? [] : filteredProducts.map(p => p.id || p._id || ""))}
                      className={`w-6 h-6 rounded-lg border-2 transition-all cursor-pointer flex items-center justify-center ${selectedIds.length === filteredProducts.length ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'}`}
                    >
                      {selectedIds.length === filteredProducts.length && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                    </div>
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Masterpiece</th>
                  <th className="px-6 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Collection</th>
                  <th className="px-6 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Appraisal</th>
                  <th className="px-6 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inventory Health</th>
                  <th className="px-6 py-5 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const prodId = p.id || p._id || "prod";
                  const isSelected = selectedIds.includes(prodId);
                  return (
                    <tr key={prodId} className={`group hover:bg-slate-50 transition-colors ${isSelected ? 'bg-slate-50/50' : ''}`}>
                      <td className="px-8 py-4">
                        <div 
                          onClick={() => toggleSelect(prodId)}
                          className={`w-6 h-6 rounded-lg border-2 transition-all cursor-pointer flex items-center justify-center ${isSelected ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200 group-hover:border-slate-400'}`}
                        >
                          {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                            {p.images?.[0] ? <img src={p.images[0]} className="w-full h-full object-cover" alt="" /> : <ImageIcon size={20} className="m-auto text-slate-300" />}
                          </div>
                          <span className="text-sm font-bold text-slate-900 tracking-tight">{p.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">{p.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-900">₹{Number(p.price).toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${getStockColor(p.stock)}`} />
                             <span className="text-[11px] font-bold text-slate-900">{p.stock} Units</span>
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">• {getStockStatus(p.stock)}</span>
                          </div>
                          <div className="w-32 bg-slate-100 h-1 rounded-full overflow-hidden">
                            <div className={`h-full ${getStockColor(p.stock)}`} style={{ width: `${Math.min(100, (p.stock / 100) * 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => onEdit(p)} className="p-2.5 hover:bg-white hover:shadow-lg rounded-xl text-slate-600 hover:text-slate-900 transition-all"><Edit size={16} /></button>
                          <button onClick={() => onView(p)} className="p-2.5 hover:bg-white hover:shadow-lg rounded-xl text-slate-600 hover:text-slate-900 transition-all"><Eye size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[80] bg-slate-900 text-white px-10 py-5 rounded-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] flex items-center gap-10 border border-white/10 backdrop-blur-2xl"
          >
             <div className="flex items-center gap-4 pr-10 border-r border-white/10">
                <div className="w-10 h-10 bg-white text-slate-900 rounded-2xl flex items-center justify-center font-bold text-sm shadow-xl">
                   {selectedIds.length}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/40">Batch Action</span>
                  <span className="text-xs font-bold text-white">Masterpieces Selected</span>
                </div>
             </div>
             
             <div className="flex items-center gap-6">
                <button 
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2.5 px-8 py-3 bg-rose-500 text-white rounded-[20px] text-[11px] font-extrabold uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                >
                   <Trash2 size={18} /> Purge
                </button>
                <button className="flex items-center gap-2.5 px-8 py-3 bg-white/10 text-white rounded-[20px] text-[11px] font-extrabold uppercase tracking-widest hover:bg-white/20 transition-all border border-white/5">
                   <Archive size={18} /> Archive
                </button>
                <button 
                  onClick={() => setSelectedIds([])}
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors"
                >
                   Deselect
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
