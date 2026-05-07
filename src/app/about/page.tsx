import Link from "next/link";
import { Sparkles, Heart, Leaf } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Tote-ally Iconic",
  description: "Meet the founders behind Tote-ally Iconic — the premium Gen Z tote bag brand born from a love for style, sustainability, and self-expression.",
};

const VALUES = [
  { icon: Sparkles, title: "Bold by Design", desc: "Every bag is a canvas for self-expression. We craft totes that start conversations." },
  { icon: Leaf, title: "Sustainably Made", desc: "100% canvas, zero compromise. We source responsibly so the planet stays iconic too." },
  { icon: Heart, title: "Made with Love", desc: "Small batch, high quality. Each piece is made with care by people who love what they do." },
];

export default function About() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-[#FFF8F0] text-[#900C3F]">

      {/* Hero */}
      <section className="w-full bg-[#F5ECD7]/50 border-b border-[#F5ECD7] py-24 px-8 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.4em] text-[#FF69B4] mb-4 block">Our Story</span>
        <h1 className="font-serif text-6xl md:text-8xl font-bold leading-[0.9] tracking-tighter mb-6">
          Made to Be Seen.
        </h1>
        <p className="text-[#900C3F]/70 max-w-xl mx-auto text-lg leading-relaxed">
          Tote-ally Iconic is more than a bag brand. It's a lifestyle — born from the belief that 
          what you carry says everything about who you are.
        </p>
      </section>

      {/* Brand Story */}
      <section className="max-w-6xl mx-auto w-full px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="w-full h-[500px] rounded-[40px] overflow-hidden border border-[#F5ECD7] shadow-2xl shadow-[#900C3F]/10 group">
          <img
            src="/mockups/premium.png"
            alt="Tote-ally Iconic brand lifestyle"
            className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
          />
        </div>
        <div className="flex flex-col gap-6">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#FF69B4]">How It Started</span>
          <h2 className="font-serif text-4xl font-bold leading-tight">
            Born from a love for<br />totes &amp; aesthetics.
          </h2>
          <p className="text-[#900C3F]/70 leading-relaxed text-lg">
            Tote-ally Iconic was founded by <strong>Khadija Memon &amp; Abhirami Aluvila</strong> — two friends 
            who wanted bags that felt as bold and expressive as they did. Tired of settling for basic, 
            they decided to create their own.
          </p>
          <p className="text-[#900C3F]/70 leading-relaxed">
            We believe every bag tells a story. Whether it's a blank canvas waiting for your name or a 
            premium piece made to last, every stitch is a commitment to quality and individuality. 
            Make yours iconic.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="w-full bg-[#900C3F] text-[#FFF8F0] py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.4em] text-[#FF69B4] mb-4 block">What We Stand For</span>
            <h2 className="font-serif text-4xl font-bold">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {VALUES.map((v) => (
              <div key={v.title} className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#FF69B4]/20 flex items-center justify-center">
                  <v.icon size={28} className="text-[#FF69B4]" />
                </div>
                <h3 className="font-serif text-2xl font-bold">{v.title}</h3>
                <p className="text-[#FFF8F0]/70 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="max-w-5xl mx-auto w-full px-8 py-24 flex flex-col items-center text-center">
        <span className="text-xs font-bold uppercase tracking-[0.4em] text-[#FF69B4] mb-4 block">The People Behind It</span>
        <h2 className="font-serif text-4xl font-bold mb-16">Meet the Founders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 w-full max-w-3xl">
          <div className="flex flex-col items-center gap-4">
            <div className="w-48 h-48 rounded-full border-4 border-[#F5ECD7] shadow-xl bg-white flex items-center justify-center">
              <span className="font-serif text-6xl font-bold text-[#900C3F]">K</span>
            </div>
            <h3 className="font-serif text-2xl font-bold">Khadija Memon</h3>
            <p className="text-[#900C3F]/60 font-semibold text-sm uppercase tracking-widest">Co-Founder &amp; Creative Director</p>
            <p className="text-[#900C3F]/70 text-sm leading-relaxed max-w-xs">
              The visionary behind every design. Khadija brings the aesthetic to life with her love for retro-luxury style.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-48 h-48 rounded-full border-4 border-[#F5ECD7] shadow-xl bg-white flex items-center justify-center">
              <span className="font-serif text-6xl font-bold text-[#900C3F]">A</span>
            </div>
            <h3 className="font-serif text-2xl font-bold">Abhirami Aluvila</h3>
            <p className="text-[#900C3F]/60 font-semibold text-sm uppercase tracking-widest">Co-Founder &amp; Operations Lead</p>
            <p className="text-[#900C3F]/70 text-sm leading-relaxed max-w-xs">
              The backbone of the brand. Abhirami ensures every bag reaches you in perfect condition, on time.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full bg-[#F5ECD7]/40 border-t border-[#F5ECD7] py-20 px-8 text-center">
        <h2 className="font-serif text-4xl font-bold mb-4">Ready to be iconic?</h2>
        <p className="text-[#900C3F]/70 mb-8 max-w-md mx-auto">Browse our collection or design your own custom tote.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/shop" className="px-10 py-4 bg-[#900C3F] text-white font-bold rounded-md hover:bg-[#FF69B4] transition-all shadow-lg">
            Shop Collection
          </Link>
          <Link href="/customize" className="px-10 py-4 border-2 border-[#900C3F] font-bold rounded-md hover:bg-[#900C3F] hover:text-white transition-all">
            Design Custom
          </Link>
        </div>
      </section>

    </main>
  );
}
