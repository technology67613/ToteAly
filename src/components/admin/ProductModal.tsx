"use client";

import React, { useState, useEffect } from "react";
import { 
  X, Save, Plus, Trash2, 
  RefreshCcw, Package, Upload, 
  Check, Info, ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
  onSave: (product: any) => void;
  onDelete?: (id: string) => void;
}

export const ProductModal = ({ isOpen, onClose, product, onSave, onDelete }: ProductModalProps) => {
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    price: 0,
    category: "Plain Totes",
    description: "",
    stock: 50,
    images: [] as string[],
    is_customizable: true,
    is_featured: false
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData(
      product
        ? {
        id: product.id || product._id || "",
        title: product.title || "",
        price: product.price || 0,
        category: product.category || "Plain Totes",
        description: product.description || "",
        stock: product.stock || 0,
        images: product.images || [],
        is_customizable: product.is_customizable ?? true,
        is_featured: product.is_featured ?? false
      }
        : {
        id: "",
        title: "",
        price: 0,
        category: "Plain Totes",
        description: "",
        stock: 50,
        images: [],
        is_customizable: true,
        is_featured: false
      }
    );
  }, [product, isOpen]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formDataObj = new FormData();
    formDataObj.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formDataObj,
      });
      if (res.ok) {
        const { url } = await res.json();
        setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleLocalSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLocalDelete = () => {
    if (!product || !onDelete) return;
    onDelete(formData.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  if (!isOpen) return null;

  const categories = ["Plain Totes", "Premium", "Hampers", "New Arrivals", "Limited Edition"];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
      >
        {/* Deletion Confirmation Overlay */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[110] bg-white/80 backdrop-blur-md flex items-center justify-center p-8"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="max-w-md w-full bg-white rounded-[32px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border border-slate-100 p-10 text-center space-y-8"
              >
                <div className="w-20 h-20 bg-rose-50 rounded-[28px] flex items-center justify-center text-rose-500 mx-auto shadow-sm">
                  <Trash2 size={36} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-slate-900">Purge Masterpiece?</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    You are about to permanently remove <span className="text-slate-900 font-bold">"{formData.title}"</span> from your catalog. This action cannot be reversed.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleLocalDelete}
                    className="w-full py-4 bg-rose-500 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-rose-500/20 hover:bg-rose-600 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                  >
                    Confirm Deletion
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:text-slate-900 transition-colors"
                  >
                    Keep it in Catalog
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                <Package size={20} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-slate-900">{product ? "Edit Product" : "Add New Product"}</h2>
                <p className="text-xs text-slate-400 font-medium tracking-wide">Manage your inventory catalog</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-lg transition-colors group">
            <X size={20} className="text-slate-400 group-hover:text-slate-900" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            
            {/* Left: Main Details */}
            <div className="lg:col-span-3 space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Product Name</label>
                <input 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter product title..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
                  <div className="relative">
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium appearance-none outline-none focus:border-slate-900 transition-all cursor-pointer"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Price (₹)</label>
                  <input 
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-slate-900 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea 
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide product details..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-slate-900 outline-none transition-all resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Stock Available</label>
                  <input 
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-slate-900 outline-none transition-all"
                  />
                </div>
                <div className="flex flex-col justify-end gap-3 pb-1">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <div 
                      onClick={() => setFormData(p => ({...p, is_customizable: !p.is_customizable}))}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${formData.is_customizable ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-300'}`}
                    >
                      {formData.is_customizable && <Check size={14} />}
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Customizable</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <div 
                      onClick={() => setFormData(p => ({...p, is_featured: !p.is_featured}))}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${formData.is_featured ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-300'}`}
                    >
                      {formData.is_featured && <Check size={14} />}
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Featured Product</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Media Portfolio */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Product Media</label>
                <label className="text-[10px] font-bold text-slate-900 hover:text-slate-600 cursor-pointer transition-colors uppercase tracking-widest flex items-center gap-1.5">
                  <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload'}
                  <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <AnimatePresence>
                  {formData.images.map((url, i) => (
                    <motion.div 
                      key={url} 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 group"
                    >
                      <img src={url} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="" />
                      <button 
                        onClick={() => removeImage(i)}
                        className="absolute top-2 right-2 w-7 h-7 bg-white/90 text-rose-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white shadow-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                <button 
                  onClick={() => {
                    const url = prompt("Enter image URL:");
                    if (url) setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
                  }}
                  className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-slate-900 hover:text-slate-900 hover:bg-slate-50 transition-all group"
                >
                  <Plus size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Add URL</span>
                </button>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex items-center gap-2 text-emerald-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Live Inventory</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Changes made here are instantly synchronized across your store. High-quality imagery is recommended for best presentation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose} 
              disabled={saving} 
              className="px-6 py-2.5 text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
            >
              Cancel
            </button>
            {product && (
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-6 py-2.5 text-rose-500 hover:bg-rose-50 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
              >
                <Trash2 size={16} /> Delete Product
              </button>
            )}
          </div>
          
          <button 
            onClick={handleLocalSave}
            disabled={saving || uploading}
            className="flex items-center gap-2 px-10 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-black hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCcw size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Saving..." : product ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
