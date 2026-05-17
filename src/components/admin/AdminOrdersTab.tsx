import React from 'react';
import { ShoppingBag, Eye, CheckCircle2, Clock, Truck, Package, Search, Filter, Download, MoreHorizontal, IndianRupee } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AdminOrdersTabProps {
  orders: any[];
  loading: boolean;
  onRefresh: () => void;
  onUpdateStatus?: (id: string, status: string) => void;
}

export const AdminOrdersTab = ({ orders, loading, onRefresh, onUpdateStatus }: AdminOrdersTabProps) => {
  const router = useRouter();

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'processing': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'shipped': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-200 ring-1 ring-rose-500/20';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const handleView = (id: string) => {
    router.push(`/admin/orders/${id}`);
  };

  const handleExport = () => {
    const filename = `ToteAly_Orders_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    window.open(`/api/admin/export/${filename}`, '_blank');
  };


  if (loading) return <div className="p-20 text-center text-[var(--admin-text-muted)] animate-pulse font-bold uppercase tracking-widest text-xs">Loading Cloud Orders...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-[16px] border border-[var(--admin-border)] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <div className="relative w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" />
          <input 
            type="text" 
            placeholder="Search order ID or customer..." 
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--admin-light)]/50 border border-[var(--admin-border)] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/20 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => window.open(`/api/admin/export/ToteAly_Orders_Report_${new Date().toISOString().split('T')[0]}.csv`, '_blank')}
            className="flex items-center gap-2 px-4 py-2.5 border border-[var(--admin-border)] rounded-xl text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] hover:bg-[var(--admin-light)] transition-all"
          >
            <Download size={14} /> Export CSV
          </button>
          <button 
            onClick={() => window.open(`/api/admin/export/ToteAly_Orders_Report_${new Date().toISOString().split('T')[0]}.pdf`, '_blank')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--admin-primary)] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[var(--admin-primary)]/20"
          >
            <Eye size={14} /> Preview PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[16px] border border-[var(--admin-border)] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--admin-light)]/30 border-b border-[var(--admin-border)]">
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Reference</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Customer</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Amount</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-text-muted)] text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-text-muted)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {orders.map((o, idx) => (
                <motion.tr 
                  key={o.id} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleView(o.id)}
                  className={`group hover:bg-[var(--admin-light)]/20 transition-colors cursor-pointer ${o.status?.toLowerCase() === 'cancelled' ? 'bg-rose-50/30 opacity-75' : ''}`}
                >
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-bold text-[var(--admin-primary)]">#{o.id.slice(0, 8).toUpperCase()}</span>
                      <span className="text-[9px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mt-1">
                        {new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} • {new Date(o.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[var(--admin-text-primary)]">{o.user?.name || o.shippingDetails?.name || 'Guest User'}</span>
                        {!o.user_id && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-md text-[8px] font-bold uppercase tracking-wider">Guest</span>
                        )}
                      </div>
                      <span className="text-[10px] text-[var(--admin-text-muted)]">{o.user?.email || o.shippingDetails?.email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center font-bold text-sm text-[var(--admin-text-primary)]">
                       <IndianRupee size={12} className="mr-0.5" />
                       {o.totalAmount || o.total_amount}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center">
                      <span className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${getStatusStyle(o.status)}`}>
                        {o.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => handleView(o.id)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-[var(--admin-light)] text-[var(--admin-text-primary)] hover:bg-[var(--admin-primary)] hover:text-white transition-all"
                       >
                         <Eye size={16} />
                       </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
