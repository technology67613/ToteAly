import type { Metadata } from "next";
import "./globals.css";

import Providers from "@/components/Providers";
import CartSidebar from "@/components/CartSidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col font-sans bg-brand-cream text-brand-dark-rose">
        <Providers>
          <Navbar />
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
          <CartSidebar />
        </Providers>
      </body>
    </html>
  );
}
