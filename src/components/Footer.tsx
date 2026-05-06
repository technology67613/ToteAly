import Link from "next/link";
import { Camera, Send, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#F5ECD7] pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        {/* Brand */}
        <div className="flex flex-col gap-6">
          <h2 className="font-serif text-2xl font-bold text-[#900C3F] tracking-tighter">Tote-ally Iconic</h2>
          <p className="text-sm text-[#900C3F]/70 leading-relaxed">
            Premium Gen Z tote bag brand based in India. Made to be seen, crafted to last.
          </p>
          <div className="flex gap-4">
            <a href="https://instagram.com/TOTE_ALLY_ICONIC" target="_blank" className="w-10 h-10 rounded-full bg-[#F5ECD7] flex items-center justify-center text-[#900C3F] hover:bg-[#FF69B4] hover:text-white transition-all">
              <Camera size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-[#F5ECD7] flex items-center justify-center text-[#900C3F] hover:bg-[#FF69B4] hover:text-white transition-all">
              <Send size={18} />
            </a>
            <a href="mailto:hello@totallyiconic.in" className="w-10 h-10 rounded-full bg-[#F5ECD7] flex items-center justify-center text-[#900C3F] hover:bg-[#FF69B4] hover:text-white transition-all">
              <Mail size={18} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Shop</h3>
          <nav className="flex flex-col gap-3 text-sm font-semibold">
            <Link href="/shop" className="hover:text-[#FF69B4] transition-colors">New Arrivals</Link>
            <Link href="/customize" className="hover:text-[#FF69B4] transition-colors">Custom Designer</Link>
            <Link href="/shop" className="hover:text-[#FF69B4] transition-colors">Premium Collection</Link>
            <Link href="/shop" className="hover:text-[#FF69B4] transition-colors">Hampers</Link>
          </nav>
        </div>

        {/* Support */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Support</h3>
          <nav className="flex flex-col gap-3 text-sm font-semibold">
            <Link href="/contact" className="hover:text-[#FF69B4] transition-colors">Contact Us</Link>
            <Link href="/about" className="hover:text-[#FF69B4] transition-colors">About Story</Link>
            <Link href="#" className="hover:text-[#FF69B4] transition-colors">Shipping Policy</Link>
            <Link href="#" className="hover:text-[#FF69B4] transition-colors">Returns & Refunds</Link>
          </nav>
        </div>

        {/* Newsletter */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Newsletter</h3>
          <p className="text-sm text-[#900C3F]/70">Join the iconic club for early access and drops.</p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Your email" 
              className="flex-1 bg-[#F5ECD7]/30 border border-[#F5ECD7] px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-[#FF69B4]" 
            />
            <button className="bg-[#900C3F] text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-[#FF69B4] transition-all">Join</button>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-[#F5ECD7] flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#900C3F]/40">
          © 2026 Tote-ally Iconic. All rights reserved.
        </p>
        <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest text-[#900C3F]/40">
          <Link href="/privacy" className="hover:text-[#900C3F]">Privacy</Link>
          <Link href="/terms" className="hover:text-[#900C3F]">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
