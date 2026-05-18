"use client";

import { usePathname } from "next/navigation";

export default function AnnouncementBar({ announcement }: { announcement: string }) {
  const pathname = usePathname();

  if (!announcement || pathname !== "/") return null;

  // Format text to a softer, editorial-grade casing for a high-end luxury feel
  const formattedText = announcement.toLowerCase() === "free delivery on orders above ₹999!" 
    ? "Free delivery on orders above ₹999!" 
    : announcement;

  return (
    <div className="w-full bg-[#FFF8F0] border-b border-[#F5ECD7] text-[#900C3F] py-2 px-6 text-center relative overflow-hidden group shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        {/* SVG Sparkles Icon Left */}
        <svg 
          className="w-3.5 h-3.5 text-[#900C3F]/80 animate-pulse shrink-0" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5 5 3Z" />
        </svg>
        
        {/* Classy Serif Italic Typography */}
        <span className="font-serif italic font-bold tracking-[0.06em] text-xs sm:text-[14px] text-[#900C3F]">
          {formattedText}
        </span>

        {/* SVG Sparkles Icon Right */}
        <svg 
          className="w-3.5 h-3.5 text-[#900C3F]/80 animate-pulse shrink-0" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5 5 3Z" />
        </svg>
      </div>
    </div>
  );
}
