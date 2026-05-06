"use client";

import { useCartStore } from "@/store/cartStore";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartSidebar() {
  const { isOpen, closeCart, items, updateQuantity, removeItem } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#900C3F]/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-[#FFF8F0] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        <div className="p-6 border-b border-[#F5ECD7] flex justify-between items-center bg-[#F5ECD7]/50">
          <h2 className="font-serif text-2xl font-bold text-[#900C3F]">Your Cart</h2>
          <button onClick={closeCart} className="text-[#900C3F] hover:text-[#FF69B4] transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {items.length === 0 ? (
            <div className="text-center text-[#900C3F]/60 mt-12 flex flex-col items-center gap-4">
              <p>Your cart is empty.</p>
              <button onClick={closeCart} className="text-sm font-bold uppercase tracking-widest border-b border-[#900C3F] pb-1">
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 border-b border-[#F5ECD7] pb-4">
                <div className="w-20 h-24 bg-white rounded-xl overflow-hidden flex items-center justify-center relative border border-[#F5ECD7]">
                  <img 
                    src={item.customizationDetails?.preview || item.image || "/products/plain.png"} 
                    alt={item.title} 
                    className="object-contain w-full h-full" 
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-[#900C3F]">{item.title}</h3>
                    {item.isCustomized && (
                      <span className="text-xs bg-[#FF69B4]/10 text-[#FF69B4] px-2 py-0.5 rounded-full font-semibold border border-[#FF69B4]/20">
                        Customized
                      </span>
                    )}
                    <p className="text-[#900C3F]/70 text-sm mt-1">₹{item.price}</p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-3 bg-[#F5ECD7]/50 rounded px-2 py-1">
                      <button 
                        onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                        className="text-[#900C3F] hover:text-[#FF69B4]"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-semibold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-[#900C3F] hover:text-[#FF69B4]"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-[#900C3F]/50 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-[#F5ECD7] bg-[#F5ECD7]/30">
            <div className="flex justify-between items-center mb-6">
              <span className="font-serif text-xl text-[#900C3F]">Total</span>
              <span className="font-serif text-2xl font-bold text-[#900C3F]">₹{total}</span>
            </div>
            <Link 
              href="/checkout" 
              onClick={closeCart}
              className="w-full block text-center py-4 bg-[#900C3F] text-[#FFF8F0] rounded-md font-semibold hover:bg-[#FF69B4] transition-colors text-lg"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
