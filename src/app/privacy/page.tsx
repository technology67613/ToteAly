import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Tote-ally Iconic",
  description: "Read our privacy policy to understand how Tote-ally Iconic collects and uses your data.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FFF8F0] text-[#900C3F] py-16 px-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        <div>
          <Link href="/" className="text-sm text-[#900C3F]/60 hover:text-[#FF69B4] transition-colors">← Back to Home</Link>
          <h1 className="font-serif text-5xl font-bold mt-4 mb-2">Privacy Policy</h1>
          <p className="text-[#900C3F]/60 text-sm">Last updated: May 2026</p>
        </div>

        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-2xl font-bold">1. Information We Collect</h2>
          <p className="text-[#900C3F]/80 leading-relaxed">When you use Tote-ally Iconic, we may collect your name, email address, and profile picture through Google Sign-In. For orders, we also collect shipping address details and payment confirmation IDs.</p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-2xl font-bold">2. How We Use Your Information</h2>
          <p className="text-[#900C3F]/80 leading-relaxed">We use your information to process orders, send order confirmations, provide customer support, and improve our services. We do not sell your personal data to third parties.</p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-2xl font-bold">3. Payment Security</h2>
          <p className="text-[#900C3F]/80 leading-relaxed">All payments are processed securely through Razorpay. We do not store your card details. All transactions are encrypted and PCI-DSS compliant.</p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-2xl font-bold">4. Cookies</h2>
          <p className="text-[#900C3F]/80 leading-relaxed">We use session cookies to keep you logged in and to maintain your shopping cart. We do not use tracking cookies for advertising purposes.</p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-2xl font-bold">5. Contact Us</h2>
          <p className="text-[#900C3F]/80 leading-relaxed">If you have any questions about this Privacy Policy, please <Link href="/contact" className="text-[#FF69B4] font-bold underline">contact us</Link>.</p>
        </section>
      </div>
    </main>
  );
}
