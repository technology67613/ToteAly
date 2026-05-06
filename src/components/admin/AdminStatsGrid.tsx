import React from 'react';
import { DollarSign, ShoppingBag, Package, Users } from "lucide-react";

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
    { label: "Total Revenue", value: stats.revenue, icon: DollarSign, delta: stats.delta?.revenue || "+12%", color: "text-green-500", bg: "bg-green-50" },
    { label: "Total Orders", value: stats.orders, icon: ShoppingBag, delta: stats.delta?.orders || "+5 today", color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Active Products", value: stats.products, icon: Package, delta: stats.delta?.products || "Synced", color: "text-[#FF69B4]", bg: "bg-pink-50" },
    { label: "Registered Users", value: stats.customers, icon: Users, delta: stats.delta?.customers || "+2 new", color: "text-[#900C3F]", bg: "bg-[#900C3F]/5" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {statItems.map((stat) => (
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
  );
};
