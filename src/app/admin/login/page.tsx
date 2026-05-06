"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { ShieldCheck, LogIn, User, Lock, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      if ((session?.user as any)?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
        callbackUrl: "/admin",
      });

      if (result?.error) {
        setError("Invalid credentials. Please try again.");
      } else {
        router.push("/admin");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#0a0a0a] text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#900C3F]/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[40px] p-10 flex flex-col gap-8 relative z-10 shadow-2xl items-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-[#900C3F] rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-[#900C3F]/40 transform rotate-3">
            <ShieldCheck size={32} />
          </div>
          <div className="flex flex-col gap-1 text-center">
            <h1 className="font-serif text-3xl font-bold tracking-tight">Command Center</h1>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">Secure Admin Access</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20">
                <User size={18} />
              </div>
              <input
                type="text"
                placeholder="Admin Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#900C3F]/50 transition-all placeholder:text-white/20"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20">
                <Lock size={18} />
              </div>
              <input
                type="password"
                placeholder="Security Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#900C3F]/50 transition-all placeholder:text-white/20"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 p-3 rounded-xl border border-red-400/20">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-black rounded-2xl font-bold text-sm uppercase tracking-widest transition-all shadow-xl hover:bg-[#FF69B4] hover:text-white flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:scale-100 group"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                Authenticate
              </>
            )}
          </button>
        </form>

        <div className="flex flex-col gap-4 items-center mt-4">
            <div className="h-px w-12 bg-white/10" />
            <p className="text-[9px] text-white/20 uppercase tracking-[0.3em] font-bold">
              Restricted Access &bull; Managed Session
            </p>
        </div>
      </div>
    </main>
  );
}
