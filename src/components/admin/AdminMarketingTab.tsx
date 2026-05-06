import React, { useState, useEffect } from 'react';
import { Ticket, Plus, Trash2, Calendar, Percent, Banknote } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  expiry_date: string;
  is_active: boolean;
  usage_count: number;
}

export const AdminMarketingTab = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_value: 499,
    expiry_date: '',
    is_active: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const res = await fetch('/api/admin/coupons');
    if (res.ok) setCoupons(await res.json());
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCoupon)
    });
    if (res.ok) {
      setShowAdd(false);
      fetchCoupons();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    const res = await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchCoupons();
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif font-bold">Campaigns & Coupons</h2>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#900C3F] text-white rounded-xl font-bold text-sm hover:bg-[#FF69B4] transition-all"
        >
          <Plus size={18} /> New Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="bg-white rounded-3xl border border-[#F5ECD7] p-8 flex flex-col gap-6 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-[#900C3F]/5 rounded-2xl flex items-center justify-center text-[#900C3F]">
                <Ticket size={24} />
              </div>
              <button 
                onClick={() => handleDelete(coupon.id)}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <div>
              <p className="text-[10px] font-bold text-[#900C3F]/40 uppercase tracking-widest mb-1">Coupon Code</p>
              <p className="font-mono text-2xl font-bold text-[#900C3F] tracking-tighter">{coupon.code}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-[#F5ECD7] pt-6">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Discount</p>
                <p className="font-bold flex items-center gap-1">
                  {coupon.discount_type === 'percentage' ? <Percent size={14} /> : <Banknote size={14} />}
                  {coupon.discount_value}{coupon.discount_type === 'percentage' ? '%' : ' OFF'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Used</p>
                <p className="font-bold">{coupon.usage_count} times</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <Calendar size={12} />
              Expires: {coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString() : 'Never'}
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowAdd(false)} />
          <form onSubmit={handleAdd} className="relative bg-white w-full max-w-lg rounded-[40px] p-10 flex flex-col gap-6">
            <h2 className="text-3xl font-serif font-bold mb-4">Create Iconic Coupon</h2>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Unique Code</label>
              <input 
                value={newCoupon.code}
                onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                placeholder="e.g. ICONIC20" 
                className="px-6 py-4 rounded-2xl bg-[#F8F9FA] border border-[#F5ECD7] font-mono text-lg" 
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Type</label>
                <select 
                  value={newCoupon.discount_type}
                  onChange={e => setNewCoupon({...newCoupon, discount_type: e.target.value as any})}
                  className="px-6 py-4 rounded-2xl bg-[#F8F9FA] border border-[#F5ECD7] font-bold"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Value</label>
                <input 
                  type="number"
                  value={newCoupon.discount_value}
                  onChange={e => setNewCoupon({...newCoupon, discount_value: parseInt(e.target.value)})}
                  className="px-6 py-4 rounded-2xl bg-[#F8F9FA] border border-[#F5ECD7] font-bold"
                  required
                />
              </div>
            </div>

            <button type="submit" className="mt-4 py-5 bg-[#900C3F] text-white rounded-[32px] font-bold text-lg hover:bg-[#FF69B4] shadow-xl">
              Launch Campaign
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
