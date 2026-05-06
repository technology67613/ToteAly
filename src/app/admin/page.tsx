"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  BarChart2, ShoppingBag, Users, Package, TrendingUp,
  PlusCircle, Search, ChevronDown, AlertCircle, Loader2,
  Image as ImageIcon, X, Check, ArrowUpRight, DollarSign,
  Camera, Link as LinkIcon, RefreshCcw, Sparkles, Trash2,
  LogOut, ExternalLink, Bell, Settings, Filter, Printer, CheckCircle
} from "lucide-react";

type Tab = "dashboard" | "orders" | "products" | "customers";

interface Product {
  id: string;
  _id?: string;
  title: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  description?: string;
  is_customizable?: boolean;
}

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  customizationDetails?: any;
  customization_details?: any;
}

interface Order {
  id: string;
  _id?: string;
  created_at: string;
  createdAt?: string;
  totalAmount: number;
  total_amount?: number;
  status: string;
  payment_status?: string;
  paymentId?: string;
  products?: OrderItem[];
  order_items?: OrderItem[];
  user?: { name?: string; email?: string };
  profiles?: { name?: string; email?: string };
  shippingDetails?: {
    name?: string;
    email?: string;
    address?: string;
    city?: string;
    pincode?: string;
    state?: string;
    phone?: string;
  };
}

interface Customer {
  id: string;
  _id?: string;
  name: string;
  email: string;
  created_at: string;
  createdAt?: string;
}

interface Stats {
  revenue: string;
  orders: number;
  products: number;
  customers: number;
  trend?: Record<string, number>;
  delta: {
    revenue: string;
    orders: string;
    products: string;
    customers: string;
  };
}

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: "",
    price: 0,
    category: "Plain Totes",
    description: "",
    stock: 50,
    images: ["/mockups/plain.png"],
    isCustomizable: true
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editUploading, setEditUploading] = useState(false);

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
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      } else {
        console.error("Stats fetch failed");
      }

      if (tab === "products") {
        const prodRes = await fetch("/api/admin/products");
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData);
        }
      }

      if (tab === "orders") {
        const ordRes = await fetch("/api/admin/orders");
        if (ordRes.ok) {
          const ordData = await ordRes.json();
          setOrders(ordData);
        }
      }

      if (tab === "customers") {
        const custRes = await fetch("/api/admin/customers");
        if (custRes.ok) {
          const custData = await custRes.json();
          setCustomers(custData);
        }
      }
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (id: string, status: string, payment_status?: string) => {
    setUpdatingOrderId(id);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, payment_status }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });
      if (res.ok) {
        setIsAddingProduct(false);
        setNewProduct({
          title: "",
          price: 0,
          category: "Plain Totes",
          description: "",
          stock: 50,
          images: ["/mockups/plain.png"],
          isCustomizable: true
        });
        fetchData();
      }
    } catch (error) {
      console.error("Failed to add product:", error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this iconic bag?")) return;
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingProduct.id || editingProduct._id,
          title: editingProduct.title,
          price: editingProduct.price,
          category: editingProduct.category,
          description: editingProduct.description,
          stock: editingProduct.stock,
          images: editingProduct.images,
          isCustomizable: editingProduct.is_customizable
        }),
      });
      if (res.ok) {
        setEditingProduct(null);
        fetchData();
      }
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  const handleEditFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;
    setEditUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setEditingProduct({ ...editingProduct, images: [data.url] });
    } catch (error) {
      console.error("Upload failed:", error);
    }
    setEditUploading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setNewProduct({ ...newProduct, images: [data.url] });
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
    setUploading(false);
  };

  const handleLogout = async () => {
    signOut({ callbackUrl: "/admin/login" });
  };

  if (status === "loading" || (loading && !stats)) {
    return (
      <div className="min-h-screen w-full bg-[#F8F9FA] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#900C3F]" />
      </div>
    );
  }

  return (
    <div className="flex w-full h-screen overflow-hidden">
      {/* Sidebar - Modern Dark Style */}
      <aside className="w-72 bg-[#1A1A1A] text-white flex flex-col shrink-0">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-[#900C3F] rounded-xl flex items-center justify-center font-serif font-bold text-xl shadow-lg shadow-[#900C3F]/40">T</div>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold tracking-tight">ToteAly</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Admin Suite</span>
            </div>
          </div>
          
          <nav className="flex flex-col gap-2">
            {[
              { id: "dashboard", icon: BarChart2, label: "Overview" },
              { id: "orders", icon: ShoppingBag, label: "Orders" },
              { id: "products", icon: Package, label: "Inventory" },
              { id: "customers", icon: Users, label: "Customers" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id as Tab)}
                className={`flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-bold transition-all ${
                  tab === item.id 
                    ? "bg-[#900C3F] text-white shadow-xl shadow-[#900C3F]/20 translate-x-1" 
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-white/5 flex flex-col gap-6">
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Store Status</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            </div>
            <p className="text-sm font-bold">Iconic Store Live</p>
            <a href="/" target="_blank" className="text-[10px] text-[#FF69B4] font-bold flex items-center gap-1 mt-1 hover:underline">
              Visit Site <ExternalLink size={10} />
            </a>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-5 py-3 text-white/40 hover:text-white transition-colors text-sm font-bold group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8F9FA] overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-20 bg-white border-b border-[#F5ECD7] flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-6 flex-1">
             <div className="relative max-w-md w-full">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#900C3F]/20" />
                <input 
                  type="text"
                  placeholder="Global search orders, users, bags..."
                  className="w-full pl-12 pr-4 py-2.5 bg-[#F8F9FA] border border-[#F5ECD7] rounded-xl text-sm focus:outline-none focus:border-[#FF69B4] transition-all"
                />
             </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative w-10 h-10 rounded-xl bg-[#F8F9FA] border border-[#F5ECD7] flex items-center justify-center text-[#900C3F]/60 hover:text-[#900C3F] transition-colors">
              <Bell size={18} />
              <div className="absolute top-2 right-2 w-2 h-2 bg-[#FF69B4] rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-px bg-[#F5ECD7]" />
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-[#F8F9FA] transition-colors cursor-pointer">
              <div className="text-right flex flex-col">
                <span className="text-xs font-bold">{session?.user?.name || "Store Admin"}</span>
                <span className="text-[10px] font-bold text-[#900C3F]/40 uppercase tracking-widest">
                  {(session?.user as any)?.role === 'admin' ? 'Store Admin' : 'Unauthorized'}
                </span>
              </div>
              {session?.user?.image ? (
                <img src={session.user.image} className="w-10 h-10 rounded-xl object-cover" alt="Profile" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-[#900C3F] text-white flex items-center justify-center font-bold">
                  {session?.user?.name?.[0] || "A"}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          
          {/* Header Section */}
          <div className="flex justify-between items-end mb-10">
            <div className="flex flex-col gap-1">
              <h1 className="font-serif text-4xl font-bold tracking-tight capitalize">
                {tab === "dashboard" ? "Command Center" : tab}
              </h1>
              <p className="text-sm text-[#900C3F]/40 font-medium">Manage your iconic tote brand and track growth.</p>
            </div>
            {tab === "products" && (
              <button 
                onClick={() => setIsAddingProduct(true)}
                className="flex items-center gap-2 px-6 py-3 bg-[#900C3F] text-white rounded-xl font-bold text-sm hover:bg-[#FF69B4] transition-all shadow-xl shadow-[#900C3F]/20 active:scale-95"
              >
                <PlusCircle size={18} /> New Product
              </button>
            )}
          </div>

          {/* ── OVERVIEW / DASHBOARD ── */}
          {tab === "dashboard" && stats && (
            <div className="flex flex-col gap-10">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                  { label: "Total Revenue", value: stats.revenue, icon: DollarSign, delta: stats.delta?.revenue || "+12%", color: "text-green-500", bg: "bg-green-50" },
                  { label: "Total Orders", value: stats.orders, icon: ShoppingBag, delta: stats.delta?.orders || "+5 today", color: "text-blue-500", bg: "bg-blue-50" },
                  { label: "Active Products", value: stats.products, icon: Package, delta: stats.delta?.products || "Synced", color: "text-[#FF69B4]", bg: "bg-pink-50" },
                  { label: "Registered Users", value: stats.customers, icon: Users, delta: stats.delta?.customers || "+2 new", color: "text-[#900C3F]", bg: "bg-[#900C3F]/5" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-3xl p-8 border border-[#F5ECD7] flex flex-col gap-6 relative overflow-hidden group hover:shadow-xl hover:shadow-[#900C3F]/5 transition-all">
                    <div className="flex justify-between items-start relative z-10">
                      <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center ${stat.color}`}>
                        <stat.icon size={24} />
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${stat.bg} ${stat.color}`}>
                        {stat.delta}
                      </span>
                    </div>
                    <div className="flex flex-col relative z-10">
                      <p className="text-xs font-bold text-[#900C3F]/40 uppercase tracking-widest">{stat.label}</p>
                      <p className="font-serif text-4xl font-bold mt-1 tracking-tight">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Trend Chart Placeholder / Simple Bar Visualization */}
              <div className="bg-white rounded-[40px] border border-[#F5ECD7] p-10 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-xl font-bold">Revenue Trend</h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 rounded-lg bg-[#900C3F]/5 text-[#900C3F] text-[10px] font-bold uppercase tracking-widest">Monthly</button>
                  </div>
                </div>

                <div className="h-[300px] w-full bg-[#F8F9FA] rounded-3xl p-8 flex items-end justify-between gap-4">
                  {stats.trend && Object.keys(stats.trend).length > 0 ? (
                    Object.entries(stats.trend).map(([month, amount]) => {
                      const max = Math.max(...Object.values(stats.trend!));
                      const height = (amount / max) * 100;
                      return (
                        <div key={month} className="flex-1 flex flex-col items-center gap-4 group">
                          <div className="w-full bg-[#900C3F]/10 rounded-t-xl relative overflow-hidden flex items-end" style={{ height: '100%' }}>
                             <div
                               className="w-full bg-[#900C3F] rounded-t-xl transition-all duration-1000 group-hover:bg-[#FF69B4]"
                               style={{ height: `${height}%` }}
                             />
                             <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full group-hover:translate-y-[-10px] opacity-0 group-hover:opacity-100 transition-all bg-[#1A1A1A] text-white text-[10px] px-2 py-1 rounded-md z-10 whitespace-nowrap">
                               ₹{amount.toLocaleString()}
                             </div>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#900C3F]/40">{month}</span>
                        </div>
                      )
                    })
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#900C3F]/20 gap-3">
                       <TrendingUp size={48} />
                       <p className="font-bold text-sm uppercase tracking-widest">No transaction data yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}


          {/* ── ORDERS ── */}
          {tab === "orders" && (
            <div className="bg-white rounded-[40px] border border-[#F5ECD7] overflow-hidden shadow-sm">
              <div className="p-8 border-b border-[#F5ECD7] flex justify-between items-center">
                <div className="flex gap-4">
                   <button className="flex items-center gap-2 px-4 py-2 bg-[#900C3F] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">All Orders</button>
                   <button className="flex items-center gap-2 px-4 py-2 hover:bg-[#F8F9FA] text-[#900C3F]/60 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors">Pending</button>
                </div>
                <button onClick={fetchData} className="text-[#900C3F]/40 hover:text-[#900C3F] transition-colors"><RefreshCcw size={16} className={loading ? "animate-spin" : ""} /></button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#F8F9FA] border-b border-[#F5ECD7]">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Order Ref</th>
                      <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Items</th>
                      <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Customer</th>
                      <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Revenue</th>
                      <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Status</th>
                      <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5ECD7]">
                    {orders.map((o) => {
                      const orderId = o.id || o._id || "unknown";
                      return (
                      <tr key={orderId} className="hover:bg-[#F8F9FA] transition-colors">
                        <td className="px-8 py-6">
                           <p className="font-mono text-xs font-bold text-[#900C3F]">#{orderId.toString().slice(-6).toUpperCase()}</p>
                           <p className="text-[10px] font-medium text-[#900C3F]/40 mt-1">{new Date(o.created_at || o.createdAt || "").toLocaleDateString()}</p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex -space-x-3 hover:-space-x-1 transition-all">
                             {(o.products || o.order_items || []).map((p: any, idx: number) => (
                                <div key={idx} className="w-10 h-10 rounded-xl border-2 border-white bg-[#F5ECD7] shadow-sm overflow-hidden flex items-center justify-center">
                                   {p.customization_details?.canvasData || p.customizationDetails?.canvasData ? <img src={p.customization_details?.canvasData || p.customizationDetails?.canvasData} className="w-full h-full object-cover" /> : <Package size={14} className="text-[#900C3F]/20" />}
                                </div>
                             ))}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <p className="text-sm font-bold">{o.user?.name || o.shippingDetails?.name || o.profiles?.name || "Guest Checkout"}</p>
                           <p className="text-[10px] font-medium text-[#900C3F]/40">{o.user?.email || o.shippingDetails?.email || o.profiles?.email || "No Email Provided"}</p>
                        </td>
                        <td className="px-8 py-6 font-bold text-sm">₹{o.totalAmount || o.total_amount}</td>
                        <td className="px-8 py-6">
                           <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                              o.status === 'Delivered' ? 'bg-green-50 text-green-600' :
                              o.status === 'Shipped' ? 'bg-blue-50 text-blue-600' :
                              o.status === 'Cancelled' ? 'bg-red-50 text-red-500' :
                              'bg-orange-50 text-orange-600'
                           }`}>
                              {o.status}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button onClick={() => setSelectedOrder(o)} className="text-[#900C3F]/60 hover:text-[#900C3F] transition-colors"><Search size={18} /></button>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── INVENTORY ── */}
          {tab === "products" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((p) => {
                const prodId = p.id || p._id || "prod";
                return (
                <div key={prodId} className="bg-white rounded-[32px] border border-[#F5ECD7] overflow-hidden group hover:shadow-2xl hover:shadow-[#900C3F]/5 transition-all">
                   <div className="aspect-[4/3] bg-[#F8F9FA] relative flex items-center justify-center overflow-hidden border-b border-[#F5ECD7]">
                      {p.images?.[0] ? <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /> : <ImageIcon size={40} className="text-[#900C3F]/10" />}
                       <div className="absolute top-4 left-4 flex gap-2">
                          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-bold uppercase tracking-widest border border-[#F5ECD7]">{p.category}</span>
                          {p.is_customizable && (
                             <span className="px-2 py-1 bg-[#900C3F] text-white rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                <Sparkles size={10} /> Custom
                             </span>
                          )}
                       </div>
                      <div className="absolute inset-0 bg-[#900C3F]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                         <button onClick={() => setEditingProduct(p)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#900C3F] hover:bg-[#FF69B4] hover:text-white transition-all"><Settings size={20} /></button>
                         <button onClick={() => handleDeleteProduct(prodId)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={20} /></button>
                      </div>
                   </div>
                   <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex flex-col">
                            <h3 className="font-serif text-lg font-bold leading-tight truncate max-w-[150px]">{p.title}</h3>
                            <p className="text-sm font-bold text-[#900C3F]/40">₹{p.price}</p>
                         </div>
                         <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${p.stock < 10 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                            {p.stock} In Stock
                         </div>
                      </div>
                      <div className="w-full bg-[#F8F9FA] h-2 rounded-full overflow-hidden">
                         <div className={`h-full ${p.stock < 10 ? 'bg-red-500' : 'bg-[#900C3F]'} transition-all`} style={{ width: `${Math.min(100, (p.stock / 100) * 100)}%` }} />
                      </div>
                   </div>
                </div>
              )})}
            </div>
          )}

          {/* ── CUSTOMERS ── */}
          {tab === "customers" && (
             <div className="bg-white rounded-[40px] border border-[#F5ECD7] overflow-hidden">
                <table className="w-full text-left">
                   <thead className="bg-[#F8F9FA] border-b border-[#F5ECD7]">
                      <tr>
                         <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Customer</th>
                         <th className="px-8 py-5 text-[10px) font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Contact Email</th>
                         <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Account Joined</th>
                         <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40 text-right">Activity</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-[#F5ECD7]">
                      {customers.map((c) => {
                         const customerId = c.id || c._id || "cust";
                         return (
                         <tr key={customerId} className="hover:bg-[#F8F9FA] transition-colors">
                            <td className="px-8 py-6 flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-[#F5ECD7] flex items-center justify-center font-bold text-sm">{c.name?.[0] || 'U'}</div>
                               <span className="font-bold">{c.name || "Anonymous User"}</span>
                            </td>
                            <td className="px-8 py-6 text-sm font-medium">{c.email}</td>
                            <td className="px-8 py-6 text-xs font-bold text-[#900C3F]/40 uppercase tracking-widest">{new Date(c.created_at || c.createdAt || "").toLocaleDateString()}</td>
                            <td className="px-8 py-6 text-right"><span className="px-2 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-bold uppercase border border-green-100">Verified</span></td>
                         </tr>
                      )})}
                   </tbody>
                </table>
             </div>
          )}

        </div>
      </main>

      {/* ── MODALS ── */}
      {isAddingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-[#1A1A1A]/80 backdrop-blur-xl" onClick={() => setIsAddingProduct(false)} />
            <div className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
               <div className="p-10 pb-6 flex justify-between items-center">
                <h2 className="font-serif text-3xl font-bold">Launch New Bag</h2>
                <button onClick={() => setIsAddingProduct(false)} className="w-12 h-12 rounded-2xl bg-[#F8F9FA] border border-[#F5ECD7] flex items-center justify-center hover:bg-[#900C3F] hover:text-white transition-all">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddProduct} className="p-10 pt-0 overflow-auto flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Product Title</label>
                    <input 
                      value={newProduct.title}
                      onChange={e => setNewProduct({...newProduct, title: e.target.value})}
                      placeholder="e.g. Classic Cream Tote" 
                      required
                      className="w-full px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-[#F5ECD7] focus:outline-none focus:border-[#FF69B4]" 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Category</label>
                    <select 
                      value={newProduct.category}
                      onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                      className="w-full px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-[#F5ECD7] focus:outline-none focus:border-[#FF69B4]"
                    >
                      <option>Plain Totes</option>
                      <option>Custom Totes</option>
                      <option>Premium Collection</option>
                      <option>Gift Hampers</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Price (INR)</label>
                    <input 
                      type="number"
                      value={newProduct.price}
                      onChange={e => setNewProduct({...newProduct, price: parseInt(e.target.value)})}
                      placeholder="499" 
                      required
                      className="w-full px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-[#F5ECD7] focus:outline-none focus:border-[#FF69B4]" 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Stock Quantity</label>
                    <input 
                      type="number"
                      value={newProduct.stock}
                      onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})}
                      placeholder="50" 
                      className="w-full px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-[#F5ECD7] focus:outline-none focus:border-[#FF69B4]" 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Description</label>
                  <textarea 
                    value={newProduct.description}
                    onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                    placeholder="Describe the bag's magic..." 
                    rows={3}
                    className="w-full px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-[#F5ECD7] focus:outline-none focus:border-[#FF69B4] resize-none" 
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Gallery</label>
                  <div className="grid grid-cols-5 gap-3">
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-[#F5ECD7] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#FF69B4] hover:bg-[#FF69B4]/5 transition-all overflow-hidden relative">
                      {uploading ? <Loader2 className="w-6 h-6 animate-spin text-[#FF69B4]" /> : <PlusCircle size={20} className="text-[#900C3F]/20" />}
                      <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                    </label>
                    {newProduct.images.map((img, i) => (
                      <div key={i} className="aspect-square rounded-2xl border border-[#F5ECD7] overflow-hidden relative shadow-sm">
                        <img src={img} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-[#F8F9FA] p-5 rounded-2xl border border-[#F5ECD7]">
                  <input 
                    type="checkbox"
                    id="isCustomizable"
                    checked={newProduct.isCustomizable}
                    onChange={e => setNewProduct({...newProduct, isCustomizable: e.target.checked})}
                    className="w-5 h-5 accent-[#900C3F] cursor-pointer"
                  />
                  <label htmlFor="isCustomizable" className="text-sm font-bold text-[#900C3F] cursor-pointer">
                    Enable Personalization / Custom Design for this Bag
                  </label>
                </div>
                <button type="submit" className="w-full py-5 bg-[#900C3F] text-white rounded-[32px] font-bold text-lg hover:bg-[#FF69B4] transition-all shadow-2xl shadow-[#900C3F]/30">Authorize & Save Product</button>
              </form>
            </div>
          </div>
      )}

      {selectedOrder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 print:p-0">
            <div className="absolute inset-0 bg-[#1A1A1A]/80 backdrop-blur-xl print:hidden" onClick={() => setSelectedOrder(null)} />
            <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:w-full print:h-auto print:static print:shadow-none print:rounded-none print-container">
               {/* Controls - Hidden in Print */}
               <div className="p-4 border-b border-[#F5ECD7] flex justify-between items-center bg-[#F8F9FA] print:hidden">
                  <div className="flex items-center gap-2 text-[#900C3F] font-bold">
                    <Printer size={18} />
                    <span className="text-xs uppercase tracking-widest">Tax Invoice Preview</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => window.print()}
                      className="px-6 py-2 bg-[#900C3F] text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#FF69B4] transition-all"
                    >
                      Print Invoice
                    </button>
                    <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 rounded-lg bg-white border border-[#F5ECD7] flex items-center justify-center hover:bg-red-50 text-red-500 transition-all">
                      <X size={16} />
                    </button>
                  </div>
               </div>

               {/* ACTUAL INVOICE CONTENT - Optimized for Print */}
               <div className="p-10 overflow-auto bg-white print:overflow-visible print:p-0">
                  <div className="border-2 border-black p-0 flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b-2 border-black flex flex-col items-center text-center">
                      <h1 className="text-5xl font-bold uppercase tracking-tight text-black mb-2">Tax Invoice</h1>
                      <div className="mt-4">
                        <p className="text-2xl font-bold text-black uppercase">{process.env.NEXT_PUBLIC_STORE_NAME || "Tote-ally Iconic"}</p>
                      </div>
                    </div>

                    {/* Metadata Bar */}
                    <div className="grid grid-cols-2 border-b-2 border-black bg-gray-50 print:bg-gray-50">
                      <div className="p-3 border-r-2 border-black">
                        <p className="text-sm"><span className="font-bold">INVOICE NO. :</span> #ORD-{(selectedOrder.id || selectedOrder._id || "").slice(-6).toUpperCase()}</p>
                      </div>
                      <div className="p-3 text-right">
                        <p className="text-sm"><span className="font-bold">Invoice Date:</span> {new Date(selectedOrder.created_at || Date.now()).toLocaleDateString('en-IN')}</p>
                        <p className="text-sm"><span className="font-bold">Payment Method:</span> {selectedOrder.paymentId === 'MANUAL_UPI' ? 'Manual UPI' : (selectedOrder.paymentId || 'Online')}</p>
                      </div>
                    </div>

                    {/* Bill To / Ship To */}
                    <div className="grid grid-cols-2 border-b-2 border-black">
                      <div className="p-4 border-r-2 border-black">
                        <h3 className="font-bold text-sm uppercase mb-2 bg-gray-100 p-1 px-2 border-b border-black">BILL TO</h3>
                        <div className="text-sm space-y-0.5">
                          <p className="font-bold text-base">{selectedOrder.shippingDetails?.name || selectedOrder.user?.name || selectedOrder.profiles?.name || "Customer"}</p>
                          <p>{selectedOrder.shippingDetails?.address || "Address not provided"}</p>
                          <p>{selectedOrder.shippingDetails?.city} {selectedOrder.shippingDetails?.pincode ? `- ${selectedOrder.shippingDetails.pincode}` : ""}</p>
                          <p>{selectedOrder.shippingDetails?.state}</p>
                          <p className="mt-1 font-medium">Email: {selectedOrder.shippingDetails?.email || selectedOrder.user?.email || selectedOrder.profiles?.email}</p>
                          <p>Phone: {selectedOrder.shippingDetails?.phone || "N/A"}</p>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-sm uppercase mb-2 bg-gray-100 p-1 px-2 border-b border-black">SHIP TO</h3>
                        <div className="text-sm space-y-0.5">
                          <p className="font-bold text-base">{selectedOrder.shippingDetails?.name || selectedOrder.user?.name || selectedOrder.profiles?.name || "Customer"}</p>
                          <p>{selectedOrder.shippingDetails?.address || "Address not provided"}</p>
                          <p>{selectedOrder.shippingDetails?.city} {selectedOrder.shippingDetails?.pincode ? `- ${selectedOrder.shippingDetails.pincode}` : ""}</p>
                          <p>{selectedOrder.shippingDetails?.state}</p>
                        </div>
                      </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full text-left border-collapse border-b-2 border-black">
                      <thead>
                        <tr className="bg-gray-800 text-white print:bg-black">
                          <th className="p-3 border-r-2 border-white text-xs font-bold uppercase text-center w-16">SN</th>
                          <th className="p-3 border-r-2 border-white text-xs font-bold uppercase">DESCRIPTION</th>
                          <th className="p-3 border-r-2 border-white text-xs font-bold uppercase text-center w-20">QTY</th>
                          <th className="p-3 border-r-2 border-white text-xs font-bold uppercase text-right w-32">UNIT PRICE</th>
                          <th className="p-3 text-xs font-bold uppercase text-right w-32">TOTAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedOrder.products || selectedOrder.order_items || []).map((item: any, i: number) => (
                          <tr key={i} className="border-b border-gray-300 min-h-[40px]">
                            <td className="p-3 border-r-2 border-black text-center text-sm">{i + 1}</td>
                            <td className="p-3 border-r-2 border-black text-sm">
                              <p className="font-bold">{item.name || "Tote Bag"}</p>
                              {item.is_customized && <p className="text-[10px] text-pink-600 font-bold italic">Custom Design Applied</p>}
                            </td>
                            <td className="p-3 border-r-2 border-black text-center text-sm">{item.quantity}</td>
                            <td className="p-3 border-r-2 border-black text-right text-sm">₹{(item.price || 0).toLocaleString('en-IN')}.00</td>
                            <td className="p-3 text-right text-sm font-bold">₹{((item.price || 0) * (item.quantity || 0)).toLocaleString('en-IN')}.00</td>
                          </tr>
                        ))}
                        {/* Fill remaining space to match Vyapar aesthetic */}
                        {[...Array(Math.max(0, 8 - (selectedOrder.products || selectedOrder.order_items || []).length))].map((_, i) => (
                          <tr key={`empty-${i}`} className="h-10 border-b border-gray-100">
                            <td className="border-r-2 border-black"></td>
                            <td className="border-r-2 border-black"></td>
                            <td className="border-r-2 border-black"></td>
                            <td className="border-r-2 border-black"></td>
                            <td></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Summary Footer */}
                    <div className="grid grid-cols-2">
                      <div className="flex flex-col border-r-2 border-black">
                        <div className="p-4 border-b border-black flex-1 min-h-[100px]">
                          <h4 className="font-bold text-[10px] uppercase mb-1 underline">Terms & Instructions</h4>
                          <p className="text-[10px] leading-tight opacity-75">1. No returns on customized iconic totes. 2. Payment verification required for UPI orders. 3. Standard delivery within 5-7 business days.</p>
                        </div>
                        <div className="p-4 bg-gray-50 flex flex-col justify-between h-40">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-tight">Payment Status: {selectedOrder.payment_status?.toUpperCase() || "PAID"}</p>
                            <p className="text-[10px] opacity-60">ID: {selectedOrder.paymentId || "N/A"}</p>
                          </div>
                          <div className="mt-8 border-t border-black pt-2 text-center">
                            <p className="text-[10px] font-bold uppercase">Authorized Seal & Signature</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className="divide-y border-black">
                          <div className="flex justify-between p-2.5 px-4 text-sm">
                            <span className="font-medium text-gray-500">SUBTOTAL</span>
                            <span className="font-bold">₹{(selectedOrder.total_amount || selectedOrder.totalAmount || 0).toLocaleString('en-IN')}.00</span>
                          </div>
                          <div className="flex justify-between p-2.5 px-4 text-sm bg-gray-50 font-bold border-y border-black">
                            <span>TOTAL ITEMS</span>
                            <span>{(selectedOrder.products || selectedOrder.order_items || []).reduce((acc: number, item: any) => acc + (item.quantity || 0), 0)}</span>
                          </div>
                        </div>
                        <div className="mt-auto border-t-2 border-black">
                           <div className="flex justify-between p-4 px-5 bg-yellow-50 print:bg-yellow-50 items-center">
                             <div className="flex flex-col">
                               <span className="font-bold text-xs text-[#900C3F] uppercase tracking-wider">Grand Total</span>
                               <span className="text-[10px] opacity-40 italic text-black">Net Amount Payable</span>
                             </div>
                             <span className="font-bold text-3xl text-black">₹{(selectedOrder.total_amount || selectedOrder.totalAmount || 0).toLocaleString('en-IN')}.00</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-between items-center text-[9px] opacity-30 font-medium">
                    <p>System Generated Tax Invoice | Tote-ally Iconic Command Center</p>
                    <p>Verified Secure Transaction</p>
                  </div>

                  {selectedOrder.paymentId === "MANUAL_UPI" && selectedOrder.payment_status === 'Pending' && (
                    <div className="mt-8 print:hidden">
                      <button 
                        onClick={() => {
                          updateOrderStatus((selectedOrder.id || selectedOrder._id)!, 'Confirmed', 'Paid');
                          setSelectedOrder({...selectedOrder, payment_status: 'Paid', status: 'Confirmed'});
                        }}
                        className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest transition-all shadow-xl shadow-green-500/20 flex items-center justify-center gap-3"
                      >
                        <CheckCircle size={18} /> Approve Payment & Issue Invoice
                      </button>
                    </div>
                  )}
               </div>
            </div>
          </div>
      )}

      {/* ── EDIT PRODUCT MODAL ── */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-[#1A1A1A]/80 backdrop-blur-xl" onClick={() => setEditingProduct(null)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-10 pb-6 flex justify-between items-center">
              <h2 className="font-serif text-3xl font-bold">Edit Bag</h2>
              <button onClick={() => setEditingProduct(null)} className="w-12 h-12 rounded-2xl bg-[#F8F9FA] border border-[#F5ECD7] flex items-center justify-center hover:bg-[#900C3F] hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateProduct} className="p-10 pt-0 overflow-auto flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Product Title</label>
                  <input
                    value={editingProduct.title}
                    onChange={e => setEditingProduct({...editingProduct, title: e.target.value})}
                    required
                    className="w-full px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-[#F5ECD7] focus:outline-none focus:border-[#FF69B4]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-[#F5ECD7] focus:outline-none focus:border-[#FF69B4]"
                  >
                    <option>Plain Totes</option>
                    <option>Custom Totes</option>
                    <option>Premium Collection</option>
                    <option>Gift Hampers</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Price (INR)</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={e => setEditingProduct({...editingProduct, price: parseInt(e.target.value)})}
                    required
                    className="w-full px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-[#F5ECD7] focus:outline-none focus:border-[#FF69B4]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Stock Quantity</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})}
                    className="w-full px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-[#F5ECD7] focus:outline-none focus:border-[#FF69B4]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Description</label>
                <textarea
                  value={editingProduct.description || ""}
                  onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                  rows={3}
                  className="w-full px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-[#F5ECD7] focus:outline-none focus:border-[#FF69B4] resize-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Gallery</label>
                <div className="grid grid-cols-5 gap-3">
                  <label className="aspect-square rounded-2xl border-2 border-dashed border-[#F5ECD7] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#FF69B4] hover:bg-[#FF69B4]/5 transition-all overflow-hidden relative">
                    {editUploading ? <Loader2 className="w-6 h-6 animate-spin text-[#FF69B4]" /> : <PlusCircle size={20} className="text-[#900C3F]/20" />}
                    <input type="file" className="hidden" onChange={handleEditFileUpload} accept="image/*" />
                  </label>
                  {editingProduct.images?.map((img, i) => (
                    <div key={i} className="aspect-square rounded-2xl border border-[#F5ECD7] overflow-hidden relative shadow-sm">
                      <img src={img} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#F8F9FA] p-5 rounded-2xl border border-[#F5ECD7]">
                <input
                  type="checkbox"
                  id="editIsCustomizable"
                  checked={editingProduct.is_customizable || false}
                  onChange={e => setEditingProduct({...editingProduct, is_customizable: e.target.checked})}
                  className="w-5 h-5 accent-[#900C3F] cursor-pointer"
                />
                <label htmlFor="editIsCustomizable" className="text-sm font-bold text-[#900C3F] cursor-pointer">
                  Enable Personalization / Custom Design for this Bag
                </label>
              </div>

              <button type="submit" className="w-full py-5 bg-[#900C3F] text-white rounded-[32px] font-bold text-lg hover:bg-[#FF69B4] transition-all shadow-2xl shadow-[#900C3F]/30">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
