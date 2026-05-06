"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  BarChart2, ShoppingBag, Users, Package, TrendingUp,
  Search, Loader2, LogOut, Bell, Settings, Ticket, Megaphone,
  LayoutDashboard, Menu, X, ArrowUpRight, ChevronRight, Globe
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
import { ProductModal } from "@/components/admin/ProductModal";

type Tab = "dashboard" | "orders" | "products" | "customers" | "marketing" | "settings";

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
    { id: "orders", icon: ShoppingBag, label: "Orders", badge: orders.filter(o => o.status === 'pending').length },
    { id: "products", icon: Package, label: "Inventory", badge: 0 },
    { id: "customers", icon: Users, label: "Customers", badge: 0 },
    { id: "marketing", icon: Megaphone, label: "Marketing", badge: 0 },
    { id: "settings", icon: Settings, label: "Settings", badge: 0 },
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
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/40">
              <X size={20} />
            </button>
          </div>

          <nav className="flex flex-col gap-2 flex-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setTab(item.id as Tab);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`group flex items-center justify-between px-5 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                  tab === item.id 
                    ? "bg-[var(--admin-primary)] text-white shadow-xl shadow-[var(--admin-primary)]/20 translate-x-1" 
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className={tab === item.id ? "text-white" : "group-hover:text-white transition-colors"} /> 
                  {item.label}
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-md text-[9px]">{item.badge}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-6">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-8 h-8 rounded-full bg-[var(--admin-primary)]/20 flex items-center justify-center text-[var(--admin-primary)]">
                    <Globe size={14} />
                 </div>
                 <span className="text-[10px] font-bold uppercase tracking-widest">Live Store</span>
              </div>
              <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all">
                Visit Storefront
              </button>
            </div>
            
            <button onClick={handleLogout} className="flex items-center gap-3 px-5 text-white/40 hover:text-rose-400 transition-colors text-[10px] font-bold uppercase tracking-widest">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 bg-white border-b border-[var(--admin-border)] flex items-center justify-between px-10 shrink-0 z-40">
          <div className="flex items-center gap-6 flex-1">
             <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-[var(--admin-text-primary)]">
               <Menu size={24} />
             </button>
             <div className="relative max-w-md w-full hidden md:block">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" />
                <input 
                  type="text" 
                  placeholder="Search orders, customers, inventory..." 
                  className="w-full pl-12 pr-4 py-2.5 bg-[var(--admin-light)] border border-[var(--admin-border)] rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/10 transition-all" 
                />
             </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-bold uppercase tracking-widest">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
               Cloud Connected
            </div>
            <button className="relative text-[var(--admin-text-muted)] hover:text-[var(--admin-primary)] transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--admin-primary)] text-white text-[8px] flex items-center justify-center rounded-full border-2 border-white font-bold">3</span>
            </button>
            <div className="flex items-center gap-4 pl-8 border-l border-[var(--admin-border)]">
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-bold text-[var(--admin-text-primary)] leading-none">{session?.user?.name}</span>
                <span className="text-[9px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">Administrator</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[var(--admin-surface-dark)] text-white flex items-center justify-center font-serif font-bold shadow-lg shadow-black/5">
                {session?.user?.name?.[0]}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[var(--admin-background)]">
          <div className="p-10 max-w-[1600px] mx-auto space-y-10">
            <header>
              <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-[0.2em] mb-2">
                <span>ToteAly Cloud</span>
                <ChevronRight size={10} />
                <span className="text-[var(--admin-primary)]">{tab}</span>
              </div>
              <h1 className="font-serif text-4xl font-bold text-[var(--admin-text-primary)] tracking-tight capitalize">{tab}</h1>
            </header>

            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {tab === "dashboard" && stats && (
                  <div className="space-y-10">
                    <AdminStatsGrid stats={stats} />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                       <div className="lg:col-span-2 bg-white p-8 rounded-[24px] border border-[var(--admin-border)] shadow-sm">
                          <div className="flex justify-between items-center mb-8">
                             <div>
                               <h3 className="font-serif text-xl font-bold text-[var(--admin-text-primary)]">Sales Velocity</h3>
                               <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mt-1">Net revenue performance over time</p>
                             </div>
                             <div className="flex gap-2">
                               {['1D', '1W', '1M', '1Y'].map((p) => (
                                 <button key={p} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all ${p === '1W' ? 'bg-[var(--admin-primary)] text-white shadow-lg shadow-[var(--admin-primary)]/20' : 'text-[var(--admin-text-muted)] hover:bg-[var(--admin-light)]'}`}>
                                   {p}
                                 </button>
                               ))}
                             </div>
                          </div>
                          <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={stats?.trend ? Object.entries(stats.trend).map(([name, revenue]) => ({ name, revenue })) : CHART_DATA}>
                                <defs>
                                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--admin-primary)" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="var(--admin-primary)" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                                <XAxis 
                                  dataKey="name" 
                                  axisLine={false} 
                                  tickLine={false} 
                                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                                  dy={15}
                                />
                                <YAxis 
                                  axisLine={false} 
                                  tickLine={false} 
                                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                                />
                                <Tooltip 
                                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="var(--admin-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                       </div>

                       <div className="bg-white p-8 rounded-[24px] border border-[var(--admin-border)] shadow-sm flex flex-col">
                          <h3 className="font-serif text-xl font-bold text-[var(--admin-text-primary)] mb-8">Popular Categories</h3>
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
                          <button className="mt-10 w-full py-3.5 border border-[var(--admin-border)] rounded-xl text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)] hover:bg-[var(--admin-light)] transition-all flex items-center justify-center gap-2">
                             Full Analytics <ArrowUpRight size={14} />
                          </button>
                       </div>
                    </div>
                  </div>
                )}
                {tab === "orders" && (
                  <AdminOrdersTab 
                    orders={orders} 
                    loading={loading} 
                    onRefresh={fetchData} 
                    onUpdateStatus={async (id, status) => {
                      const res = await fetch('/api/admin/orders', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id, status })
                      });
                      if (res.ok) fetchData();
                    }}
                  />
                )}
                {tab === "products" && (
                  <AdminInventoryTab 
                    products={products} 
                    onEdit={(p) => {
                      setEditingProduct(p);
                      setIsProductModalOpen(true);
                    }} 
                    onDelete={handleProductDelete} 
                    onNew={() => {
                      setEditingProduct(null);
                      setIsProductModalOpen(true);
                    }}
                  />
                )}
                {tab === "customers" && <AdminCustomersTab customers={customers} />}
                {tab === "marketing" && <AdminMarketingTab />}
                {tab === "settings" && <AdminSettingsTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isProductModalOpen && (
          <ProductModal 
            isOpen={isProductModalOpen}
            onClose={() => {
              setIsProductModalOpen(false);
              setEditingProduct(null);
            }}
            product={editingProduct}
            onSave={handleProductSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
