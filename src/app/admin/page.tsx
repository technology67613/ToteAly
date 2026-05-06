"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  BarChart2, ShoppingBag, Users, Package, TrendingUp,
  Search, Loader2, LogOut, Bell, Settings, Ticket, Megaphone,
  LayoutDashboard, Menu, X, ArrowUpRight, ChevronRight, Globe, Calendar, Mail, Star,
  Plus, Zap, Download, IndianRupee, History
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

// Modular Components
import { AdminStatsGrid } from "@/components/admin/AdminStatsGrid";
import { AdminOrdersTab } from "@/components/admin/AdminOrdersTab";
import { AdminInventoryTab } from "@/components/admin/AdminInventoryTab";
import { AdminCustomersTab } from "@/components/admin/AdminCustomersTab";
import { AdminMarketingTab } from "@/components/admin/AdminMarketingTab";
import { AdminSettingsTab } from "@/components/admin/AdminSettingsTab";
import { AdminInquiriesTab } from "@/components/admin/AdminInquiriesTab";
import { AdminReviewsTab } from "@/components/admin/AdminReviewsTab";
import { AdminAnalyticsTab } from "@/components/admin/AdminAnalyticsTab";
import { AdminLogsTab } from "@/components/admin/AdminLogsTab";
import { AdminActivityFeed } from "@/components/admin/AdminActivityFeed";
import { ProductModal } from "@/components/admin/ProductModal";

type Tab = "dashboard" | "analytics" | "orders" | "products" | "customers" | "inquiries" | "marketing" | "reviews" | "settings" | "logs";

const CHART_DATA = [
  { name: 'Mon', sales: 4000, revenue: 2400 },
  { name: 'Tue', sales: 3000, revenue: 1398 },
  { name: 'Wed', sales: 2000, revenue: 9800 },
  { name: 'Thu', sales: 2780, revenue: 3908 },
  { name: 'Fri', sales: 1890, revenue: 4800 },
  { name: 'Sat', sales: 2390, revenue: 3800 },
  { name: 'Sun', sales: 3490, revenue: 4300 },
];

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const handleProductSave = async (formData: any) => {
    const url = "/api/admin/products";
    const method = editingProduct ? "PATCH" : "POST";
    const payload = editingProduct ? { ...formData, id: editingProduct.id } : formData;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setIsProductModalOpen(false);
      setEditingProduct(null);
      fetchData();
    }
  };

  const handleProductDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this iconic product?")) return;
    const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    } else if (status === "authenticated" && (session?.user as any)?.role !== "admin") {
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role === "admin") {
      fetchData();
    }
  }, [tab, status, session]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statsRes = await fetch("/api/admin/stats");
      if (statsRes.ok) setStats(await statsRes.json());

      if (tab === "products") {
        const res = await fetch("/api/admin/products");
        if (res.ok) setProducts(await res.json());
      }
      if (tab === "orders") {
        const res = await fetch("/api/admin/orders");
        if (res.ok) setOrders(await res.json());
      }
      if (tab === "customers") {
        const res = await fetch("/api/admin/customers");
        if (res.ok) setCustomers(await res.json());
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    }
    setLoading(false);
  };

  const handleLogout = () => signOut({ callbackUrl: "/admin/login" });

  if (status === "loading" || (loading && !stats)) {
    return (
      <div className="min-h-screen w-full bg-[var(--admin-background)] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-10 h-10 text-[var(--admin-primary)]" />
        </motion.div>
      </div>
    );
  }

  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Overview", badge: 0 },
    { id: "analytics", icon: BarChart2, label: "Analytics", badge: 0 },
    { id: "orders", icon: ShoppingBag, label: "Orders", badge: orders.filter(o => o.status === 'Pending').length },
    { id: "products", icon: Package, label: "Inventory", badge: 0 },
    { id: "customers", icon: Users, label: "Customers", badge: 0 },
    { id: "inquiries", icon: Mail, label: "Inquiries", badge: 0 },
    { id: "marketing", icon: Megaphone, label: "Marketing", badge: 0 },
    { id: "reviews", icon: Star, label: "Reviews", badge: 0 },
    { id: "settings", icon: Settings, label: "Settings", badge: 0 },
    { id: "logs", icon: History, label: "Audit Trail", badge: 0 },
  ];

  return (
    <div className="flex w-full h-screen overflow-hidden bg-[var(--admin-background)]">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[var(--admin-surface-dark)] text-white flex flex-col shrink-0 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--admin-primary)] rounded-xl flex items-center justify-center font-serif font-bold text-xl shadow-lg shadow-[var(--admin-primary)]/20">T</div>
              <div className="flex flex-col">
                <span className="font-serif text-[16px] font-bold tracking-tight">ToteAly</span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold">Cloud Admin</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id as Tab)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${tab === item.id ? 'bg-white/10 text-white shadow-xl shadow-black/20 ring-1 ring-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={20} className={tab === item.id ? 'text-[var(--admin-primary)]' : 'group-hover:text-white transition-colors'} />
                  <span className="text-xs font-bold tracking-wide">{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="px-2 py-0.5 bg-rose-500 text-white text-[9px] font-bold rounded-full shadow-lg shadow-rose-500/20">{item.badge}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="pt-8 border-t border-white/5 mt-8">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-4 p-4 text-white/40 hover:text-rose-400 hover:bg-rose-500/5 rounded-2xl transition-all font-bold text-xs"
            >
              <LogOut size={20} /> Logout Account
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-[var(--admin-border)] flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[var(--admin-light)] transition-all">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Cloud Live</span>
               </div>
               <div className="h-4 w-px bg-[var(--admin-border)] mx-2" />
               <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">Global Administrative Terminal v3.2</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" />
              <input 
                type="text" 
                placeholder="Deep search icons, orders, users..." 
                className="w-80 pl-12 pr-4 py-2.5 bg-[var(--admin-light)]/50 border border-[var(--admin-border)] rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/20 transition-all"
              />
            </div>
            <button className="relative w-11 h-11 flex items-center justify-center rounded-xl hover:bg-[var(--admin-light)] transition-all border border-[var(--admin-border)]">
              <Bell size={20} className="text-[var(--admin-text-primary)]" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-4 ring-white" />
            </button>
            <div className="flex items-center gap-4 p-1 pl-4 bg-[var(--admin-light)]/30 border border-[var(--admin-border)] rounded-2xl">
               <div className="text-right flex flex-col">
                  <span className="text-xs font-bold text-[var(--admin-text-primary)]">Admin Panel</span>
                  <span className="text-[9px] font-bold text-[var(--admin-primary)] uppercase tracking-widest">Iconic Mode</span>
               </div>
               <div className="w-9 h-9 rounded-xl bg-[var(--admin-surface-dark)] text-white flex items-center justify-center font-serif text-sm font-bold shadow-lg">A</div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {tab === "dashboard" && (
                  <div className="space-y-10">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <h1 className="font-serif text-3xl font-bold text-[var(--admin-text-primary)] tracking-tight">Executive Dashboard</h1>
                        <p className="text-xs text-[var(--admin-text-muted)] mt-1 font-medium">Monitoring ToteAly Iconic metrics in real-time</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="px-4 py-2.5 bg-white border border-[var(--admin-border)] rounded-xl flex items-center gap-2 text-xs font-bold">
                           <Calendar size={14} className="text-[var(--admin-text-muted)]" />
                           May 2026
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                       <button 
                        onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                        className="p-6 bg-white border border-[var(--admin-border)] rounded-3xl hover:shadow-xl hover:scale-[1.02] transition-all group flex flex-col gap-4 text-left"
                       >
                          <div className="w-12 h-12 bg-[var(--admin-light)] rounded-2xl flex items-center justify-center text-[var(--admin-primary)] group-hover:bg-[var(--admin-primary)] group-hover:text-white transition-all">
                             <Plus size={24} />
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">Storefront</p>
                             <p className="text-sm font-bold text-[var(--admin-text-primary)]">New Product</p>
                          </div>
                       </button>
                       <button 
                        onClick={() => setTab("marketing")}
                        className="p-6 bg-white border border-[var(--admin-border)] rounded-3xl hover:shadow-xl hover:scale-[1.02] transition-all group flex flex-col gap-4 text-left"
                       >
                          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all">
                             <Zap size={24} />
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">Growth</p>
                             <p className="text-sm font-bold text-[var(--admin-text-primary)]">New Campaign</p>
                          </div>
                       </button>
                       <button 
                        onClick={() => setTab("inquiries")}
                        className="p-6 bg-white border border-[var(--admin-border)] rounded-3xl hover:shadow-xl hover:scale-[1.02] transition-all group flex flex-col gap-4 text-left"
                       >
                          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-all">
                             <Mail size={24} />
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">Support</p>
                             <p className="text-sm font-bold text-[var(--admin-text-primary)]">Check Leads</p>
                          </div>
                       </button>
                       <button className="p-6 bg-white border border-[var(--admin-border)] rounded-3xl hover:shadow-xl hover:scale-[1.02] transition-all group flex flex-col gap-4 text-left">
                          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                             <Download size={24} />
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">Intelligence</p>
                             <p className="text-sm font-bold text-[var(--admin-text-primary)]">Export Sales</p>
                          </div>
                       </button>
                    </div>

                    <AdminStatsGrid stats={stats} />

                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
                      <div className="xl:col-span-2 bg-white p-8 rounded-[32px] border border-[var(--admin-border)] shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                           <div>
                              <h3 className="font-serif text-xl font-bold text-[var(--admin-text-primary)]">Revenue Velocity</h3>
                              <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mt-1">Monthly Cloud Performance</p>
                           </div>
                        </div>
                        <div className="h-[400px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={Object.entries(stats?.trend || {}).map(([name, revenue]) => ({ name, revenue }))}>
                              <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="var(--admin-primary)" stopOpacity={0.1}/>
                                  <stop offset="95%" stopColor="var(--admin-primary)" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--admin-light)" />
                              <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--admin-text-muted)' }} 
                                dy={10}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'var(--admin-surface-dark)', 
                                  borderRadius: '16px', 
                                  border: 'none', 
                                  color: 'white',
                                  boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
                                }}
                                itemStyle={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="var(--admin-primary)" 
                                strokeWidth={4} 
                                fillOpacity={1} 
                                fill="url(#colorRev)" 
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="bg-white p-8 rounded-[32px] border border-[var(--admin-border)] shadow-sm flex flex-col">
                         <h3 className="font-serif text-lg font-bold text-[var(--admin-text-primary)] mb-8">Popular Categories</h3>
                         <div className="flex-1 space-y-6">
                           {(stats?.categories || [
                              { label: 'Plain Totes', val: 65, color: '#8B1A4A' },
                              { label: 'Black Edition', val: 45, color: '#1A1A1A' },
                              { label: 'Premium Canvas', val: 30, color: '#C0A080' },
                              { label: 'Custom Prints', val: 85, color: '#FF69B4' },
                           ]).map((cat: any) => (
                              <div key={cat.label} className="space-y-3">
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                  <span className="text-[var(--admin-text-primary)]">{cat.label}</span>
                                  <span className="text-[var(--admin-text-muted)]">{cat.val}%</span>
                                </div>
                                <div className="w-full bg-[var(--admin-light)] h-2 rounded-full overflow-hidden">
                                   <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${cat.val}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    style={{ backgroundColor: cat.color }}
                                    className="h-full rounded-full" 
                                   />
                                </div>
                              </div>
                           ))}
                         </div>
                      </div>

                      <div className="bg-white p-8 rounded-[32px] border border-[var(--admin-border)] shadow-sm">
                         <h3 className="font-serif text-lg font-bold text-[var(--admin-text-primary)] mb-8">Recent Activity</h3>
                         <AdminActivityFeed />
                      </div>
                    </div>
                  </div>
                )}

                { tab === "analytics" && <AdminAnalyticsTab /> }
                { tab === "orders" && <AdminOrdersTab orders={orders} loading={loading} onRefresh={fetchData} /> }
                {tab === "products" && (
                  <AdminInventoryTab 
                    products={products} 
                    onEdit={(p) => { setEditingProduct(p); setIsProductModalOpen(true); }} 
                    onDelete={handleProductDelete}
                    onNew={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                  />
                )}
                {tab === "customers" && <AdminCustomersTab customers={customers} />}
                {tab === "inquiries" && <AdminInquiriesTab />}
                { tab === "marketing" && <AdminMarketingTab /> }
                { tab === "reviews" && <AdminReviewsTab /> }
                { tab === "settings" && <AdminSettingsTab /> }
                { tab === "logs" && <AdminLogsTab /> }
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <ProductModal 
        isOpen={isProductModalOpen}
        onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
        product={editingProduct}
        onSave={handleProductSave}
      />
    </div>
  );
}
