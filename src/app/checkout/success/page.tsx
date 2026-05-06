"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight, Printer, ShoppingBag, Truck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      router.push("/");
      return;
    }

    // In a real app, you'd fetch order details from an API
    // For now, we show a success state
    setLoading(false);
  }, [orderId, router]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col pt-32 pb-20 px-4">
      <div className="max-w-3xl mx-auto w-full">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-green-50 rounded-[40px] flex items-center justify-center mx-auto mb-8 animate-bounce">
            <CheckCircle className="text-green-500 w-12 h-12" />
          </div>
          <h1 className="font-serif text-5xl font-bold tracking-tight mb-4 text-[#900C3F]">Order Confirmed!</h1>
          <p className="text-[#900C3F]/60 text-lg font-medium">Your iconic tote is being prepared for its journey.</p>
          <div className="mt-6 inline-flex items-center gap-3 px-6 py-2 bg-white border border-[#F5ECD7] rounded-full shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#900C3F]/40">Order Ref:</span>
            <span className="font-mono text-sm font-bold text-[#900C3F]">#{orderId?.slice(-8).toUpperCase()}</span>
          </div>
        </div>

        {/* Next Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: ShoppingBag, title: "Order Received", desc: "Successfully verified payment" },
            { icon: Package, title: "Processing", desc: "Hand-crafting your design" },
            { icon: Truck, title: "Shipping", desc: "ETA: 3-5 Business Days" },
          ].map((step, i) => (
            <div key={i} className="bg-white p-6 rounded-[32px] border border-[#F5ECD7] flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 bg-[#900C3F]/5 rounded-2xl flex items-center justify-center text-[#900C3F]">
                <step.icon size={20} />
              </div>
              <h3 className="font-bold text-sm">{step.title}</h3>
              <p className="text-[10px] text-gray-400 font-medium leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4">
          <Link 
            href={`/orders/${orderId}`}
            className="flex-1 py-5 bg-[#900C3F] text-white rounded-[32px] font-bold text-lg flex items-center justify-center gap-3 hover:bg-[#FF69B4] transition-all shadow-xl shadow-[#900C3F]/20"
          >
            Track My Order <ArrowRight size={20} />
          </Link>
          <button 
            onClick={() => window.print()}
            className="px-8 py-5 bg-white border-2 border-[#900C3F] text-[#900C3F] rounded-[32px] font-bold text-lg flex items-center justify-center gap-3 hover:bg-[#900C3F]/5 transition-all"
          >
            <Printer size={20} /> Print Invoice
          </button>
        </div>

        <div className="mt-12 text-center">
           <Link href="/shop" className="text-[#900C3F] font-bold hover:underline">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <main>
      <Navbar />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#900C3F]"></div>
        </div>
      }>
        <SuccessContent />
      </Suspense>
      <Footer />
    </main>
  );
}
