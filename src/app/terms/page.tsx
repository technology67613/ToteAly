import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Tote-ally Iconic",
  description: "Read our terms of service for purchasing and using Tote-ally Iconic's products and platform.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FFF8F0] text-[#900C3F] py-16 px-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        <div>
          <Link href="/" className="text-sm text-[#900C3F]/60 hover:text-[#FF69B4] transition-colors">← Back to Home</Link>
          <h1 className="font-serif text-5xl font-bold mt-4 mb-2">Terms of Service</h1>
          <p className="text-[#900C3F]/60 text-sm">Last updated: May 2026</p>
        </div>

        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-2xl font-bold">1. Use of the Platform</h2>
          <p className="text-[#900C3F]/80 leading-relaxed">By using Tote-ally Iconic's website, you agree to use it only for lawful purposes and in a way that does not infringe the rights of others. You must be at least 13 years old to use this service.</p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-2xl font-bold">2. Orders & Payments</h2>
          <p className="text-[#900C3F]/80 leading-relaxed">All orders are subject to availability. Prices are listed in Indian Rupees (₹) and are inclusive of applicable taxes. Payments are processed via Razorpay.</p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-2xl font-bold">3. Shipping</h2>
          <p className="text-[#900C3F]/80 leading-relaxed">We ship across India. Standard delivery takes 3-7 business days. Shipping timelines are estimates and may vary due to courier or external factors.</p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-2xl font-bold">4. Returns & Refunds</h2>
          <p className="text-[#900C3F]/80 leading-relaxed">Customized products are non-refundable as they are made to order. For defective or incorrect standard products, please contact us within 7 days of delivery. We will arrange a replacement or refund.</p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-2xl font-bold">5. Intellectual Property</h2>
          <p className="text-[#900C3F]/80 leading-relaxed">All content on this website, including logos, designs, and images, is the property of Tote-ally Iconic and may not be reproduced without permission.</p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-2xl font-bold">6. Contact</h2>
          <p className="text-[#900C3F]/80 leading-relaxed">For any queries, please <Link href="/contact" className="text-[#FF69B4] font-bold underline">contact us</Link>.</p>
        </section>
      </div>
    </main>
  );
}
