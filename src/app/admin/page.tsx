"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  BarChart2, ShoppingBag, Users, Package, TrendingUp,
  Search, Loader2, LogOut, Bell, Settings, Ticket, Megaphone,
  LayoutDashboard, Menu, X, ArrowUpRight, ChevronRight, ChevronDown, Globe, Calendar, Mail, Star,
  Plus, Zap, Download, IndianRupee, History, CreditCard, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
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
import { AdminDesignsTab } from "@/components/admin/AdminDesignsTab";
import { AdminActivityFeed } from "@/components/admin/AdminActivityFeed";
import { ProductModal } from "@/components/admin/ProductModal";
import { ProductStatsModal } from "@/components/admin/ProductStatsModal";

type Tab = "dashboard" | "analytics" | "orders" | "products" | "customers" | "inquiries" | "marketing" | "reviews" | "settings";

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
  const [viewingProduct, setViewingProduct] = useState<any>(null);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<'today' | 'week' | 'year' | 'till_date' | 'custom'>('till_date');
  const [isRangeOpen, setIsRangeOpen] = useState(false);
  
  // Global Date Range
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState(today);

  const ranges = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'Week' },
    { id: 'year', label: 'Year' },
    { id: 'till_date', label: 'Till Date' },
    { id: 'custom', label: 'Custom' },
  ];

  const handleRangeChange = (range: any) => {
    setSelectedRange(range);
    setIsRangeOpen(false);
    
    const todayStr = new Date().toISOString().split('T')[0];
    let start = todayStr;

    if (range === 'today') start = todayStr;
    else if (range === 'week') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      start = d.toISOString().split('T')[0];
    } else if (range === 'year') {
      const d = new Date();
      d.setFullYear(d.getFullYear() - 1);
      start = d.toISOString().split('T')[0];
    } else if (range === 'till_date') {
      start = '2024-01-01';
    }

    if (range !== 'custom') {
      setStartDate(start);
      setEndDate(todayStr);
    }
  };

  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const statsRes = await fetch(`/api/admin/stats?range=${selectedRange}&from=${startDate}&to=${endDate}`, { 
        cache: 'no-store',
        signal: controller.signal 
      });
      
      if (statsRes.ok) {
        setStats(await statsRes.json());
      } else if (statsRes.status !== 503) {
        toast.error("Failed to sync metrics");
      }

      if (tab === "products") {
        const res = await fetch("/api/admin/products", { cache: 'no-store', signal: controller.signal });
        if (res.ok) setProducts(await res.json());
      }
      if (tab === "orders") {
        const res = await fetch(`/api/admin/orders?from=${startDate}&to=${endDate}`, { cache: 'no-store', signal: controller.signal });
        if (res.ok) setOrders(await res.json());
      }
      if (tab === "customers") {
        const res = await fetch("/api/admin/customers", { cache: 'no-store', signal: controller.signal });
        if (res.ok) setCustomers(await res.json());
      }
      
      const notifRes = await fetch("/api/admin/notifications", { cache: 'no-store', signal: controller.signal });
      if (notifRes.ok) {
        const data = await notifRes.json();
        setNotifications(data);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Fetch Error:", error);
        toast.error("Network synchronization failed");
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };



  useEffect(() => {
    // Session redirects disabled for open development
  }, []);

  useEffect(() => {
    fetchData();
    // Poll notifications every 60 seconds
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/notifications", { cache: 'no-store' });
        if (res.ok) setNotifications(await res.json());
      } catch (err) {
        console.error("Notification Poll Error:", err);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [tab, selectedRange, startDate, endDate]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Update Status Error:", error);
    }
  };

  const handleLogout = () => signOut({ callbackUrl: "/admin/login" });

  const handleExport = (type: string) => {
    const date = new Date().toISOString().split('T')[0];
    const filename = `ToteAly_${type}_Report_${date}.csv`;
    window.open(`/api/admin/export/${filename}`, '_blank');
  };

  if (status === "loading" || (loading && !stats)) {
    return (
      <div className="min-h-screen w-full bg-[var(--admin-background)] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
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
  ];

  return (
    <div className="flex w-full h-screen overflow-hidden bg-[var(--admin-background)]">
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[var(--admin-surface-dark)] text-white flex flex-col shrink-0 transition-all duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
          <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide pr-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setTab(item.id as Tab);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${tab === item.id ? 'bg-white/10 text-white shadow-xl shadow-black/20 ring-1 ring-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className={tab === item.id ? 'text-[var(--admin-primary)]' : 'group-hover:text-white transition-colors'} />
                  <span className="text-[11px] font-bold tracking-wide">{item.label}</span>
                </div>
                {item.badge > 0 && <span className="px-1.5 py-0.5 bg-rose-500 text-white text-[8px] font-bold rounded-full">{item.badge}</span>}
              </button>
            ))}
          </nav>
          <div className="pt-6 border-t border-white/5 mt-auto space-y-1">
            <button
              onClick={() => {
                setTab("settings");
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${tab === "settings" ? 'bg-white/10 text-white shadow-xl shadow-black/20 ring-1 ring-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              <Settings size={18} className={tab === "settings" ? 'text-[var(--admin-primary)]' : 'group-hover:text-white transition-colors'} />
              <span className="text-[11px] font-bold tracking-wide">Settings</span>
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-white/40 hover:text-rose-400 hover:bg-rose-500/5 rounded-xl transition-all font-bold text-[11px]">
              <LogOut size={18} /> Logout Account
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 md:h-20 bg-white border-b border-[var(--admin-border)] flex items-center justify-between px-4 md:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4 md:gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--admin-light)]/50"><Menu size={20} /></button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[8px] md:text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Cloud Live</span>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative w-10 h-10 flex items-center justify-center rounded-xl border border-[var(--admin-border)] hover:bg-[var(--admin-light)] transition-all"
              >
                <Bell size={20} />
                {notifications.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsNotificationsOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-80 md:w-96 bg-white border border-[var(--admin-border)] rounded-[32px] shadow-2xl z-20 overflow-hidden"
                    >
                      <div className="p-6 border-b border-[var(--admin-border)] bg-[var(--admin-light)]/30 flex justify-between items-center">
                        <h3 className="font-serif text-lg font-bold">Priority Alerts</h3>
                        <span className="px-3 py-1 bg-white rounded-lg text-[10px] font-bold uppercase tracking-widest text-[var(--admin-primary)] shadow-sm">{notifications.length} Active</span>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.map((n) => (
                          <div 
                            key={n.id} 
                            className="p-5 border-b border-[var(--admin-border)] last:border-0 hover:bg-[var(--admin-light)]/20 transition-all cursor-pointer group relative"
                          >
                            <div className="flex gap-4" onClick={async () => {
                              if (n.type === 'inquiry') setTab('inquiries');
                              else if (n.type === 'order' || n.type === 'payment') setTab('orders');
                              else if (n.type === 'stock') setTab('products');
                              setIsNotificationsOpen(false);
                              // Mark as read in DB
                              setNotifications(prev => prev.filter(x => x.id !== n.id));
                              fetch(`/api/admin/notifications?id=${n.id}`, { method: 'PATCH' });
                            }}>
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                n.type === 'stock' ? 'bg-amber-50 text-amber-600' :
                                n.type === 'payment' ? 'bg-rose-50 text-rose-500' :
                                n.type === 'inquiry' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                              }`}>
                                {n.type === 'stock' ? <AlertTriangle size={18} /> : 
                                 n.type === 'payment' ? <CreditCard size={18} /> :
                                 n.type === 'inquiry' ? <Mail size={18} /> : <ShoppingBag size={18} />}
                              </div>
                              <div className="flex-1 pr-6">
                                <div className="flex justify-between items-start">
                                  <p className="text-xs font-bold text-[var(--admin-text-primary)]">{n.title}</p>
                                  <span className="text-[9px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">{new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-[11px] text-[var(--admin-text-muted)] mt-1 line-clamp-1">{n.message}</p>
                              </div>
                            </div>
                            <button 
                              onClick={async (e) => {
                                e.stopPropagation();
                                setNotifications(prev => prev.filter(x => x.id !== n.id));
                                fetch(`/api/admin/notifications?id=${n.id}`, { method: 'PATCH' });
                              }}
                              className="absolute top-5 right-4 p-1 text-[var(--admin-text-muted)] hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                        {notifications.length === 0 && (
                          <div className="p-10 text-center flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-[var(--admin-light)] rounded-full flex items-center justify-center text-[var(--admin-text-muted)]">
                              <Bell size={24} />
                            </div>
                            <p className="text-xs font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">All caught up!</p>
                          </div>
                        )}
                      </div>
                      {notifications.length > 0 && (
                         <div className="p-4 bg-[var(--admin-light)]/10 text-center border-t border-[var(--admin-border)]">
                            <button 
                              onClick={async () => {
                                setNotifications([]);
                                fetch('/api/admin/notifications?all=true', { method: 'PATCH' });
                                setIsNotificationsOpen(false);
                              }}
                              className="text-[10px] font-bold text-[var(--admin-primary)] uppercase tracking-widest hover:underline"
                            >
                              Mark all as seen
                            </button>
                         </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-3 p-1 bg-[var(--admin-light)]/30 border border-[var(--admin-border)] rounded-2xl">
               <div className="text-right hidden sm:flex flex-col"><span className="text-xs font-bold text-[var(--admin-text-primary)]">Admin</span><span className="text-[8px] font-bold text-[var(--admin-primary)] uppercase tracking-widest">Iconic</span></div>
               <div className="w-8 h-8 rounded-xl bg-[var(--admin-surface-dark)] text-white flex items-center justify-center font-serif text-xs font-bold">A</div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                {tab === "dashboard" && (
                  <div className="space-y-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h1 className="font-serif text-3xl font-bold text-[var(--admin-text-primary)] tracking-tight">Executive Dashboard</h1>
                        <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mt-1">Platform-wide overview and pulse check</p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4">
                        {/* Range Selector */}
                        <div className="relative">
                          <button
                            onClick={() => setIsRangeOpen(!isRangeOpen)}
                            className="flex items-center gap-3 bg-white border border-[var(--admin-border)] rounded-2xl px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-primary)] shadow-sm hover:border-[var(--admin-primary)] transition-all min-w-[140px] justify-between group"
                          >
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-[var(--admin-primary)]" />
                              <span>{ranges.find(r => r.id === selectedRange)?.label}</span>
                            </div>
                            <ChevronDown className={`transition-transform duration-300 ${isRangeOpen ? 'rotate-180' : ''} text-[var(--admin-text-muted)] group-hover:text-[var(--admin-primary)]`} size={14} />
                          </button>
                          
                          <AnimatePresence>
                            {isRangeOpen && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsRangeOpen(false)} />
                                <motion.div 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 10 }}
                                  className="absolute right-0 mt-3 w-full min-w-[180px] bg-white border border-[var(--admin-border)] rounded-2xl shadow-2xl z-50 overflow-hidden py-2"
                                >
                                  {ranges.map((range) => (
                                    <button
                                      key={range.id}
                                      onClick={() => handleRangeChange(range.id)}
                                      className={`w-full text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
                                        selectedRange === range.id 
                                          ? 'bg-[var(--admin-light)] text-[var(--admin-primary)]' 
                                          : 'text-[var(--admin-text-muted)] hover:bg-[var(--admin-light)]/50 hover:text-[var(--admin-text-primary)]'
                                      }`}
                                    >
                                      {range.label}
                                    </button>
                                  ))}
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Custom Date Pickers */}
                        {selectedRange === 'custom' && (
                          <div className="flex items-center gap-2 p-1 bg-white border border-[var(--admin-border)] rounded-2xl shadow-sm h-[50px]">
                            <div className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--admin-light)] rounded-xl transition-all">
                               <span className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">From</span>
                               <input 
                                type="date" 
                                value={startDate} 
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent text-xs font-bold text-[var(--admin-text-primary)] focus:outline-none"
                               />
                            </div>
                            <div className="w-px h-8 bg-[var(--admin-border)]" />
                            <div className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--admin-light)] rounded-xl transition-all">
                               <span className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">To</span>
                               <input 
                                type="date" 
                                value={endDate} 
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-transparent text-xs font-bold text-[var(--admin-text-primary)] focus:outline-none"
                               />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                       <button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} className="p-6 bg-white border border-[var(--admin-border)] rounded-3xl hover:shadow-xl transition-all group flex flex-col gap-4 text-left">
                          <div className="w-12 h-12 bg-[var(--admin-light)] rounded-2xl flex items-center justify-center text-[var(--admin-primary)] group-hover:bg-[var(--admin-primary)] group-hover:text-white transition-all"><Plus size={24} /></div>
                          <div><p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">Inventory</p><p className="text-sm font-bold text-[var(--admin-text-primary)]">Add Product</p></div>
                       </button>
                       <button onClick={() => setTab("marketing")} className="p-6 bg-white border border-[var(--admin-border)] rounded-3xl hover:shadow-xl transition-all group flex flex-col gap-4 text-left">
                          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all"><Zap size={24} /></div>
                          <div><p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">Growth</p><p className="text-sm font-bold text-[var(--admin-text-primary)]">New Campaign</p></div>
                       </button>
                       <button onClick={() => setTab("inquiries")} className="p-6 bg-white border border-[var(--admin-border)] rounded-3xl hover:shadow-xl transition-all group flex flex-col gap-4 text-left">
                          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-all"><Mail size={24} /></div>
                          <div><p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">Support</p><p className="text-sm font-bold text-[var(--admin-text-primary)]">Check Leads</p></div>
                       </button>
                         <button onClick={() => {
                            const date = new Date().toISOString().split('T')[0];
                            const filename = `ToteAly_Sales_Report_${date}.csv`;
                            window.open(`/api/admin/export/${filename}?from=${startDate}&to=${endDate}`, '_blank');
                         }} className="p-6 bg-white border border-[var(--admin-border)] rounded-3xl hover:shadow-xl transition-all group flex flex-col gap-4 text-left">
                          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all"><Download size={24} /></div>
                          <div><p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">Intelligence</p><p className="text-sm font-bold text-[var(--admin-text-primary)]">Export CSV</p></div>
                       </button>
                    </div>

                    <AdminStatsGrid stats={stats} />
                  </div>
                )}
                { tab === "analytics" && <AdminAnalyticsTab startDate={startDate} endDate={endDate} setStartDate={setStartDate} setEndDate={setEndDate} /> }
                { tab === "orders" && <AdminOrdersTab orders={orders} loading={loading} onRefresh={fetchData} onUpdateStatus={handleUpdateStatus} /> }
                {tab === "products" && (
                  <AdminInventoryTab
                    products={products}
                    onEdit={(p) => { setEditingProduct(p); setIsProductModalOpen(true); }}
                    onDelete={async (id: string) => {
                      const toastId = toast.loading("Deleting product...");
                      try {
                        const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
                        if (res.ok) { toast.success("Product deleted", { id: toastId }); fetchData(); }
                        else { const e = await res.json(); toast.error(e.error || "Delete failed", { id: toastId }); }
                      } catch { toast.error("Unexpected error", { id: toastId }); }
                    }}
                    onView={(p) => { setViewingProduct(p); setIsStatsModalOpen(true); }}
                    onNew={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                  />
                )}

                { tab === "customers" && <AdminCustomersTab customers={customers} /> }
                { tab === "inquiries" && <AdminInquiriesTab /> }
                { tab === "marketing" && <AdminMarketingTab /> }
                { tab === "reviews" && <AdminReviewsTab /> }
                { tab === "settings" && <AdminSettingsTab /> }

              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
        product={editingProduct}
        onDelete={async (id: string) => {
          const toastId = toast.loading("Deleting product...");
          try {
            const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
            if (res.ok) { 
              toast.success("Product deleted", { id: toastId }); 
              setIsProductModalOpen(false);
              setEditingProduct(null);
              fetchData(); 
            }
            else { const e = await res.json(); toast.error(e.error || "Delete failed", { id: toastId }); }
          } catch { toast.error("Unexpected error", { id: toastId }); }
        }}
        onSave={async (formData: any) => {
          const url = "/api/admin/products";
          const method = editingProduct ? "PATCH" : "POST";
          const payload = editingProduct ? { ...formData, id: editingProduct.id } : formData;
          const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
          if (res.ok) { setIsProductModalOpen(false); setEditingProduct(null); fetchData(); }
        }}
      />
      <ProductStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => { setIsStatsModalOpen(false); setViewingProduct(null); }}
        productId={viewingProduct?.id || viewingProduct?._id}
        productTitle={viewingProduct?.title}
      />
    </div>
  );
}

