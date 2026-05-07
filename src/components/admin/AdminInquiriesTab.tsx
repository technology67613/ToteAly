import React, { useCallback, useEffect, useState } from 'react';
import { Mail, MessageSquare, Trash2, CheckCircle, Clock, Archive, ExternalLink, User, Tag, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  quantity?: number;
  bag_type?: string;
  logo_url?: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  created_at: string;
}

export const AdminInquiriesTab = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const fetchInquiries = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/inquiries');
      if (res.ok) setInquiries(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInquiries();
  }, [fetchInquiries]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: status as any } : inq));
        if (selectedInquiry?.id === id) setSelectedInquiry(prev => prev ? { ...prev, status: status as any } : null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this iconic inquiry?")) return;
    try {
      const res = await fetch(`/api/admin/inquiries?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setInquiries(prev => prev.filter(inq => inq.id !== id));
        setSelectedInquiry(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'replied': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'archived': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  if (loading) return <div className="p-20 text-center font-bold uppercase tracking-widest text-xs animate-pulse text-[var(--admin-text-muted)]">Loading Iconic Inquiries...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* List (2/3) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-[24px] border border-[var(--admin-border)] overflow-hidden shadow-sm">
           <div className="p-6 border-b border-[var(--admin-border)] bg-[var(--admin-light)]/30 flex justify-between items-center">
              <h3 className="font-serif text-lg font-bold">Inbound Inquiries</h3>
              <span className="px-3 py-1 bg-white rounded-lg text-[10px] font-bold uppercase tracking-widest text-[var(--admin-primary)] shadow-sm">
                {inquiries.filter(i => i.status === 'new').length} New
              </span>
           </div>
           <div className="divide-y divide-[var(--admin-border)]">
              {inquiries.map((inq, idx) => (
                <motion.div 
                  key={inq.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedInquiry(inq)}
                  className={`p-6 flex items-center justify-between hover:bg-[var(--admin-light)]/20 transition-all cursor-pointer group ${selectedInquiry?.id === inq.id ? 'bg-[var(--admin-light)]/40 border-l-4 border-l-[var(--admin-primary)]' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[var(--admin-text-primary)] group-hover:scale-110 transition-transform ${inq.status === 'new' ? 'bg-rose-50 text-rose-500 shadow-sm' : 'bg-[var(--admin-light)]'}`}>
                      {inq.bag_type ? <Tag size={18} /> : <MessageSquare size={18} />}
                    </div>
                    <div>
                       <p className={`text-sm font-bold ${inq.status === 'new' ? 'text-[var(--admin-text-primary)]' : 'text-[var(--admin-text-muted)]'}`}>{inq.subject}</p>
                       <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mt-1">{inq.name} • {new Date(inq.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${getStatusColor(inq.status)}`}>
                    {inq.status}
                  </span>
                </motion.div>
              ))}
              {inquiries.length === 0 && (
                <div className="p-20 text-center text-[var(--admin-text-muted)] italic text-sm">
                  The iconic mailbox is currently empty.
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Detail (1/3) */}
      <div className="lg:col-span-1">
        <AnimatePresence mode="wait">
          {selectedInquiry ? (
            <motion.div 
              key={selectedInquiry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[32px] border border-[var(--admin-border)] shadow-xl overflow-hidden sticky top-24"
            >
               <div className="p-8 border-b border-[var(--admin-border)] bg-[var(--admin-surface-dark)] text-white">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                       <User size={20} />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(selectedInquiry.id, 'archived')} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all">
                        <Archive size={18} />
                      </button>
                      <button onClick={() => deleteInquiry(selectedInquiry.id)} className="w-10 h-10 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-serif text-2xl font-bold">{selectedInquiry.name}</h3>
                  <p className="text-xs text-white/60 mt-1">{selectedInquiry.email}</p>
               </div>

               <div className="p-8 space-y-8">
                  <div className="space-y-4">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Inquiry Details</p>
                     <div className="p-5 bg-[var(--admin-light)]/50 rounded-2xl border border-[var(--admin-border)] space-y-2">
                        <p className="text-sm font-bold text-[var(--admin-text-primary)]">{selectedInquiry.subject}</p>
                        <p className="text-xs text-[var(--admin-text-primary)] leading-relaxed italic">"{selectedInquiry.message}"</p>
                     </div>
                  </div>

                  {selectedInquiry.bag_type && (
                    <div className="space-y-4">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Bulk Order Specs</p>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-[var(--admin-primary)]/5 rounded-2xl border border-[var(--admin-primary)]/10">
                             <Layers size={14} className="text-[var(--admin-primary)] mb-2" />
                             <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Quantity</p>
                             <p className="text-sm font-bold text-[var(--admin-text-primary)]">{selectedInquiry.quantity} Units</p>
                          </div>
                          <div className="p-4 bg-[var(--admin-primary)]/5 rounded-2xl border border-[var(--admin-primary)]/10">
                             <Tag size={14} className="text-[var(--admin-primary)] mb-2" />
                             <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Bag Type</p>
                             <p className="text-sm font-bold text-[var(--admin-text-primary)]">{selectedInquiry.bag_type}</p>
                          </div>
                       </div>
                       {selectedInquiry.logo_url && (
                         <div className="mt-4">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] mb-2">Attached Branding</p>
                            <img src={selectedInquiry.logo_url} className="w-full h-32 object-contain bg-[var(--admin-light)] rounded-xl p-4 border border-[var(--admin-border)]" alt="Client Logo" />
                         </div>
                       )}
                    </div>
                  )}

                  <div className="space-y-4">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Quick Reply</p>
                     <div className="flex flex-col gap-3">
                        <a 
                          href={`mailto:${selectedInquiry.email}?subject=Re: ${selectedInquiry.subject}`}
                          onClick={() => updateStatus(selectedInquiry.id, 'replied')}
                          className="w-full py-4 bg-[var(--admin-primary)] text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-[var(--admin-primary)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          <Mail size={18} /> Open Iconic Mailer
                        </a>
                        <button 
                          onClick={() => updateStatus(selectedInquiry.id, 'read')}
                          className="w-full py-4 border border-[var(--admin-border)] text-[var(--admin-text-muted)] rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[var(--admin-light)] transition-all flex items-center justify-center gap-3"
                        >
                          <CheckCircle size={18} /> Mark as Read
                        </button>
                     </div>
                  </div>
               </div>
            </motion.div>
          ) : (
            <div className="h-[500px] bg-[var(--admin-light)]/30 rounded-[32px] border-2 border-dashed border-[var(--admin-border)] flex flex-col items-center justify-center p-10 text-center">
               <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-[var(--admin-primary)] shadow-sm mb-6">
                  <Mail size={32} />
               </div>
               <h4 className="font-serif text-xl font-bold mb-2">No Inquiry Selected</h4>
               <p className="text-sm text-[var(--admin-text-muted)]">Click on an iconic message from the left to view the full details and take action.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
