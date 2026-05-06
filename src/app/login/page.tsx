"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2, Globe } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <main className="min-h-screen bg-[#FFF8F0] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-serif font-bold text-[#900C3F] tracking-tighter">
            Tote-ally Iconic
          </Link>
          <p className="text-[#900C3F]/60 mt-2 text-sm">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#F5ECD7] shadow-lg shadow-[#900C3F]/5 p-10 flex flex-col gap-6">
          <div className="text-center">
            <h2 className="font-serif text-2xl font-bold text-[#900C3F] mb-2">Welcome back</h2>
            <p className="text-sm text-[#900C3F]/60">Sign in to track orders, save designs, and more.</p>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 border-2 border-[#F5ECD7] rounded-xl font-bold text-[#900C3F] hover:border-[#FF69B4] hover:text-[#FF69B4] hover:bg-[#FF69B4]/5 transition-all disabled:opacity-50 text-sm uppercase tracking-widest"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {loading ? "Signing in..." : "Continue with Google"}
          </button>

          <div className="bg-[#F5ECD7]/40 rounded-xl p-4 text-center">
            <p className="text-xs text-[#900C3F]/70 leading-relaxed">
              We use <strong>Google Sign-In</strong> for a secure and seamless experience. 
              No password to remember — just your Google account.
            </p>
          </div>

          <p className="text-xs text-center text-[#900C3F]/40">
            By signing in you agree to our{" "}
            <Link href="/terms" className="underline hover:text-[#FF69B4] transition-colors">Terms</Link> and{" "}
            <Link href="/privacy" className="underline hover:text-[#FF69B4] transition-colors">Privacy Policy</Link>.
          </p>
        </div>

        <p className="text-center mt-6 text-xs text-[#900C3F]/50">
          Looking for the admin panel?{" "}
          <Link href="/admin/login" className="font-bold text-[#900C3F] hover:text-[#FF69B4] transition-colors">
            Admin Login →
          </Link>
        </p>
      </div>
    </main>
  );
}
