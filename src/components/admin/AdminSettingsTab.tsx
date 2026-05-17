import React, { useState, useEffect } from 'react';
import { Save, ShieldCheck, Truck, Mail, Store, AlertTriangle, RefreshCcw, Power, Upload, ImageIcon, MessageCircle, MapPin, AtSign, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'sonner';

interface AdminSettings {
  site_name: string;
  contact_email: string;
  whatsapp_number: string;
  shop_address: string;
  instagram_handle: string;
  currency_symbol: string;
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
    whatsapp_number: "",
    shop_address: "",
    instagram_handle: "",
    currency_symbol: "₹",
    free_shipping_threshold: 999,
    base_shipping_cost: 50,
    announcement_bar: "Free Shipping on orders above ₹999!",
    maintenance_mode: false,
    logo_url: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Factory Reset states
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [phraseConfirm, setPhraseConfirm] = useState("");
  const [usidConfirm, setUsidConfirm] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [resetting, setResetting] = useState(false);

  const handleFactoryReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phraseConfirm !== "I want to delete my database") {
      toast.error("Confirmation phrase does not match.");
      return;
    }
    if (!usidConfirm || !passwordConfirm) {
      toast.error("Please enter admin credentials.");
      return;
    }
    
    setResetting(true);
    const toastId = toast.loading("Wiping database and resetting to fresh state...");
    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phrase: phraseConfirm,
          usid: usidConfirm,
          password: passwordConfirm
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Factory Reset complete! Website is completely fresh.", { id: toastId });
        setIsResetModalOpen(false);
        setPhraseConfirm("");
        setUsidConfirm("");
        setPasswordConfirm("");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error(data.error || "Reset failed.", { id: toastId });
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Reset failed due to a server error.", { id: toastId });
    } finally {
      setResetting(false);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          // Ensure booleans and numbers are correctly typed if they come as strings
          if (typeof data.maintenance_mode === 'string') data.maintenance_mode = data.maintenance_mode === 'true';
          if (typeof data.free_shipping_threshold === 'string') data.free_shipping_threshold = parseInt(data.free_shipping_threshold);
          if (typeof data.base_shipping_cost === 'string') data.base_shipping_cost = parseInt(data.base_shipping_cost);
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
      toast.success("Platform Configuration Updated");
    } catch (e) {
      console.error(e);
      toast.error("Failed to sync settings to cloud.");
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
        toast.success("Logo uploaded successfully");
      } else {
        toast.error("Failed to upload logo");
      }
    } catch (err) {
      console.error(err);
      toast.error("Upload error");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-[var(--admin-text-muted)] animate-pulse font-bold uppercase tracking-widest text-xs">Synchronizing with Cloud Config...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12 max-w-4xl mx-auto"
    >
      {/* Master Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-3xl border border-[var(--admin-border)] shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--admin-primary)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10">
          <h2 className="text-2xl font-serif font-bold text-[var(--admin-text-primary)]">Platform Core</h2>
          <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Cloud Configuration
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="relative z-10 flex items-center justify-center gap-2.5 px-6 py-3 bg-[var(--admin-primary)] text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[var(--admin-primary)]/20 disabled:opacity-50 disabled:hover:scale-100"
        >
          {saving ? <RefreshCcw size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Deploying..." : "Deploy Configuration"}
        </button>
      </div>

      {/* Control Center */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        className={`rounded-3xl border p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm transition-all duration-500 ${settings.maintenance_mode ? 'bg-amber-50 border-amber-200' : 'bg-white border-[var(--admin-border)]'}`}
      >
         <div className="flex items-start md:items-center gap-5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${settings.maintenance_mode ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-slate-100 text-slate-400'}`}>
               <Power size={24} />
            </div>
            <div>
               <p className={`text-lg font-serif font-bold ${settings.maintenance_mode ? 'text-amber-900' : 'text-[var(--admin-text-primary)]'}`}>Maintenance Mode</p>
               <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${settings.maintenance_mode ? 'text-amber-700/80' : 'text-[var(--admin-text-muted)]'}`}>
                 {settings.maintenance_mode ? 'Storefront is currently offline. Only admins can access.' : 'Public storefront is live and accepting orders.'}
               </p>
            </div>
         </div>
         <button 
          onClick={() => setSettings({...settings, maintenance_mode: !settings.maintenance_mode})}
          className={`relative w-14 h-8 rounded-full p-1 transition-all duration-500 shrink-0 ${settings.maintenance_mode ? 'bg-amber-500 shadow-inner' : 'bg-slate-200'}`}
         >
            <div className={`w-6 h-6 bg-white rounded-full transition-all duration-500 shadow-sm ${settings.maintenance_mode ? 'translate-x-6' : 'translate-x-0'}`} />
         </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Brand Identity */}
        <motion.div 
          className="bg-white rounded-3xl border border-[var(--admin-border)] p-6 md:p-8 flex flex-col gap-8 shadow-sm"
        >
          <div className="flex items-center gap-4 text-[var(--admin-primary)] border-b border-slate-100 pb-4">
            <div className="w-10 h-10 bg-[var(--admin-light)] rounded-xl flex items-center justify-center">
              <Store size={20} />
            </div>
            <h3 className="font-serif text-xl font-bold text-[var(--admin-text-primary)]">Brand Identity</h3>
          </div>
          
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
               <div className="w-20 h-20 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden group relative shrink-0">
                  {settings.logo_url ? <img src={settings.logo_url} className="w-full h-full object-contain p-2" /> : <ImageIcon size={24} className="text-slate-300" />}
                  {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm"><RefreshCcw className="animate-spin text-[var(--admin-primary)]" /></div>}
               </div>
               <div className="flex-1 text-center sm:text-left space-y-2.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Platform Logo</p>
                  <label className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--admin-primary)]/5 text-[var(--admin-primary)] rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-[var(--admin-primary)] hover:text-white transition-all w-full sm:w-auto">
                     <Upload size={14} /> Upload Master File
                     <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
                  </label>
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--admin-text-muted)] flex items-center gap-2">
                Store Name
              </label>
              <input 
                value={settings.site_name || ''}
                onChange={e => setSettings({...settings, site_name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[var(--admin-primary)]/20 focus:border-[var(--admin-primary)]/30 focus:outline-none transition-all placeholder:text-slate-300" 
                placeholder="ToteAly Iconic"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--admin-text-muted)]">Announcement Bar</label>
                <input 
                  value={settings.announcement_bar || ''}
                  onChange={e => setSettings({...settings, announcement_bar: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-[var(--admin-primary)]/20 focus:border-[var(--admin-primary)]/30 focus:outline-none transition-all" 
                  placeholder="Free Shipping on orders above ₹999!"
                />
              </div>
              <div className="col-span-1 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--admin-text-muted)]">Currency</label>
                <input 
                  value={settings.currency_symbol || ''}
                  onChange={e => setSettings({...settings, currency_symbol: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-center text-sm focus:bg-white focus:ring-2 focus:ring-[var(--admin-primary)]/20 focus:border-[var(--admin-primary)]/30 focus:outline-none transition-all" 
                  placeholder="₹"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Communications & Social */}
        <motion.div 
          className="bg-white rounded-3xl border border-[var(--admin-border)] p-6 md:p-8 flex flex-col gap-8 shadow-sm"
        >
          <div className="flex items-center gap-4 text-[var(--admin-primary)] border-b border-slate-100 pb-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <MessageCircle size={20} />
            </div>
            <h3 className="font-serif text-xl font-bold text-[var(--admin-text-primary)]">Communications & Social</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--admin-text-muted)] flex items-center gap-2">
                <Mail size={12} /> Support Email
              </label>
              <input 
                type="email"
                value={settings.contact_email || ''}
                onChange={e => setSettings({...settings, contact_email: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 focus:outline-none transition-all" 
                placeholder="support@totealy.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--admin-text-muted)] flex items-center gap-2">
                <MessageCircle size={12} /> WhatsApp Number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">+91</span>
                <input 
                  type="tel"
                  value={settings.whatsapp_number || ''}
                  onChange={e => setSettings({...settings, whatsapp_number: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 focus:outline-none transition-all" 
                  placeholder="98765 43210"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--admin-text-muted)] flex items-center gap-2">
                <AtSign size={12} /> Instagram Handle
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">@</span>
                <input 
                  value={settings.instagram_handle || ''}
                  onChange={e => setSettings({...settings, instagram_handle: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm focus:bg-white focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500/30 focus:outline-none transition-all" 
                  placeholder="totealy.iconic"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Operations & Logistics */}
        <motion.div 
          className="bg-white rounded-3xl border border-[var(--admin-border)] p-6 md:p-8 flex flex-col gap-8 shadow-sm lg:col-span-2"
        >
          <div className="flex items-center gap-4 text-emerald-600 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Truck size={20} />
            </div>
            <h3 className="font-serif text-xl font-bold text-[var(--admin-text-primary)]">Operations & Logistics</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--admin-text-muted)] flex items-center gap-2">
                <MapPin size={12} /> Headquarters / Shop Address
              </label>
              <textarea 
                value={settings.shop_address || ''}
                onChange={e => setSettings({...settings, shop_address: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 focus:outline-none transition-all resize-none" 
                placeholder="123 Iconic Lane, Style District&#10;Mumbai, Maharashtra 400001&#10;India"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--admin-text-muted)] flex items-center gap-2">
                 Free Shipping Threshold
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">{settings.currency_symbol || '₹'}</span>
                <input 
                  type="number"
                  value={settings.free_shipping_threshold ?? ''}
                  onChange={e => setSettings({...settings, free_shipping_threshold: parseInt(e.target.value) || 0})}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 focus:outline-none transition-all" 
                />
              </div>
              <p className="text-[9px] text-slate-400 font-medium mt-1">Orders above this amount will not be charged shipping.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--admin-text-muted)] flex items-center gap-2">
                 Flat Shipping Fee
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">{settings.currency_symbol || '₹'}</span>
                <input 
                  type="number"
                  value={settings.base_shipping_cost ?? ''}
                  onChange={e => setSettings({...settings, base_shipping_cost: parseInt(e.target.value) || 0})}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 focus:outline-none transition-all" 
                />
              </div>
              <p className="text-[9px] text-slate-400 font-medium mt-1">Base fee applied to orders below the free threshold.</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-rose-50 rounded-3xl border border-rose-100 p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between mt-8">
        <div className="flex items-start md:items-center gap-5">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-rose-900 mb-1">Danger Zone</h3>
            <p className="text-[10px] font-bold text-rose-600/80 uppercase tracking-widest">
              Resetting store data will permanently purge all dynamic content and revert to factory settings.
            </p>
          </div>
        </div>
        <button 
          type="button"
          onClick={() => setIsResetModalOpen(true)}
          className="shrink-0 px-6 py-3 bg-[#E60042] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#F21A58] transition-all shadow-lg shadow-rose-600/20 active:scale-95"
        >
          Factory Reset
        </button>
      </div>

      {/* FACTORY RESET CONFIRMATION MODAL */}
      <AnimatePresence>
        {isResetModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] border border-rose-100 max-w-lg w-full overflow-hidden shadow-[0_20px_50px_rgba(230,0,66,0.15)] p-8 text-left"
            >
              <div className="flex items-center gap-4 text-[#E60042] mb-6">
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-rose-950">Confirm Database Purge</h3>
                  <p className="text-[8px] font-bold text-rose-500 uppercase tracking-widest mt-1">This action is permanent and irreversible.</p>
                </div>
              </div>

              <p className="text-xs text-slate-500 font-medium mb-6 leading-relaxed">
                This factory reset will wipe all custom designs, products, orders, customers, reviews, and transaction records. A fresh copy of the configuration settings will be restored.
              </p>

              <form onSubmit={handleFactoryReset} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">
                    Confirm Phrase
                  </label>
                  <input
                    type="text"
                    required
                    placeholder='Type "I want to delete my database"'
                    value={phraseConfirm}
                    onChange={e => setPhraseConfirm(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/30 focus:outline-none transition-all placeholder-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">
                      Admin USID
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Admin username"
                      value={usidConfirm}
                      onChange={e => setUsidConfirm(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/30 focus:outline-none transition-all placeholder-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">
                      Admin Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Admin password"
                      value={passwordConfirm}
                      onChange={e => setPasswordConfirm(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/30 focus:outline-none transition-all placeholder-slate-400"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetModalOpen(false);
                      setPhraseConfirm("");
                      setUsidConfirm("");
                      setPasswordConfirm("");
                    }}
                    className="flex-1 py-3 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={phraseConfirm !== "I want to delete my database" || resetting}
                    className="flex-1 py-3 bg-[#E60042] text-white rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-[#F21A58] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2"
                  >
                    {resetting ? <Loader2 className="animate-spin" size={12} /> : null}
                    Purge All Data
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
