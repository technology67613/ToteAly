import { Metadata } from "next";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { ChevronLeft, Mail, Phone, MapPin, Calendar, ShoppingBag, Package, Star, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Customer Profile | ToteAly Admin",
  description: "Detailed iconic customer profile and order history.",
};

async function getCustomerData(id: string) {
  if (!id) return null;
  
  // 1. Try to find a registered profile first
  const { data: customer } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (customer) {
    const { data: orders } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    return { 
      customer: { ...customer, isGuest: false }, 
      orders: orders || [] 
    };
  }

  // 2. If no profile, it might be a guest (id = email)
  const decodedId = decodeURIComponent(id);
  if (decodedId.includes('@')) {
    const { data: guestOrders } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('shipping_details->>email', decodedId)
      .order('created_at', { ascending: false });

    if (guestOrders && guestOrders.length > 0) {
      const firstOrder = guestOrders[0];
      return {
        customer: {
          id: decodedId,
          name: firstOrder.shipping_details?.name || decodedId.split('@')[0],
          email: decodedId,
          phone: firstOrder.shipping_details?.phone,
          address: firstOrder.shipping_details?.address,
          created_at: firstOrder.created_at,
          isGuest: true
        },
        orders: guestOrders
      };
    }
  }

  return null;
}

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getCustomerData(id);
  if (!data) notFound();

  const { customer, orders } = data;
  const activeOrders = orders.filter((o: any) => o.status?.toLowerCase() !== 'cancelled');
  const totalSpent = activeOrders.reduce((acc: number, order: any) => acc + (order.total_amount || 0), 0);

  return (
    <div className="min-h-screen bg-[var(--admin-bg)] p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Breadcrumbs */}
        <Link 
          href="/admin?tab=customers" 
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-text-muted)] hover:text-[var(--admin-primary)] transition-colors"
        >
          <ChevronLeft size={14} /> Back to Audience
        </Link>

        {/* Profile Header */}
        <div className="bg-white rounded-[32px] border border-[var(--admin-border)] overflow-hidden shadow-sm">
          <div className="h-32 bg-[var(--admin-primary)]/5 border-b border-[var(--admin-border)]" />
          <div className="px-12 pb-12 -mt-16">
            <div className="flex flex-col md:flex-row items-end justify-between gap-8">
              <div className="flex items-end gap-8">
                <div className="w-32 h-32 rounded-[32px] bg-white border-4 border-white shadow-2xl flex items-center justify-center font-serif text-5xl font-bold text-[var(--admin-primary)] overflow-hidden">
                  {customer.name?.[0] || 'A'}
                </div>
                <div className="pb-2">
                  <h1 className="text-4xl font-serif font-bold text-[var(--admin-text-primary)]">{customer.name || "Iconic Customer"}</h1>
                  <p className={`text-sm font-bold uppercase tracking-widest mt-1 flex items-center gap-2 ${customer.isGuest ? 'text-amber-600' : 'text-[var(--admin-primary)]'}`}>
                    {customer.isGuest ? <ShoppingBag size={14} /> : <ShieldCheck size={14} />}
                    {customer.isGuest ? "Guest Shopper" : "Verified Iconic Member"}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 pb-2">
                 <a 
                   href={`mailto:${customer.email}`}
                   className="px-6 py-3 bg-[var(--admin-primary)] text-white rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-[var(--admin-primary)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                 >
                    Send Direct Message
                 </a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Contact Info */}
          <div className="space-y-10">
             <div className="bg-white p-8 rounded-[32px] border border-[var(--admin-border)] shadow-sm space-y-8">
                <h3 className="text-lg font-serif font-bold text-[var(--admin-text-primary)]">Customer Dossier</h3>
                <div className="space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--admin-light)] flex items-center justify-center text-[var(--admin-text-muted)]">
                         <Mail size={18} />
                      </div>
                      <div>
                         <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">Email Address</p>
                         <p className="text-sm font-bold text-[var(--admin-text-primary)]">{customer.email}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--admin-light)] flex items-center justify-center text-[var(--admin-text-muted)]">
                         <Phone size={18} />
                      </div>
                      <div>
                         <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">Contact Number</p>
                         <p className="text-sm font-bold text-[var(--admin-text-primary)]">{customer.phone || 'Not Provided'}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--admin-light)] flex items-center justify-center text-[var(--admin-text-muted)]">
                         <MapPin size={18} />
                      </div>
                      <div>
                         <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">Primary Shipping</p>
                         <p className="text-sm font-bold text-[var(--admin-text-primary)]">{customer.address || 'No Address on File'}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--admin-light)] flex items-center justify-center text-[var(--admin-text-muted)]">
                         <Calendar size={18} />
                      </div>
                      <div>
                         <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">Member Since</p>
                         <p className="text-sm font-bold text-[var(--admin-text-primary)]">{new Date(customer.created_at).toLocaleDateString()}</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-[var(--admin-primary)] p-8 rounded-[32px] text-white space-y-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Iconic Value</p>
                <div className="space-y-1">
                   <p className="text-4xl font-serif font-bold tracking-tighter">₹{totalSpent.toLocaleString()}</p>
                   <p className="text-xs font-medium opacity-80">Lifetime cloud expenditure</p>
                </div>
                <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                   <div className="flex items-center gap-2">
                      <ShoppingBag size={16} />
                      <span className="text-xs font-bold">{orders.length} {customer.isGuest ? 'Guest' : 'Iconic'} Orders</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <Star size={16} className="fill-white" />
                      <span className="text-xs font-bold text-white">{customer.isGuest ? 'Recent Shopper' : 'Top 5% User'}</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Right: Order History */}
          <div className="lg:col-span-2 space-y-8">
             <div className="bg-white rounded-[32px] border border-[var(--admin-border)] shadow-sm overflow-hidden">
                <div className="p-8 border-b border-[var(--admin-border)] flex justify-between items-center">
                   <h3 className="text-lg font-serif font-bold text-[var(--admin-text-primary)]">Acquisition History</h3>
                   <span className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">{orders.length} Transactions Found</span>
                </div>
                <div className="divide-y divide-[var(--admin-border)]">
                   {orders.map((order: any) => (
                      <Link 
                        key={order.id} 
                        href={`/admin/orders/${order.id}`}
                        className={`p-8 flex items-center justify-between hover:bg-[var(--admin-light)]/20 transition-all group ${order.status?.toLowerCase() === 'cancelled' ? 'bg-rose-50/10 opacity-70' : ''}`}
                      >
                         <div className="flex items-center gap-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${order.status?.toLowerCase() === 'cancelled' ? 'bg-rose-100 text-rose-600' : 'bg-[var(--admin-light)] text-[var(--admin-primary)]'}`}>
                               <Package size={24} />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-[var(--admin-text-primary)]">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                               <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mt-1">
                                  {new Date(order.created_at).toLocaleDateString()} • {order.order_items?.length || 0} Artifacts
                               </p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-lg font-bold text-[var(--admin-text-primary)] group-hover:text-[var(--admin-primary)] transition-colors">₹{order.total_amount}</p>
                            <span className={`inline-block px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest mt-1 border ${
                               order.status?.toLowerCase() === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                               order.status?.toLowerCase() === 'shipped' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                               order.status?.toLowerCase() === 'processing' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                               order.status?.toLowerCase() === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                               order.status?.toLowerCase() === 'cancelled' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                               'bg-slate-50 text-slate-500 border-slate-100'
                            }`}>
                               {order.status}
                            </span>
                         </div>
                      </Link>
                   ))}
                   {orders.length === 0 && (
                      <div className="p-20 text-center text-[var(--admin-text-muted)] italic text-sm">
                         This customer has not yet acquired any iconic artifacts.
                      </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
