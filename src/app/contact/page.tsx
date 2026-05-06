"use client";

import Link from "next/link";
import { Mail, Send, MessageCircle, Camera } from "lucide-react";
import { useState } from "react";

import { Box, Layers, Palette as PaletteIcon, UploadCloud, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

function ContactForm() {
  const searchParams = useSearchParams();
  const isBulk = searchParams.get("type") === "bulk";

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: isBulk ? "Bulk Order Inquiry" : "",
    message: "",
    quantity: "50",
    bagType: "Plain Totes",
    logoUrl: ""
  });
  const [sent, setSent] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isBulk) {
      setForm(prev => ({ ...prev, subject: "Bulk Order Inquiry" }));
    }
  }, [isBulk]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setForm({ ...form, logoUrl: data.url });
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSent(true);
      }
    } catch (error) {
      console.error("Contact submission failed:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-5 gap-16">

        {/* Contact Form */}
        <div className="lg:col-span-3">
          <div className="flex gap-4 mb-10 border-b border-[#F5ECD7] pb-6">
            <Link
              href="/contact"
              className={`text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full transition-all ${!isBulk ? 'bg-[#900C3F] text-white shadow-lg shadow-[#900C3F]/20' : 'bg-white text-[#900C3F]/40'}`}
            >
              General Inquiry
            </Link>
            <Link
              href="/contact?type=bulk"
              className={`text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full transition-all ${isBulk ? 'bg-[#900C3F] text-white shadow-lg shadow-[#900C3F]/20' : 'bg-white text-[#900C3F]/40'}`}
            >
              Bulk / Wholesale
            </Link>
          </div>

          {sent ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <Send size={56} className="text-[#FF69B4]" />
              <h2 className="font-serif text-3xl font-bold">Message Sent!</h2>
              <p className="text-[#900C3F]/70">We'll get back to you within 24 hours.</p>
              <button onClick={() => setSent(false)} className="mt-4 text-sm font-bold uppercase tracking-widest border-b border-[#900C3F]/40 pb-1">
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <h2 className="font-serif text-3xl font-bold">{isBulk ? "Bulk Order Manifest" : "Send a Message"}</h2>

              {isBulk && (
                <div className="bg-[#900C3F]/5 p-8 rounded-3xl border border-[#900C3F]/10 grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#900C3F]/60 flex items-center gap-2"><Box size={12} /> Approx Quantity</label>
                    <select
                      value={form.quantity}
                      onChange={e => setForm({...form, quantity: e.target.value})}
                      className="w-full p-3 bg-white rounded-xl border border-[#F5ECD7] focus:outline-none focus:border-[#900C3F]"
                    >
                      <option value="50">50 - 100 Pieces</option>
                      <option value="200">100 - 500 Pieces</option>
                      <option value="500">500+ Pieces</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#900C3F]/60 flex items-center gap-2"><Layers size={12} /> Bag Category</label>
                    <select
                      value={form.bagType}
                      onChange={e => setForm({...form, bagType: e.target.value})}
                      className="w-full p-3 bg-white rounded-xl border border-[#F5ECD7] focus:outline-none focus:border-[#900C3F]"
                    >
                      <option>Plain Canvas</option>
                      <option>Premium Textured</option>
                      <option>Regular Daily</option>
                      <option>Custom Dyed</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 flex flex-col gap-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#900C3F]/60 flex items-center gap-2"><UploadCloud size={12} /> Upload Brand Logo (Optional)</label>
                    <div className="relative group">
                      <input type="file" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className="w-full p-6 border-2 border-dashed border-[#900C3F]/20 rounded-2xl bg-white flex flex-col items-center justify-center gap-2 group-hover:border-[#900C3F]/40 transition-all">
                        {uploading ? (
                          <Loader2 size={24} className="animate-spin text-[#900C3F]" />
                        ) : form.logoUrl ? (
                          <div className="flex items-center gap-3">
                            <img src={form.logoUrl} className="w-10 h-10 object-cover rounded-lg" />
                            <span className="text-sm font-bold text-green-600">Logo Uploaded Successfully</span>
                          </div>
                        ) : (
                          <>
                            <PaletteIcon size={24} className="text-[#900C3F]/20" />
                            <span className="text-sm font-bold opacity-40">Drop your logo or Click to Browse</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#900C3F]/60">Your Name</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Abhirami" required
                    className="w-full p-3 border-b border-[#900C3F]/30 bg-transparent focus:outline-none focus:border-[#FF69B4] transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#900C3F]/60">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@email.com" required
                    className="w-full p-3 border-b border-[#900C3F]/30 bg-transparent focus:outline-none focus:border-[#FF69B4] transition-colors" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-[#900C3F]/60">Subject</label>
                <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="Custom order, Wholesale inquiry…" required
                  className="w-full p-3 border-b border-[#900C3F]/30 bg-transparent focus:outline-none focus:border-[#FF69B4] transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-[#900C3F]/60">Message</label>
                <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={5} placeholder="Tell us what's on your mind…" required
                  className="w-full p-3 border-b border-[#900C3F]/30 bg-transparent focus:outline-none focus:border-[#FF69B4] transition-colors resize-none" />
              </div>
              <button type="submit"
                className="w-full py-4 bg-[#900C3F] text-[#FFF8F0] rounded-md font-semibold hover:bg-[#FF69B4] transition-colors text-lg flex items-center justify-center gap-2">
                <Send size={18} /> Send Message
              </button>
            </form>
          )}
        </div>

        {/* Contact Info */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div>
            <h2 className="font-serif text-3xl font-bold mb-6">Find Us</h2>
            <div className="flex flex-col gap-5">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-[#F5ECD7] flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-[#900C3F]" />
                </div>
                <div>
                  <p className="font-bold text-sm">Email</p>
                  <a href="mailto:hello@totallyiconic.in" className="text-[#900C3F]/70 text-sm hover:text-[#FF69B4] transition-colors">hello@totallyiconic.in</a>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-[#F5ECD7] flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={18} className="text-[#900C3F]" />
                </div>
                <div>
                  <p className="font-bold text-sm">WhatsApp</p>
                  <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer"
                    className="text-[#900C3F]/70 text-sm hover:text-[#FF69B4] transition-colors">
                    +91 99999 99999
                  </a>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-[#F5ECD7] flex items-center justify-center flex-shrink-0">
                  <Camera size={18} className="text-[#900C3F]" />
                </div>
                <div>
                  <p className="font-bold text-sm">Instagram</p>
                  <a href="https://instagram.com/TOTE_ALLY_ICONIC" target="_blank" rel="noopener noreferrer"
                    className="text-[#900C3F]/70 text-sm hover:text-[#FF69B4] transition-colors">
                    @TOTE_ALLY_ICONIC
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#FF69B4]/10 border border-[#FF69B4]/20 rounded-xl p-6">
            <p className="font-bold text-[#900C3F] mb-1">🎁 First 10 Orders</p>
            <p className="text-sm text-[#900C3F]/70">
              Get a free mystery freebie with every order among the first 10! Place yours now before they run out.
            </p>
            <Link href="/shop" className="mt-3 inline-block text-sm font-bold text-[#FF69B4] border-b border-[#FF69B4]/40">
              Shop Now →
            </Link>
          </div>
        </div>
      </div>
  );
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#FFF8F0] text-[#900C3F]">
      {/* Hero */}
      <div className="bg-[#F5ECD7]/40 border-b border-[#F5ECD7] py-16 text-center px-6">
        <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">Say Hello 👋</h1>
        <p className="text-[#900C3F]/70 max-w-lg mx-auto">
          We'd love to hear from you — whether it's a custom order inquiry, a collaboration idea, or just a kind note.
        </p>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#900C3F]" size={32} />
        </div>
      }>
        <ContactForm />
      </Suspense>
    </main>
  );
}
