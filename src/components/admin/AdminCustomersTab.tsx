import { useRouter } from 'next/navigation';
import { Users, Search, Download, Filter, User, Eye } from "lucide-react";
import { motion } from "framer-motion";

interface Customer {
  id: string;
  _id?: string;
  name: string;
  email: string;
  created_at: string;
  orders?: any[];
  isGuest?: boolean;
}

export const AdminCustomersTab = ({ customers }: { customers: Customer[] }) => {
  const router = useRouter();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center bg-white p-6 rounded-[16px] border border-[var(--admin-border)] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <div className="relative w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" />
          <input 
            type="text" 
            placeholder="Search customers..." 
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--admin-light)]/50 border border-[var(--admin-border)] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/20 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => window.open(`/api/admin/export/ToteAly_Customers_Report_${new Date().toISOString().split('T')[0]}.csv`, '_blank')}
            className="flex items-center gap-2 px-4 py-2.5 border border-[var(--admin-border)] rounded-xl text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] hover:bg-[var(--admin-light)] transition-all"
          >
            <Download size={14} /> Export CSV
          </button>
          <button 
            onClick={() => window.open(`/api/admin/export/ToteAly_Customers_Report_${new Date().toISOString().split('T')[0]}.pdf`, '_blank')}
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
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Customer</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Contact Email</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Orders</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Since</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-text-muted)] text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {customers.map((c, idx) => {
                const customerId = c.id || c._id || "cust";
                return (
                  <motion.tr 
                    key={customerId} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => router.push(`/admin/customers/${customerId}`)}
                    className="group hover:bg-[var(--admin-light)]/20 transition-colors cursor-pointer"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[var(--admin-light)] flex items-center justify-center font-serif font-bold text-[var(--admin-primary)] shadow-sm ring-1 ring-black/5">
                          {c.name?.[0] || <User size={16} />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[var(--admin-text-primary)] group-hover:text-[var(--admin-primary)] transition-colors">{c.name || "Anonymous User"}</span>
                          <span className="text-[9px] font-bold text-[var(--admin-primary)] uppercase tracking-widest">{c.isGuest ? "Guest Shopper" : "Iconic Member"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-medium text-[var(--admin-text-primary)]">{c.email}</td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-[var(--admin-text-primary)]">{c.orders?.length || 0}</span>
                    </td>
                    <td className="px-8 py-6 text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">
                      {new Date(c.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${
                        c.isGuest 
                          ? 'bg-amber-50 text-amber-600 border-amber-100' 
                          : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {c.isGuest ? "Guest" : "Verified"}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-6">
                      <div className="w-20 h-20 bg-[var(--admin-light)] rounded-full flex items-center justify-center text-[var(--admin-primary)]/20">
                        <Users size={40} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-serif font-bold text-[var(--admin-text-primary)]">No customers yet</p>
                        <p className="text-sm text-[var(--admin-text-muted)] max-w-xs mx-auto">Share your store link with the world to start growing your community.</p>
                      </div>
                      <button className="px-6 py-3 bg-[var(--admin-primary)] text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-[var(--admin-primary)]/20">
                        Copy Store Link
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
