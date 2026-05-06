import React from 'react';
import { DollarSign, ShoppingBag, Package, Users, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

interface Stats {
  revenue: string;
  orders: number;
  products: number;
  customers: number;
  delta: {
    revenue: string;
    orders: string;
    products: string;
    customers: string;
  };
}

export const AdminStatsGrid = ({ stats }: { stats: Stats }) => {
  const statItems = [
    { 
      label: "TOTAL REVENUE", 
      value: stats.revenue, 
      icon: DollarSign, 
      delta: stats.delta?.revenue || "+0%", 
      type: "revenue" 
    },
    { 
      label: "TOTAL ORDERS", 
      value: stats.orders, 
      icon: ShoppingBag, 
      delta: stats.delta?.orders || "Live", 
      type: "orders" 
    },
    { 
      label: "ACTIVE PRODUCTS", 
      value: stats.products, 
      icon: Package, 
      delta: stats.delta?.products || "Synced", 
      type: "products" 
    },
    { 
      label: "REGISTERED USERS", 
      value: stats.customers, 
      icon: Users, 
      delta: stats.delta?.customers || "Active", 
      type: "customers" 
    },
  ];

  const getDeltaColor = (delta: string) => {
    if (delta.startsWith('+') && delta !== '+0%') return "bg-emerald-50 text-emerald-600";
    if (delta.startsWith('-')) return "bg-rose-50 text-rose-600";
    return "bg-slate-50 text-slate-500";
  };

  const getDeltaIcon = (delta: string) => {
    if (delta.startsWith('+') && delta !== '+0%') return <TrendingUp size={12} />;
    if (delta.startsWith('-')) return <TrendingDown size={12} />;
    return <Minus size={12} />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {statItems.map((stat, idx) => (
        <motion.div 
          key={stat.label} 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1, duration: 0.4, ease: "easeOut" }}
          className="bg-white rounded-[16px] p-8 border border-[var(--admin-border)] shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex flex-col gap-6 relative overflow-hidden group hover:shadow-xl transition-all"
        >
          <div className="flex justify-between items-start relative z-10">
            <div className="w-12 h-12 bg-[var(--admin-light)] rounded-xl flex items-center justify-center text-[var(--admin-primary)]">
              <stat.icon size={24} />
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg ${getDeltaColor(stat.delta)}`}>
              {getDeltaIcon(stat.delta)}
              {stat.delta}
            </div>
          </div>
          <div className="flex flex-col relative z-10">
            <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-[0.2em]">{stat.label}</p>
            <p className="font-serif text-[36px] font-bold mt-1 tracking-tight text-[var(--admin-text-primary)]">
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </p>
          </div>
          
          {/* Subtle Background Pattern */}
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-[var(--admin-primary)] group-hover:scale-110 transition-transform duration-700">
            <stat.icon size={120} />
          </div>
        </motion.div>
      ))}
    </div>
  );
};
