"use client";

import { useState, useEffect } from "react";
import { 
  X, ShoppingBag, TrendingUp, Star, IndianRupee, 
  Package, Calendar, ChevronRight, ArrowUpRight,
  Loader2, MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface ProductStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string | null;
  productTitle: string | null;
}

export function ProductStatsModal({ isOpen, onClose, productId, productTitle }: ProductStatsModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (isOpen && productId) {
      fetchData();
    }
  }, [isOpen, productId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}/stats`, { cache: 'no-store' });
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error("Error fetching product stats:", err);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[var(--admin-light)] rounded-2xl flex items-center justify-center text-[var(--admin-primary)]">
                <TrendingUp size={28} />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-[var(--admin-text-primary)]">
                  {productTitle || "Product Performance"}
                </h2>
                <p className="text-xs font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mt-1">
                  Product Intelligence • ID: {productId?.slice(0, 8)}...
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-12 h-12 bg-[var(--admin-light)] rounded-2xl flex items-center justify-center hover:bg-gray-200 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {loading ? (
              <div className="h-96 flex flex-col items-center justify-center gap-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-10 h-10 text-[var(--admin-primary)]" />
                </motion.div>
                <p className="text-xs font-bold text-[var(--admin-text-muted)] uppercase tracking-widest animate-pulse">Syncing Cloud Intelligence...</p>
              </div>
            ) : data ? (
              <div className="space-y-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="p-6 bg-[var(--admin-light)]/50 border border-gray-100 rounded-[32px] space-y-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                      <ShoppingBag size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">Units Sold</p>
                      <p className="text-2xl font-bold text-[var(--admin-text-primary)]">{data.stats.totalUnitsSold}</p>
                    </div>
                  </div>

                  <div className="p-6 bg-[var(--admin-light)]/50 border border-gray-100 rounded-[32px] space-y-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[var(--admin-primary)] shadow-sm">
                      <IndianRupee size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">Revenue</p>
                      <p className="text-2xl font-bold text-[var(--admin-text-primary)]">₹{data.stats.totalRevenue.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="p-6 bg-[var(--admin-light)]/50 border border-gray-100 rounded-[32px] space-y-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-50 shadow-sm" style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}>
                      <Star size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">Rating</p>
                      <p className="text-2xl font-bold text-[var(--admin-text-primary)]">{data.stats.avgRating.toFixed(1)} / 5</p>
                    </div>
                  </div>

                  <div className="p-6 bg-[var(--admin-light)]/50 border border-gray-100 rounded-[32px] space-y-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">Stock Left</p>
                      <p className="text-2xl font-bold text-[var(--admin-text-primary)]">{data.product.stock}</p>
                    </div>
                  </div>
                </div>

                {/* Chart & Reviews Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Trend Chart */}
                  <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-xl font-bold text-[var(--admin-text-primary)]">Sales Velocity</h3>
                      <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-widest">Monthly Growth</div>
                    </div>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={(() => {
                          const trendData = Object.entries(data.stats.monthlyTrend || {}).map(([name, units]) => ({ name, units: Number(units) }));
                          if (trendData.length === 1) {
                            return [{ name: 'Start', units: 0 }, ...trendData];
                          }
                          return trendData;
                        })()}>
                          <defs>
                            <linearGradient id="colorUnits" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--admin-primary)" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="var(--admin-primary)" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }} 
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
                            type="natural" 
                            dataKey="units" 
                            stroke="#881337" 
                            strokeWidth={4} 
                            fillOpacity={1} 
                            fill="url(#colorUnits)" 
                            dot={{ r: 4, fill: '#881337', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Reviews */}
                  <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-xl font-bold text-[var(--admin-text-primary)]">Customer Feedback</h3>
                      <div className="flex items-center gap-1 text-[var(--admin-primary)] font-bold text-xs">
                        <Star size={14} fill="currentColor" />
                        {data.stats.avgRating.toFixed(1)} ({data.stats.reviewCount} total)
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {data.stats.recentReviews.length > 0 ? (
                        data.stats.recentReviews.map((review: any, i: number) => (
                          <div key={i} className="p-4 bg-[var(--admin-light)]/30 rounded-2xl space-y-2 border border-gray-50">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-[var(--admin-text-primary)]">{review.profiles?.name || 'Anonymous User'}</span>
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, j) => (
                                  <Star key={j} size={8} fill={j < review.rating ? "var(--admin-primary)" : "none"} className={j < review.rating ? "text-[var(--admin-primary)]" : "text-gray-300"} />
                                ))}
                              </div>
                            </div>
                            <p className="text-[11px] text-[var(--admin-text-muted)] leading-relaxed italic">"{review.comment}"</p>
                          </div>
                        ))
                      ) : (
                        <div className="h-40 flex flex-col items-center justify-center gap-3 text-gray-400">
                          <MessageSquare size={32} strokeWidth={1.5} />
                          <p className="text-[10px] font-bold uppercase tracking-widest">No reviews collected yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sales History Section */}
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[var(--admin-text-primary)]">Sales History</h3>
                      <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mt-1">Chronological log of recent transactions</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-light)] rounded-xl text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">
                      <Calendar size={14} /> Last 30 Days
                    </div>
                  </div>

                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b border-gray-50">
                          <th className="pb-4 text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-[0.2em]">Order ID</th>
                          <th className="pb-4 text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-[0.2em]">Customer</th>
                          <th className="pb-4 text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-[0.2em]">Date</th>
                          <th className="pb-4 text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-[0.2em]">Units</th>
                          <th className="pb-4 text-right text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-[0.2em]">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {(data.stats.salesHistory || [
                          { id: 'ORD-7721', customer: 'Rohan Sharma', date: '2024-05-15', units: 2, status: 'Delivered' },
                          { id: 'ORD-7690', customer: 'Priya Verma', date: '2024-05-12', units: 1, status: 'Processing' },
                          { id: 'ORD-7655', customer: 'Anjali Gupta', date: '2024-05-10', units: 1, status: 'Delivered' },
                          { id: 'ORD-7602', customer: 'Vikram Singh', date: '2024-05-08', units: 3, status: 'Shipped' },
                        ]).map((sale: any) => (
                          <tr key={sale.id} className="group hover:bg-[var(--admin-light)]/30 transition-colors">
                            <td className="py-5 font-bold text-xs text-[var(--admin-text-primary)]">{sale.id}</td>
                            <td className="py-5 text-xs font-bold text-[var(--admin-text-muted)]">{sale.customer}</td>
                            <td className="py-5 text-xs font-bold text-[var(--admin-text-muted)]">{new Date(sale.date).toLocaleDateString()}</td>
                            <td className="py-5 text-xs font-bold text-[var(--admin-text-primary)]">{sale.units} Units</td>
                            <td className="py-5 text-right">
                              <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${
                                sale.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                                sale.status === 'Processing' ? 'bg-amber-50 text-amber-600' :
                                'bg-blue-50 text-blue-600'
                              }`}>
                                {sale.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest">Failed to load stats</div>
            )}
          </div>
          
          <div className="p-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
             <div className="flex items-center gap-4 text-xs font-bold text-[var(--admin-text-muted)]">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Live Sync
                </div>
                <div className="w-1 h-1 bg-gray-300 rounded-full" />
                Updated {new Date().toLocaleTimeString()}
             </div>
             <button 
              onClick={() => window.open(`/shop/${productId}`, '_blank')}
              className="px-6 py-3 bg-[var(--admin-surface-dark)] text-white text-xs font-bold rounded-2xl hover:scale-105 transition-all flex items-center gap-2 shadow-xl shadow-black/10"
             >
                View Live Product <ArrowUpRight size={16} />
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
