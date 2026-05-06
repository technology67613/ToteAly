import React, { useState, useEffect } from 'react';
import { Save, ShieldCheck, Truck, Mail, Store, AlertTriangle, RefreshCcw, Power, Upload, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

interface AdminSettings {
  site_name: string;
  contact_email: string;
  gst_number: string;
  free_shipping_threshold: number;
  base_shipping_cost: number;
  announcement_bar: string;
  maintenance_mode: boolean;
  logo_url: string;
  [key: string]: any;
}

export const AdminSettingsTab = () => {
  const [settings, setSettings] = useState<AdminSettings>({
    site_name: "Tote-ally Iconic",
    contact_email: "support@totealy.com",
    gst_number: "",
    free_shipping_threshold: 999,
    base_shipping_cost: 50,
    announcement_bar: "Free Shipping on orders above ₹999!",
    maintenance_mode: false,
    logo_url: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (e) {
        console.error("Failed to load settings", e);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error("Failed to save");
    } catch (e) {
      console.error(e);
      alert("Failed to save settings to cloud.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const { url } = await res.json();
        setSettings({ ...settings, logo_url: url });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-[var(--admin-text-muted)] animate-pulse font-bold uppercase tracking-widest text-xs">Synchronizing with Cloud Config...</div>;

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

      {/* Control Center */}
      <div className="bg-amber-50 rounded-[24px] border border-amber-100 p-8 flex items-center justify-between shadow-sm">
         <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${settings.maintenance_mode ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-white text-amber-500'}`}>
               <Power size={24} />
            </div>
            <div>
               <p className="text-sm font-bold text-amber-900">Maintenance Mode</p>
               <p className="text-[10px] text-amber-700/60 font-bold uppercase tracking-widest">Toggle public storefront access</p>
            </div>
         </div>
         <button 
          onClick={() => setSettings({...settings, maintenance_mode: !settings.maintenance_mode})}
          className={`w-14 h-8 rounded-full p-1.5 transition-all ${settings.maintenance_mode ? 'bg-amber-500' : 'bg-slate-200'}`}
         >
            <div className={`w-5 h-5 bg-white rounded-full transition-all ${settings.maintenance_mode ? 'translate-x-6' : 'translate-x-0'}`} />
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Branding */}
        <motion.div 
          className="bg-white rounded-[24px] border border-[var(--admin-border)] p-8 flex flex-col gap-8 shadow-sm"
        >
          <div className="flex items-center gap-3 text-[var(--admin-primary)]">
            <div className="w-10 h-10 bg-[var(--admin-light)] rounded-xl flex items-center justify-center">
              <Store size={20} />
            </div>
            <h3 className="font-bold uppercase tracking-[0.2em] text-[10px] text-[var(--admin-text-primary)]">Store Branding</h3>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-6">
               <div className="w-20 h-20 bg-[var(--admin-light)] rounded-2xl border border-[var(--admin-border)] flex items-center justify-center overflow-hidden group relative">
                  {settings.logo_url ? <img src={settings.logo_url} className="w-full h-full object-contain" /> : <ImageIcon size={24} className="text-[var(--admin-text-muted)]" />}
                  {uploading && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><RefreshCcw className="animate-spin text-[var(--admin-primary)]" /></div>}
               </div>
               <div className="flex-1 space-y-2">
                  <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">Platform Logo</p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--admin-primary)]/10 text-[var(--admin-primary)] rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-[var(--admin-primary)] hover:text-white transition-all">
                     <Upload size={14} /> Upload New
                     <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
                  </label>
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Store Name</label>
              <input 
                value={settings.site_name}
                onChange={e => setSettings({...settings, site_name: e.target.value})}
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
                value={settings.contact_email || settings.support_email}
                onChange={e => setSettings({...settings, contact_email: e.target.value})}
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
