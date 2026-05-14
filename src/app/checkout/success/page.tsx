"use client";

import { useSearchParams } from "next/navigation";
import DownloadInvoice from "@/components/DownloadInvoice";
import Link from "next/link";
import { CheckCircle2, ShoppingBag, User } from "lucide-react";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-[#FFF8F0] py-12">
      <div className="bg-green-50 p-4 rounded-full mb-8">
        <CheckCircle2 size={64} className="text-green-500" />
      </div>
      
      <h1 className="text-5xl font-serif font-bold text-[#900C3F] mb-4">Order Confirmed!</h1>
      <p className="text-[#900C3F]/70 max-w-lg mb-12 text-lg leading-relaxed">
        Thank you for your order. We've sent a confirmation email to your inbox. 
        Your iconic tote bags are now being handcrafted with love! ✦
      </p>

      <div className="grid grid-cols-1 gap-6 w-full max-w-md">
        {orderId && (
          <div className="flex flex-col gap-3">
             <DownloadInvoice order={{ id: orderId }} />
             <p className="text-[10px] text-[#900C3F]/40 uppercase tracking-widest font-bold">PDF Format · Printable</p>
          </div>
        )}

        <div className="h-px bg-[#F5ECD7] my-4 w-full"></div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/shop" 
            className="flex items-center justify-center gap-2 bg-white border-2 border-[#900C3F] text-[#900C3F] px-8 py-4 rounded-xl font-bold hover:bg-[#900C3F] hover:text-white transition-all group"
          >
            <ShoppingBag size={18} className="group-hover:scale-110 transition-transform" />
            Continue Shopping
          </Link>
          <Link 
            href="/profile" 
            className="flex items-center justify-center gap-2 bg-[#F5ECD7] text-[#900C3F] px-8 py-4 rounded-xl font-bold hover:bg-[#E8D5C4] transition-all"
          >
            <User size={18} />
            View Orders
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-serif text-[#900C3F]">Loading your icon...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
