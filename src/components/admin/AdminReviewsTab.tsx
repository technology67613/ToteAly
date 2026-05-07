import React, { useCallback, useEffect, useState } from 'react';
import { Star, CheckCircle2, XCircle, Trash2, User, Package, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Review {
  id: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  profiles?: { name: string; avatar_url: string };
  products?: { title: string };
}

export const AdminReviewsTab = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/reviews');
      if (res.ok) setReviews(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReviews();
  }, [fetchReviews]);

  const toggleApproval = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'approved' ? 'pending' : 'approved';
    const res = await fetch('/api/admin/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: nextStatus })
    });
    if (res.ok) fetchReviews();
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this iconic review?')) return;
    const res = await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchReviews();
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-[var(--admin-text-muted)] font-bold text-xs uppercase tracking-widest">Loading Social Proof...</div>;

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center bg-white p-8 rounded-[16px] border border-[var(--admin-border)] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[var(--admin-text-primary)]">Social Proof Moderation</h2>
          <p className="text-[11px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mt-1">Manage customer feedback and storefront reputation</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right">
              <p className="text-xs font-bold text-[var(--admin-text-primary)]">{reviews.filter(r => r.status === 'pending').length} Pending</p>
              <p className="text-[10px] text-[var(--admin-text-muted)] font-bold uppercase tracking-widest">Moderation Queue</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence>
          {reviews.map((review, idx) => (
            <motion.div 
              key={review.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`bg-white p-8 rounded-[32px] border border-[var(--admin-border)] flex flex-col md:flex-row gap-8 items-start hover:shadow-xl transition-all group ${review.status !== 'approved' ? 'border-amber-200 bg-amber-50/10' : ''}`}
            >
              <div className="flex-1 space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-[var(--admin-light)] flex items-center justify-center font-serif font-bold text-[var(--admin-primary)]">
                          {review.profiles?.name?.[0] || 'A'}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-[var(--admin-text-primary)]">{review.profiles?.name || 'Anonymous'}</p>
                          <div className="flex items-center gap-1 mt-1 text-amber-400">
                             {[...Array(5)].map((_, i) => (
                               <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />
                             ))}
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--admin-light)] rounded-lg">
                       <Package size={14} className="text-[var(--admin-text-muted)]" />
                       <span className="text-[10px] font-bold text-[var(--admin-text-primary)] uppercase tracking-widest">{review.products?.title || 'Iconic Product'}</span>
                    </div>
                 </div>

                 <div className="relative">
                    <MessageSquare size={24} className="absolute -left-2 -top-2 text-[var(--admin-primary)]/5" />
                    <p className="text-sm text-[var(--admin-text-primary)] font-medium leading-relaxed pl-4">
                       "{review.comment}"
                    </p>
                 </div>

                 <div className="flex items-center gap-4 text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">
                    <span>Submitted: {new Date(review.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className={review.status === 'approved' ? "text-emerald-600" : "text-amber-600"}>
                       {review.status === 'approved' ? "Approved & Live" : "Pending Moderation"}
                    </span>
                 </div>
              </div>

              <div className="flex flex-row md:flex-col gap-3 shrink-0 pt-2">
                 <button 
                  onClick={() => toggleApproval(review.id, review.status)}
                  className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${review.status === 'approved' ? 'bg-slate-100 text-slate-400 hover:text-amber-600 hover:bg-amber-50' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-105'}`}
                 >
                    {review.status === 'approved' ? <XCircle size={24} /> : <CheckCircle2 size={24} />}
                 </button>
                 <button 
                  onClick={() => deleteReview(review.id)}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-rose-50 text-rose-300 hover:bg-rose-500 hover:text-white transition-all"
                 >
                    <Trash2 size={24} />
                 </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {reviews.length === 0 && (
          <div className="py-20 text-center space-y-6 bg-white rounded-[32px] border border-[var(--admin-border)]">
             <div className="w-20 h-20 bg-[var(--admin-light)] rounded-full flex items-center justify-center text-[var(--admin-primary)]/20 mx-auto">
                <Star size={40} />
             </div>
             <div className="space-y-2">
                <p className="text-xl font-serif font-bold text-[var(--admin-text-primary)]">No Feedback Yet</p>
                <p className="text-sm text-[var(--admin-text-muted)] max-w-xs mx-auto">Wait for iconic reviews to appear here for moderation.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
