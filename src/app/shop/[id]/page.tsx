"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, ArrowLeft, Sparkles, ShieldCheck, Truck, RefreshCw, Loader2, Palette } from "lucide-react";
import { useCartStore, CartItem } from "@/store/cartStore";
import Image from "next/image";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getFallbackProduct } from "@/lib/catalog";

interface Product {
  id: string;
  _id?: string;
  title: string;
  price: number;
  description: string;
  category: string;
  images: string[];
  is_customizable: boolean;
  stock: number;
}

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    async function getProduct() {
      if (!params?.id) return;
      try {
        const id = params.id as string;
        
        if (!isSupabaseConfigured()) {
          console.warn("Supabase not configured. Using placeholder for UI development only.");
          setProduct(getFallbackProduct(id));
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
          
        if (data) {
          setProduct(data);
        } else if (error) {
          console.error("Supabase product fetch error:", error);
          setProduct(getFallbackProduct(id));
        }
      } catch (err) {
        console.error("Failed to load product from cloud:", err);
        setProduct(getFallbackProduct(params.id as string));
      } finally {
        setLoading(false);
      }
    }
    getProduct();
  }, [params.id]);

  const handleAddToCart = () => {
    if (!product) return;
    const item: CartItem = {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      image: product.images?.[0],
      isCustomized: false,
    };
    addItem(item);
    openCart();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#900C3F]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex flex-col items-center justify-center gap-6">
        <h1 className="font-serif text-3xl font-bold">Bag not found</h1>
        <p className="text-[#900C3F]/50">The item you are looking for might have been moved or is currently out of sync with our cloud inventory.</p>
        <Link href="/shop" className="text-[#FF69B4] font-bold uppercase tracking-widest text-sm flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Collection
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF8F0] text-[#900C3F] p-6 lg:p-20">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24">
        
        <div className="flex-1">
          <Link href="/shop" className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#900C3F]/40 hover:text-[#900C3F] transition-colors">
            <ArrowLeft size={14} /> Back to Collection
          </Link>
          
          <div className="relative aspect-[4/5] bg-white rounded-[40px] overflow-hidden border border-[#F5ECD7] shadow-2xl">
            <Image
              src={(product.images && product.images.length > 0) ? product.images[0] : "/mockups/plain.png"} 
              alt={product.title} 
              fill
              className="object-cover"
              priority
            />
            <div className="absolute top-8 left-8">
               <span className="bg-[#900C3F] text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg">
                {product.category}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-8 pt-10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[#FF69B4] font-bold text-xs uppercase tracking-[0.3em]">
              <Sparkles size={14} /> Cloud Sync Active
            </div>
            <h1 className="font-serif text-5xl lg:text-7xl font-bold leading-tight">
              {product.title}
            </h1>
            <p className="text-3xl font-bold text-[#900C3F]">₹{product.price}</p>
          </div>

          <p className="text-lg leading-relaxed text-[#900C3F]/70 max-w-xl italic font-serif">
            "{product.description}"
          </p>

          <div className="flex flex-col gap-4 mt-4">
            <div className="flex gap-4">
               <button 
                onClick={handleAddToCart}
                className="flex-1 py-5 bg-[#900C3F] text-white rounded-3xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-[#900C3F]/20 hover:bg-[#FF69B4] transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <ShoppingBag size={20} /> Add to Cart
              </button>
              
              {product.is_customizable && (
                <Link 
                  href={`/customize?product=${product.id}`}
                  className="flex-1 py-5 bg-white border border-[#F5ECD7] text-[#900C3F] rounded-3xl font-bold text-sm uppercase tracking-widest hover:border-[#FF69B4] transition-all active:scale-95 flex items-center justify-center gap-3 shadow-sm"
                >
                  <Palette size={20} /> Personalize
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-12 border-t border-[#F5ECD7]">
            <div className="flex flex-col gap-2">
              <ShieldCheck size={24} className="text-[#FF69B4]" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Premium Quality</p>
            </div>
            <div className="flex flex-col gap-2">
              <Truck size={24} className="text-[#FF69B4]" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Fast Delivery</p>
            </div>
            <div className="flex flex-col gap-2">
              <RefreshCw size={24} className="text-[#FF69B4]" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Easy Returns</p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
