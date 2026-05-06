"use client";

import React, { useState, useEffect } from "react";
import { X, Image as ImageIcon, Save, Plus, Trash2, Sparkles, RefreshCcw, Package, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
  onSave: (product: any) => void;
}

export const ProductModal = ({ isOpen, onClose, product, onSave }: ProductModalProps) => {
  const [formData, setFormData] = useState({
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
    if (product) {
      setFormData({
        title: product.title || "",
        price: product.price || 0,
        category: product.category || "Plain Totes",
        description: product.description || "",
        stock: product.stock || 0,
        images: product.images || [],
        is_customizable: product.is_customizable ?? true,
        is_featured: product.is_featured ?? false
      });
    } else {
      setFormData({
        title: "",
        price: 0,
        category: "Plain Totes",
        description: "",
        stock: 50,
        images: [],
        is_customizable: true,
        is_featured: false
      });
    }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-10 border-b border-[var(--admin-border)] flex justify-between items-center bg-[var(--admin-light)]/30 shrink-0">
          <div className="flex items-center gap-6">
             <div className="w-14 h-14 bg-[var(--admin-primary)] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[var(--admin-primary)]/20">
                <Package size={28} />
             </div>
             <div>
                <h2 className="text-3xl font-serif font-bold text-[var(--admin-text-primary)]">{product ? "Edit Iconic Product" : "New Iconic Creation"}</h2>
                <p className="text-xs font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mt-1">Curating the ToteAly Aesthetic</p>
             </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white transition-all">
            <X size={24} className="text-[var(--admin-text-muted)]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
             {/* Left: Basic Info */}
             <div className="space-y-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Product Title</label>
                   <input 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-[var(--admin-light)] border border-[var(--admin-border)] font-bold text-sm focus:bg-white focus:ring-4 focus:ring-[var(--admin-primary)]/10 transition-all outline-none" 
                    placeholder="e.g. Midnight Canvas Tote"
                   />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Description</label>
                   <textarea 
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-[var(--admin-light)] border border-[var(--admin-border)] font-medium text-sm focus:bg-white focus:ring-4 focus:ring-[var(--admin-primary)]/10 transition-all outline-none resize-none" 
                    placeholder="Describe the iconic craftsmanship..."
                   />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Price (₹)</label>
                      <input 
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        className="w-full px-6 py-4 rounded-2xl bg-[var(--admin-light)] border border-[var(--admin-border)] font-bold text-sm focus:bg-white focus:ring-4 focus:ring-[var(--admin-primary)]/10 transition-all outline-none" 
                      />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Stock Units</label>
                      <input 
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                        className="w-full px-6 py-4 rounded-2xl bg-[var(--admin-light)] border border-[var(--admin-border)] font-bold text-sm focus:bg-white focus:ring-4 focus:ring-[var(--admin-primary)]/10 transition-all outline-none" 
                      />
                   </div>
                </div>
                <div className="flex gap-10">
                   <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={formData.is_customizable}
                        onChange={(e) => setFormData({ ...formData, is_customizable: e.target.checked })}
                        className="w-5 h-5 rounded-md border-[var(--admin-border)] text-[var(--admin-primary)] focus:ring-[var(--admin-primary)]/20" 
                      />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] group-hover:text-[var(--admin-primary)] transition-colors">Customizable</span>
                   </label>
                   <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="w-5 h-5 rounded-md border-[var(--admin-border)] text-[var(--admin-primary)] focus:ring-[var(--admin-primary)]/20" 
                      />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] group-hover:text-[var(--admin-primary)] transition-colors">Featured</span>
                   </label>
                </div>
             </div>

             {/* Right: Media */}
             <div className="space-y-8">
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Media Gallery</label>
                      <label className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-primary)]/10 text-[var(--admin-primary)] rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-[var(--admin-primary)] hover:text-white transition-all">
                         {uploading ? <RefreshCcw size={14} className="animate-spin" /> : <Upload size={14} />} 
                         {uploading ? 'Uploading...' : 'Upload Cloud'}
                         <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
                      </label>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      {formData.images.map((url, i) => (
                        <div key={i} className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--admin-light)] group border border-[var(--admin-border)] shadow-sm">
                           <img src={url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                           <button 
                            onClick={() => removeImage(i)}
                            className="absolute top-2 right-2 w-8 h-8 bg-rose-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg shadow-rose-500/20"
                           >
                             <Trash2 size={16} />
                           </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          const url = prompt("Enter iconic image URL:");
                          if (url) setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
                        }}
                        className="aspect-square rounded-2xl border-2 border-dashed border-[var(--admin-border)] flex flex-col items-center justify-center gap-3 text-[var(--admin-text-muted)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)] hover:bg-[var(--admin-primary)]/5 transition-all group"
                      >
                         <Plus size={24} className="group-hover:scale-110 transition-transform" />
                         <span className="text-[10px] font-bold uppercase tracking-widest">Add URL</span>
                      </button>
                   </div>
                </div>
                <div className="p-6 bg-amber-50 border border-amber-100 rounded-[24px]">
                   <div className="flex items-center gap-3 mb-2">
                      <RefreshCcw size={16} className="text-amber-600" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Cloud Sync Active</span>
                   </div>
                   <p className="text-[11px] text-amber-700 leading-relaxed">
                      All media is instantly uploaded to the ToteAly asset cloud and optimized for rapid global delivery.
                   </p>
                </div>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-10 border-t border-[var(--admin-border)] bg-[var(--admin-light)]/30 flex justify-end gap-4 shrink-0">
          <button onClick={onClose} disabled={saving} className="px-10 py-4 border border-[var(--admin-border)] rounded-2xl text-xs font-bold uppercase tracking-widest text-[var(--admin-text-muted)] hover:bg-white transition-all disabled:opacity-50">
             Cancel Changes
          </button>
          <button 
            onClick={handleLocalSave}
            disabled={saving || uploading}
            className="px-10 py-4 bg-[var(--admin-primary)] text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-2xl shadow-[var(--admin-primary)]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 disabled:opacity-50"
          >
             {saving ? <RefreshCcw size={18} className="animate-spin" /> : <Save size={18} />}
             {saving ? "Processing..." : product ? "Update Product" : "Launch Product"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
