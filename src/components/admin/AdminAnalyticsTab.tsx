import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, DollarSign, ShoppingBag, Users, Calendar, ArrowUpRight, ArrowDownRight, Target, ShieldCheck, Rocket, Package, ChevronDown 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const COLORS = ['#8B1A4A', '#1A1A1A', '#C0A080', '#FF69B4', '#E2E8F0'];

export const AdminAnalyticsTab = ({ 
  startDate, 
  endDate, 
  setStartDate, 
  setEndDate 
}: { 
  startDate: string, 
  endDate: string, 
  setStartDate: (d: string) => void, 
  setEndDate: (d: string) => void 
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [customersLimit, setCustomersLimit] = useState(5);
  const [productsLimit, setProductsLimit] = useState(5);
  const [customerSort, setCustomerSort] = useState<'value' | 'repeated' | 'volume'>('value');
  const [productSort, setProductSort] = useState<'qty' | 'revenue'>('qty');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isProductSortOpen, setIsProductSortOpen] = useState(false);
  const [geoMode, setGeoMode] = useState<'city' | 'state'>('city');
  const [isGeoOpen, setIsGeoOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<'today' | 'week' | 'year' | 'till_date' | 'custom'>('till_date');
  const [isRangeOpen, setIsRangeOpen] = useState(false);

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
    
    const today = new Date().toISOString().split('T')[0];
    let start = today;

    if (range === 'today') start = today;
    else if (range === 'week') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      start = d.toISOString().split('T')[0];
    } else if (range === 'year') {
      const d = new Date();
      d.setFullYear(d.getFullYear() - 1);
      start = d.toISOString().split('T')[0];
    } else if (range === 'till_date') {
      start = '2024-01-01'; // Project start
    }

    if (range !== 'custom') {
      setStartDate(start);
      setEndDate(today);
    }
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/stats?from=${startDate}&to=${endDate}`);
        if (res.ok) setData(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [startDate, endDate]);

  if (loading) return <div className="p-20 text-center animate-pulse text-[var(--admin-text-muted)] font-bold text-xs uppercase tracking-widest">Crunching Cloud Intelligence...</div>;

  const trendData = Object.entries(data?.trend || {}).map(([name, revenue]) => ({ name, revenue }));
  const categoryData = data?.categories || [];

  const sortOptions = [
    { id: 'value', label: 'Value wise' },
    { id: 'repeated', label: 'Repeated order wise' },
    { id: 'volume', label: 'No of order wise' },
  ];

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col xl:flex-row justify-between xl:items-center bg-white p-8 rounded-[32px] border border-[var(--admin-border)] shadow-[0_2px_12px_rgba(0,0,0,0.04)] gap-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[var(--admin-text-primary)]">Business Intelligence</h2>
          <p className="text-[11px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mt-1">Deep analytics and revenue trajectory forecasting</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
           {/* Smart Range Selector */}
           <div className="relative">
              <button
                onClick={() => setIsRangeOpen(!isRangeOpen)}
                className="flex items-center gap-3 bg-[var(--admin-light)] border border-[var(--admin-border)] rounded-2xl px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-primary)] shadow-sm hover:border-[var(--admin-primary)] transition-all min-w-[140px] justify-between group"
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
                      className="absolute left-0 mt-3 w-full min-w-[180px] bg-white border border-[var(--admin-border)] rounded-2xl shadow-2xl z-50 overflow-hidden py-2"
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

           {/* Conditional Date Pickers (only shown if 'custom' is selected) */}
           <AnimatePresence>
              {selectedRange === 'custom' && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2 p-1 bg-[var(--admin-light)] border border-[var(--admin-border)] rounded-2xl shadow-sm h-[50px]"
                >
                   <div className="flex items-center gap-2 px-4 py-2 hover:bg-white rounded-xl transition-all cursor-pointer">
                      <span className="text-[9px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">From</span>
                      <input 
                       type="date" 
                       value={startDate} 
                       onChange={(e) => setStartDate(e.target.value)}
                       className="bg-transparent text-[10px] font-bold text-[var(--admin-text-primary)] focus:outline-none cursor-pointer"
                      />
                   </div>
                   <div className="w-px h-6 bg-[var(--admin-border)]" />
                   <div className="flex items-center gap-2 px-4 py-2 hover:bg-white rounded-xl transition-all cursor-pointer">
                      <span className="text-[9px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">To</span>
                      <input 
                       type="date" 
                       value={endDate} 
                       onChange={(e) => setEndDate(e.target.value)}
                       className="bg-transparent text-[10px] font-bold text-[var(--admin-text-primary)] focus:outline-none cursor-pointer"
                      />
                   </div>
                </motion.div>
              )}
           </AnimatePresence>

           <button 
              onClick={() => {
                const filename = `ToteAly_Intelligence_Report_${new Date().toISOString().split('T')[0]}.pdf`;
                window.open(`/api/admin/export/${filename}?from=${startDate}&to=${endDate}`, '_blank');
              }}
              className="px-6 py-3 bg-[var(--admin-primary)] text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-[var(--admin-primary)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all h-[50px]"
            >
              Download Report
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white p-8 rounded-[32px] border border-[var(--admin-border)] shadow-sm">
            <h3 className="text-lg font-serif font-bold text-[var(--admin-text-primary)] mb-8">Revenue Trajectory</h3>
            <div className="h-[300px]">
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
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="var(--admin-primary)" strokeWidth={4} fill="url(#colorRevenue)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-white p-8 rounded-[32px] border border-[var(--admin-border)] shadow-sm">
            <h3 className="text-lg font-serif font-bold text-[var(--admin-text-primary)] mb-8">Sales by Category</h3>
            <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--admin-light)" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: 'var(--admin-text-muted)'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: 'var(--admin-text-muted)'}} />
                    <Tooltip />
                    <Bar dataKey="val" fill="var(--admin-primary)" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         {[
            { label: 'Avg Order Value', value: data?.avgOrderValue || '₹0', icon: Target, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Customer LTV', value: data?.customerLTV || '₹0', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: 'Repeat Rate', value: data?.repeatRate || '0%', icon: TrendingUp, color: 'text-rose-500', bg: 'bg-rose-50' },
            { label: 'Avg Items/Order', value: data?.avgItemsPerOrder || '0', icon: ShoppingBag, color: 'text-amber-500', bg: 'bg-amber-50' },
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
            </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         {/* Top Customers */}
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] p-8 border border-[var(--admin-border)] shadow-sm"
         >
            <div className="flex justify-between items-start mb-8">
               <div>
                  <h3 className="font-serif text-xl font-bold text-[var(--admin-text-primary)]">Top Customers</h3>
                  <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mt-1">Community ranking and loyalty</p>
               </div>
               <div className="relative">
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="flex items-center gap-3 bg-white border border-[var(--admin-border)] rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-primary)] shadow-sm hover:border-[var(--admin-primary)] transition-all min-w-[160px] justify-between group"
                  >
                    <span>{sortOptions.find(o => o.id === customerSort)?.label}</span>
                    <ChevronDown className={`transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''} text-[var(--admin-text-muted)] group-hover:text-[var(--admin-primary)]`} size={14} />
                  </button>
                  
                  <AnimatePresence>
                    {isSortOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-full bg-white border border-[var(--admin-border)] rounded-2xl shadow-xl z-50 overflow-hidden py-2"
                        >
                          {sortOptions.map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => {
                                setCustomerSort(opt.id as any);
                                setIsSortOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${
                                customerSort === opt.id 
                                  ? 'bg-[var(--admin-light)] text-[var(--admin-primary)]' 
                                  : 'text-[var(--admin-text-muted)] hover:bg-[var(--admin-light)]/50 hover:text-[var(--admin-text-primary)]'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
               </div>
            </div>

            <div className="space-y-4">
               {(() => {
                  const filtered = (data?.topCustomers || [])
                     .filter((c: any) => customerSort === 'repeated' ? c.orders > 1 : true)
                     .sort((a: any, b: any) => {
                        if (customerSort === 'value') return b.total - a.total;
                        return b.orders - a.orders;
                     });

                  if (filtered.length === 0) {
                     return (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                           <div className="w-16 h-16 bg-[var(--admin-light)] rounded-2xl flex items-center justify-center text-[var(--admin-text-muted)] mb-4">
                              <Users size={32} opacity={0.2} />
                           </div>
                           <p className="text-sm font-serif font-bold text-[var(--admin-text-primary)]">No customers found</p>
                           <p className="text-[10px] text-[var(--admin-text-muted)] mt-1 font-bold uppercase tracking-widest max-w-[200px]">
                              {customerSort === 'repeated' 
                                 ? "No repeat buyers detected in this period." 
                                 : "No purchase data available for the selected range."}
                           </p>
                        </div>
                     );
                  }

                  return filtered.slice(0, customersLimit).map((customer: any, i: number) => (
                     <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-[var(--admin-light)]/50 transition-all group">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-full bg-[var(--admin-light)] flex items-center justify-center text-[var(--admin-primary)] font-serif font-bold text-lg border border-[var(--admin-border)]">
                              {customer.name?.charAt(0) || 'G'}
                           </div>
                           <div className="min-w-0">
                              <p className="text-xs font-bold text-[var(--admin-text-primary)] truncate">{customer.name}</p>
                              <p className="text-[10px] text-[var(--admin-text-muted)] font-bold truncate">{customer.email}</p>
                           </div>
                        </div>
                        <div className="text-right shrink-0">
                           <p className="text-xs font-bold text-[var(--admin-primary)]">₹{Number(customer.total).toLocaleString('en-IN')}</p>
                           <p className="text-[9px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">{customer.orders} Orders</p>
                        </div>
                     </div>
                  ));
               })()}

               {((data?.topCustomers || []).filter((c: any) => customerSort === 'repeated' ? c.orders > 1 : true).length > customersLimit) && (
                  <button 
                     onClick={() => setCustomersLimit(prev => prev + 10)}
                     className="w-full py-4 text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest hover:text-[var(--admin-primary)] transition-all border-t border-dashed border-[var(--admin-border)] mt-4 flex items-center justify-center gap-2 group"
                  >
                     <span>Load More</span>
                     <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
               )}
            </div>
         </motion.div>

         {/* Top Products */}
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] p-8 border border-[var(--admin-border)] shadow-sm"
         >
            <div className="flex justify-between items-start mb-8">
               <div>
                  <h3 className="font-serif text-xl font-bold text-[var(--admin-text-primary)]">Top Products</h3>
                  <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mt-1">Best sellers by volume & value</p>
               </div>
               <div className="relative">
                  <button
                    onClick={() => setIsProductSortOpen(!isProductSortOpen)}
                    className="flex items-center gap-3 bg-white border border-[var(--admin-border)] rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-primary)] shadow-sm hover:border-[var(--admin-primary)] transition-all min-w-[140px] justify-between group"
                  >
                    <span>{productSort === 'qty' ? 'Quantity Wise' : 'Revenue Wise'}</span>
                    <ChevronDown className={`transition-transform duration-300 ${isProductSortOpen ? 'rotate-180' : ''} text-[var(--admin-text-muted)] group-hover:text-[var(--admin-primary)]`} size={14} />
                  </button>
                  
                  <AnimatePresence>
                    {isProductSortOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsProductSortOpen(false)} />
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-full bg-white border border-[var(--admin-border)] rounded-2xl shadow-xl z-50 overflow-hidden py-2"
                        >
                          {[
                            { id: 'qty', label: 'Quantity Wise' },
                            { id: 'revenue', label: 'Revenue Wise' },
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => {
                                setProductSort(opt.id as any);
                                setIsProductSortOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${
                                productSort === opt.id 
                                  ? 'bg-[var(--admin-light)] text-[var(--admin-primary)]' 
                                  : 'text-[var(--admin-text-muted)] hover:bg-[var(--admin-light)]/50 hover:text-[var(--admin-text-primary)]'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
               </div>
            </div>

            <div className="space-y-4">
               {(() => {
                  const sorted = [...(data?.topProducts || [])].sort((a: any, b: any) => {
                     if (productSort === 'revenue') return b.revenue - a.revenue;
                     return b.qty - a.qty;
                  });

                  return sorted.slice(0, productsLimit).map((product: any, i: number) => (
                     <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-[var(--admin-light)]/50 transition-all group">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-[var(--admin-light)]/30 border border-transparent group-hover:bg-white group-hover:border-[var(--admin-border)] text-[var(--admin-primary)] flex items-center justify-center transition-all">
                              <Package size={22} />
                           </div>
                           <div className="min-w-0">
                              <p className="text-xs font-bold text-[var(--admin-text-primary)] truncate">{product.name}</p>
                              <p className="text-[10px] text-[var(--admin-text-muted)] font-bold mt-0.5">₹{Number(product.revenue).toLocaleString('en-IN')}</p>
                           </div>
                        </div>
                        <div className="text-right shrink-0">
                           <p className="text-sm font-serif font-bold text-[var(--admin-text-primary)]">{product.qty}</p>
                           <p className="text-[8px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">Units Sold</p>
                        </div>
                     </div>
                  ));
               })()}

               {(data?.topProducts || []).length > productsLimit && (
                  <button 
                     onClick={() => setProductsLimit(prev => prev + 5)}
                     className="w-full py-4 text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest hover:text-[var(--admin-primary)] transition-all border-t border-dashed border-[var(--admin-border)] mt-4 flex items-center justify-center gap-2 group"
                  >
                     <span>Load More</span>
                     <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
               )}
            </div>
         </motion.div>
      </div>

      {/* City Wise Distribution */}
      <div className="mt-10">
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] p-8 border border-[var(--admin-border)] shadow-sm"
         >
            <div className="flex flex-col lg:flex-row gap-10">
               <div className="lg:w-1/3">
                  <div className="flex justify-between items-start mb-8">
                     <div>
                        <h3 className="font-serif text-xl font-bold text-[var(--admin-text-primary)]">
                           {geoMode === 'city' ? 'City Wise' : 'State Wise'}
                        </h3>
                        <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mt-1">Geographic community spread</p>
                     </div>
                     <div className="relative">
                        <button
                          onClick={() => setIsGeoOpen(!isGeoOpen)}
                          className="flex items-center gap-3 bg-white border border-[var(--admin-border)] rounded-xl px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-[var(--admin-text-primary)] shadow-sm hover:border-[var(--admin-primary)] transition-all min-w-[120px] justify-between group"
                        >
                          <span>{geoMode === 'city' ? 'City Wise' : 'State Wise'}</span>
                          <ChevronDown className={`transition-transform duration-300 ${isGeoOpen ? 'rotate-180' : ''} text-[var(--admin-text-muted)] group-hover:text-[var(--admin-primary)]`} size={12} />
                        </button>
                        
                        <AnimatePresence>
                          {isGeoOpen && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setIsGeoOpen(false)} />
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute right-0 mt-2 w-full bg-white border border-[var(--admin-border)] rounded-2xl shadow-xl z-50 overflow-hidden py-1"
                              >
                                {[
                                  { id: 'city', label: 'City Wise' },
                                  { id: 'state', label: 'State Wise' },
                                ].map((opt) => (
                                  <button
                                    key={opt.id}
                                    onClick={() => {
                                      setGeoMode(opt.id as any);
                                      setIsGeoOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest transition-all ${
                                      geoMode === opt.id 
                                        ? 'bg-[var(--admin-light)] text-[var(--admin-primary)]' 
                                        : 'text-[var(--admin-text-muted)] hover:bg-[var(--admin-light)]/50 hover:text-[var(--admin-text-primary)]'
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 overflow-y-auto custom-scrollbar pr-2 max-h-[400px]">
                     {((geoMode === 'city' ? data?.cities : data?.states) || []).map((item: any, i: number) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--admin-light)]/30 hover:bg-white hover:border-[var(--admin-border)] border border-transparent transition-all group">
                           <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                           <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-bold text-[var(--admin-text-primary)] uppercase tracking-widest truncate">{item.label}</p>
                              <div className="w-full bg-black/5 h-1 rounded-full mt-2 overflow-hidden">
                                 <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(item.val / (data?.customers || 1)) * 100}%` }}
                                    className="h-full" 
                                    style={{ backgroundColor: COLORS[i % COLORS.length] }} 
                                 />
                              </div>
                           </div>
                           <span className="text-xs font-serif font-bold text-[var(--admin-text-primary)]">{item.val}</span>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="lg:w-2/3 h-[500px] relative bg-[var(--admin-light)]/20 rounded-[24px] border border-[var(--admin-border)] overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 p-10">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie
                              data={(geoMode === 'city' ? data?.cities : data?.states) || []}
                              innerRadius={100}
                              outerRadius={160}
                              paddingAngle={8}
                              dataKey="val"
                              nameKey="label"
                              stroke="none"
                           >
                              {((geoMode === 'city' ? data?.cities : data?.states) || []).map((entry: any, index: number) => (
                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                           </Pie>
                           <Tooltip 
                              contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '16px 24px' }}
                              itemStyle={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                           />
                        </PieChart>
                     </ResponsiveContainer>
                  </div>
                  
                  {/* Center Content */}
                  <div className="absolute flex flex-col items-center justify-center text-center">
                     <Users className="text-[var(--admin-primary)] mb-2" size={32} />
                     <p className="text-2xl font-serif font-bold text-[var(--admin-text-primary)]">{data?.customers}</p>
                     <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">Total Community</p>
                  </div>
               </div>
            </div>
         </motion.div>
      </div>

    </div>
  );
};
