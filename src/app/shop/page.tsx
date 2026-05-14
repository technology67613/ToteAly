"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingBag, Loader2, Sparkles, Heart } from "lucide-react";
import { useCartStore, CartItem } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import Image from "next/image";
import { FALLBACK_PRODUCTS } from "@/lib/catalog";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["All Products", "Plain Totes", "Premium", "Hampers"];

interface Product {
  id: string;
  _id?: string;
  title: string;
  price: number;
  category: string;
  isCustomizable: boolean;
  images: string[];
}

export default function Shop() {
  const { data: session } = useSession();
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, openCart } = useCartStore();
  const { items: wishlistItems, toggleItem, fetchWishlist } = useWishlistStore();

  useEffect(() => {
    if (session) fetchWishlist();
  }, [session, fetchWishlist]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const params = new URLSearchParams(window.location.search);
        const catParam = params.get("category");
        if (catParam && CATEGORIES.includes(catParam)) {
          setActiveCategory(catParam);
        }

        const res = await fetch("/api/products");
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data.length > 0 ? data : FALLBACK_PRODUCTS);
        } else {
          setProducts(FALLBACK_PRODUCTS);
        }
      } catch (err) {
        setProducts(FALLBACK_PRODUCTS);
      } finally {
        // Artificially delay for smooth transition
        setTimeout(() => setLoading(false), 500);
      }
    }
    loadProducts();
  }, []);

  const filtered = Array.isArray(products) 
    ? (activeCategory === "All Products"
      ? products
      : products.filter((p) => p.category === activeCategory))
    : [];

  const handleAddToCart = (product: Product) => {
    const safeId = product.id || product._id || "unknown";
    const item: CartItem = {
      id: `${safeId}-${Date.now()}`,
      productId: safeId,
      title: product.title,
      price: product.price,
      quantity: 1,
      image: product.images?.[0],
      isCustomized: false,
    };
    addItem(item);
    toast.success("Added to cart!", { duration: 1000 });
    openCart();
  };

  const handleWishlist = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      toast.error("Please login to save favorites", {
        action: {
          label: "Login",
          onClick: () => (window.location.href = "/login")
        }
      });
      return;
    }
    toggleItem(productId);
    const isInWishlist = wishlistItems.includes(productId);
    toast(isInWishlist ? "Removed from favorites" : "Saved to favorites", {
      icon: <Heart size={14} fill={isInWishlist ? "none" : "#FF69B4"} className="text-[#FF69B4]" />,
      duration: 1500
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-8 lg:p-16 bg-[#FFF8F0] text-[#900C3F]">
      <div className="w-full max-w-7xl flex flex-col gap-12">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#F5ECD7] pb-10">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[#FF69B4] font-bold text-xs uppercase tracking-[0.3em]">
              <Sparkles size={14} /> The Collection
            </div>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Tote-ally <span className="italic font-normal">Iconic.</span>
            </h1>
          </div>
          
          <div className="w-full md:w-auto flex gap-2 md:gap-4 overflow-x-auto pb-4 md:pb-0 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap text-[10px] md:text-xs font-bold uppercase tracking-widest px-4 md:px-6 py-2 md:py-3 rounded-full border transition-all ${
                  activeCategory === cat
                    ? "bg-[#900C3F] text-white border-[#900C3F] shadow-lg shadow-[#900C3F]/20"
                    : "bg-white text-[#900C3F]/60 border-[#F5ECD7] hover:border-[#FF69B4] hover:text-[#900C3F]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col gap-5 animate-pulse">
                <div className="aspect-[4/5] bg-[#F5ECD7]/50 rounded-3xl" />
                <div className="flex flex-col gap-2">
                  <div className="h-6 bg-[#F5ECD7]/50 rounded-md w-3/4" />
                  <div className="h-4 bg-[#F5ECD7]/50 rounded-md w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {filtered.map((product) => {
              const productId = product.id || product._id || "";
              const isLiked = wishlistItems.includes(productId);
              
              return (
                <div key={productId} className="group flex flex-col gap-5">
                  {/* Image Container */}
                  <div className="relative aspect-[4/5] bg-white rounded-3xl overflow-hidden border border-[#F5ECD7] shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-[#900C3F]/10 group-hover:-translate-y-2">
                    <Link href={`/shop/${productId}`} className="absolute inset-0 z-10">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]} 
                          alt={product.title} 
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#900C3F]/10">
                          <ShoppingBag size={64} />
                        </div>
                      )}
                    </Link>

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => handleWishlist(e, productId)}
                      className="absolute top-4 right-4 z-30 p-3 rounded-full bg-white/80 backdrop-blur-md border border-[#F5ECD7] text-[#900C3F] hover:text-[#FF69B4] hover:scale-110 transition-all shadow-sm"
                    >
                      <Heart 
                        size={18} 
                        fill={isLiked ? "#FF69B4" : "none"} 
                        className={isLiked ? "text-[#FF69B4]" : ""} 
                      />
                    </button>

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                      {product.isCustomizable && (
                        <span className="text-[10px] bg-white/90 backdrop-blur-sm text-[#FF69B4] px-3 py-1.5 rounded-full font-bold shadow-sm uppercase tracking-widest border border-[#F5ECD7]">
                          Customizable
                        </span>
                      )}
                      {product.category === "Premium" && (
                        <span className="text-[10px] bg-[#900C3F] text-white px-3 py-1.5 rounded-full font-bold shadow-sm uppercase tracking-widest border border-[#900C3F]">
                          Premium
                        </span>
                      )}
                    </div>

                    {/* Hover Quick Add */}
                    <div className="absolute inset-0 bg-[#900C3F]/0 group-hover:bg-[#900C3F]/5 transition-all duration-500 flex items-end p-6 z-30">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full py-4 bg-[#900C3F] text-white font-bold text-sm uppercase tracking-widest rounded-2xl translate-y-20 group-hover:translate-y-0 transition-transform duration-500 shadow-xl shadow-[#900C3F]/30 flex items-center justify-center gap-3 hover:bg-[#FF69B4]"
                      >
                        <ShoppingBag size={18} /> Quick Add
                      </button>
                    </div>
                  </div>

                  {/* Info Container */}
                  <div className="flex flex-col gap-1 px-2">
                    <div className="flex justify-between items-start">
                      <Link href={`/shop/${productId}`}>
                        <h3 className="font-serif text-2xl font-bold tracking-tight group-hover:text-[#FF69B4] transition-colors">
                          {product.title}
                        </h3>
                      </Link>
                      <p className="font-bold text-lg">₹{product.price}</p>
                    </div>
                    <p className="text-sm text-[#900C3F]/50 font-medium uppercase tracking-widest mb-2">
                      {product.category}
                    </p>
                    {product.isCustomizable && (
                      <Link 
                        href={`/customize?product=${productId}`} 
                        className="text-xs text-[#FF69B4] font-bold underline decoration-[#FF69B4]/30 underline-offset-4 hover:decoration-[#FF69B4] transition-all"
                      >
                        Personalize your bag →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="py-24 text-center bg-white border border-[#F5ECD7] rounded-[32px]">
            <p className="font-serif text-3xl font-bold mb-3">No bags in this category yet.</p>
            <p className="text-[#900C3F]/60 mb-8">Try another collection or start a custom design.</p>
            <Link href="/customize" className="inline-flex px-8 py-4 bg-[#900C3F] text-white rounded-md font-bold hover:bg-[#FF69B4] transition-colors">
              Open Design Studio
            </Link>
          </div>
        )}

        {/* Footer Accent */}
        {!loading && filtered.length > 0 && (
          <div className="mt-20 py-12 border-t border-[#F5ECD7] flex flex-col items-center text-center gap-4">
            <p className="font-serif italic text-2xl text-[#900C3F]/40">Cannot find what you are looking for?</p>
            <Link 
              href="/contact" 
              className="text-xs font-bold uppercase tracking-[0.3em] text-[#FF69B4] hover:tracking-[0.4em] transition-all"
            >
              Order a Custom Bulk Set
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
