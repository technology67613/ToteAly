import React, { useState, useEffect } from 'react';
import { History, Shield, User, Clock, Info, Search, Filter, Download } from "lucide-react";
import { motion } from "framer-motion";

interface AdminLog {
  id: string;
  action: string;
  user: string;
  target: string;
  details: string;
  created_at: string;
}

export const AdminLogsTab = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/admin/logs');
        if (res.ok) setLogs(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getActionColor = (action: string) => {
    if (action.startsWith('CREATE')) return 'text-emerald-500 bg-emerald-50';
    if (action.startsWith('DELETE')) return 'text-rose-500 bg-rose-50';
    if (action.startsWith('UPDATE')) return 'text-amber-500 bg-amber-50';
    return 'text-blue-500 bg-blue-50';
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-[var(--admin-text-muted)] font-bold text-xs uppercase tracking-widest">Synchronizing Ledger...</div>;

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center bg-white p-8 rounded-[16px] border border-[var(--admin-border)] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[var(--admin-text-primary)]">Administrative Ledger</h2>
          <p className="text-[11px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mt-1">Immutable audit trail of all platform operations</p>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-4 py-2 border border-[var(--admin-border)] rounded-xl text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">
              <Filter size={14} /> Filter
           </button>
           <button className="flex items-center gap-2 px-6 py-2 bg-[var(--admin-primary)] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-[var(--admin-primary)]/20">
              <Download size={14} /> Export Audit
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-[var(--admin-border)] overflow-hidden shadow-sm">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-[var(--admin-light)]/30 border-b border-[var(--admin-border)]">
                     <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Timestamp</th>
                     <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Agent</th>
                     <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Operation</th>
                     <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Target Entity</th>
                     <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Outcome</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-[var(--admin-border)]">
                  {logs.map((log, idx) => (
                     <motion.tr 
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-[var(--admin-light)]/20 transition-colors"
                     >
                        <td className="px-8 py-6">
                           <div className="flex flex-col gap-1">
                              <span className="text-xs font-bold text-[var(--admin-text-primary)]">{new Date(log.created_at).toLocaleDateString()}</span>
                              <span className="text-[9px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">{new Date(log.created_at).toLocaleTimeString()}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[var(--admin-light)] flex items-center justify-center text-[var(--admin-primary)]">
                                 <Shield size={14} />
                              </div>
                              <span className="text-xs font-bold text-[var(--admin-text-primary)]">{log.user}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${getActionColor(log.action)}`}>
                              {log.action}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-sm font-bold text-[var(--admin-text-primary)]">{log.target}</td>
                        <td className="px-8 py-6">
                           <p className="text-xs text-[var(--admin-text-muted)] font-medium leading-relaxed max-w-xs">{log.details}</p>
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
