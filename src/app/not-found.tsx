import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found | Tote-ally Iconic",
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#FFF8F0] text-[#900C3F] flex items-center justify-center px-6">
      <div className="text-center flex flex-col items-center gap-8 max-w-lg">
        <div className="relative">
          <p className="font-serif text-[10rem] font-bold leading-none text-[#F5ECD7] select-none">
            404
          </p>
          <p className="absolute inset-0 flex items-center justify-center font-serif text-[10rem] font-bold leading-none text-[#900C3F]/10 select-none blur-sm">
            404
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="font-serif text-3xl font-bold">
            This page is not iconic (yet).
          </h1>
          <p className="text-[#900C3F]/60 text-base leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or may have been moved.
            Let&apos;s get you back to something fabulous.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            href="/"
            className="px-8 py-4 bg-[#900C3F] text-white font-bold rounded-md hover:bg-[#FF69B4] transition-all shadow-lg shadow-[#900C3F]/20 text-sm uppercase tracking-widest"
          >
            Go Home
          </Link>
          <Link
            href="/shop"
            className="px-8 py-4 border-2 border-[#900C3F] font-bold rounded-md hover:bg-[#900C3F] hover:text-white transition-all text-sm uppercase tracking-widest"
          >
            Shop the Collection
          </Link>
        </div>

        <p className="text-[10px] text-[#900C3F]/30 uppercase tracking-widest">
          ✦ Tote-ally Iconic ✦
        </p>
      </div>
    </main>
  );
}
