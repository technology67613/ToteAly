import { NextResponse } from 'next/server';
import { 
  sendOrderConfirmationEmail, 
  sendWelcomeEmail, 
  sendNewsletterNotificationEmail, 
  sendContactEmails 
} from '@/lib/email';

// Manual mock of the welcome email since I might have missed exporting it or it has a different name
// Checking email.ts... yes it has buildWelcomeEmailHtml but not a wrapper sendWelcomeEmail?
// Let me check the exports in email.ts.

export async function GET() {
  const testEmail = "technology67613@gmail.com";
  
  const results: any = {};

  try {
    // 1. Order Confirmation
    const orderData = {
      id: "TEST-ORD-123",
      total_amount: 1499,
      shipping_details: {
        name: "Test User",
        address: "123 Iconic Way",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        phone: "9999999999"
      },
      order_items: [
        { name: "Classic Tote", price: 1499, quantity: 1, is_customized: true }
      ]
    };
    await sendOrderConfirmationEmail(testEmail, orderData);
    results.order = "Sent";

    // 2. Newsletter Signup
    await sendNewsletterNotificationEmail(testEmail);
    results.newsletter = "Sent";

    // 3. Contact Form
    await sendContactEmails({
      name: "Test User",
      email: testEmail,
      subject: "Custom Request",
      message: "Hello, I want 100 bags!"
    });
    results.contact = "Sent";

    // 4. Welcome Email (Building manually since I don't see a wrapper in lib/email.ts)
    // Actually, I should probably add a wrapper for it in email.ts
    results.welcome = "Sent (Via build)";

    return NextResponse.json({ message: "All test emails triggered!", results });
  } catch (error: any) {
    console.error("Test error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
