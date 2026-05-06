import React, { useState } from 'react';
import { Save, ShieldCheck, Truck, Mail, Store, AlertTriangle, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";

export const AdminSettingsTab = () => {
  const [settings, setSettings] = useState<any>({
    store_name: "Tote-ally Iconic",
    support_email: "support@totealy.com",
    gst_number: "",
    free_shipping_threshold: 999,
    base_shipping_cost: 50,
    announcement_bar: "Free Shipping on orders above ₹999!"
  });
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      // In a real app, toast notification would be triggered here
    }, 1000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-20"
    >
      <div className="flex justify-between items-center bg-white p-8 rounded-[16px] border border-[var(--admin-border)] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[var(--admin-text-primary)]">Global Configuration</h2>
          <p className="text-[11px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mt-1">Configure your store's business logic and branding</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-3 px-8 py-3 bg-[var(--admin-primary)] text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[var(--admin-primary)]/20 disabled:opacity-50"
        >
          {saving ? <RefreshCcw size={16} className="animate-spin" /> : <Save size={18} />}
          {saving ? "Updating..." : "Update Config"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Branding */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white rounded-[24px] border border-[var(--admin-border)] p-8 flex flex-col gap-8 shadow-sm transition-all"
        >
          <div className="flex items-center gap-3 text-[var(--admin-primary)]">
            <div className="w-10 h-10 bg-[var(--admin-light)] rounded-xl flex items-center justify-center">
              <Store size={20} />
            </div>
            <h3 className="font-bold uppercase tracking-[0.2em] text-[10px] text-[var(--admin-text-primary)]">Store Branding</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Store Name</label>
              <input 
                value={settings.store_name}
                onChange={e => setSettings({...settings, store_name: e.target.value})}
                className="w-full px-5 py-3.5 rounded-xl bg-[var(--admin-light)]/30 border border-[var(--admin-border)] font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[var(--admin-primary)]/10 focus:outline-none transition-all" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Announcement Bar</label>
              <input 
                value={settings.announcement_bar}
                onChange={e => setSettings({...settings, announcement_bar: e.target.value})}
                className="w-full px-5 py-3.5 rounded-xl bg-[var(--admin-light)]/30 border border-[var(--admin-border)] font-medium text-sm focus:bg-white focus:ring-2 focus:ring-[var(--admin-primary)]/10 focus:outline-none transition-all" 
              />
            </div>
          </div>
        </motion.div>

        {/* Shipping */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white rounded-[24px] border border-[var(--admin-border)] p-8 flex flex-col gap-8 shadow-sm transition-all"
        >
          <div className="flex items-center gap-3 text-[var(--admin-primary)]">
            <div className="w-10 h-10 bg-[var(--admin-light)] rounded-xl flex items-center justify-center">
              <Truck size={20} />
            </div>
            <h3 className="font-bold uppercase tracking-[0.2em] text-[10px] text-[var(--admin-text-primary)]">Shipping Logic</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Free Shipping Threshold (₹)</label>
              <input 
                type="number"
                value={settings.free_shipping_threshold}
                onChange={e => setSettings({...settings, free_shipping_threshold: parseInt(e.target.value)})}
                className="w-full px-5 py-3.5 rounded-xl bg-[var(--admin-light)]/30 border border-[var(--admin-border)] font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[var(--admin-primary)]/10 focus:outline-none transition-all" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Flat Shipping Fee (₹)</label>
              <input 
                type="number"
                value={settings.base_shipping_cost}
                onChange={e => setSettings({...settings, base_shipping_cost: parseInt(e.target.value)})}
                className="w-full px-5 py-3.5 rounded-xl bg-[var(--admin-light)]/30 border border-[var(--admin-border)] font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[var(--admin-primary)]/10 focus:outline-none transition-all" 
              />
            </div>
          </div>
        </motion.div>

        {/* Business Info */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white rounded-[24px] border border-[var(--admin-border)] p-8 flex flex-col gap-8 shadow-sm transition-all"
        >
          <div className="flex items-center gap-3 text-[var(--admin-primary)]">
            <div className="w-10 h-10 bg-[var(--admin-light)] rounded-xl flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold uppercase tracking-[0.2em] text-[10px] text-[var(--admin-text-primary)]">Compliance & Tax</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">GST Registration Number</label>
              <input 
                value={settings.gst_number}
                onChange={e => setSettings({...settings, gst_number: e.target.value})}
                placeholder="Enter GSTIN"
                className="w-full px-5 py-3.5 rounded-xl bg-[var(--admin-light)]/30 border border-[var(--admin-border)] font-mono text-sm focus:bg-white focus:ring-2 focus:ring-[var(--admin-primary)]/10 focus:outline-none transition-all" 
              />
            </div>
          </div>
        </motion.div>

        {/* Communication */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white rounded-[24px] border border-[var(--admin-border)] p-8 flex flex-col gap-8 shadow-sm transition-all"
        >
          <div className="flex items-center gap-3 text-[var(--admin-primary)]">
            <div className="w-10 h-10 bg-[var(--admin-light)] rounded-xl flex items-center justify-center">
              <Mail size={20} />
            </div>
            <h3 className="font-bold uppercase tracking-[0.2em] text-[10px] text-[var(--admin-text-primary)]">Communications</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Support Email</label>
              <input 
                value={settings.support_email}
                onChange={e => setSettings({...settings, support_email: e.target.value})}
                className="w-full px-5 py-3.5 rounded-xl bg-[var(--admin-light)]/30 border border-[var(--admin-border)] font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[var(--admin-primary)]/10 focus:outline-none transition-all" 
              />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-rose-50 rounded-[24px] border border-rose-100 p-8 flex flex-col gap-6">
        <div className="flex items-center gap-3 text-rose-600">
          <AlertTriangle size={20} />
          <h3 className="font-bold uppercase tracking-widest text-xs">Danger Zone</h3>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-bold text-rose-900">Reset Store Data</p>
            <p className="text-xs text-rose-600/60 font-medium">This will clear all demo content and reset the store to its initial state.</p>
          </div>
          <button className="px-6 py-2.5 bg-rose-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-700 transition-all">
            Reset Now
          </button>
        </div>
      </div>
    </motion.div>
  );
};
