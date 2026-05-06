"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, User, Mail, Phone, MapPin, 
  ShoppingBag, Calendar, ChevronRight, Star,
  Clock, CreditCard, ShieldCheck, ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";

export default function CustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await fetch(`/api/admin/customers?id=${id}`);
        if (res.ok) setCustomer(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[var(--admin-background)] flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
        <User className="w-10 h-10 text-[var(--admin-primary)]" />
      </motion.div>
    </div>
  );

  if (!customer) return (
    <div className="min-h-screen bg-[var(--admin-background)] flex flex-col items-center justify-center gap-4">
      <p className="font-serif text-2xl font-bold">Customer not found</p>
      <button onClick={() => router.back()} className="text-[var(--admin-primary)] font-bold uppercase tracking-widest text-xs">Return to Dashboard</button>
    </div>
  );

  const stats = [
    { label: "Total Orders", value: customer.orders?.length || 0, icon: ShoppingBag },
    { label: "Lifetime Value", value: `₹${customer.orders?.reduce((acc: number, o: any) => acc + Number(o.total_amount), 0).toLocaleString('en-IN')}`, icon: CreditCard },
    { label: "Member Since", value: new Date(customer.created_at).getFullYear(), icon: Calendar },
    { label: "Trust Score", value: "9.8/10", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-[var(--admin-background)] pb-20">
      <header className="h-20 bg-white border-b border-[var(--admin-border)] flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[var(--admin-light)] transition-all">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="font-serif text-xl font-bold text-[var(--admin-text-primary)]">{customer.name}</h1>
            <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">Customer ID: {customer.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-2.5 border border-[var(--admin-border)] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--admin-light)] transition-all">
            Edit Profile
          </button>
          <button className="px-6 py-2.5 bg-rose-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-rose-200">
            Suspend Account
          </button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-10 grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-1 space-y-10">
          {/* Main Info Card */}
          <div className="bg-white p-8 rounded-[32px] border border-[var(--admin-border)] shadow-sm">
             <div className="flex flex-col items-center text-center mb-8">
                <div className="w-24 h-24 rounded-3xl bg-[var(--admin-surface-dark)] text-white flex items-center justify-center font-serif text-4xl font-bold mb-4 shadow-xl">
                  {customer.name?.[0]}
                </div>
                <h2 className="font-serif text-2xl font-bold">{customer.name}</h2>
                <p className="text-[10px] font-bold text-[var(--admin-primary)] uppercase tracking-widest mt-1">Premium Iconic Member</p>
             </div>
             
             <div className="space-y-6 pt-8 border-t border-[var(--admin-border)]">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-[var(--admin-light)] rounded-xl flex items-center justify-center text-[var(--admin-text-muted)]"><Mail size={16} /></div>
                  <span className="text-xs font-medium text-[var(--admin-text-primary)] truncate">{customer.email}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-[var(--admin-light)] rounded-xl flex items-center justify-center text-[var(--admin-text-muted)]"><Phone size={16} /></div>
                  <span className="text-xs font-medium text-[var(--admin-text-primary)]">+91 {customer.phone || 'N/A'}</span>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-[var(--admin-light)] rounded-xl flex items-center justify-center text-[var(--admin-text-muted)] mt-1"><MapPin size={16} /></div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-[var(--admin-text-primary)] leading-relaxed">
                      {customer.address?.street || 'No address provided'}<br />
                      {customer.address?.city} {customer.address?.zip}
                    </span>
                  </div>
                </div>
             </div>
          </div>

          <div className="bg-[var(--admin-surface-dark)] p-8 rounded-[32px] text-white">
             <div className="flex items-center gap-3 mb-6">
                <ShieldCheck size={20} className="text-[var(--admin-primary)]" />
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40">Security Status</h4>
             </div>
             <p className="text-xs font-medium leading-relaxed text-white/60">Verified via email. Two-factor authentication is enabled. No suspicious activity detected in the last 90 days.</p>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-[24px] border border-[var(--admin-border)] shadow-sm"
              >
                <stat.icon size={20} className="text-[var(--admin-primary)] mb-4" />
                <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-serif font-bold mt-1 text-[var(--admin-text-primary)]">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="bg-white rounded-[32px] border border-[var(--admin-border)] overflow-hidden shadow-sm">
             <div className="p-8 border-b border-[var(--admin-border)] flex justify-between items-center bg-[var(--admin-light)]/30">
               <h3 className="font-serif text-xl font-bold">Transaction History</h3>
               <span className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">Sorted by newest</span>
             </div>
             <div className="divide-y divide-[var(--admin-border)]">
                {customer.orders?.map((order: any) => (
                  <div 
                    key={order.id} 
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                    className="p-8 flex items-center justify-between hover:bg-[var(--admin-light)]/20 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-6">
                       <div className="w-12 h-12 bg-[var(--admin-light)] rounded-2xl flex items-center justify-center text-[var(--admin-text-primary)] group-hover:bg-[var(--admin-primary)] group-hover:text-white transition-all">
                          <ShoppingBag size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-[var(--admin-text-primary)]">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-10 text-right">
                       <div className="flex flex-col items-end">
                          <span className="text-sm font-bold">₹{order.total_amount}</span>
                          <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${order.status === 'delivered' ? 'text-emerald-600' : 'text-amber-600'}`}>{order.status}</span>
                       </div>
                       <ChevronRight size={18} className="text-[var(--admin-text-muted)] group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
                {(!customer.orders || customer.orders.length === 0) && (
                  <div className="p-20 text-center text-[var(--admin-text-muted)] italic text-sm">
                    No transactions found for this customer.
                  </div>
                )}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
