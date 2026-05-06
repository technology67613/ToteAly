"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Package, Truck, CheckCircle2, AlertCircle, 
  ChevronLeft, MapPin, CreditCard, ShoppingBag,
  ExternalLink, Printer, Edit3, Trash2, Mail, Phone,
  Loader2, Check
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (authStatus === "authenticated" && (session?.user as any)?.role === "admin") {
      fetchOrder();
    }
  }, [params.id, authStatus, session]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/admin/orders?id=${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
    }
    setLoading(false);
  };

  const updateStatus = async (newStatus: string, paymentStatus?: string) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: params.id, 
          status: newStatus,
          payment_status: paymentStatus 
        }),
      });
      if (res.ok) await fetchOrder();
    } catch (error) {
      console.error("Update failed:", error);
    }
    setUpdating(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]"><Loader2 className="animate-spin text-[#900C3F]" /></div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">Order not found</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex flex-col gap-2">
            <button onClick={() => router.push("/admin")} className="flex items-center gap-2 text-[#900C3F]/40 hover:text-[#900C3F] font-bold text-xs uppercase tracking-widest transition-colors mb-4">
              <ChevronLeft size={16} /> Dashboard
            </button>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-serif font-bold">Manage Order</h1>
              <span className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest ${
                order.payment_status === 'Paid' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
              }`}>
                {order.payment_status}
              </span>
            </div>
            <p className="text-sm font-bold text-[#900C3F]/40 font-mono">ID: {order.id}</p>
          </div>

          <div className="flex items-center gap-3">
             {order.payment_status !== 'Paid' && (
                <button 
                  onClick={() => updateStatus(order.status, 'Paid')}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
                >
                   <Check size={16} /> Confirm Payment
                </button>
             )}
             <button onClick={() => window.print()} className="px-6 py-3 bg-white border border-[#F5ECD7] rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-gray-50 transition-colors">
                <Printer size={16} /> Print Invoice
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Status Manager */}
            <div className="bg-white rounded-[40px] border border-[#F5ECD7] p-10">
               <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40 mb-8">Fulfillment Control</h3>
               <div className="flex flex-wrap gap-4">
                  {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(s)}
                      disabled={updating}
                      className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all border ${
                        order.status === s 
                        ? "bg-[#900C3F] text-white border-[#900C3F] shadow-lg shadow-[#900C3F]/20" 
                        : "bg-white border-[#F5ECD7] text-[#900C3F]/60 hover:border-[#900C3F]"
                      }`}
                    >
                      {updating && order.status !== s ? <Loader2 size={14} className="animate-spin inline mr-2" /> : null}
                      {s}
                    </button>
                  ))}
               </div>
            </div>

            {/* Items Table */}
            <div className="bg-white rounded-[40px] border border-[#F5ECD7] overflow-hidden">
               <div className="p-8 border-b border-[#F5ECD7]">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Order Content</h3>
               </div>
               <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <tr>
                      <th className="px-8 py-4">Product</th>
                      <th className="px-8 py-4 text-center">Qty</th>
                      <th className="px-8 py-4 text-right">Unit Price</th>
                      <th className="px-8 py-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5ECD7]">
                    {(order.products || order.order_items || []).map((item: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                                 {item.image || item.customization_details?.preview ? <img src={item.image || item.customization_details?.preview} className="w-full h-full object-cover" /> : <Package size={18} className="text-gray-300" />}
                              </div>
                              <div>
                                 <p className="font-bold text-sm">{item.name || item.title}</p>
                                 {item.is_customized && <span className="text-[9px] font-bold uppercase tracking-widest text-[#900C3F]">Custom Design</span>}
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-center font-bold text-sm">{item.quantity}</td>
                        <td className="px-8 py-6 text-right font-mono text-sm">₹{item.price}</td>
                        <td className="px-8 py-6 text-right font-bold text-sm text-[#900C3F]">₹{item.price * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
               <div className="p-10 bg-gray-50 border-t border-[#F5ECD7] flex justify-between items-center">
                  <span className="font-bold uppercase tracking-widest text-[10px] text-gray-400">Total Revenue Collected</span>
                  <span className="text-3xl font-serif font-bold text-[#900C3F]">₹{order.totalAmount || order.total_amount}</span>
               </div>
            </div>
          </div>

          {/* Customer Detail Sidebar */}
          <div className="flex flex-col gap-8">
             <div className="bg-white rounded-[40px] border border-[#F5ECD7] p-8">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40 mb-6">Customer Dossier</h3>
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-16 h-16 rounded-[24px] bg-[#900C3F]/5 flex items-center justify-center text-[#900C3F] font-serif font-bold text-2xl">
                      {order.shippingDetails?.name?.[0] || 'U'}
                   </div>
                   <div>
                      <p className="font-bold text-lg leading-tight">{order.shippingDetails?.name}</p>
                      <p className="text-xs font-bold text-[#900C3F]/40 uppercase tracking-widest">Iconic Member</p>
                   </div>
                </div>
                <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-3 text-sm font-bold">
                      <Mail size={16} className="text-[#900C3F]/20" />
                      {order.shippingDetails?.email}
                   </div>
                   <div className="flex items-center gap-3 text-sm font-bold">
                      <Phone size={16} className="text-[#900C3F]/20" />
                      {order.shippingDetails?.phone}
                   </div>
                   <div className="flex gap-3 text-sm font-bold border-t border-[#F5ECD7] pt-6 mt-2">
                      <MapPin size={16} className="text-[#900C3F]/20 shrink-0" />
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase tracking-widest text-gray-400">Shipping Address</span>
                        <p className="font-medium text-gray-600 leading-relaxed">
                          {order.shippingDetails?.address}<br />
                          {order.shippingDetails?.city}, {order.shippingDetails?.state} {order.shippingDetails?.pincode}
                        </p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Actions */}
             <div className="bg-[#1A1A1A] rounded-[40px] p-8 text-white flex flex-col gap-4">
                <h3 className="font-serif text-xl font-bold">Admin Actions</h3>
                <button className="w-full py-4 bg-white/10 border border-white/10 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/20 transition-all">
                   <Mail size={16} /> Resend Receipt
                </button>
                <button className="w-full py-4 bg-white/10 border border-white/10 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/20 transition-all">
                   <ExternalLink size={16} /> View in Shiprocket
                </button>
                <button className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all">
                   <Trash2 size={16} /> Delete Order
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
