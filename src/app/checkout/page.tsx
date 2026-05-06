"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { 
  ShoppingBag, CheckCircle, Loader2, ChevronRight, 
  ShieldCheck, Truck, Lock, CreditCard, ArrowLeft,
  Sparkles, Package, MapPin, Phone, Mail, User, UploadCloud, QrCode
} from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type Step = "details" | "payment" | "success";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>("details");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "manual_upi">("razorpay");
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    state: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const SHIPPING_FEE = 50;
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + SHIPPING_FEE;

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingScreenshot(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setScreenshotUrl(data.url);
      }
    } catch (error) {
      console.error("Screenshot upload failed:", error);
    }
    setUploadingScreenshot(false);
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.id = "razorpay-sdk";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      if (paymentMethod === "manual_upi") {
        if (!screenshotUrl) {
           alert("Please upload a payment screenshot first.");
           setLoading(false);
           return;
        }
        const orderRes = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items,
            totalAmount: total,
            paymentId: "MANUAL_UPI",
            shippingDetails: { ...form, country: "India", payment_method: "Manual_UPI", payment_screenshot_url: screenshotUrl },
          }),
        });
        const orderData = await orderRes.json();
        if (!orderRes.ok) {
          console.error("Validation Details:", orderData.details);
          throw new Error(orderData.error ? `${orderData.error}: ${JSON.stringify(orderData.details || {})}` : "Order could not be saved.");
        }
        const finalOrderId = orderData.id || orderData._id || "MANUAL_" + Date.now();
        setOrderId(finalOrderId);
        clearCart();
        router.push(`/checkout/success?orderId=${finalOrderId}`);
        setLoading(false);
        return;
      }

      // 1. Create Order on Backend
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total, items }),
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const { order } = data;

      // 2. Load SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Razorpay SDK failed to load. Check your connection.");
      }

      // 3. Configure Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_your_id",
        amount: order.amount,
        currency: order.currency,
        name: "Tote-ally Iconic",
        description: `Order for ${items.length} iconic items`,
        image: "/icon.svg",
        order_id: order.id,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: {
          color: "#900C3F",
        },
        handler: async function (response: any) {
          setLoading(true);
          try {
            const orderRes = await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                items,
                totalAmount: total,
                paymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                shippingDetails: { ...form, country: "India" },
              }),
            });
            const orderResData = await orderRes.json();
            if (!orderRes.ok) {
              console.error("Validation Details:", orderResData.details);
              throw new Error(orderResData.error ? `${orderResData.error}: ${JSON.stringify(orderResData.details || {})}` : "Order could not be saved.");
            }
            const finalOrderId = orderResData.id || response.razorpay_order_id || order.id;
            setOrderId(finalOrderId);
            clearCart();
            router.push(`/checkout/success?orderId=${finalOrderId}`);
          } catch (e) {
            console.error("Order completion failed:", e);
            alert(e instanceof Error ? e.message : "Order completion failed. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("Payment Process Error:", error);
      alert(error.message || "Failed to process payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && step !== "success") {
    return (
      <main className="min-h-screen bg-[#FFF8F0] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-[#900C3F]/5 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-[#900C3F]/20" />
        </div>
        <h1 className="font-serif text-3xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-[#900C3F]/50 mb-8">Start adding some iconic totes to your collection.</p>
        <Link href="/shop" className="px-10 py-4 bg-[#900C3F] text-white rounded-full font-bold hover:bg-[#FF69B4] transition-all shadow-xl shadow-[#900C3F]/20">
          Browse Shop
        </Link>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#900C3F]">
      <nav className="h-20 bg-white border-b border-[#F5ECD7] flex items-center px-6 lg:px-20 justify-between sticky top-0 z-50">
        <Link href="/" className="font-serif text-2xl font-bold tracking-tighter">ToteAly</Link>
        <div className="hidden md:flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">
          <span className={step === "details" ? "text-[#900C3F]" : ""}>Shipping</span>
          <ChevronRight size={14} />
          <span className={step === "payment" ? "text-[#900C3F]" : ""}>Payment</span>
          <ChevronRight size={14} />
          <span>Success</span>
        </div>
        <Link href="/shop" className="flex items-center gap-2 text-xs font-bold hover:text-[#FF69B4] transition-colors">
          <ArrowLeft size={14} /> <span className="hidden sm:inline">Back to Shop</span>
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto p-6 lg:p-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        <div className="lg:col-span-7 flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#FF69B4]">Secure Checkout</span>
            <h1 className="font-serif text-4xl lg:text-5xl font-bold">
              {step === "details" ? "Shipping Manifest" : "Review & Authorize"}
            </h1>
          </div>

          {step === "details" ? (
            <div className="flex flex-col gap-8 bg-white p-8 lg:p-12 rounded-[40px] border border-[#F5ECD7] shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#900C3F]/40 flex items-center gap-2"><User size={12} /> Full Name</label>
                  <input name="name" value={form.name} onChange={handleFormChange} placeholder="Abhirami Aluvila" 
                    className="w-full px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-[#F5ECD7] focus:outline-none focus:border-[#FF69B4] transition-all font-medium" />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#900C3F]/40 flex items-center gap-2"><Mail size={12} /> Email Address</label>
                  <input name="email" value={form.email} onChange={handleFormChange} placeholder="hello@totealy.com" type="email"
                    className="w-full px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-[#F5ECD7] focus:outline-none focus:border-[#FF69B4] transition-all font-medium" />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#900C3F]/40 flex items-center gap-2"><Phone size={12} /> Phone Number</label>
                <input name="phone" value={form.phone} onChange={handleFormChange} placeholder="+91 98765 43210" type="tel"
                  className="w-full px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-[#F5ECD7] focus:outline-none focus:border-[#FF69B4] transition-all font-medium" />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#900C3F]/40 flex items-center gap-2"><MapPin size={12} /> Shipping Address</label>
                <input name="address" value={form.address} onChange={handleFormChange} placeholder="Flat, Street, Locality"
                  className="w-full px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-[#F5ECD7] focus:outline-none focus:border-[#FF69B4] transition-all font-medium" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#900C3F]/40">City</label>
                  <input name="city" value={form.city} onChange={handleFormChange} placeholder="Mumbai"
                    className="w-full px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-[#F5ECD7] focus:outline-none focus:border-[#FF69B4] transition-all font-medium" />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#900C3F]/40">Pincode</label>
                  <input name="pincode" value={form.pincode} onChange={handleFormChange} placeholder="400001"
                    className="w-full px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-[#F5ECD7] focus:outline-none focus:border-[#FF69B4] transition-all font-medium" />
                </div>
                <div className="flex flex-col gap-3 col-span-2 md:col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#900C3F]/40">State</label>
                  <input name="state" value={form.state} onChange={handleFormChange} placeholder="Maharashtra"
                    className="w-full px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-[#F5ECD7] focus:outline-none focus:border-[#FF69B4] transition-all font-medium" />
                </div>
              </div>

              <button
                onClick={() => setStep("payment")}
                disabled={!form.name || !form.email || !form.phone || !form.address}
                className="mt-6 w-full py-6 bg-[#900C3F] text-white rounded-[32px] font-bold text-lg hover:bg-[#FF69B4] transition-all shadow-2xl shadow-[#900C3F]/20 disabled:opacity-40"
              >
                Proceed to Secure Payment
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-10 bg-white p-8 lg:p-12 rounded-[40px] border border-[#F5ECD7] shadow-sm">
              <div className="bg-[#F8F9FA] p-8 rounded-3xl border border-[#F5ECD7] flex flex-col gap-4">
                 <div className="flex justify-between items-center border-b border-[#F5ECD7] pb-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#900C3F]/40">Delivery Details</p>
                    <button onClick={() => setStep("details")} className="text-[10px] font-bold uppercase text-[#FF69B4]">Modify</button>
                 </div>
                 <div className="flex flex-col gap-1">
                    <p className="font-bold">{form.name}</p>
                    <p className="text-sm text-[#900C3F]/60">{form.email} • {form.phone}</p>
                    <p className="text-sm text-[#900C3F]/60">{form.address}, {form.city}, {form.state} - {form.pincode}</p>
                 </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex gap-4 mb-2">
                   <button 
                     onClick={() => setPaymentMethod("razorpay")} 
                     className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border-2 ${paymentMethod === 'razorpay' ? 'bg-[#900C3F] text-white border-[#900C3F]' : 'bg-transparent text-[#900C3F] border-[#F5ECD7] hover:border-[#900C3F]'}`}
                   >
                     <CreditCard size={18} /> Razorpay
                   </button>
                   <button 
                     onClick={() => setPaymentMethod("manual_upi")} 
                     className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border-2 ${paymentMethod === 'manual_upi' ? 'bg-[#900C3F] text-white border-[#900C3F]' : 'bg-transparent text-[#900C3F] border-[#F5ECD7] hover:border-[#900C3F]'}`}
                   >
                     <QrCode size={18} /> Manual UPI
                   </button>
                </div>

                {paymentMethod === "razorpay" ? (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4 p-6 rounded-3xl border-2 border-[#900C3F] bg-[#900C3F]/5">
                      <div className="w-12 h-12 bg-[#900C3F] text-white rounded-2xl flex items-center justify-center">
                        <CreditCard size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold">Razorpay Secure Checkout</p>
                        <p className="text-xs text-[#900C3F]/60">Cards, UPI, NetBanking & Wallets</p>
                      </div>
                      <Lock size={18} className="text-[#900C3F]/20" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-6 p-8 rounded-3xl border-2 border-[#900C3F] bg-[#900C3F]/5">
                    <img src="/payment.jpeg" alt="UPI QR Code" className="w-48 h-48 rounded-xl shadow-lg" />
                    <div className="text-center">
                      <p className="font-bold text-lg">Scan to Pay via UPI</p>
                      <p className="text-sm text-[#900C3F]/60">Total: ₹{total}</p>
                    </div>
                    
                    <div className="w-full relative">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleScreenshotUpload} 
                        disabled={uploadingScreenshot}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full py-4 bg-white border-2 border-dashed border-[#900C3F]/30 rounded-2xl flex flex-col items-center justify-center text-[#900C3F] gap-2 hover:bg-[#900C3F]/5 transition-colors">
                        {uploadingScreenshot ? (
                           <Loader2 size={24} className="animate-spin" />
                        ) : screenshotUrl ? (
                           <>
                             <CheckCircle size={24} className="text-green-500" />
                             <span className="text-sm font-bold">Screenshot Uploaded</span>
                           </>
                        ) : (
                           <>
                             <UploadCloud size={24} />
                             <span className="text-sm font-bold">Upload Payment Screenshot</span>
                           </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handlePayment}
                  disabled={loading || (paymentMethod === "manual_upi" && !screenshotUrl)}
                  className="w-full py-6 bg-[#900C3F] text-white rounded-[32px] font-bold text-xl hover:bg-[#FF69B4] transition-all shadow-2xl shadow-[#900C3F]/30 flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={24} className="animate-spin" /> : <Lock size={20} />}
                  {paymentMethod === "razorpay" ? (loading ? "Establishing Secure Link..." : `Authorize Payment • ₹${total}`) : (loading ? "Processing..." : `Complete Order • ₹${total}`)}
                </button>
              </div>

              <div className="flex flex-wrap justify-center gap-8 opacity-40 grayscale mt-4">
                <div className="flex items-center gap-2 text-xs font-bold"><ShieldCheck size={16} /> PCI COMPLIANT</div>
                <div className="flex items-center gap-2 text-xs font-bold"><Lock size={16} /> 256-BIT ENCRYPTION</div>
                <div className="flex items-center gap-2 text-xs font-bold"><CheckCircle size={16} /> SECURE GATEWAY</div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 flex flex-col gap-8">
           <div className="bg-[#1A1A1A] rounded-[40px] p-8 lg:p-12 text-white shadow-2xl shadow-[#900C3F]/20 sticky top-28">
              <div className="flex items-center gap-3 mb-10">
                <Package size={20} className="text-[#FF69B4]" />
                <h2 className="font-serif text-2xl font-bold">Iconic Manifest</h2>
              </div>

              <div className="flex flex-col gap-8 mb-10 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-5 items-center group">
                    <div className="w-16 h-20 bg-white/5 rounded-2xl overflow-hidden flex items-center justify-center border border-white/10 shrink-0">
                       <img 
                        src={item.customizationDetails?.preview || item.image || "/mockups/plain.png"} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Qty: {item.quantity}</span>
                        {item.isCustomized && <span className="text-[10px] font-bold text-[#FF69B4] uppercase tracking-widest flex items-center gap-1"><Sparkles size={10} /> Custom</span>}
                      </div>
                    </div>
                    <p className="font-bold text-sm">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4 border-t border-white/10 pt-8">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40 font-bold uppercase tracking-widest">Subtotal</span>
                  <span className="font-bold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40 font-bold uppercase tracking-widest">Shipping</span>
                  <span className="font-bold">₹{SHIPPING_FEE}</span>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF69B4]">Grand Total</span>
                    <span className="font-serif text-4xl font-bold tracking-tight">₹{total}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-green-400 uppercase tracking-widest">
                       <Truck size={12} /> Fast Express
                    </div>
                    <p className="text-[8px] text-white/20 uppercase tracking-widest">Expected: 3-5 Business Days</p>
                  </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
