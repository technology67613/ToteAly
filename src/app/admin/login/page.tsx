"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, Lock, User } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        username: form.username,
        password: form.password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Invalid admin credentials");
      } else {
        toast.success("Welcome back, Admin!");
        setTimeout(() => {
          window.location.href = "/admin";
        }, 500);
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#121212] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-serif font-bold text-white tracking-tighter">
            Tote-ally <span className="text-[#FF69B4]">Iconic</span>
          </Link>
          <div className="mt-4 flex items-center justify-center gap-2 text-[#FF69B4] font-bold text-[10px] uppercase tracking-[0.3em]">
            <ShieldCheck size={14} /> Admin Terminal
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-[32px] border border-white/5 p-10 shadow-2xl shadow-black">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6" id="admin-login-form">
            <div className="flex flex-col gap-2">
              <label 
                htmlFor="username"
                className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-2 cursor-pointer"
              >
                <User size={12} /> Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#FF69B4] transition-all"
                placeholder="admin@toteallyiconic.com"
              />
            </div>
 
            <div className="flex flex-col gap-2">
              <label 
                htmlFor="password"
                className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-2 cursor-pointer"
              >
                <Lock size={12} /> Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#FF69B4] transition-all"
                placeholder="••••••••"
              />
            </div>
 
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-[#FF69B4] text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-[#FF69B4]/20 hover:bg-[#ff85c1] transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
              aria-label={loading ? "Authenticating admin" : "Login to admin dashboard"}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
              {loading ? "Authenticating..." : "Access Dashboard"}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] font-bold uppercase tracking-widest text-white/20 mt-8">
          Unauthorized Access Restricted
        </p>
      </div>
    </main>
  );
}
