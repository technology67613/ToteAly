import type { Metadata } from "next";
import "./globals.css";

import Providers from "@/components/Providers";
import CartSidebar from "@/components/CartSidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";
import { createClient } from "@supabase/supabase-js";
import AnnouncementBar from "@/components/AnnouncementBar";

export const revalidate = 60; // Cache the layout for 60 seconds

export const metadata: Metadata = {
  metadataBase: new URL("https://mystore-weld.vercel.app/"),
  title: {
    default: "Tote-ally Iconic | Premium Customizable Tote Bags",
    template: "%s | Tote-ally Iconic"
  },
  description: "The ultimate destination for premium, Gen Z-focused customizable tote bags. Retro-luxury designs made to be seen.",
  keywords: ["tote bags", "customized bags", "retro luxury", "fashion accessories", "sustainable bags", "Tote-ally Iconic"],
  authors: [{ name: "Tote-ally Iconic Team" }],
  creator: "Tote-ally Iconic",
  publisher: "Tote-ally Iconic",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://mystore-weld.vercel.app/",
    siteName: "Tote-ally Iconic",
    title: "Tote-ally Iconic | Made to Be Seen",
    description: "Premium customizable tote bags with a retro-luxury aesthetic.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tote-ally Iconic",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tote-ally Iconic | Made to Be Seen",
    description: "Premium customizable tote bags with a retro-luxury aesthetic.",
    images: ["/og-image.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch site configuration
  let config: Record<string, any> = {};
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase.from("site_config").select("key, value");
      config = data?.reduce((acc: any, row: any) => ({ ...acc, [row.key]: row.value }), {}) || {};
    }
  } catch (error) {
    console.error("Failed to fetch site config", error);
  }

  const announcementBarEnabled = config.announcement_bar_enabled !== "false" && config.announcement_bar_enabled !== false;
  const threshold = config.free_shipping_threshold !== undefined ? Number(config.free_shipping_threshold) : 999;
  const announcementText = config.announcement_bar || config.announcement_bar_text;

  let announcement = "";
  if (announcementBarEnabled) {
    if (announcementText && announcementText.trim() !== "") {
      // Dynamically replace 999 references with the active threshold
      announcement = announcementText.replace(/999/g, threshold.toString());
    } else {
      // Premium dynamic default fallback
      announcement = `Free Delivery on orders above ₹${threshold}!`;
    }
  }

  return (
    <html
      lang="en"
      className="h-full antialiased"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body 
        className="min-h-full flex flex-col font-sans bg-brand-cream text-brand-dark-rose"
        suppressHydrationWarning
      >
        <Providers>
          <Navbar config={config} />
          <AnnouncementBar announcement={announcement} />
          <div className="flex-grow">
            {children}
          </div>
          <Footer config={config} />
          <CartSidebar />
          <Toaster position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
