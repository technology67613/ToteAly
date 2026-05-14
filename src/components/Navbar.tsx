"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/customize", label: "Customize" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { openCart, items } = useCartStore();
  const { data: session } = useSession();

  if (pathname?.startsWith("/admin")) return null;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted ? items.reduce((sum, i) => sum + i.quantity, 0) : 0;

  return (
    <nav className="w-full sticky top-0 z-30 bg-[#FFF8F0]/90 backdrop-blur-sm border-b border-[#F5ECD7]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-serif font-bold text-[#900C3F] tracking-tighter hover:text-[#FF69B4] transition-colors">
          Tote-ally Iconic
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 items-center text-sm font-semibold uppercase tracking-widest">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors hover:text-[#FF69B4] pb-0.5 ${
                pathname === link.href
                  ? "text-[#FF69B4] border-b border-[#FF69B4]"
                  : "text-[#900C3F]/80"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {session ? (
            <div className="hidden md:flex items-center gap-4">
              <Link href="/profile" className="text-sm font-semibold text-[#900C3F]/80 hover:text-[#FF69B4] transition-colors">
                {session.user?.name?.split(" ")[0]}
              </Link>
              <button
                onClick={() => signOut()}
                className="text-xs font-semibold uppercase tracking-widest text-[#900C3F]/50 hover:text-[#900C3F] transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link href="/login" className="hidden md:block text-sm font-semibold uppercase tracking-widest text-[#900C3F]/80 hover:text-[#FF69B4] transition-colors">
              Login
            </Link>
          )}

          {/* Cart */}
          <button
            onClick={openCart}
            className="relative text-[#900C3F] hover:text-[#FF69B4] transition-colors"
            aria-label="Open cart"
          >
            <ShoppingBag size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#FF69B4] text-white text-[10px] flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </button>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-[#900C3F] hover:text-[#FF69B4] transition-colors"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#FFF8F0] border-t border-[#F5ECD7] px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`font-semibold uppercase tracking-widest text-sm py-2 border-b border-[#F5ECD7] ${
                pathname === link.href ? "text-[#FF69B4]" : "text-[#900C3F]/80"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {session ? (
            <>
              <Link href="/profile" onClick={() => setMobileOpen(false)} className="text-sm font-semibold text-[#900C3F]/80 py-2">Profile</Link>
              <button onClick={() => { signOut(); setMobileOpen(false); }} className="text-sm font-semibold text-[#900C3F]/50 text-left py-2">Sign Out</button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm font-semibold text-[#900C3F]/80 py-2">Login</Link>
          )}
        </div>
      )}
    </nav>
  );
}
