import React from 'react';
import { Package, RefreshCcw, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  _id?: string;
  created_at: string;
  totalAmount: number;
  total_amount?: number;
  status: string;
  order_items?: any[];
  products?: any[];
  user?: { name?: string; email?: string };
  shippingDetails?: { name?: string; email?: string };
  profiles?: { name?: string; email?: string };
}

interface AdminOrdersTabProps {
  orders: Order[];
  loading: boolean;
  onRefresh: () => void;
}

export const AdminOrdersTab = ({ orders, loading, onRefresh }: AdminOrdersTabProps) => {
  const router = useRouter();
  
  const getDesignPreview = (item: any) => {
    const details = item.customization_details || item.customizationDetails || {};
    return details.preview_image || details.preview || details.canvasData || "";
  };

  return (
    <div className="bg-white rounded-[40px] border border-[#F5ECD7] overflow-hidden shadow-sm">
      <div className="p-8 border-b border-[#F5ECD7] flex justify-between items-center">
        <div className="flex gap-4">
           <button className="flex items-center gap-2 px-4 py-2 bg-[#900C3F] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">All Orders</button>
           <button className="flex items-center gap-2 px-4 py-2 hover:bg-[#F8F9FA] text-[#900C3F]/60 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors">Pending</button>
        </div>
        <button onClick={onRefresh} className="text-[#900C3F]/40 hover:text-[#900C3F] transition-colors">
          <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#F8F9FA] border-b border-[#F5ECD7]">
            <tr>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Order Ref</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Items</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Customer</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Revenue</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40">Status</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#900C3F]/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5ECD7]">
            {orders.map((o) => {
              const orderId = o.id || o._id || "unknown";
              return (
              <tr key={orderId} className="hover:bg-[#F8F9FA] transition-colors">
                <td className="px-8 py-6">
                   <p className="font-mono text-xs font-bold text-[#900C3F]">#{orderId.toString().slice(-6).toUpperCase()}</p>
                   <p className="text-[10px] font-medium text-[#900C3F]/40 mt-1">{new Date(o.created_at).toLocaleDateString()}</p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex -space-x-3 hover:-space-x-1 transition-all">
                     {(o.products || o.order_items || []).map((p: any, idx: number) => (
                        <div key={idx} className="w-10 h-10 rounded-xl border-2 border-white bg-[#F5ECD7] shadow-sm overflow-hidden flex items-center justify-center">
                           {getDesignPreview(p) ? <img src={getDesignPreview(p)} className="w-full h-full object-cover" alt="Preview" /> : <Package size={14} className="text-[#900C3F]/20" />}
                        </div>
                     ))}
                  </div>
                </td>
                <td className="px-8 py-6">
                   <p className="text-sm font-bold">{o.user?.name || o.shippingDetails?.name || o.profiles?.name || "Guest Checkout"}</p>
                   <p className="text-[10px] font-medium text-[#900C3F]/40">{o.user?.email || o.shippingDetails?.email || o.profiles?.email}</p>
                </td>
                <td className="px-8 py-6 font-bold text-sm">₹{o.totalAmount || o.total_amount}</td>
                <td className="px-8 py-6">
                   <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                      o.status === 'Delivered' ? 'bg-green-50 text-green-600' :
                      o.status === 'Shipped' ? 'bg-blue-50 text-blue-600' :
                      o.status === 'Cancelled' ? 'bg-red-50 text-red-500' :
                      'bg-orange-50 text-orange-600'
                   }`}>
                      {o.status}
                   </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button 
                    onClick={() => router.push(`/admin/orders/${orderId}`)} 
                    className="flex items-center gap-2 ml-auto px-4 py-2 bg-[#900C3F]/5 text-[#900C3F] rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-[#900C3F] hover:text-white transition-all"
                  >
                    Manage <ExternalLink size={12} />
                  </button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
};
