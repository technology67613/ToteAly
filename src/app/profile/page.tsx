"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { Package, User, MapPin, Heart, Settings, LogOut, Loader2 } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  Delivered: "bg-green-100 text-green-700",
  Shipped: "bg-blue-100 text-blue-700",
  Confirmed: "bg-yellow-100 text-yellow-700",
  Pending: "bg-[#F5ECD7] text-[#900C3F]",
  Cancelled: "bg-red-100 text-red-700",
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<"orders" | "settings" | "wishlist">("orders");
  
  // Data states
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
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
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-3 p-4 rounded-xl font-semibold transition-all ${
                activeTab === "settings" ? "bg-[#FF69B4] text-white shadow-md" : "bg-white hover:bg-[#F5ECD7]/50 border border-[#F5ECD7]"
              }`}
            >
              <Settings size={18} /> Profile Settings
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
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-3 p-4 rounded-xl font-semibold bg-white border border-red-100 text-red-500 hover:bg-red-50 transition-all mt-4"
            >
              <LogOut size={18} /> Log Out
            </button>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="w-full md:w-3/4">
          
          {/* Orders Tab */}
          {activeTab === "orders" && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="font-serif text-3xl font-bold mb-6">Order History</h2>
              {loadingOrders ? (
                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[#FF69B4]" size={32} /></div>
              ) : (
                <div className="flex flex-col gap-4">
                  {orders.map((order) => (
                    <div key={order._id} className="bg-white border border-[#F5ECD7] rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md">
                      <div className="flex flex-col gap-1">
                        <p className="font-bold text-lg">Order #{order._id.slice(-6).toUpperCase()}</p>
                        <p className="text-sm text-[#900C3F]/60">{new Date(order.createdAt).toLocaleDateString()} • {order.products.length} items</p>
                      </div>
                      <div className="flex flex-col md:items-end gap-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold w-max ${STATUS_COLORS[order.status] || ""}`}>
                          {order.status}
                        </span>
                        <p className="font-bold text-xl">₹{order.totalAmount}</p>
                      </div>
                    </div>
                  ))}

                  {orders.length === 0 && (
                    <div className="bg-white border border-[#F5ECD7] rounded-2xl p-16 text-center text-[#900C3F]/50">
                      <Package size={48} className="mx-auto mb-4 opacity-30" />
                      <p className="text-lg">No orders yet. Time to get iconic!</p>
                      <Link href="/shop" className="inline-block mt-4 text-[#FF69B4] font-bold hover:underline">Browse Shop →</Link>
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

          {/* Wishlist Tab */}
          {activeTab === "wishlist" && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="font-serif text-3xl font-bold mb-6">Wishlist</h2>
              <div className="bg-white border border-[#F5ECD7] rounded-2xl p-16 text-center text-[#900C3F]/50">
                <Heart size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg">Your wishlist is empty. Save items while browsing!</p>
                <Link href="/shop" className="inline-block mt-4 text-[#FF69B4] font-bold hover:underline">Explore Collection →</Link>
              </div>
            </section>
          )}

        </div>
      </div>
    </main>
  );
}
