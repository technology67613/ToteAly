import * as nodemailer from "nodemailer";

export async function sendOrderConfirmationEmail(to: string, orderDetails: any) {
  try {
    // Create a transporter
    // For production, the user should replace these with real SMTP credentials
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_PORT === "465", 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // For Resend, if you haven't verified a custom domain, 
    // you MUST use 'onboarding@resend.dev'
    const senderEmail = "onboarding@resend.dev";

    // 1. Send confirmation to the customer
    const customerMailOptions = {
      from: `"Tote-ally Iconic" <${senderEmail}>`,
      to,
      subject: `Order Confirmed: #${orderDetails.id.slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: serif; color: #900C3F; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #F5ECD7;">
          <h1 style="text-align: center;">Tote-ally Iconic</h1>
          <p>Hi there,</p>
          <p>Your order has been confirmed! We are getting it ready for shipment.</p>
          <div style="background: #F5ECD7; padding: 15px; border-radius: 10px;">
            <h3>Order Summary</h3>
            <p><strong>Order ID:</strong> #${orderDetails.id}</p>
            <p><strong>Total Amount:</strong> ₹${orderDetails.totalAmount}</p>
            <p><strong>Shipping to:</strong> ${orderDetails.shippingAddress}</p>
          </div>
          <p>Stay iconic,<br/>The Tote-ally Iconic Team</p>
        </div>
      `,
    };

    // 2. Send notification to the admin
    const adminMailOptions = {
      from: `"Tote-ally Iconic System" <${senderEmail}>`,
      to: "devrajnandanpahar@gmail.com",
      subject: `🚨 New Order Received: #${orderDetails.id.slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
          <h2 style="color: #900C3F;">New Order Placed!</h2>
          <p><strong>Order ID:</strong> #${orderDetails.id}</p>
          <p><strong>Customer Email:</strong> ${to}</p>
          <p><strong>Total Amount:</strong> ₹${orderDetails.totalAmount}</p>
          <p><strong>Shipping Address:</strong> ${orderDetails.shippingAddress}</p>
          <hr />
          <p>Please check the admin dashboard for full details, including product customizations.</p>
        </div>
      `,
    };

    const customerInfo = await transporter.sendMail(customerMailOptions);
    console.log("Customer email sent: %s", customerInfo.messageId);
    
    const adminInfo = await transporter.sendMail(adminMailOptions);
    console.log("Admin email sent: %s", adminInfo.messageId);
    
    return customerInfo;
  } catch (error) {
    console.error("Email Sending Error:", error);
    // Don't throw error to avoid breaking the order flow, just log it
    return null;
  }
}
