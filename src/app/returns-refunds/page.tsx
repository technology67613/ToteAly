import Link from "next/link";

const DETAILS = [
  {
    title: "Return Window",
    body: "Return or replacement requests should be raised within 7 days of delivery. Requests shared after this period may not be eligible for review.",
  },
  {
    title: "Eligible Cases",
    body: "Returns or replacements are generally accepted for damaged items, wrong products, missing items, or clear manufacturing defects. Please keep the product unused and in its original condition.",
  },
  {
    title: "Custom Orders",
    body: "Customized, personalized, and bulk-made products are not eligible for return because they are made for a specific request. They may still be reviewed if they arrive damaged, incorrect, or defective.",
  },
  {
    title: "How to Request",
    body: "Contact us with your order details, issue description, and clear photos or videos of the product and packaging. Our team will review the request and confirm the next step.",
  },
  {
    title: "Refunds",
    body: "Approved refunds are processed to the original payment method where possible. Manual UPI or offline payment refunds may be processed through a verified UPI ID or bank details provided by the customer.",
  },
  {
    title: "Non-Returnable Cases",
    body: "Used products, products damaged after delivery, minor color differences caused by screen settings, and requests without order proof may not be eligible for refund or replacement.",
  },
];

export default function ReturnsRefundsPage() {
  return (
    <main className="min-h-screen bg-[#FFF8F0] text-[#900C3F] px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-sm text-[#900C3F]/60 hover:text-[#FF69B4] transition-colors">
          Back to Home
        </Link>
        <h1 className="font-serif text-5xl md:text-6xl font-bold mt-8 mb-6">Returns & Refunds</h1>
        <p className="text-lg text-[#900C3F]/70 leading-relaxed mb-12">
          We want every order to reach you correctly and in good condition. This standard policy explains when a return, replacement, or refund can be reviewed.
        </p>
        <div className="grid gap-6">
          {DETAILS.map((item) => (
            <section key={item.title} className="border-t border-[#F5ECD7] pt-6">
              <h2 className="font-serif text-2xl font-bold mb-3">{item.title}</h2>
              <p className="text-[#900C3F]/75 leading-relaxed">{item.body}</p>
            </section>
          ))}
        </div>
        <Link
          href="/contact"
          className="inline-flex mt-12 px-8 py-4 bg-[#900C3F] text-white rounded-md font-bold hover:bg-[#FF69B4] transition-colors"
        >
          Start a Support Request
        </Link>
      </div>
    </main>
  );
}
