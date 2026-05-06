import React, { useState, useEffect } from 'react';
import { Save, ShieldCheck, Truck, Mail, Store } from "lucide-react";

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

  // In a real app, you'd fetch from /api/admin/settings
  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("Settings saved to Cloud!");
    }, 1000);
  };

  return (
    <div className="max-w-4xl flex flex-col gap-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif font-bold">Global Configuration</h2>
          <p className="text-sm text-[#900C3F]/40 font-medium">Configure your store's business logic and branding.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-[#900C3F] text-white rounded-xl font-bold text-sm hover:bg-[#FF69B4] transition-all disabled:opacity-50"
        >
          {saving ? "Saving..." : <><Save size={18} /> Update Config</>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Branding */}
        <div className="bg-white rounded-[32px] border border-[#F5ECD7] p-8 flex flex-col gap-6">
          <div className="flex items-center gap-3 text-[#900C3F] mb-2">
            <Store size={20} />
            <h3 className="font-bold uppercase tracking-widest text-xs">Store Branding</h3>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Store Name</label>
            <input 
              value={settings.store_name}
              onChange={e => setSettings({...settings, store_name: e.target.value})}
              className="px-6 py-4 rounded-2xl bg-[#F8F9FA] border border-[#F5ECD7] font-bold" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Announcement Bar</label>
            <input 
              value={settings.announcement_bar}
              onChange={e => setSettings({...settings, announcement_bar: e.target.value})}
              className="px-6 py-4 rounded-2xl bg-[#F8F9FA] border border-[#F5ECD7] font-medium text-sm" 
            />
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-white rounded-[32px] border border-[#F5ECD7] p-8 flex flex-col gap-6">
          <div className="flex items-center gap-3 text-[#900C3F] mb-2">
            <Truck size={20} />
            <h3 className="font-bold uppercase tracking-widest text-xs">Shipping Logic</h3>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Free Shipping Threshold (₹)</label>
            <input 
              type="number"
              value={settings.free_shipping_threshold}
              onChange={e => setSettings({...settings, free_shipping_threshold: parseInt(e.target.value)})}
              className="px-6 py-4 rounded-2xl bg-[#F8F9FA] border border-[#F5ECD7] font-bold" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Flat Shipping Fee (₹)</label>
            <input 
              type="number"
              value={settings.base_shipping_cost}
              onChange={e => setSettings({...settings, base_shipping_cost: parseInt(e.target.value)})}
              className="px-6 py-4 rounded-2xl bg-[#F8F9FA] border border-[#F5ECD7] font-bold" 
            />
          </div>
        </div>

        {/* Business Info */}
        <div className="bg-white rounded-[32px] border border-[#F5ECD7] p-8 flex flex-col gap-6">
          <div className="flex items-center gap-3 text-[#900C3F] mb-2">
            <ShieldCheck size={20} />
            <h3 className="font-bold uppercase tracking-widest text-xs">Compliance & Tax</h3>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">GST Registration Number</label>
            <input 
              value={settings.gst_number}
              onChange={e => setSettings({...settings, gst_number: e.target.value})}
              placeholder="Enter GSTIN"
              className="px-6 py-4 rounded-2xl bg-[#F8F9FA] border border-[#F5ECD7] font-mono" 
            />
          </div>
        </div>

        {/* Communication */}
        <div className="bg-white rounded-[32px] border border-[#F5ECD7] p-8 flex flex-col gap-6">
          <div className="flex items-center gap-3 text-[#900C3F] mb-2">
            <Mail size={20} />
            <h3 className="font-bold uppercase tracking-widest text-xs">Communications</h3>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Support Email</label>
            <input 
              value={settings.support_email}
              onChange={e => setSettings({...settings, support_email: e.target.value})}
              className="px-6 py-4 rounded-2xl bg-[#F8F9FA] border border-[#F5ECD7] font-bold" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};
