"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { 
  ShoppingBag, CheckCircle, Loader2, ChevronRight, 
  ShieldCheck, Truck, Lock, CreditCard, ArrowLeft,
  Sparkles, Package, MapPin, Phone, Mail, User, MessageSquare,
  Copy, Check, Upload, QrCode, AlertCircle
} from "lucide-react";

type Step = "details" | "payment" | "success";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>("details");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Manual UPI States
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    state: "",
    notes: "",
  });

  const [threshold, setThreshold] = useState(999);
  const [shippingCost, setShippingCost] = useState(50);

  useEffect(() => {
    setMounted(true);
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.free_shipping_threshold !== undefined) {
            setThreshold(Number(data.free_shipping_threshold));
          }
          if (data.base_shipping_cost !== undefined) {
            setShippingCost(Number(data.base_shipping_cost));
          }
        }
      })
      .catch(err => console.error("[CHECKOUT SETTINGS ERROR] Failed to load shipping settings:", err));
  }, []);

  if (!mounted) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const SHIPPING_FEE = subtotal >= threshold ? 0 : shippingCost;
  const amountUntilFreeShipping = Math.max(threshold - subtotal, 0);
  const total = subtotal + SHIPPING_FEE - couponDiscount;

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const applyCoupon = async () => {
    if (!couponCode) return;
    setApplyingCoupon(true);
    try {
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, amount: subtotal }),
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedCoupon(data.coupon);
        setCouponDiscount(data.discount);
      } else {
        alert(data.error || "Invalid coupon code");
      }
    } catch (error) {
      console.error("Coupon application failed:", error);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
  };



  const copyToClipboard = (text: string, type: "upi" | "amount") => {
    navigator.clipboard.writeText(text);
    if (type === "upi") {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingScreenshot(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setScreenshotUrl(data.url);
    } catch (err) {
      console.error("Screenshot upload error:", err);
      alert("Failed to upload screenshot. Please try again.");
    } finally {
      setUploadingScreenshot(false);
    }
  };

  const handlePayment = async () => {
    if (!screenshotUrl) {
      alert("Please upload your payment screenshot/receipt before placing your order.");
      return;
    }

    setLoading(true);
    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          totalAmount: total,
          paymentId: "MANUAL_UPI",
          shippingDetails: {
            ...form,
            country: "India",
            payment_method: "Manual UPI",
            payment_screenshot_url: screenshotUrl,
          },
          couponCode: appliedCoupon?.code || null,
        }),
      });

      const orderResData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderResData.error || "Order could not be saved.");
      }

      clearCart();
      router.push(`/checkout/success?orderId=${orderResData.id}`);
    } catch (e: any) {
      console.error("Order completion failed:", e);
      alert(e.message || "Order completion failed. Please contact support.");
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
            <div className="flex justify-between items-end">
              <h1 className="font-serif text-4xl lg:text-5xl font-bold">
                {step === "details" ? "Shipping Manifest" : "Review & Authorize"}
              </h1>

            </div>
          </div>

          {step === "details" ? (
            <div className="flex flex-col gap-8 bg-white p-8 lg:p-12 rounded-[40px] border border-[#F5ECD7] shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#900C3F]/40 flex items-center gap-2"><User size={12} /> Full Name</label>
                  <input name="name" value={form.name} onChange={handleFormChange} placeholder="Your full name" 
                    className="w-full px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-[#F5ECD7] focus:outline-none focus:border-[#FF69B4] transition-all font-medium" />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#900C3F]/40 flex items-center gap-2"><Mail size={12} /> Email Address</label>
                  <input name="email" value={form.email} onChange={handleFormChange} placeholder="toteallyiconic@gmail.com" type="email"
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

              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#900C3F]/40 flex items-center gap-2"><MessageSquare size={12} /> Order Notes (Optional)</label>
                <textarea 
                  name="notes" 
                  value={form.notes} 
                  onChange={handleFormChange} 
                  placeholder="Anything we should know? (e.g. delivery instructions)"
                  rows={2}
                  className="w-full px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-[#F5ECD7] focus:outline-none focus:border-[#FF69B4] transition-all font-medium text-sm resize-none" 
                />
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
                disabled={
                  !form.name || 
                  !form.email || 
                  form.phone.length < 10 || 
                  form.address.length < 10 || 
                  !form.city || 
                  !form.pincode
                }
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

              <div className="flex flex-col gap-8">
                {/* UPI QR & Payment Info */}
                <div className="bg-gradient-to-br from-[#FFF8F0] to-[#FFF] p-8 rounded-[32px] border border-[#F5ECD7] flex flex-col items-center text-center gap-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#900C3F]" />
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#900C3F]">
                    <QrCode size={16} /> Scan QR to Pay
                  </div>
                  
                  {/* Glowing QR Frame */}
                  <div className="relative p-2 bg-white rounded-3xl border-2 border-[#900C3F]/20 shadow-md group hover:border-[#FF69B4] transition-colors duration-300">
                    <img 
                      src="/payment.jpeg" 
                      alt="UPI Payment QR Code"
                      className="w-56 object-contain rounded-2xl"
                    />
                    <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-tr from-[#900C3F] to-[#FF69B4] opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none -z-10" />
                  </div>

                  <p className="text-xs text-[#900C3F]/60 max-w-[280px]">
                    Scan the QR above using <strong>GPay, PhonePe, Paytm</strong>, or any UPI app to pay, or use the direct UPI transfer details below.
                  </p>

                  <div className="w-full h-[1px] bg-[#F5ECD7]" />

                  {/* Payment Details */}
                  <div className="w-full flex flex-col gap-3">
                    <div className="flex items-center justify-between bg-white px-5 py-3.5 rounded-2xl border border-[#F5ECD7]">
                      <div className="text-left">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[#900C3F]/40">Payee Name</p>
                        <p className="text-sm font-bold text-slate-800">Abhirami Binu Aluvila</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-white px-5 py-3.5 rounded-2xl border border-[#F5ECD7]">
                      <div className="text-left">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[#900C3F]/40">UPI ID</p>
                        <p className="text-sm font-bold font-mono">6354656157@fam</p>
                      </div>
                      <button 
                        onClick={() => copyToClipboard("6354656157@fam", "upi")}
                        className="p-2 bg-[#900C3F]/5 text-[#900C3F] hover:bg-[#900C3F] hover:text-white rounded-xl transition-all active:scale-95"
                        title="Copy UPI ID"
                      >
                        {copiedUpi ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-white px-5 py-3.5 rounded-2xl border border-[#F5ECD7]">
                      <div className="text-left">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[#900C3F]/40">Payable Amount</p>
                        <p className="text-sm font-bold font-serif text-[#900C3F]">₹{total}</p>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(total.toString(), "amount")}
                        className="p-2 bg-[#900C3F]/5 text-[#900C3F] hover:bg-[#900C3F] hover:text-white rounded-xl transition-all active:scale-95"
                        title="Copy Amount"
                      >
                        {copiedAmount ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Verification Fields */}
                <div className="flex flex-col gap-6 bg-white p-8 rounded-[32px] border border-[#F5ECD7]">
                  <div className="flex items-start gap-3 text-[#900C3F]">
                    <AlertCircle className="shrink-0 mt-0.5 text-[#FF69B4]" size={16} />
                    <div className="flex flex-col gap-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider">Verification Details</h4>
                      <p className="text-[11px] text-[#900C3F]/60">Upload the transaction receipt or screenshot to verify your payment.</p>
                    </div>
                  </div>

                  {/* Screenshot Upload */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#900C3F]/60">Upload Payment Receipt / Screenshot <span className="text-[#FF69B4]">*</span></label>
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#F5ECD7] hover:border-[#FF69B4] bg-[#F8F9FA] hover:bg-white rounded-2xl p-6 cursor-pointer transition-all relative overflow-hidden min-h-[100px]">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleScreenshotUpload}
                        disabled={uploadingScreenshot}
                        className="hidden" 
                      />
                      {uploadingScreenshot ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 size={24} className="animate-spin text-[#900C3F]" />
                          <span className="text-xs font-bold text-[#900C3F]/60">Uploading proof...</span>
                        </div>
                      ) : screenshotUrl ? (
                        <div className="flex items-center gap-4 w-full">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#F5ECD7] shrink-0 bg-white">
                            <img src={screenshotUrl} alt="Receipt Preview" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-xs font-bold text-emerald-600 truncate flex items-center gap-1.5">
                              <CheckCircle size={14} /> Uploaded Successfully
                            </p>
                            <p className="text-[9px] text-[#900C3F]/40 truncate">Click to replace screenshot</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-[#900C3F]/40">
                          <Upload size={24} />
                          <span className="text-xs font-bold">Select Receipt Photo</span>
                          <span className="text-[9px]">JPG, PNG supported</span>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handlePayment}
                    disabled={loading || uploadingScreenshot || !screenshotUrl}
                    className="w-full py-5 bg-[#900C3F] text-white rounded-[24px] font-bold text-base hover:bg-[#FF69B4] transition-all shadow-xl shadow-[#900C3F]/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-[#900C3F]"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Lock size={16} />}
                    {loading ? "Placing Order..." : `Submit Order • ₹${total}`}
                  </button>
                </div>
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
                  <span className="font-bold">{SHIPPING_FEE === 0 ? "Free" : `₹${SHIPPING_FEE}`}</span>
                </div>
                {amountUntilFreeShipping > 0 && (
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#FF69B4]">
                    Add ₹{amountUntilFreeShipping} more for free shipping
                  </p>
                )}

                <div className="flex flex-col gap-3 mt-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Iconic Privilege Code</p>
                  <div className="flex gap-2">
                    <input 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="ENTER CODE"
                      disabled={!!appliedCoupon}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF69B4] disabled:opacity-50"
                    />
                    {appliedCoupon ? (
                      <button onClick={removeCoupon} className="px-6 py-3 bg-rose-500/20 text-rose-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">Remove</button>
                    ) : (
                      <button 
                        onClick={applyCoupon} 
                        disabled={applyingCoupon || !couponCode}
                        className="px-6 py-3 bg-[#FF69B4] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                      >
                        {applyingCoupon ? "..." : "Apply"}
                      </button>
                    )}
                  </div>
                  {appliedCoupon && (
                    <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle size={12} /> Coupon "{appliedCoupon.code}" Applied!
                    </p>
                  )}
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-[#FF69B4]">
                    <span className="font-bold uppercase tracking-widest">Iconic Discount</span>
                    <span className="font-bold">-₹{couponDiscount}</span>
                  </div>
                )}
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
