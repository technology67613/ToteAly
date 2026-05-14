"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, ArrowLeft, Sparkles, ShieldCheck, Truck, RefreshCw, Loader2, Palette, Heart, Star, MessageSquare } from "lucide-react";
import { useCartStore, CartItem } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import Image from "next/image";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getFallbackProduct } from "@/lib/catalog";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

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

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: {
    name: string;
    avatar_url: string;
  };
}

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  
  const { addItem, openCart } = useCartStore();
  const { items: wishlistItems, toggleItem, fetchWishlist } = useWishlistStore();

  const isLiked = product ? wishlistItems.includes(product.id) : false;

  useEffect(() => {
    if (session) fetchWishlist();
  }, [session, fetchWishlist]);

  useEffect(() => {
    async function getProduct() {
      if (!params?.id) return;
      try {
        const id = params.id as string;
        
        if (!isSupabaseConfigured()) {
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
          const res = await fetch(`/api/products/${id}/reviews`);
          if (res.ok) {
            const reviewsData = await res.json();
            setReviews(reviewsData);
          }
        } else if (error) {
          setProduct(getFallbackProduct(id));
        }
      } catch (err) {
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
    toast.success("Added to cart!", { duration: 1000 });
    openCart();
  };

  const handleWishlist = () => {
    if (!product) return;
    if (!session) {
      toast.error("Please login to save favorites");
      return;
    }
    toggleItem(product.id);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !product) return;
    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview),
      });
      if (res.ok) {
        toast.success("Review submitted for approval!");
        setNewReview({ rating: 5, comment: "" });
      } else {
        toast.error("Failed to submit review");
      }
    } catch (err) {
      toast.error("Error submitting review");
    } finally {
      setSubmittingReview(false);
    }
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
        <p className="text-[#900C3F]/50">The item you are looking for might have been moved.</p>
        <Link href="/shop" className="text-[#FF69B4] font-bold uppercase tracking-widest text-sm flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Collection
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF8F0] text-[#900C3F] p-6 lg:p-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mb-32">
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
              <div className="flex items-center gap-6">
                <p className="text-3xl font-bold text-[#900C3F]">₹{product.price}</p>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-[#F5ECD7] shadow-sm">
                    <Star size={14} fill="#FF69B4" className="text-[#FF69B4]" />
                    <span className="text-xs font-bold">4.8 ({reviews.length})</span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-lg leading-relaxed text-[#900C3F]/70 max-w-xl italic font-serif">
              "{product.description}"
            </p>

            <div className="flex flex-col gap-4 mt-4">
              <div className="flex gap-4">
                <button 
                  onClick={handleAddToCart}
                  className="flex-[2] py-5 bg-[#900C3F] text-white rounded-3xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-[#900C3F]/20 hover:bg-[#FF69B4] transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <ShoppingBag size={20} /> Add to Cart
                </button>
                
                <button 
                  onClick={handleWishlist}
                  className={`flex-1 py-5 rounded-3xl font-bold text-sm uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 shadow-sm border ${
                    isLiked ? "bg-[#FF69B4]/10 border-[#FF69B4] text-[#FF69B4]" : "bg-white border-[#F5ECD7] text-[#900C3F]"
                  }`}
                >
                  <Heart size={20} fill={isLiked ? "#FF69B4" : "none"} />
                  {isLiked ? "Saved" : "Save"}
                </button>
              </div>

              {product.is_customizable && (
                <Link 
                  href={`/customize?product=${product.id}`}
                  className="w-full py-5 bg-white border border-[#F5ECD7] text-[#900C3F] rounded-3xl font-bold text-sm uppercase tracking-widest hover:border-[#FF69B4] transition-all active:scale-95 flex items-center justify-center gap-3 shadow-sm"
                >
                  <Palette size={20} /> Personalize this bag
                </Link>
              )}
            </div>

            </div>
          </div>

        <div className="border-t border-[#F5ECD7] pt-20">
          <div className="flex flex-col lg:flex-row gap-20">
            <div className="lg:w-1/3 flex flex-col gap-8">
              <h2 className="font-serif text-4xl font-bold">Community <span className="italic font-normal text-[#FF69B4]">Love.</span></h2>
              
              {session ? (
                <form onSubmit={handleSubmitReview} className="bg-white p-8 rounded-[32px] border border-[#F5ECD7] shadow-sm flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-bold uppercase tracking-widest">Rating</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          className="hover:scale-110 transition-transform"
                        >
                          <Star 
                            size={24} 
                            fill={star <= newReview.rating ? "#FF69B4" : "none"} 
                            className={star <= newReview.rating ? "text-[#FF69B4]" : "text-[#F5ECD7]"} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-bold uppercase tracking-widest">Your Experience</p>
                    <textarea 
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      placeholder="How's your new bag?"
                      className="w-full h-32 bg-[#FFF8F0] border border-[#F5ECD7] rounded-xl p-4 text-sm focus:outline-none focus:border-[#FF69B4]"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full py-4 bg-[#900C3F] text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#900C3F]/20 hover:bg-[#FF69B4] transition-all disabled:opacity-50"
                  >
                    {submittingReview ? "Submitting..." : "Post Review"}
                  </button>
                </form>
              ) : (
                <div className="bg-[#900C3F] text-white p-8 rounded-[32px] shadow-xl">
                  <p className="font-serif text-xl mb-4 italic">Love your bag? Tell the world.</p>
                  <Link href="/login" className="text-xs font-bold uppercase tracking-widest bg-white text-[#900C3F] px-6 py-3 rounded-full hover:bg-[#FF69B4] hover:text-white transition-all inline-block">
                    Login to Review
                  </Link>
                </div>
              )}
            </div>

            <div className="flex-1">
              {reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white p-8 rounded-[32px] border border-[#F5ECD7] shadow-sm flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#F5ECD7] overflow-hidden">
                            {review.profiles.avatar_url ? (
                              <Image src={review.profiles.avatar_url} alt={review.profiles.name} width={40} height={40} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#900C3F]/30 font-bold uppercase">
                                {review.profiles.name[0]}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{review.profiles.name}</p>
                            <p className="text-[10px] text-[#900C3F]/40 uppercase tracking-widest">
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={10} fill={i < review.rating ? "#FF69B4" : "none"} className={i < review.rating ? "text-[#FF69B4]" : "text-[#F5ECD7]"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm italic leading-relaxed text-[#900C3F]/70">"{review.comment}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center gap-4 bg-white/50 rounded-[40px] border border-dashed border-[#F5ECD7]">
                  <MessageSquare size={40} className="text-[#900C3F]/10" />
                  <p className="font-serif italic text-xl text-[#900C3F]/40">No reviews yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
