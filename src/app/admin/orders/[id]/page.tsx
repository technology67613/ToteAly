"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Package, Truck, CheckCircle2, Clock, 
  MapPin, User, Mail, Phone, IndianRupee, Printer, 
  ChevronRight, CreditCard, ExternalLink, MessageSquare,
  Eye, X, Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showScreenshot, setShowScreenshot] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/admin/orders?id=${id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[var(--admin-background)] flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
        <Package className="w-10 h-10 text-[var(--admin-primary)]" />
      </motion.div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-[var(--admin-background)] flex flex-col items-center justify-center gap-4">
      <p className="font-serif text-2xl font-bold">Order not found</p>
      <button onClick={() => router.back()} className="text-[var(--admin-primary)] font-bold uppercase tracking-widest text-xs">Return to Dashboard</button>
    </div>
  );

  const steps = [
    { label: 'Pending', icon: Clock, date: order.created_at, active: true },
    { label: 'Processing', icon: Package, date: null, active: order.status !== 'pending' },
    { label: 'Shipped', icon: Truck, date: null, active: ['shipped', 'delivered'].includes(order.status) },
    { label: 'Delivered', icon: CheckCircle2, date: null, active: order.status === 'delivered' },
  ];

  const handleFulfilled = async () => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, status: 'delivered', payment_status: 'paid' })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrder({ ...order, status: updated.status, payment_status: updated.payment_status });
        toast.success("Order marked as fulfilled!");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to update order status.");
    }
  };

  const handleApprovePayment = async () => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, status: 'Confirmed' })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrder({ ...order, status: updated.status, payment_status: updated.payment_status });
        toast.success("Payment approved and confirmation email sent!");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to approve payment.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--admin-background)] pb-20">
      {/* Top Header */}
      <header className="h-20 bg-white border-b border-[var(--admin-border)] flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[var(--admin-light)] transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="font-serif text-xl font-bold text-[var(--admin-text-primary)]">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
            <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'full' })}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 border border-[var(--admin-border)] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--admin-light)] transition-all">
            <Printer size={16} /> Print Invoice
          </button>
          <button 
            onClick={handleFulfilled}
            disabled={order.status === 'delivered'}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--admin-primary)] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-[var(--admin-primary)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <CheckCircle2 size={16} /> {order.status === 'delivered' ? 'Completed' : 'Mark as Fulfilled'}
          </button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-10 grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Left Side (3/4) */}
        <div className="lg:col-span-3 space-y-10">
          
          {/* Progress Tracker */}
          <div className="bg-white p-10 rounded-[32px] border border-[var(--admin-border)] shadow-sm">
             <div className="flex justify-between items-center mb-12">
               {steps.map((step, idx) => (
                 <div key={step.label} className="flex-1 flex flex-col items-center relative group">
                    {idx < steps.length - 1 && (
                      <div className={`absolute top-6 left-1/2 w-full h-[2px] ${steps[idx+1].active ? 'bg-emerald-500' : 'bg-[var(--admin-light)]'}`} />
                    )}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 z-10 transition-all ${step.active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-[var(--admin-light)] text-[var(--admin-text-muted)]'}`}>
                      <step.icon size={20} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${step.active ? 'text-emerald-600' : 'text-[var(--admin-text-muted)]'}`}>{step.label}</span>
                    {step.date && <span className="text-[8px] text-[var(--admin-text-muted)] mt-1">{new Date(step.date).toLocaleDateString()}</span>}
                 </div>
               ))}
             </div>
          </div>

          {/* Items Section */}
          <div className="bg-white rounded-[32px] border border-[var(--admin-border)] overflow-hidden shadow-sm">
            <div className="px-10 py-8 border-b border-[var(--admin-border)] bg-[var(--admin-light)]/30 flex justify-between items-center">
              <h3 className="font-serif text-xl font-bold">Line Items</h3>
              <span className="px-3 py-1 bg-white rounded-lg text-[10px] font-bold uppercase tracking-widest text-[var(--admin-primary)] shadow-sm">
                {order.order_items?.length || 0} Products
              </span>
            </div>
            <div className="divide-y divide-[var(--admin-border)]">
              {(order.order_items || []).map((item: any) => (
                <div key={item.id} className="p-10 flex gap-8 group hover:bg-[var(--admin-light)]/10 transition-all">
                  <div className="w-24 h-24 bg-[var(--admin-light)] rounded-2xl overflow-hidden shrink-0 border border-[var(--admin-border)]">
                     {(item.products?.images?.[0] || item.image) ? (
                        <img 
                          src={item.products?.images?.[0] || item.image} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          alt={item.products?.title || item.title} 
                        />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--admin-text-muted)]">
                          <Package size={24} />
                        </div>
                     )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                       <div>
                          <h4 className="font-serif text-lg font-bold text-[var(--admin-text-primary)]">{item.products?.title || item.title}</h4>
                          <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mt-1">Category: {item.products?.category || item.category || 'Tote'}</p>
                       </div>
                       <div className="text-right">
                          <p className="font-bold text-sm">₹{item.products?.price || item.price}</p>
                          <p className="text-[10px] text-[var(--admin-text-muted)] font-bold">Qty: {item.quantity || 1}</p>
                       </div>
                    </div>
                    {item.customization && (
                      <div className="p-4 bg-[var(--admin-primary)]/5 rounded-xl border border-[var(--admin-primary)]/10 space-y-2">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--admin-primary)]">Customization Detected</p>
                        <p className="text-xs font-medium text-[var(--admin-text-primary)]">{item.customization.text || 'No custom text'}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-10 bg-[var(--admin-light)]/20 grid grid-cols-2 gap-20">
               <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Order Notes</p>
                  <p className="text-sm font-medium text-[var(--admin-text-primary)] leading-relaxed italic">"Please ensure the handle is double-stitched for extra durability. Looking forward to this iconic piece!"</p>
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--admin-text-muted)] font-medium">Subtotal</span>
                    <span className="font-bold">₹{order.total_amount - (order.shipping_cost || 50)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--admin-text-muted)] font-medium">Shipping (Flat)</span>
                    <span className="font-bold">₹{order.shipping_cost || 50}</span>
                  </div>
                  <div className="pt-4 border-t border-[var(--admin-border)] flex justify-between items-center">
                    <span className="text-lg font-serif font-bold">Grand Total</span>
                    <span className="text-2xl font-serif font-bold text-[var(--admin-primary)]">₹{order.total_amount}</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Side (1/4) - Action Sidebar */}
        <div className="space-y-10">
          
          {/* Customer Profile */}
          <div className="bg-white p-8 rounded-[32px] border border-[var(--admin-border)] shadow-sm">
             <div className="flex items-center gap-4 mb-8 pb-8 border-b border-[var(--admin-border)]">
                <div className="w-14 h-14 rounded-2xl bg-[var(--admin-surface-dark)] text-white flex items-center justify-center font-serif text-xl font-bold">
                  {order.shipping_details?.name?.[0] || 'U'}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[var(--admin-text-primary)]">{order.shipping_details?.name}</span>
                  <span className="text-[10px] font-bold text-[var(--admin-primary)] uppercase tracking-widest">Premium Member</span>
                </div>
             </div>
             
             <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-[var(--admin-light)] rounded-lg flex items-center justify-center text-[var(--admin-text-muted)]"><Mail size={14} /></div>
                  <span className="text-xs font-medium text-[var(--admin-text-primary)] truncate">{order.shipping_details?.email}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-[var(--admin-light)] rounded-lg flex items-center justify-center text-[var(--admin-text-muted)]"><Phone size={14} /></div>
                  <span className="text-xs font-medium text-[var(--admin-text-primary)]">+91 98765 43210</span>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-[var(--admin-light)] rounded-lg flex items-center justify-center text-[var(--admin-text-muted)] mt-1"><MapPin size={14} /></div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-[var(--admin-text-primary)] leading-relaxed">
                      {order.shipping_details?.address}<br />
                      {order.shipping_details?.city}, {order.shipping_details?.zip}
                    </span>
                    <button className="flex items-center gap-2 text-[10px] font-bold text-[var(--admin-primary)] uppercase tracking-widest mt-2 hover:underline">
                      <ExternalLink size={10} /> View on Map
                    </button>
                  </div>
                </div>
             </div>
          </div>

          {/* Payment Status */}
          <div className="bg-white p-8 rounded-[32px] border border-[var(--admin-border)] shadow-sm">
             <div className="flex items-center gap-3 mb-6">
                <CreditCard size={18} className="text-[var(--admin-text-muted)]" />
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">Payment Logic</h4>
             </div>

             {order.payment_id === 'MANUAL_UPI' ? (
                <div className="space-y-4">
                   <div className={`p-6 rounded-2xl border flex flex-col items-center gap-3 ${order.payment_status === 'paid' ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${order.payment_status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${order.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {order.payment_status === 'paid' ? 'UPI Verified' : 'Awaiting Approval'}
                        </span>
                      </div>
                      <span className="text-2xl font-serif font-bold text-[var(--admin-text-primary)]">₹{order.total_amount}</span>
                   </div>

                   {order.payment_status !== 'paid' && (
                     <div className="space-y-3">
                        {order.shipping_details?.payment_screenshot_url && (
                          <button 
                            onClick={() => setShowScreenshot(true)}
                            className="w-full py-4 bg-[var(--admin-primary)]/10 text-[var(--admin-primary)] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--admin-primary)] hover:text-white transition-all flex items-center justify-center gap-2"
                          >
                            <Eye size={14} /> View Screenshot
                          </button>
                        )}
                        <button 
                          onClick={handleApprovePayment}
                          className="w-full py-4 bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 size={14} /> Approve Payment
                        </button>
                     </div>
                   )}
                   
                   {order.payment_status === 'paid' && (
                     <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-bold uppercase tracking-widest text-center border border-emerald-100">
                        Payment Completed via Manual UPI
                     </div>
                   )}
                </div>
             ) : (
                <div className="space-y-4">
                   <div className={`p-6 rounded-2xl border flex flex-col items-center gap-3 ${order.payment_status === 'paid' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {order.payment_status === 'paid' ? 'Transaction Success' : 'Awaiting Payment'}
                      </span>
                      <span className="text-2xl font-serif font-bold">₹{order.total_amount}</span>
                   </div>
                   {order.payment_status === 'paid' ? (
                     <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-bold uppercase tracking-widest text-center">
                        Payment Completed
                     </div>
                   ) : (
                     <button 
                       onClick={handleApprovePayment}
                       className="w-full py-4 bg-[var(--admin-light)] text-[var(--admin-text-primary)] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--admin-border)] transition-all"
                     >
                       Mark as Paid
                     </button>
                   )}
                </div>
             )}
          </div>

          {/* Quick Actions */}
          <div className="bg-[var(--admin-surface-dark)] p-8 rounded-[32px] text-white shadow-xl">
             <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-6">Admin Actions</h4>
             <div className="space-y-3">
                <button className="w-full flex justify-between items-center p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group">
                   <div className="flex items-center gap-3">
                      <MessageSquare size={16} className="text-white/40" />
                      <span className="text-xs font-bold">Contact User</span>
                   </div>
                   <ChevronRight size={14} className="text-white/20 group-hover:text-white" />
                </button>
                <button className="w-full flex justify-between items-center p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group">
                   <div className="flex items-center gap-3">
                      <Package size={16} className="text-white/40" />
                      <span className="text-xs font-bold">Generate Label</span>
                   </div>
                   <ChevronRight size={14} className="text-white/20 group-hover:text-white" />
                </button>
             </div>
          </div>

        </div>
      </main>

      {/* Screenshot Lightbox */}
      <AnimatePresence>
        {showScreenshot && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-10 bg-black/95 backdrop-blur-md"
            onClick={() => setShowScreenshot(false)}
          >
            <button className="absolute top-6 right-6 md:top-10 md:right-10 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all z-10">
              <X size={24} />
            </button>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative max-w-5xl w-full flex flex-col items-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-full bg-white/5 border border-white/10 rounded-[32px] p-2 overflow-hidden shadow-2xl">
                <img 
                  src={order.shipping_details?.payment_screenshot_url} 
                  className="w-full max-h-[75vh] object-contain rounded-[24px]"
                  alt="Payment Screenshot" 
                />
              </div>
              
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <a 
                  href={order.shipping_details?.payment_screenshot_url} 
                  target="_blank" 
                  download
                  className="px-8 py-4 bg-white text-black rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:scale-105 transition-all shadow-xl"
                >
                  <Download size={16} /> Download Proof
                </a>
                <button 
                  onClick={() => {
                    handleApprovePayment();
                    setShowScreenshot(false);
                  }}
                  className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-emerald-500/20"
                >
                  <CheckCircle2 size={16} /> Confirm Payment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
