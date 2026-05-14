import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye, Download, Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export const AdminDesignsTab = () => {
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/designs');
      if (res.ok) setDesigns(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch('/api/admin/designs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) fetchDesigns();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-[var(--admin-text-muted)] font-bold uppercase tracking-widest text-xs">Loading design queue...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif font-bold">Custom Designs</h2>
          <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mt-1">Review and approve user-generated artwork</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {designs.map((design) => (
          <motion.div 
            key={design.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[24px] border border-[var(--admin-border)] overflow-hidden shadow-sm group hover:shadow-xl transition-all"
          >
            <div className="aspect-square bg-[var(--admin-light)] relative">
              <img 
                src={design.thumbnail_url || "/products/plain.png"} 
                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform" 
                alt="Design preview"
              />
              <div className="absolute top-4 right-4">
                 <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-sm ${
                   design.status === 'approved' ? 'bg-emerald-500 text-white' :
                   design.status === 'rejected' ? 'bg-rose-500 text-white' :
                   'bg-amber-500 text-white'
                 }`}>
                   {design.status}
                 </span>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">{design.bag_type}</p>
                  <h4 className="font-bold text-[var(--admin-text-primary)] mt-1">{design.profiles?.name || 'Guest'}</h4>
                </div>
                <p className="font-bold text-[var(--admin-primary)]">₹{design.price}</p>
              </div>

              <div className="flex gap-2 pt-2">
                {design.status === 'pending_review' && (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(design.id, 'approved')}
                      disabled={!!updating}
                      className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all"
                    >
                      {updating === design.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                      Approve
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(design.id, 'rejected')}
                      disabled={!!updating}
                      className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-600 transition-all"
                    >
                      <XCircle size={12} />
                      Reject
                    </button>
                  </>
                )}
                {design.status !== 'pending_review' && (
                   <button 
                    onClick={() => handleUpdateStatus(design.id, 'pending_review')}
                    className="w-full py-2.5 bg-[var(--admin-light)] text-[var(--admin-text-muted)] rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                   >
                     <Clock size={12} /> Reset Status
                   </button>
                )}
              </div>
              
              <button className="w-full py-2.5 border border-[var(--admin-border)] rounded-xl text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] flex items-center justify-center gap-2 hover:bg-[var(--admin-light)] transition-all">
                <Download size={12} /> Download Assets
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {designs.length === 0 && (
        <div className="py-20 text-center">
          <div className="w-20 h-20 bg-[var(--admin-light)] rounded-full flex items-center justify-center mx-auto mb-6">
            <Eye size={32} className="text-[var(--admin-text-muted)]" />
          </div>
          <p className="text-[var(--admin-text-muted)] font-medium">No custom designs in the queue yet.</p>
        </div>
      )}
    </div>
  );
};
