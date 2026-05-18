"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Package, User, MapPin, Heart, Settings, LogOut, Loader2, Zap, Plus,
  X, CheckCircle2, Clipboard, Phone, Calendar, CreditCard, Receipt, FileText, ChevronRight
} from "lucide-react";
import DownloadInvoice from "@/components/DownloadInvoice";

const STATUS_COLORS: Record<string, string> = {
  Delivered: "bg-green-100 text-green-700",
  Shipped: "bg-blue-100 text-blue-700",
  Confirmed: "bg-yellow-100 text-yellow-700",
  Pending: "bg-[#F5ECD7] text-[#900C3F]",
  Cancelled: "bg-red-100 text-red-700",
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<"orders" | "settings" | "wishlist" | "designs">("orders");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  
  // Data states
  const [orders, setOrders] = useState<any[]>([]);
  const [designs, setDesigns] = useState<any[]>([]);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingDesigns, setLoadingDesigns] = useState(true);
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  
  // Profile Form States
  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    }
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (session?.user) {
      fetchOrders();
      fetchProfile();
      fetchDesigns();
      fetchWishlist();
    }
  }, [session]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (e) {
      console.error("Failed to fetch orders:", e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchDesigns = async () => {
    try {
      const res = await fetch("/api/designs");
      const data = await res.json();
      if (Array.isArray(data)) {
        setDesigns(data);
      }
    } catch (e) {
      console.error("Failed to fetch designs:", e);
    } finally {
      setLoadingDesigns(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist");
      const data = await res.json();
      if (Array.isArray(data)) {
        setWishlistItems(data);
      }
    } catch (e) {
      console.error("Failed to fetch wishlist:", e);
    } finally {
      setLoadingWishlist(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      if (res.ok) {
        setProfileData({
          name: data.name || session?.user?.name || "",
          phone: data.phone || "",
          address: {
            street: data.address?.street || "",
            city: data.address?.city || "",
            state: data.address?.state || "",
            postalCode: data.address?.postalCode || "",
            country: data.address?.country || "",
          }
        });
      }
    } catch (e) {
      console.error("Failed to fetch profile:", e);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setSaveMessage("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      if (res.ok) {
        setSaveMessage("Profile updated successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        setSaveMessage("Failed to update profile.");
      }
    } catch (error) {
      setSaveMessage("An error occurred.");
    } finally {
      setSavingProfile(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#FF69B4] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#FFF8F0] text-[#900C3F] py-12 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-10">
        
        {/* Sidebar */}
        <div className="w-full md:w-1/4 flex flex-col gap-6">
          <div className="bg-white border border-[#F5ECD7] rounded-2xl p-6 text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-[#F5ECD7] border-4 border-[#FFF8F0] shadow-sm flex items-center justify-center overflow-hidden mb-4">
              {session.user?.image ? (
                <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-[#900C3F]/50" />
              )}
            </div>
            <h1 className="font-serif text-xl font-bold">{profileData.name || session.user?.name}</h1>
            <p className="text-[#900C3F]/60 text-xs truncate w-full">{session.user?.email}</p>
          </div>

          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-3 p-4 rounded-xl font-semibold transition-all ${
                activeTab === "orders" ? "bg-[#FF69B4] text-white shadow-md" : "bg-white hover:bg-[#F5ECD7]/50 border border-[#F5ECD7]"
              }`}
            >
              <Package size={18} /> My Orders
            </button>
            <button
              onClick={() => setActiveTab("designs")}
              className={`flex items-center gap-3 p-4 rounded-xl font-semibold transition-all ${
                activeTab === "designs" ? "bg-[#FF69B4] text-white shadow-md" : "bg-white hover:bg-[#F5ECD7]/50 border border-[#F5ECD7]"
              }`}
            >
              <Zap size={18} /> Saved Designs
            </button>
            <button
              onClick={() => setActiveTab("wishlist")}
              className={`flex items-center gap-3 p-4 rounded-xl font-semibold transition-all ${
                activeTab === "wishlist" ? "bg-[#FF69B4] text-white shadow-md" : "bg-white hover:bg-[#F5ECD7]/50 border border-[#F5ECD7]"
              }`}
            >
              <Heart size={18} /> Wishlist
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-3 p-4 rounded-xl font-semibold transition-all ${
                activeTab === "settings" ? "bg-[#FF69B4] text-white shadow-md" : "bg-white hover:bg-[#F5ECD7]/50 border border-[#F5ECD7]"
              }`}
            >
              <Settings size={18} /> Profile Settings
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-3 p-4 rounded-xl font-semibold bg-white border border-red-100 text-red-500 hover:bg-red-50 transition-all mt-4"
            >
              <LogOut size={18} /> Log Out
            </button>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          
          {/* Orders Tab */}
          {activeTab === "orders" && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="font-serif text-3xl font-bold mb-6">Order History</h2>
              {loadingOrders ? (
                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[#FF69B4]" size={32} /></div>
              ) : (
                <div className="flex flex-col gap-4">
                  {orders.map((order) => (
                    <div 
                      key={order.id} 
                      onClick={() => setSelectedOrder(order)}
                      className="bg-white border border-[#F5ECD7] rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md cursor-pointer hover:border-[#FF69B4]/50 hover:bg-[#FFF8F0]/30"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-lg">Order #{order.id?.slice(-6).toUpperCase()}</p>
                          {!order.user_id && (
                            <span className="text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-orange-100 text-orange-700 border border-orange-200">Guest User</span>
                          )}
                        </div>
                        <p className="text-sm text-[#900C3F]/60">{new Date(order.created_at).toLocaleDateString()} • {(order.order_items || order.items || [])?.length || 0} items</p>
                      </div>
                      <div className="flex flex-col md:items-end gap-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold w-max ${STATUS_COLORS[order.status] || ""}`}>
                          {order.status}
                        </span>
                        <p className="font-bold text-xl">₹{order.total_amount || order.totalAmount}</p>
                      </div>
                    </div>
                  ))}

                  {orders.length === 0 && (
                    <div className="bg-white border border-[#F5ECD7] rounded-2xl p-16 text-center text-[#900C3F]/50">
                      <Package size={48} className="mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-bold">No orders yet</p>
                      <p className="text-sm mt-1">Time to get iconic and place your first order!</p>
                      <Link href="/shop" className="inline-block mt-6 px-8 py-3 bg-[#900C3F] text-white rounded-xl font-bold hover:bg-[#FF69B4] transition-all">Browse Shop</Link>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Designs Tab */}
          {activeTab === "designs" && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-3xl font-bold">My Saved Designs</h2>
                <Link href="/customize" className="text-sm font-bold text-[#FF69B4] hover:underline flex items-center gap-1">
                  <Plus size={16} /> Create New
                </Link>
              </div>
              
              {loadingDesigns ? (
                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[#FF69B4]" size={32} /></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {designs.map((design) => (
                    <div key={design.id} className="bg-white border border-[#F5ECD7] rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-500">
                      <div className="aspect-square bg-[#F5ECD7]/30 relative overflow-hidden">
                        <img 
                          src={design.preview_image || design.preview_url} 
                          alt={design.title || design.name} 
                          className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                           <Link 
                            href={`/customize?designId=${design.id}`}
                            className="bg-white text-[#900C3F] px-6 py-2 rounded-full font-bold text-sm shadow-xl"
                           >
                            Edit Design
                           </Link>
                        </div>
                      </div>
                      <div className="p-4 border-t border-[#F5ECD7]">
                        <p className="font-bold text-[#900C3F] truncate">{design.title || design.name}</p>
                        <p className="text-[10px] uppercase tracking-widest text-[#900C3F]/50 mt-1">
                          Created {new Date(design.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}

                  {designs.length === 0 && (
                    <div className="col-span-full bg-white border border-[#F5ECD7] rounded-2xl p-16 text-center text-[#900C3F]/50">
                      <Zap size={48} className="mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-bold">No designs saved yet</p>
                      <p className="text-sm mt-1">Bring your ideas to life in the Studio!</p>
                      <Link href="/customize" className="inline-block mt-6 px-8 py-3 bg-[#900C3F] text-white rounded-xl font-bold hover:bg-[#FF69B4] transition-all">Go to Studio</Link>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Wishlist Tab */}
          {activeTab === "wishlist" && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="font-serif text-3xl font-bold mb-6">My Wishlist</h2>
              
              {loadingWishlist ? (
                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[#FF69B4]" size={32} /></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {wishlistItems.map((item) => (
                    <Link key={item.product_id} href={`/shop/${item.product_id}`} className="bg-white border border-[#F5ECD7] rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-500">
                      <div className="aspect-square bg-[#F5ECD7]/30 relative overflow-hidden">
                        <img 
                          src={(item.products?.images && item.products.images.length > 0) ? item.products.images[0] : "/mockups/plain.png"} 
                          alt={item.products?.title || "Product"} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <div className="p-4 border-t border-[#F5ECD7] flex justify-between items-center">
                        <div>
                          <p className="font-bold text-[#900C3F]">{item.products?.title || "Iconic Bag"}</p>
                          <p className="text-sm font-bold text-[#FF69B4]">₹{item.products?.price}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#FFF8F0] flex items-center justify-center text-[#FF69B4]">
                           <Heart size={20} fill="#FF69B4" />
                        </div>
                      </div>
                    </Link>
                  ))}


                  {wishlistItems.length === 0 && (
                    <div className="col-span-full bg-white border border-[#F5ECD7] rounded-2xl p-16 text-center text-[#900C3F]/50">
                      <Heart size={48} className="mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-bold">Your wishlist is empty</p>
                      <p className="text-sm mt-1">Save your favorites while browsing the shop!</p>
                      <Link href="/shop" className="inline-block mt-6 px-8 py-3 bg-[#900C3F] text-white rounded-xl font-bold hover:bg-[#FF69B4] transition-all">Explore Collection</Link>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="font-serif text-3xl font-bold mb-6">Profile Settings</h2>
              
              <div className="bg-white border border-[#F5ECD7] rounded-2xl p-8">
                <form onSubmit={handleProfileSubmit} className="flex flex-col gap-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold opacity-80">Full Name</label>
                      <input 
                        type="text" 
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="p-3 bg-[#F5ECD7]/30 border border-[#F5ECD7] rounded-xl focus:outline-none focus:border-[#FF69B4]"
                        required
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold opacity-80">Email Address (Read Only)</label>
                      <input 
                        type="email" 
                        value={session?.user?.email || ""}
                        disabled
                        className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold opacity-80">Phone Number</label>
                      <input 
                        type="tel" 
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        placeholder="+91 98765 43210"
                        className="p-3 bg-[#F5ECD7]/30 border border-[#F5ECD7] rounded-xl focus:outline-none focus:border-[#FF69B4]"
                      />
                    </div>
                  </div>

                  <hr className="border-[#F5ECD7] my-2" />
                  
                  <h3 className="font-serif text-xl font-bold flex items-center gap-2"><MapPin size={20}/> Shipping Address</h3>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold opacity-80">Street Address</label>
                    <input 
                      type="text" 
                      value={profileData.address.street}
                      onChange={(e) => setProfileData({...profileData, address: {...profileData.address, street: e.target.value}})}
                      className="p-3 bg-[#F5ECD7]/30 border border-[#F5ECD7] rounded-xl focus:outline-none focus:border-[#FF69B4]"
                      placeholder="123 Fashion Street, Apt 4B"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold opacity-80">City</label>
                      <input 
                        type="text" 
                        value={profileData.address.city}
                        onChange={(e) => setProfileData({...profileData, address: {...profileData.address, city: e.target.value}})}
                        className="p-3 bg-[#F5ECD7]/30 border border-[#F5ECD7] rounded-xl focus:outline-none focus:border-[#FF69B4]"
                        placeholder="Mumbai"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold opacity-80">State</label>
                      <input 
                        type="text" 
                        value={profileData.address.state}
                        onChange={(e) => setProfileData({...profileData, address: {...profileData.address, state: e.target.value}})}
                        className="p-3 bg-[#F5ECD7]/30 border border-[#F5ECD7] rounded-xl focus:outline-none focus:border-[#FF69B4]"
                        placeholder="Maharashtra"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold opacity-80">PIN Code</label>
                      <input 
                        type="text" 
                        value={profileData.address.postalCode}
                        onChange={(e) => setProfileData({...profileData, address: {...profileData.address, postalCode: e.target.value}})}
                        className="p-3 bg-[#F5ECD7]/30 border border-[#F5ECD7] rounded-xl focus:outline-none focus:border-[#FF69B4]"
                        placeholder="400001"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {saveMessage && (
                      <p className={`text-sm font-bold ${saveMessage.includes("success") ? "text-green-600" : "text-red-500"}`}>
                        {saveMessage}
                      </p>
                    )}
                    <button 
                      type="submit" 
                      disabled={savingProfile}
                      className="ml-auto bg-[#900C3F] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#FF69B4] hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {savingProfile ? <Loader2 size={18} className="animate-spin" /> : null}
                      {savingProfile ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </section>
          )}

        </div>
      </div>

      {/* Order Details & Bill Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-white border border-[#F5ECD7] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[#F5ECD7] flex items-center justify-between bg-[#FFF8F0]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF69B4]">Order Details</span>
                <h3 className="font-serif text-2xl font-bold flex items-center gap-2 mt-1">
                  #{selectedOrder.id?.slice(-8).toUpperCase()}
                  {!selectedOrder.user_id && (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-orange-100 text-orange-700 border border-orange-200">Guest User</span>
                  )}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="w-10 h-10 rounded-full hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors text-[#900C3F]/50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
              
              {/* Order Status Tracker */}
              <div className="bg-[#F5ECD7]/20 border border-[#F5ECD7]/40 rounded-2xl p-6">
                <h4 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2"><CheckCircle2 size={16} /> Fulfillment Status</h4>
                <div className="relative flex justify-between items-center w-full mt-6">
                  {/* Progress Line */}
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#F5ECD7] -translate-y-1/2 z-0" />
                  
                  {/* Status Steps */}
                  {['Pending', 'Confirmed', 'Shipped', 'Delivered'].map((step, idx) => {
                    const statuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
                    const currentIdx = statuses.indexOf(selectedOrder.status || 'Pending');
                    const isActive = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;
                    
                    return (
                      <div key={step} className="flex flex-col items-center relative z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                          isCurrent 
                            ? "bg-[#FF69B4] text-white border-[#FF69B4] scale-110 shadow-lg shadow-[#FF69B4]/30" 
                            : isActive 
                            ? "bg-[#900C3F] text-white border-[#900C3F]" 
                            : "bg-white text-[#900C3F]/40 border-[#F5ECD7]"
                        }`}>
                          {idx + 1}
                        </div>
                        <span className={`text-[10px] font-bold mt-2 uppercase tracking-wider ${isActive ? "text-[#900C3F]" : "text-[#900C3F]/40"}`}>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items Purchased List */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2"><Package size={16} /> Order Items</h4>
                <div className="divide-y divide-[#F5ECD7]/40">
                  {(selectedOrder.order_items || selectedOrder.items || []).map((item: any, index: number) => {
                    const rawDetails = item.customization_details || item.customizationDetails;
                    let parsedDetails = rawDetails;
                    if (typeof parsedDetails === 'string') {
                      try {
                        parsedDetails = JSON.parse(parsedDetails);
                      } catch (e) {
                        console.error("Failed to parse customization details string:", e);
                      }
                    }

                    console.log("Profile Modal Item:", {
                      name: item.product_title || item.name,
                      product_image: item.product_image,
                      hasRawDetails: !!rawDetails,
                      parsedPreview: parsedDetails?.preview || parsedDetails?.previewImage
                    });

                    const imgUrl = (item.product_image && item.product_image !== "null")
                      ? item.product_image
                      : (parsedDetails?.preview || parsedDetails?.previewImage || parsedDetails?.canvasData || (item.products?.images && item.products.images.length > 0 ? item.products.images[0] : null) || "/mockups/plain.png");

                    return (
                      <div key={item.id || index} className="py-4 flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-xl bg-[#F5ECD7]/30 border border-[#F5ECD7]/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                          <img 
                            src={imgUrl} 
                            alt={item.product_title || item.name} 
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{item.product_title || item.name}</p>
                          <p className="text-xs text-[#900C3F]/60 mt-1">₹{item.price} × {item.quantity}</p>
                          {(item.is_customized || item.isCustomized) && (
                            <span className="inline-block mt-1 text-[8px] font-bold uppercase tracking-wider bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">Customized Masterpiece</span>
                          )}
                        </div>
                        <p className="font-bold text-sm">₹{item.price * item.quantity}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                {/* Shipping Details */}
                <div className="bg-[#FFF8F0]/50 border border-[#F5ECD7] rounded-2xl p-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2"><MapPin size={16} /> Delivery Manifest</h4>
                  <div className="text-xs space-y-2 text-[#900C3F]/80">
                    <p className="font-bold text-[#900C3F]">{selectedOrder.shipping_details?.name}</p>
                    <p>{selectedOrder.shipping_details?.email}</p>
                    <p className="flex items-center gap-1 mt-1"><Phone size={12} /> {selectedOrder.shipping_details?.phone}</p>
                    <hr className="border-[#F5ECD7]/60 my-2" />
                    <p className="leading-relaxed">{selectedOrder.shipping_details?.address}</p>
                    <p>{selectedOrder.shipping_details?.city}, {selectedOrder.shipping_details?.state} - {selectedOrder.shipping_details?.pincode}</p>
                    {selectedOrder.shipping_details?.notes && (
                      <p className="mt-3 p-3 bg-white border border-[#F5ECD7]/60 rounded-xl italic">" {selectedOrder.shipping_details.notes} "</p>
                    )}
                  </div>
                </div>

                {/* Billing Summary */}
                <div className="bg-[#FFF8F0]/50 border border-[#F5ECD7] rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2"><Receipt size={16} /> Billing Details</h4>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between text-[#900C3F]/70">
                        <span>Subtotal</span>
                        <span>₹{((selectedOrder.order_items || selectedOrder.items || []).reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0))}</span>
                      </div>
                      
                      {selectedOrder.discount_amount > 0 && (
                        <div className="flex justify-between text-green-600 font-medium">
                          <span>Coupon Discount {selectedOrder.coupon_code ? `(${selectedOrder.coupon_code})` : ""}</span>
                          <span>- ₹{selectedOrder.discount_amount}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-[#900C3F]/70">
                        <span>Shipping Manifest</span>
                        <span>{selectedOrder.total_amount >= 999 ? "FREE" : "₹50"}</span>
                      </div>

                      <hr className="border-[#F5ECD7]" />

                      <div className="flex justify-between font-bold text-sm text-[#900C3F] pt-1">
                        <span>Total Bill</span>
                        <span className="text-[#FF69B4] text-lg">₹{selectedOrder.total_amount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#F5ECD7]/60 text-[10px] text-[#900C3F]/50 space-y-1">
                    <p className="flex items-center gap-1"><CreditCard size={10} /> Payment via {selectedOrder.payment_method || 'Razorpay'}</p>
                    <p>Transaction Ref ID: {selectedOrder.payment_id || 'N/A'}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#F5ECD7] bg-[#FFF8F0] flex flex-col sm:flex-row gap-4 items-center justify-between">
              <span className="text-[10px] text-[#900C3F]/50">Placed on {new Date(selectedOrder.created_at).toLocaleString("en-IN")}</span>
              <DownloadInvoice order={selectedOrder} />
            </div>

          </div>
        </div>
      )}
    </main>
  );
}
