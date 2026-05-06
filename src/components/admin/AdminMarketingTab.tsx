import React, { useState, useEffect } from 'react';
import { Ticket, Plus, Trash2, Calendar, Percent, Banknote, X, Rocket, Activity, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 10,
    min_order_value: 499,
    expiry_date: '',
    is_active: true
  });
  const [subscribers, setSubscribers] = useState<any[]>([]);

  useEffect(() => {
    fetchCoupons();
    fetchSubscribers();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/admin/coupons');
      if (res.ok) setCoupons(await res.json());
    } catch (e) {
      console.error("Failed to fetch coupons", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const res = await fetch('/api/admin/newsletter');
      if (res.ok) setSubscribers(await res.json());
    } catch (e) {
      console.error(e);
    }
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

  const deleteSubscriber = async (id: string) => {
    if (!confirm('Unsubscribe this user?')) return;
    const res = await fetch(`/api/admin/newsletter?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchSubscribers();
  };

  return (
    <div className="space-y-16">
      <div className="space-y-10">
        <div className="flex justify-between items-center bg-white p-8 rounded-[16px] border border-[var(--admin-border)] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div>
            <h2 className="text-2xl font-serif font-bold text-[var(--admin-text-primary)]">Campaigns & Coupons</h2>
            <p className="text-[11px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mt-1">Boost sales with promotional offers</p>
          </div>
          <button 
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-3 px-6 py-3 bg-[var(--admin-primary)] text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[var(--admin-primary)]/20"
          >
            <Plus size={18} /> New Coupon
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {coupons.map((coupon, idx) => (
              <motion.div 
                key={coupon.id} 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[24px] border border-[var(--admin-border)] p-8 flex flex-col gap-8 relative overflow-hidden group hover:shadow-xl transition-all duration-500"
              >
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 bg-[var(--admin-light)] rounded-2xl flex items-center justify-center text-[var(--admin-primary)]">
                    <Ticket size={28} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest ${coupon.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500"}`}>
                      {coupon.is_active ? "Active" : "Draft"}
                    </span>
                    <button 
                      onClick={() => handleDelete(coupon.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-[0.2em]">Campaign Code</p>
                  <p className="font-mono text-3xl font-bold text-[var(--admin-primary)] tracking-tighter group-hover:tracking-normal transition-all duration-500">{coupon.code}</p>
                </div>

                <div className="grid grid-cols-2 gap-6 border-t border-[var(--admin-border)] pt-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest flex items-center gap-1">
                      <Zap size={10} className="text-amber-500" /> Discount
                    </p>
                    <p className="font-serif text-lg font-bold text-[var(--admin-text-primary)]">
                      {coupon.discount_value}{coupon.discount_type === 'percentage' ? '%' : ' FIXED'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest flex items-center gap-1">
                      <Activity size={10} className="text-[var(--admin-primary)]" /> Usage
                    </p>
                    <p className="font-serif text-lg font-bold text-[var(--admin-text-primary)]">{coupon.usage_count} / ∞</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-[0.1em] bg-[var(--admin-light)]/50 px-3 py-2 rounded-lg">
                  <Calendar size={12} className="text-[var(--admin-primary)]" />
                  Valid Until: {coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Always Iconic'}
                </div>
                
                {/* Background accent */}
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-[var(--admin-primary)]/5 rounded-full blur-2xl group-hover:bg-[var(--admin-primary)]/10 transition-all" />
              </motion.div>
            ))}
          </AnimatePresence>

          {coupons.length === 0 && !loading && (
            <div className="col-span-full py-20 flex flex-col items-center gap-6 bg-white rounded-[24px] border border-[var(--admin-border)]">
               <div className="w-20 h-20 bg-[var(--admin-light)] rounded-full flex items-center justify-center text-[var(--admin-primary)]/20">
                 <Ticket size={40} />
               </div>
               <div className="text-center space-y-2">
                 <p className="text-xl font-serif font-bold text-[var(--admin-text-primary)]">No Active Campaigns</p>
                 <p className="text-sm text-[var(--admin-text-muted)] max-w-xs mx-auto">Create your first discount coupon to start driving more sales.</p>
               </div>
               <button 
                onClick={() => setShowAdd(true)}
                className="px-6 py-3 border border-[var(--admin-primary)] text-[var(--admin-primary)] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[var(--admin-primary)] hover:text-white transition-all"
               >
                Create First Coupon
               </button>
            </div>
          )}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="space-y-10">
        <div className="flex justify-between items-center bg-white p-8 rounded-[16px] border border-[var(--admin-border)] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div>
            <h2 className="text-2xl font-serif font-bold text-[var(--admin-text-primary)]">Newsletter Community</h2>
            <p className="text-[11px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mt-1">{subscribers.length} Iconic Subscribers</p>
          </div>
          <button className="flex items-center gap-3 px-6 py-3 border border-[var(--admin-border)] rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-[var(--admin-light)] transition-all">
             Download List
          </button>
        </div>

        <div className="bg-white rounded-[24px] border border-[var(--admin-border)] overflow-hidden">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-[var(--admin-light)]/30 border-b border-[var(--admin-border)]">
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Subscriber Email</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Source</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Joined Date</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] text-right">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-[var(--admin-border)]">
                 {subscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-[var(--admin-light)]/20 transition-colors">
                       <td className="px-8 py-5">
                          <span className="text-sm font-bold text-[var(--admin-text-primary)]">{sub.email}</span>
                       </td>
                       <td className="px-8 py-5">
                          <span className="px-2 py-1 bg-[var(--admin-light)] rounded-lg text-[9px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">{sub.source || 'Footer'}</span>
                       </td>
                       <td className="px-8 py-5 text-sm text-[var(--admin-text-muted)]">
                          {new Date(sub.subscribed_at).toLocaleDateString()}
                       </td>
                       <td className="px-8 py-5 text-right">
                          <button 
                            onClick={() => deleteSubscriber(sub.id)}
                            className="text-[10px] font-bold text-rose-400 uppercase tracking-widest hover:text-rose-600 transition-colors"
                          >
                             Unsubscribe
                          </button>
                       </td>
                    </tr>
                 ))}
                 {subscribers.length === 0 && (
                   <tr>
                      <td colSpan={4} className="p-20 text-center text-[var(--admin-text-muted)] italic text-sm">
                         No subscribers joined the iconic community yet.
                      </td>
                   </tr>
                 )}
              </tbody>
           </table>
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
              onClick={() => setShowAdd(false)} 
            />
            <motion.form 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onSubmit={handleAdd} 
              className="relative bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-[var(--admin-border)] flex justify-between items-center bg-[var(--admin-light)]/30">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-[var(--admin-text-primary)]">Create Iconic Coupon</h2>
                  <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mt-1">Configure your campaign logic</p>
                </div>
                <button type="button" onClick={() => setShowAdd(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white transition-all">
                  <X size={20} className="text-[var(--admin-text-muted)]" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Unique Code</label>
                  <input 
                    value={newCoupon.code}
                    onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                    placeholder="e.g. ICONIC20" 
                    className="w-full px-6 py-4 rounded-xl bg-[var(--admin-light)]/50 border border-[var(--admin-border)] font-mono text-xl text-[var(--admin-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--admin-primary)]/10 focus:outline-none transition-all" 
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Type</label>
                    <select 
                      value={newCoupon.discount_type}
                      onChange={e => setNewCoupon({...newCoupon, discount_type: e.target.value as any})}
                      className="w-full px-5 py-4 rounded-xl bg-[var(--admin-light)]/50 border border-[var(--admin-border)] font-bold text-sm focus:bg-white focus:outline-none transition-all appearance-none"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Value</label>
                    <input 
                      type="number"
                      value={newCoupon.discount_value}
                      onChange={e => setNewCoupon({...newCoupon, discount_value: parseInt(e.target.value)})}
                      className="w-full px-5 py-4 rounded-xl bg-[var(--admin-light)]/50 border border-[var(--admin-border)] font-bold text-sm focus:bg-white focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                
                <div className="p-4 bg-[var(--admin-primary)]/5 rounded-2xl border border-[var(--admin-primary)]/10">
                  <p className="text-[10px] font-bold text-[var(--admin-primary)] uppercase tracking-widest mb-1">Live Preview</p>
                  <p className="text-sm font-medium text-[var(--admin-text-primary)]">
                    Customers will save <span className="font-bold">{newCoupon.discount_value}{newCoupon.discount_type === 'percentage' ? '%' : '₹'}</span> on their iconic order.
                  </p>
                </div>
              </div>

              <div className="p-8 bg-[var(--admin-light)]/30 border-t border-[var(--admin-border)]">
                <button type="submit" className="w-full py-5 bg-[var(--admin-primary)] text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-[var(--admin-primary)]/20 flex items-center justify-center gap-3">
                  <Rocket size={18} /> Launch Campaign
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
