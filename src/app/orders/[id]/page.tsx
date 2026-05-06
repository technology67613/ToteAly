"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Package, Truck, CheckCircle2, AlertCircle, 
  ChevronLeft, MapPin, CreditCard, Calendar,
  ExternalLink, Printer, ShoppingBag
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function OrderDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#900C3F]"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] p-4 text-center">
        <AlertCircle size={48} className="text-[#900C3F] mb-4" />
        <h1 className="text-2xl font-serif font-bold mb-2">Order Not Found</h1>
        <p className="text-[#900C3F]/60 mb-8">We couldn't find the iconic details you're looking for.</p>
        <button onClick={() => router.push("/")} className="px-8 py-3 bg-[#900C3F] text-white rounded-full font-bold">Go Home</button>
      </div>
    );
  }

  const steps = [
    { label: "Confirmed", icon: CheckCircle2, status: "Paid", done: true },
    { label: "Processing", icon: Package, status: "Processing", done: ["Processing", "Shipped", "Delivered"].includes(order.status) },
    { label: "Shipped", icon: Truck, status: "Shipped", done: ["Shipped", "Delivered"].includes(order.status) },
    { label: "Delivered", icon: ShoppingBag, status: "Delivered", done: order.status === "Delivered" },
  ];

  return (
    <main className="bg-[#FDFBF7] min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pt-32 pb-20">
        
        {/* Back and Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[#900C3F]/40 hover:text-[#900C3F] font-bold text-sm transition-colors"
            >
              <ChevronLeft size={18} /> Back to Orders
            </button>
            <h1 className="text-4xl font-serif font-bold tracking-tight">Order #{id?.toString().slice(-8).toUpperCase()}</h1>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => window.print()} className="px-6 py-2 bg-white border border-[#F5ECD7] rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-[#F8F9FA] transition-colors uppercase tracking-widest">
                <Printer size={16} /> Print Receipt
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column: Tracking & Items */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Tracking Stepper */}
            <div className="bg-white rounded-[40px] border border-[#F5ECD7] p-10">
              <h3 className="font-bold text-sm uppercase tracking-[0.2em] text-[#900C3F]/40 mb-10">Delivery Progress</h3>
              <div className="relative flex justify-between">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#F5ECD7] -translate-y-1/2" />
                {steps.map((step, i) => (
                  <div key={i} className="relative z-10 flex flex-col items-center gap-3 group">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      step.done ? "bg-[#900C3F] text-white shadow-lg shadow-[#900C3F]/20" : "bg-white border-2 border-[#F5ECD7] text-[#900C3F]/20"
                    }`}>
                      <step.icon size={20} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${step.done ? "text-[#900C3F]" : "text-gray-300"}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-[40px] border border-[#F5ECD7] p-10">
               <h3 className="font-bold text-sm uppercase tracking-[0.2em] text-[#900C3F]/40 mb-8">Iconic Selection</h3>
               <div className="flex flex-col gap-6">
                  {(order.products || order.order_items || []).map((item: any, i: number) => (
                    <div key={i} className="flex gap-6 items-center">
                      <div className="w-24 h-24 bg-[#F8F9FA] rounded-[32px] border border-[#F5ECD7] overflow-hidden flex items-center justify-center p-2">
                        {item.image || item.customization_details?.preview ? (
                          <img src={item.image || item.customization_details?.preview} className="w-full h-full object-cover rounded-2xl" alt={item.name} />
                        ) : (
                          <Package className="text-[#900C3F]/10 w-10 h-10" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-serif text-lg font-bold">{item.name || item.title}</h4>
                        <p className="text-sm font-bold text-[#900C3F]/40">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-serif text-xl font-bold text-[#900C3F]">₹{item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
               </div>
               <div className="mt-10 pt-8 border-t border-[#F5ECD7] flex justify-between items-center">
                  <span className="font-bold text-[#900C3F]/40 uppercase tracking-widest text-[10px]">Total Paid</span>
                  <span className="text-3xl font-serif font-bold">₹{order.totalAmount || order.total_amount}</span>
               </div>
            </div>
          </div>

          {/* Sidebar: Details */}
          <div className="flex flex-col gap-8">
             {/* Shipping Details */}
             <div className="bg-white rounded-[40px] border border-[#F5ECD7] p-8">
                <div className="flex items-center gap-3 text-[#900C3F] mb-6">
                   <MapPin size={20} />
                   <h3 className="font-bold text-sm uppercase tracking-widest">Delivery Address</h3>
                </div>
                <div className="flex flex-col gap-1 text-sm font-medium">
                   <p className="font-bold text-base mb-1">{order.shippingDetails?.name}</p>
                   <p className="text-gray-600 leading-relaxed">{order.shippingDetails?.address}</p>
                   <p className="text-gray-600">{order.shippingDetails?.city}, {order.shippingDetails?.state}</p>
                   <p className="text-gray-600">{order.shippingDetails?.pincode}</p>
                   <p className="mt-4 font-bold text-[#900C3F]">{order.shippingDetails?.phone}</p>
                </div>
             </div>

             {/* Payment Details */}
             <div className="bg-white rounded-[40px] border border-[#F5ECD7] p-8">
                <div className="flex items-center gap-3 text-[#900C3F] mb-6">
                   <CreditCard size={20} />
                   <h3 className="font-bold text-sm uppercase tracking-widest">Payment Info</h3>
                </div>
                <div className="flex flex-col gap-4">
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Method</span>
                      <span className="text-xs font-bold px-3 py-1 bg-green-50 text-green-600 rounded-lg">Online Paid</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</span>
                      <span className="text-xs font-bold text-gray-600">{new Date(order.created_at || order.createdAt).toLocaleDateString()}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Transaction</span>
                      <span className="text-[10px] font-mono font-bold text-gray-400">{order.paymentId?.toString().slice(0, 15)}...</span>
                   </div>
                </div>
             </div>

             <div className="bg-[#900C3F] rounded-[40px] p-8 text-white flex flex-col gap-4">
                <h3 className="font-serif text-xl font-bold">Need Help?</h3>
                <p className="text-sm text-white/70 leading-relaxed">Our iconic support team is here for you 24/7.</p>
                <Link href="/contact" className="w-full py-4 bg-white text-[#900C3F] rounded-2xl font-bold text-sm hover:bg-[#FF69B4] hover:text-white transition-all flex items-center justify-center">Contact Support</Link>
             </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
