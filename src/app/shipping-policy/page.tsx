import Link from "next/link";

const DETAILS = [
  {
    title: "Order Processing",
    body: "Orders are usually processed within 1 to 3 business days after payment confirmation. Custom and bulk orders may take longer depending on artwork approval, production quantity, and material availability.",
  },
  {
    title: "Estimated Delivery",
    body: "Standard delivery within India usually takes 3 to 7 business days after dispatch. Delivery timelines can vary because of courier delays, local holidays, weather, remote locations, or high-demand periods.",
  },
  {
    title: "Tracking",
    body: "Once your order is shipped, tracking details are shared by email, WhatsApp, or the contact method provided at checkout. Tracking updates may take up to 24 hours to appear after dispatch.",
  },
  {
    title: "Shipping Charges",
    body: "Shipping charges, if applicable, are shown during checkout before payment. Bulk orders may receive a custom shipping quote based on quantity, weight, and delivery location.",
  },
  {
    title: "Incorrect Address",
    body: "Please provide a complete and accurate shipping address. If an order is returned because of an incorrect address, failed delivery attempts, or customer unavailability, reshipping charges may apply.",
  },
  {
    title: "Need Help",
    body: "For a delivery estimate before placing a custom or bulk order, contact us with your city, quantity, and preferred product type.",
  },
];

export default function ShippingPolicyPage() {
  return (
    <main className="min-h-screen bg-[#FFF8F0] text-[#900C3F] px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-sm text-[#900C3F]/60 hover:text-[#FF69B4] transition-colors">
          Back to Home
        </Link>
        <h1 className="font-serif text-5xl md:text-6xl font-bold mt-8 mb-6">Shipping Policy</h1>
        <p className="text-lg text-[#900C3F]/70 leading-relaxed mb-12">
          We ship Tote-ally Iconic orders across India through available courier partners. The timelines below are standard estimates and may vary by product type, destination, and order volume.
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
          Ask About Shipping
        </Link>
      </div>
    </main>
  );
}
