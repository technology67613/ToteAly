export default function CheckoutSuccess() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-[#FFF8F0]">
      <div className="text-6xl mb-6">🎉</div>
      <h1 className="text-4xl font-serif font-bold text-[#900C3F] mb-3">Order Confirmed!</h1>
      <p className="text-[#900C3F]/60 max-w-md mb-10 leading-relaxed font-medium">
        Thank you for your order. You'll receive a confirmation email shortly. Your iconic tote bags are now being prepared for shipping!
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <a href="/shop" className="bg-[#900C3F] text-white px-10 py-4 rounded-full font-bold hover:bg-[#FF69B4] transition-all shadow-xl shadow-[#900C3F]/20">
          Continue Shopping
        </a>
        <a href="/profile" className="bg-white border border-[#F5ECD7] text-[#900C3F] px-10 py-4 rounded-full font-bold hover:border-[#FF69B4] transition-all">
          View Order History
        </a>
      </div>
    </main>
  );
}
