"use client";

import React, { useState, useEffect } from "react";
import { X, Image as ImageIcon, Save, Plus, Trash2, Sparkles, RefreshCcw } from "lucide-react";
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
    isCustomizable: true
  });
  const [newImageUrl, setNewImageUrl] = useState("");
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
        isCustomizable: product.isCustomizable ?? true
      });
    } else {
      setFormData({
        title: "",
        price: 0,
        category: "Plain Totes",
        description: "",
        stock: 50,
        images: [],
        isCustomizable: true
      });
    }
  }, [product, isOpen]);

  const handleAddImage = () => {
    if (!newImageUrl) return;
    setFormData(prev => ({ ...prev, images: [...prev.images, newImageUrl] }));
    setNewImageUrl("");
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
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-8 border-b border-[var(--admin-border)] flex justify-between items-center bg-[var(--admin-light)]/30">
          <div>
            <h2 className="text-2xl font-serif font-bold text-[var(--admin-text-primary)]">
              {product ? "Edit Iconic Product" : "New Iconic Creation"}
            </h2>
            <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mt-1">Configure product details and stock</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white transition-all">
            <X size={20} className="text-[var(--admin-text-muted)]" />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto">
          {/* Main Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Product Title</label>
              <input 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Midnight Canvas Tote" 
                className="w-full px-5 py-3.5 rounded-xl bg-[var(--admin-light)]/50 border border-[var(--admin-border)] font-bold text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/10 transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full px-5 py-3.5 rounded-xl bg-[var(--admin-light)]/50 border border-[var(--admin-border)] font-bold text-sm focus:bg-white focus:outline-none appearance-none"
              >
                <option value="Plain Totes">Plain Totes</option>
                <option value="Black Edition">Black Edition</option>
                <option value="Premium Canvas">Premium Canvas</option>
                <option value="Custom Prints">Custom Prints</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Price (₹)</label>
              <input 
                type="number"
                value={formData.price}
                onChange={e => setFormData({...formData, price: parseInt(e.target.value)})}
                className="w-full px-5 py-3.5 rounded-xl bg-[var(--admin-light)]/50 border border-[var(--admin-border)] font-bold text-sm focus:bg-white focus:outline-none transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Stock Quantity</label>
              <input 
                type="number"
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
                className="w-full px-5 py-3.5 rounded-xl bg-[var(--admin-light)]/50 border border-[var(--admin-border)] font-bold text-sm focus:bg-white focus:outline-none transition-all" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Description</label>
            <textarea 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              rows={3}
              placeholder="Tell the story of this product..."
              className="w-full px-5 py-3.5 rounded-xl bg-[var(--admin-light)]/50 border border-[var(--admin-border)] font-medium text-sm focus:bg-white focus:outline-none transition-all resize-none" 
            />
          </div>

          {/* Toggle */}
          <div className="flex items-center justify-between p-5 bg-[var(--admin-primary)]/5 rounded-2xl border border-[var(--admin-primary)]/10">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[var(--admin-primary)] shadow-sm">
                  <Sparkles size={18} />
               </div>
               <div>
                  <p className="text-xs font-bold text-[var(--admin-text-primary)]">Customizable</p>
                  <p className="text-[10px] text-[var(--admin-text-muted)]">Allow customers to add custom text</p>
               </div>
            </div>
            <button 
              onClick={() => setFormData({...formData, isCustomizable: !formData.isCustomizable})}
              className={`w-12 h-6 rounded-full p-1 transition-all ${formData.isCustomizable ? 'bg-[var(--admin-primary)]' : 'bg-slate-200'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-all ${formData.isCustomizable ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Images */}
          <div className="space-y-4">
             <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Product Media</label>
             <div className="flex gap-3 mb-4">
                <input 
                  value={newImageUrl}
                  onChange={e => setNewImageUrl(e.target.value)}
                  placeholder="Paste Image URL"
                  className="flex-1 px-4 py-2 bg-[var(--admin-light)] border border-[var(--admin-border)] rounded-xl text-xs"
                />
                <button 
                  onClick={handleAddImage}
                  className="px-4 py-2 bg-[var(--admin-primary)] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest"
                >
                  Add
                </button>
             </div>
             <div className="grid grid-cols-4 gap-4">
                {formData.images.map((img, i) => (
                  <div key={i} className="aspect-square bg-[var(--admin-light)] rounded-xl border border-[var(--admin-border)] flex items-center justify-center relative group overflow-hidden">
                    <img src={img} className="w-full h-full object-cover" alt="Preview" />
                    <button 
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg z-10"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {formData.images.length === 0 && (
                  <div className="col-span-4 py-10 flex flex-col items-center justify-center border-2 border-dashed border-[var(--admin-border)] rounded-2xl text-[var(--admin-text-muted)]">
                    <ImageIcon size={32} className="mb-2 opacity-20" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">No Media Added</p>
                  </div>
                )}
             </div>
          </div>
        </div>

        <div className="p-8 bg-[var(--admin-light)]/30 border-t border-[var(--admin-border)] flex gap-4">
          <button onClick={onClose} disabled={saving} className="flex-1 py-4 border border-[var(--admin-border)] text-[var(--admin-text-muted)] rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50">
            Cancel
          </button>
          <button 
            onClick={handleLocalSave}
            disabled={saving}
            className="flex-1 py-4 bg-[var(--admin-primary)] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-[var(--admin-primary)]/20 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {saving ? <RefreshCcw size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? "Processing..." : product ? "Update Product" : "Launch Product"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
