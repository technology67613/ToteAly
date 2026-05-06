"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  BarChart2, ShoppingBag, Users, Package, TrendingUp,
  PlusCircle, Search, Loader2, LogOut, ExternalLink, Bell, X, Printer, Settings, Ticket, Megaphone
} from "lucide-react";

// Modular Components
import { AdminStatsGrid } from "@/components/admin/AdminStatsGrid";
import { AdminOrdersTab } from "@/components/admin/AdminOrdersTab";
import { AdminInventoryTab } from "@/components/admin/AdminInventoryTab";
import { AdminCustomersTab } from "@/components/admin/AdminCustomersTab";
import { AdminMarketingTab } from "@/components/admin/AdminMarketingTab";
import { AdminSettingsTab } from "@/components/admin/AdminSettingsTab";

type Tab = "dashboard" | "orders" | "products" | "customers" | "marketing" | "settings";

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: "",
    price: 0,
    category: "Plain Totes",
    description: "",
    stock: 50,
    images: ["/mockups/plain.png"],
    isCustomizable: true
  });

  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any>(null);

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
      <div className="min-h-screen w-full bg-[#F8F9FA] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#900C3F]" />
      </div>
    );
  }

  return (
    <div className="flex w-full h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-[#1A1A1A] text-white flex flex-col shrink-0">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-[#900C3F] rounded-xl flex items-center justify-center font-serif font-bold text-xl">T</div>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold tracking-tight">ToteAly</span>
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Cloud Admin</span>
            </div>
          </div>
          <nav className="flex flex-col gap-2">
            {[
              { id: "dashboard", icon: BarChart2, label: "Overview" },
              { id: "orders", icon: ShoppingBag, label: "Orders" },
              { id: "products", icon: Package, label: "Inventory" },
              { id: "customers", icon: Users, label: "Customers" },
              { id: "marketing", icon: Megaphone, label: "Marketing" },
              { id: "settings", icon: Settings, label: "Settings" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id as Tab)}
                className={`flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-bold transition-all ${
                  tab === item.id 
                    ? "bg-[#900C3F] text-white shadow-xl translate-x-1" 
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon size={18} /> {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-8">
           <button onClick={handleLogout} className="flex items-center gap-3 text-white/40 hover:text-white transition-colors text-sm font-bold">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-[#F8F9FA] overflow-hidden">
        <header className="h-20 bg-white border-b border-[#F5ECD7] flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-6 flex-1">
             <div className="relative max-w-md w-full">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#900C3F]/20" />
                <input type="text" placeholder="Search iconic assets..." className="w-full pl-12 pr-4 py-2.5 bg-[#F8F9FA] border border-[#F5ECD7] rounded-xl text-sm focus:outline-none" />
             </div>
          </div>
          <div className="flex items-center gap-6">
            <Bell size={18} className="text-[#900C3F]/60" />
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold">{session?.user?.name}</span>
              <div className="w-10 h-10 rounded-xl bg-[#900C3F] text-white flex items-center justify-center font-bold">
                {session?.user?.name?.[0]}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          <div className="flex justify-between items-end mb-10">
            <h1 className="font-serif text-4xl font-bold tracking-tight capitalize">{tab}</h1>
            {tab === "products" && (
              <button onClick={() => setIsAddingProduct(true)} className="px-6 py-3 bg-[#900C3F] text-white rounded-xl font-bold text-sm hover:bg-[#FF69B4] transition-all">
                <PlusCircle size={18} className="inline mr-2" /> New Product
              </button>
            )}
          </div>

          {tab === "dashboard" && stats && <AdminStatsGrid stats={stats} />}
          {tab === "orders" && <AdminOrdersTab orders={orders} loading={loading} onRefresh={fetchData} />}
          {tab === "products" && <AdminInventoryTab products={products} onEdit={setEditingProduct} onDelete={() => {}} />}
          {tab === "customers" && <AdminCustomersTab customers={customers} />}
          {tab === "marketing" && <AdminMarketingTab />}
          {tab === "settings" && <AdminSettingsTab />}
        </div>
      </main>

    </div>
  );
}
