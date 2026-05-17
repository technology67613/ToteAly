"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutButton({ 
  totalAmount, 
  orderId,
  customerName = "ToteAlly Customer",
  customerEmail = "customer@example.com",
  customerPhone = "9999999999"
}: { 
  totalAmount: number,
  orderId?: string,
  customerName?: string,
  customerEmail?: string,
  customerPhone?: string
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      // 1. Create order on your backend
      const response = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount }),
      });
      const order = await response.json();

      // 2. Setup Razorpay configuration options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_123", // Ensure this is in .env.local
        amount: order.amount,
        currency: order.currency,
        name: "Tote-ally Iconic",
        description: "Your custom iconic bag",
        order_id: order.id,
        handler: async function (response: any) {
          // 3. Verify payment on your backend
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              order_id: orderId // pass the internal supabase order ID to update it
            }),
          });

          if (verifyRes.ok) {
            alert("Payment Successful! Your order is iconic.");
            router.push(`/order-success?id=${orderId || ''}`);
          } else {
            alert("Payment verification failed.");
          }
        },
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: {
          color: "#900C3F", // Matches your brand colors perfectly
        },
      };

      // 4. Open the Razorpay Window
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any){
         console.error(response.error);
         alert("Payment failed: " + response.error.description);
      });
      rzp.open();
    } catch (error) {
      console.error("Payment setup failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      
      <button
        onClick={handlePayment}
        disabled={isLoading}
        style={{
          background: "#900C3F",
          color: "white",
          padding: "16px 32px",
          borderRadius: "12px",
          fontWeight: "bold",
          cursor: isLoading ? "not-allowed" : "pointer",
          border: "none",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
        className="transition-transform hover:scale-[1.02] active:scale-95"
      >
        {isLoading ? "Processing..." : `Pay ₹${totalAmount}`}
      </button>
    </>
  );
}
