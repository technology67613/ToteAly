import React from 'react';
import { ImageIcon, Settings, Trash2, Sparkles } from "lucide-react";

interface Product {
  id: string;
  _id?: string;
  title: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  is_customizable?: boolean;
}

interface AdminInventoryTabProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const AdminInventoryTab = ({ products, onEdit, onDelete }: AdminInventoryTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((p) => {
        const prodId = p.id || p._id || "prod";
        return (
        <div key={prodId} className="bg-white rounded-[32px] border border-[#F5ECD7] overflow-hidden group hover:shadow-2xl hover:shadow-[#900C3F]/5 transition-all">
           <div className="aspect-[4/3] bg-[#F8F9FA] relative flex items-center justify-center overflow-hidden border-b border-[#F5ECD7]">
              {p.images?.[0] ? <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={p.title} /> : <ImageIcon size={40} className="text-[#900C3F]/10" />}
               <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-bold uppercase tracking-widest border border-[#F5ECD7]">{p.category}</span>
                  {p.is_customizable && (
                     <span className="px-2 py-1 bg-[#900C3F] text-white rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                        <Sparkles size={10} /> Custom
                     </span>
                  )}
               </div>
              <div className="absolute inset-0 bg-[#900C3F]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                 <button onClick={() => onEdit(p)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#900C3F] hover:bg-[#FF69B4] hover:text-white transition-all"><Settings size={20} /></button>
                 <button onClick={() => onDelete(prodId)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={20} /></button>
              </div>
           </div>
           <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                 <div className="flex flex-col">
                    <h3 className="font-serif text-lg font-bold leading-tight truncate max-w-[150px]">{p.title}</h3>
                    <p className="text-sm font-bold text-[#900C3F]/40">₹{p.price}</p>
                 </div>
                 <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${p.stock < 10 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                    {p.stock} In Stock
                 </div>
              </div>
              <div className="w-full bg-[#F8F9FA] h-2 rounded-full overflow-hidden">
                 <div className={`h-full ${p.stock < 10 ? 'bg-red-500' : 'bg-[#900C3F]'} transition-all`} style={{ width: `${Math.min(100, (p.stock / 100) * 100)}%` }} />
              </div>
           </div>
        </div>
      )})}
    </div>
  );
};
