"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingBag, Sparkles, ArrowRight, Star, Truck, ShieldCheck, Heart } from "lucide-react";
import { useCartStore, CartItem } from "@/store/cartStore";
import Image from "next/image";
import { FALLBACK_PRODUCTS } from "@/lib/catalog";

const PERKS = [
  { icon: Truck, title: "Fast Shipping", desc: "Across India in 3-5 days" },
  { icon: ShieldCheck, title: "Secure Payment", desc: "Powered by Razorpay" },
  { icon: Heart, title: "Eco Friendly", desc: "100% Sustainable Canvas" },
];

export default function Home() {
  const { addItem, openCart } = useCartStore();
  const [igPosts, setIgPosts] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const heroProduct = featuredProducts[0];

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch("/api/products?featured=true");
        const data = await res.json();
        let products = Array.isArray(data) ? data : [];

        if (products.length === 0) {
          const fallbackRes = await fetch("/api/products?limit=4");
          const fallbackData = await fallbackRes.json();
          products = Array.isArray(fallbackData) ? fallbackData.slice(0, 4) : [];
        }

        const source = products.length > 0 ? products : FALLBACK_PRODUCTS.slice(0, 4);
        setFeaturedProducts(source.map(p => ({
          id: p.id,
          title: p.title,
          price: p.price,
          tag: p.category,
          image: p.images?.[0],
          isCustomizable: p.isCustomizable || p.is_customizable,
        })));
      } catch (e) {
        console.error("Featured product sync failed:", e);
        setFeaturedProducts(FALLBACK_PRODUCTS.slice(0, 4).map(p => ({
          id: p.id,
          title: p.title,
          price: p.price,
          tag: p.category,
          image: p.images?.[0],
          isCustomizable: p.isCustomizable,
        })));
      }
    }
    fetchFeatured();
    async function fetchIG() {
      try {
        // Try to get real-time posts from our custom proxy
        const res = await fetch("/api/social/instagram");
        const posts = await res.json();
        
        if (Array.isArray(posts) && posts.length > 0) {
          setIgPosts(posts.slice(0, 6));
        } else {
            setIgPosts([]);
        }
      } catch (e) {
        console.error("IG sync failed:", e);
        setIgPosts([]);
      }
    }
    fetchIG();
  }, []);

  const handleAddToCart = (product: any) => {
    const item: CartItem = {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      image: product.image,
      isCustomized: false,
    };
    addItem(item);
    openCart();
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#FFF8F0] text-[#900C3F]">
      {/* ── TOP BANNER ── */}
      <div className="w-full bg-[#FF69B4] text-white py-2 px-4 text-center text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em]">
        Free Shipping on all orders above ₹999 • Shop Now
      </div>

      {/* ── HERO SECTION ── */}
      <section className="max-w-7xl mx-auto w-full px-6 md:px-8 py-12 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2 text-[#FF69B4] font-bold text-xs uppercase tracking-[0.4em]">
             <Sparkles size={14} /> Made to Be Seen.
          </div>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.9] tracking-tighter">
            Tote-ally<br />Iconic.
          </h1>
          <p className="text-xl text-[#900C3F]/70 max-w-lg leading-relaxed">
            Elevating the everyday canvas into a statement of style. Sustainable, durable, and uniquely yours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/shop" className="px-8 lg:px-10 py-4 lg:py-5 bg-[#900C3F] text-white font-bold rounded-md hover:bg-[#FF69B4] transition-all shadow-xl shadow-[#900C3F]/20 text-center">
              Shop Collection
            </Link>
            <Link href="/customize" className="px-8 lg:px-10 py-4 lg:py-5 border-2 border-[#900C3F] font-bold rounded-md hover:bg-[#900C3F] hover:text-white transition-all text-center">
              Design Custom
            </Link>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full h-full bg-[#F5ECD7]/60 rounded-3xl relative overflow-hidden flex items-center justify-center border border-[#F5ECD7] min-h-[400px]">
            {heroProduct?.image ? (
              <Image src={heroProduct.image} alt={heroProduct.title} fill className="object-cover" priority />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[#900C3F]/30">
                <ShoppingBag size={72} />
              </div>
            )}
            <span className="absolute top-8 left-1/2 -translate-x-1/2 font-serif italic text-6xl text-white/40 pointer-events-none whitespace-nowrap z-10">
              Tote-ally<br />Iconic
            </span>
            <div className="absolute bottom-6 left-6 right-6 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm">
              <p className="font-bold text-sm">{heroProduct?.title || "Connect products in Supabase"}</p>
              <p className="text-[#FF69B4] font-bold">{heroProduct ? `₹${heroProduct.price}` : "No featured products"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PERKS BAR ── */}
      <section className="w-full border-y border-[#F5ECD7] py-12 px-6 md:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {PERKS.map((perk) => (
            <div key={perk.title} className="flex items-center gap-5">
              <div className="w-12 h-12 bg-[#F5ECD7] rounded-full flex items-center justify-center text-[#900C3F]">
                <perk.icon size={24} />
              </div>
              <div>
                <p className="font-bold text-sm uppercase tracking-widest">{perk.title}</p>
                <p className="text-xs text-[#900C3F]/60 mt-0.5">{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="max-w-7xl mx-auto w-full px-6 md:px-8 py-20 lg:py-24">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-6 sm:gap-0">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#FF69B4]">Curated Picks</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">Featured Styles</h2>
          </div>
          <Link href="/shop" className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-[#FF69B4] transition-colors">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {featuredProducts.map((product) => (
            <div key={product.id} className="group flex flex-col">
              <div className="w-full aspect-[4/5] bg-white rounded-3xl mb-4 relative overflow-hidden flex items-center justify-center border border-[#F5ECD7] shadow-sm">
                <Link href={`/shop/${product.id}`} className="absolute inset-0 z-10">
                  {product.image && <Image src={product.image} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />}
                </Link>
                <span className="absolute top-3 left-3 text-[10px] bg-white/90 backdrop-blur-sm text-[#900C3F] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest border border-[#F5ECD7] shadow-sm z-20">
                  {product.tag}
                </span>
                {product.isCustomizable && (
                  <Link href={`/customize?product=${product.id}`} className="absolute top-3 right-3 text-[10px] bg-[#FF69B4] text-white px-3 py-1.5 rounded-full font-bold uppercase tracking-widest shadow-sm z-20">
                    Design
                  </Link>
                )}
                <button
                  onClick={() => handleAddToCart(product)}
                  className="absolute bottom-0 left-0 right-0 py-3 bg-[#900C3F] text-[#FFF8F0] text-xs font-bold uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2 z-30"
                >
                  <ShoppingBag size={14} /> Add to Cart
                </button>
              </div>
              <Link href={`/shop/${product.id}`}>
                <h3 className="font-serif font-bold group-hover:text-[#FF69B4] transition-colors">{product.title}</h3>
              </Link>
              <p className="text-sm text-[#900C3F]/70 mt-0.5">₹{product.price}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CUSTOMIZER CTA ── */}
      <section className="w-full bg-[#900C3F] text-[#FFF8F0] py-16 lg:py-20 px-6 md:px-8">
        <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center text-center lg:text-left gap-10">
          <div className="flex-1">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#FF69B4] block mb-4">Personalize It</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 leading-tight">Your bag,<br />your rules.</h2>
            <p className="text-[#FFF8F0]/70 text-base md:text-lg max-w-md mx-auto lg:mx-0">
              Add your name, a quote, or your logo. Our live canvas customizer makes it effortless.
            </p>
          </div>
          <div className="flex-shrink-0 w-full lg:w-auto">
            <Link href="/customize"
              className="inline-flex items-center justify-center gap-3 w-full lg:w-auto px-10 py-5 bg-[#FF69B4] text-white font-bold text-lg rounded-md hover:bg-[#FFF8F0] hover:text-[#900C3F] transition-all duration-300">
              <Sparkles size={22} /> Design Your Tote
            </Link>
          </div>
        </div>
      </section>

      {/* ── BRAND STORY ── */}
      <section className="max-w-7xl mx-auto w-full px-6 md:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="w-full h-[300px] md:h-[500px] rounded-[40px] overflow-hidden border border-[#F5ECD7] shadow-2xl shadow-[#900C3F]/10 group relative">
          <Image
            src="/mockups/regular.png" 
            alt="Tote lifestyle" 
            fill
            className="object-cover transition-transform duration-[2000ms] group-hover:scale-110"
          />
        </div>
        <div className="flex flex-col gap-5 text-center lg:text-left items-center lg:items-start">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#FF69B4]">About The Brand</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight">Born from a love for<br />totes &amp; aesthetics.</h2>
          <p className="text-[#900C3F]/70 leading-relaxed max-w-lg">
            Tote-ally Iconic was founded by <strong>Khadija Memon &amp; Abhirami Aluvila</strong> — two friends who wanted bags that felt as bold and expressive as they did. We believe every bag tells a story. Make yours iconic.
          </p>
          <Link href="/about" className="self-center lg:self-start text-sm font-bold uppercase tracking-widest border-b border-[#900C3F]/40 pb-1 hover:text-[#FF69B4] hover:border-[#FF69B4] transition-colors">
            Read Our Story →
          </Link>
        </div>
      </section>

      {/* ── INSTAGRAM SECTION ── */}
      <section className="max-w-7xl mx-auto w-full px-6 md:px-8 pb-20">
        <h2 className="font-serif text-3xl md:text-4xl font-bold mb-2 text-center">@TOTE_ALLY_ICONIC</h2>
        <p className="text-center text-[#900C3F]/60 mb-10 text-sm px-4">Follow us on Instagram for daily drops &amp; behind the scenes.</p>
        
        <div className="w-full max-w-5xl mx-auto bg-white rounded-[32px] md:rounded-[40px] border border-[#F5ECD7] overflow-hidden shadow-2xl shadow-[#900C3F]/5 mt-10 h-[500px] md:h-[700px]">
          <iframe 
            src="https://www.instagram.com/tote_ally_iconic/embed" 
            className="w-full h-full border-none"
            title="Instagram Feed"
          />
        </div>
        
        <div className="text-center mt-12">
          <a href="https://www.instagram.com/tote_ally_iconic/" target="_blank" rel="noopener noreferrer"
            className="inline-block w-full sm:w-auto px-12 py-4 bg-[#900C3F] text-[#FFF8F0] font-bold rounded-md hover:bg-[#FF69B4] transition-all shadow-lg active:scale-95">
            Follow @tote_ally_iconic
          </a>
        </div>
      </section>

    </main>
  );
}
