import React, { useCallback, useEffect, useState } from 'react';
import { Ticket, Plus, Trash2, Calendar, Percent, Banknote, X, Rocket, Activity, Zap, Download, Edit3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 10,
    min_order_value: 499,
    expiry_date: '',
    is_active: true
  });
  const [subscribers, setSubscribers] = useState<any[]>([]);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'coupon' | 'subscriber' | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/coupons');
      if (res.ok) setCoupons(await res.json());
    } catch (e) {
      console.error("Failed to fetch coupons", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSubscribers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/newsletter');
      if (res.ok) setSubscribers(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
    fetchSubscribers();
  }, [fetchCoupons, fetchSubscribers]);

  const handleEditClick = (coupon: Coupon) => {
    setNewCoupon({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_value: coupon.min_order_value,
      expiry_date: coupon.expiry_date ? new Date(coupon.expiry_date).toISOString().split('T')[0] : '',
      is_active: coupon.is_active
    });
    setEditingId(coupon.id);
    setShowAdd(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        code: newCoupon.code,
        discount_type: newCoupon.discount_type,
        discount_value: Number(newCoupon.discount_value) || 0,
        min_order_value: Number(newCoupon.min_order_value) || 0,
        expiry_date: newCoupon.expiry_date || null,
        is_active: newCoupon.is_active
      };
      
      if (editingId) payload.id = editingId;

      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/coupons', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setShowAdd(false);
        const wasEditing = !!editingId;
        setEditingId(null);
        setNewCoupon({ code: '', discount_type: 'percentage', discount_value: 10, min_order_value: 499, expiry_date: '', is_active: true });
        fetchCoupons();
        toast.success(wasEditing ? "Campaign updated" : "Campaign launched");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save campaign");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Network error. Please check your connection.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId || !deleteType) return;
    setIsDeleting(true);
    try {
      if (deleteType === 'coupon') {
        const res = await fetch(`/api/admin/coupons?id=${deleteId}`, { method: 'DELETE' });
        if (res.ok) {
          fetchCoupons();
          toast.success("Coupon purged successfully");
        }
      } else {
        const res = await fetch(`/api/admin/newsletter?id=${deleteId}`, { method: 'DELETE' });
        if (res.ok) {
          fetchSubscribers();
          toast.success("Subscriber removed successfully");
        }
      }
      setDeleteId(null);
      setDeleteType(null);
    } catch (e) {
      toast.error("Failed to complete request");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = async (id: string, type: 'coupon' | 'subscriber') => {
    if (type === 'coupon') {
      setDeleteId(id);
      setDeleteType(type);
    } else {
      // Immediate unsubscription as requested
      try {
        const res = await fetch(`/api/admin/newsletter?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchSubscribers();
          toast.success("Subscriber removed successfully");
        }
      } catch (e) {
        toast.error("Failed to remove subscriber");
      }
    }
  };

  const handleExport = () => {
    const filename = `ToteAly_Subscribers_List_${new Date().toISOString().split('T')[0]}.pdf`;
    window.open(`/api/admin/export/${filename}`, '_blank');
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
                    <button onClick={() => handleEditClick(coupon)} className="w-8 h-8 flex items-center justify-center rounded-lg text-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => handleDeleteClick(coupon.id, 'coupon')} className="w-8 h-8 flex items-center justify-center rounded-lg text-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-[0.2em]">Campaign Code</p>
                  <p className="font-mono text-3xl font-bold text-[var(--admin-primary)] tracking-tighter group-hover:tracking-normal transition-all duration-500">{coupon.code}</p>
                </div>
                <div className="grid grid-cols-3 gap-4 border-t border-[var(--admin-border)] pt-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest flex items-center gap-1"><Zap size={10} className="text-amber-500" /> Disc.</p>
                    <p className="font-serif text-base font-bold text-[var(--admin-text-primary)]">{coupon.discount_value}{coupon.discount_type === 'percentage' ? '%' : '₹'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest flex items-center gap-1"><Banknote size={10} className="text-[var(--admin-primary)]" /> Min.</p>
                    <p className="font-serif text-base font-bold text-[var(--admin-text-primary)]">₹{coupon.min_order_value || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest flex items-center gap-1"><Activity size={10} className="text-emerald-500" /> Used</p>
                    <p className="font-serif text-base font-bold text-[var(--admin-text-primary)]">{coupon.usage_count}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-[0.1em] bg-[var(--admin-light)]/50 px-3 py-2 rounded-lg">
                  <Calendar size={12} className="text-[var(--admin-primary)]" />
                  Until: {coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString('en-IN') : 'Always Iconic'}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="space-y-10">
        <div className="flex justify-between items-center bg-white p-8 rounded-[16px] border border-[var(--admin-border)] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div>
            <h2 className="text-2xl font-serif font-bold text-[var(--admin-text-primary)]">Newsletter Community</h2>
            <p className="text-[11px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mt-1">{subscribers.length} Iconic Subscribers</p>
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-3 px-6 py-3 border border-[var(--admin-border)] rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-[var(--admin-light)] transition-all"
          >
             <Download size={14} /> Download List
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
                       <td className="px-8 py-5"><span className="text-sm font-bold text-[var(--admin-text-primary)]">{sub.email}</span></td>
                       <td className="px-8 py-5"><span className="px-2 py-1 bg-[var(--admin-light)] rounded-lg text-[9px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">{sub.source || 'Footer'}</span></td>
                       <td className="px-8 py-5 text-sm text-[var(--admin-text-muted)]">{new Date(sub.subscribed_at).toLocaleDateString()}</td>
                       <td className="px-8 py-5 text-right">
                          <button onClick={() => handleDeleteClick(sub.id, 'subscriber')} className="text-[10px] font-bold text-rose-400 uppercase tracking-widest hover:text-rose-600 transition-colors">Unsubscribe</button>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
              onClick={() => setShowAdd(false)} 
            />
            <motion.form 
              initial={{ opacity: 0, scale: 0.98, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.98, y: 20 }} 
              onSubmit={handleAdd} 
              className="relative bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
                <div className="space-y-0.5">
                  <h2 className="text-xl font-serif font-bold text-slate-900">{editingId ? 'Refine Iconic Campaign' : 'New Iconic Campaign'}</h2>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{editingId ? 'Adjust promotional parameters' : 'Architect promotional surges'}</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => { 
                    setShowAdd(false); 
                    setEditingId(null); 
                    setNewCoupon({ code: '', discount_type: 'percentage', discount_value: 10, min_order_value: 499, expiry_date: '', is_active: true }); 
                  }} 
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                {/* Code Input */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Campaign Identifier</label>
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Verified Unique</span>
                  </div>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[var(--admin-primary)] transition-colors">
                      <Zap size={18} />
                    </div>
                    <input 
                      value={newCoupon.code} 
                      onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} 
                      placeholder="e.g. ICONIC20" 
                      className="w-full pl-14 pr-6 py-4 rounded-[16px] bg-slate-50 border-2 border-transparent focus:border-[var(--admin-primary)]/10 focus:bg-white focus:outline-none font-mono text-xl text-[var(--admin-primary)] transition-all" 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Value Type</label>
                    <div className="relative">
                      <Percent size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                      <select 
                        value={newCoupon.discount_type} 
                        onChange={e => setNewCoupon({...newCoupon, discount_type: e.target.value as any})} 
                        className="w-full pl-12 pr-4 py-4 rounded-[16px] bg-slate-50 border-2 border-transparent focus:border-slate-100 focus:bg-white focus:outline-none font-bold text-[13px] text-slate-900 transition-all appearance-none cursor-pointer"
                      >
                        <option value="percentage">Percentage Off</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Reward Value</label>
                    <div className="relative">
                      <Activity size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                      <input 
                        type="number" 
                        value={newCoupon.discount_value || ''} 
                        onChange={e => setNewCoupon({...newCoupon, discount_value: parseInt(e.target.value) || 0})} 
                        className="w-full pl-12 pr-4 py-4 rounded-[16px] bg-slate-50 border-2 border-transparent focus:border-slate-100 focus:bg-white focus:outline-none font-bold text-[13px] text-slate-900 transition-all" 
                        required 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Min. Spend (₹)</label>
                    <div className="relative">
                      <Banknote size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                      <input 
                        type="number" 
                        value={newCoupon.min_order_value || ''} 
                        onChange={e => setNewCoupon({...newCoupon, min_order_value: parseInt(e.target.value) || 0})} 
                        className="w-full pl-12 pr-4 py-4 rounded-[16px] bg-slate-50 border-2 border-transparent focus:border-slate-100 focus:bg-white focus:outline-none font-bold text-[13px] text-slate-900 transition-all" 
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Expiry</label>
                    <div className="relative">
                      <Calendar size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                      <input 
                        type="date" 
                        value={newCoupon.expiry_date} 
                        onChange={e => setNewCoupon({...newCoupon, expiry_date: e.target.value})} 
                        className="w-full pl-12 pr-4 py-4 rounded-[16px] bg-slate-50 border-2 border-transparent focus:border-slate-100 focus:bg-white focus:outline-none font-bold text-[13px] text-slate-900 transition-all" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100">
                <button 
                  type="submit" 
                  className="w-full py-5 bg-[var(--admin-primary)] text-white rounded-[20px] font-bold text-[11px] uppercase tracking-[0.25em] hover:shadow-xl hover:shadow-[var(--admin-primary)]/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  <Rocket size={16} /> {editingId ? 'Update Campaign' : 'Launch Campaign'}
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* Unified Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setDeleteId(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="p-10 text-center space-y-6">
                <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mx-auto shadow-sm">
                  <Trash2 size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-serif font-bold text-slate-900">
                    {deleteType === 'coupon' ? "Purge Campaign?" : "Remove Subscriber?"}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed px-4">
                    {deleteType === 'coupon' 
                      ? "This will permanently deactivate this promotional code. Existing orders using this code will not be affected."
                      : "This will remove the user from your marketing community. They will no longer receive iconic updates."}
                  </p>
                </div>
                <div className="flex flex-col gap-3 pt-4">
                  <button 
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="w-full py-4 bg-rose-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20 disabled:opacity-50"
                  >
                    {isDeleting ? "Processing..." : "Confirm Removal"}
                  </button>
                  <button 
                    onClick={() => setDeleteId(null)}
                    disabled={isDeleting}
                    className="w-full py-4 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
                  >
                    Cancel Action
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
