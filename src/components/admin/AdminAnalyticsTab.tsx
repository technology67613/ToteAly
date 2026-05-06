import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Users, Calendar, ArrowUpRight, ArrowDownRight, Target, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const COLORS = ['#8B1A4A', '#1A1A1A', '#C0A080', '#FF69B4', '#E2E8F0'];

export const AdminAnalyticsTab = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) setData(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-20 text-center animate-pulse text-[var(--admin-text-muted)] font-bold text-xs uppercase tracking-widest">Crunching Cloud Intelligence...</div>;

  const trendData = Object.entries(data?.trend || {}).map(([name, revenue]) => ({ name, revenue }));
  const categoryData = data?.categories || [
    { label: 'Plain Totes', val: 65 },
    { label: 'Black Edition', val: 45 },
    { label: 'Premium Canvas', val: 30 },
    { label: 'Custom Prints', val: 85 },
  ];

  return (
    <div className="space-y-10 pb-20">
      <div className="flex justify-between items-center bg-white p-8 rounded-[16px] border border-[var(--admin-border)] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[var(--admin-text-primary)]">Business Intelligence</h2>
          <p className="text-[11px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mt-1">Deep analytics and revenue trajectory forecasting</p>
        </div>
        <div className="flex gap-4">
           <button className="px-6 py-2.5 bg-[var(--admin-light)] text-[var(--admin-text-primary)] rounded-xl text-[10px] font-bold uppercase tracking-widest border border-[var(--admin-border)]">Last 30 Days</button>
           <button className="px-6 py-2.5 bg-[var(--admin-primary)] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-[var(--admin-primary)]/20">Download Report</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-[var(--admin-border)] shadow-sm">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-lg font-serif font-bold text-[var(--admin-text-primary)]">Revenue Trajectory</h3>
               <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
                  <ArrowUpRight size={14} /> +12.5% vs Last Period
               </div>
            </div>
            <div className="h-[350px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--admin-primary)" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="var(--admin-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--admin-light)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: 'var(--admin-text-muted)'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: 'var(--admin-text-muted)'}} />
                    <Tooltip 
                      contentStyle={{backgroundColor: 'var(--admin-surface-dark)', borderRadius: '16px', border: 'none', color: 'white'}}
                      itemStyle={{color: 'white', fontSize: '12px', fontWeight: 'bold'}}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="var(--admin-primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-white p-8 rounded-[32px] border border-[var(--admin-border)] shadow-sm flex flex-col">
            <h3 className="text-lg font-serif font-bold text-[var(--admin-text-primary)] mb-8">Collection Distribution</h3>
            <div className="flex-1 h-[250px]">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="val"
                    >
                      {categoryData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-6">
               {categoryData.map((cat: any, i: number) => (
                  <div key={cat.label} className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                        <span className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">{cat.label}</span>
                     </div>
                     <span className="text-[10px] font-bold text-[var(--admin-text-primary)]">{cat.val}%</span>
                  </div>
               ))}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         {[
            { label: 'Avg Order Value', value: '₹1,240', icon: Target, trend: '+5.2%', color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Customer LTV', value: '₹4,850', icon: Users, trend: '+8.1%', color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: 'Conversion Rate', value: '3.42%', icon: TrendingUp, trend: '-0.4%', color: 'text-rose-500', bg: 'bg-rose-50' },
            { label: 'Retention Rate', value: '28%', icon: Target, trend: '+1.2%', color: 'text-amber-500', bg: 'bg-amber-50' },
         ].map((stat, i) => (
            <motion.div 
               key={stat.label}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="bg-white p-8 rounded-[32px] border border-[var(--admin-border)] shadow-sm space-y-4"
            >
               <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                  <stat.icon size={24} />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-bold text-[var(--admin-text-primary)] mt-1">{stat.value}</p>
               </div>
               <div className={`text-[10px] font-bold uppercase tracking-widest ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {stat.trend} vs last month
               </div>
            </motion.div>
         ))}
      </div>

      <div className="bg-white p-8 rounded-[32px] border border-[var(--admin-border)] shadow-sm">
         <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-serif text-3xl font-bold text-[var(--admin-text-primary)]">Cloud Infrastructure Health</h3>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
               <ShieldCheck size={14} /> All Systems Operational
            </span>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
               { label: 'Database Latency', value: '14ms', status: 'Optimal', color: 'text-emerald-500' },
               { label: 'Storage Availability', value: '99.98%', status: 'Active', color: 'text-emerald-500' },
               { label: 'Cloud Function Execution', value: '0.4s', status: 'Fast', color: 'text-emerald-500' },
            ].map((sys, i) => (
               <div key={sys.label} className="p-6 bg-[var(--admin-light)]/50 rounded-[24px] border border-[var(--admin-border)] flex items-center justify-between">
                  <div>
                     <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">{sys.label}</p>
                     <p className="text-xl font-bold text-[var(--admin-text-primary)] mt-1">{sys.value}</p>
                  </div>
                  <div className="text-right">
                     <span className={`text-[10px] font-bold uppercase tracking-widest ${sys.color}`}>{sys.status}</span>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};
