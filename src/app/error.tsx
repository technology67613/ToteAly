"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#FFF8F0] text-[#900C3F] flex items-center justify-center px-6">
      <div className="text-center flex flex-col items-center gap-8 max-w-lg">
        <div className="w-20 h-20 rounded-full bg-[#F5ECD7] flex items-center justify-center">
          <span className="text-4xl">⚠️</span>
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="font-serif text-3xl font-bold">Something went wrong.</h1>
          <p className="text-[#900C3F]/60 leading-relaxed">
            An unexpected error occurred. Our team has been notified. Please try again or go back home.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={reset}
            className="px-8 py-4 bg-[#900C3F] text-white font-bold rounded-md hover:bg-[#FF69B4] transition-all text-sm uppercase tracking-widest"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-8 py-4 border-2 border-[#900C3F] font-bold rounded-md hover:bg-[#900C3F] hover:text-white transition-all text-sm uppercase tracking-widest"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
