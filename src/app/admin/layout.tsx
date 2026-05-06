import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-[#900C3F] selection:text-white">
      {/* This layout replaces the main site layout for all /admin routes */}
      <div className="flex w-full">
        {children}
      </div>
    </div>
  );
}
