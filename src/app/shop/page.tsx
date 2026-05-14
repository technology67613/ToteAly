"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingBag, Loader2, Sparkles } from "lucide-react";
import { useCartStore, CartItem } from "@/store/cartStore";
import Image from "next/image";
import { FALLBACK_PRODUCTS } from "@/lib/catalog";
import { toast } from "sonner";

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
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data.length > 0 ? data : FALLBACK_PRODUCTS);
        } else {
          console.error("Failed to load products, expected an array but got:", data);
          setProducts(FALLBACK_PRODUCTS);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
        setProducts(FALLBACK_PRODUCTS);
      } finally {
        setLoading(false);
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
    toast.success("Added to cart!");
    openCart();
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-8 lg:p-16 bg-[#FFF8F0] text-[#900C3F]">
      <div className="w-full max-w-7xl flex flex-col gap-12">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-[#F5ECD7] pb-10">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[#FF69B4] font-bold text-xs uppercase tracking-[0.3em]">
              <Sparkles size={14} /> The Collection
            </div>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Tote-ally <span className="italic font-normal">Iconic.</span>
            </h1>
          </div>
          
          <div className="flex gap-2 md:gap-4 overflow-x-auto pb-4 md:pb-0 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
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
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#900C3F]" />
            <p className="font-serif italic text-[#900C3F]/60">Curating the finest bags for you...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {filtered.map((product) => (
              <div key={product.id || product._id} className="group flex flex-col gap-5">
                {/* Image Container */}
                <div className="relative aspect-[4/5] bg-white rounded-3xl overflow-hidden border border-[#F5ECD7] shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-[#900C3F]/10 group-hover:-translate-y-2">
                  <Link href={`/shop/${product.id || product._id}`} className="absolute inset-0 z-10">
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
                    <Link href={`/shop/${product.id || product._id}`}>
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
                      href={`/customize?product=${product.id || product._id}`} 
                      className="text-xs text-[#FF69B4] font-bold underline decoration-[#FF69B4]/30 underline-offset-4 hover:decoration-[#FF69B4] transition-all"
                    >
                      Personalize your bag →
                    </Link>
                  )}
                </div>
              </div>
            ))}
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
