import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";

// ---------------------------------------------------------------------------
// SMTP Transporter Logic (Lazy Initialization)
// ---------------------------------------------------------------------------
function hasSmtpConfig() {
  return Boolean(
    process.env.EMAIL_HOST &&
      process.env.EMAIL_PORT &&
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS
  );
}

let transporterInstance: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!hasSmtpConfig()) {
    console.error("Missing SMTP Config. Cannot initialize nodemailer transport.");
    throw new Error("Missing SMTP Config");
  }
  
  if (!transporterInstance) {
    transporterInstance = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  
  return transporterInstance;
}

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || "Tote-ally Iconic";

// ---------------------------------------------------------------------------
// HTML escape – ALWAYS use this before injecting user content
// ---------------------------------------------------------------------------
function esc(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ---------------------------------------------------------------------------
// Shared design tokens (Rose/Cream aesthetic)
// ---------------------------------------------------------------------------
const C = {
  cream: "#FFF8F0",
  beige: "#F5ECD7",
  rose: "#900C3F",
  roseDark: "#6B0930",
  pink: "#FF69B4",
  pinkLight: "#FFD6EC",
  text: "#2D1B1B",
  muted: "#7A5C5C",
  white: "#FFFFFF",
  border: "#E8D5C4",
};

// ---------------------------------------------------------------------------
// Shared layout wrappers
// ---------------------------------------------------------------------------
function emailWrapper(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${STORE_NAME}</title>
</head>
<body style="margin:0;padding:0;background-color:${C.beige};font-family:Georgia,'Times New Roman',serif;">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
  style="background-color:${C.beige};padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0"
        width="600" style="max-width:600px;width:100%;">
        ${body}
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

function emailHeader(subtitle?: string): string {
  return `
  <!-- HEADER -->
  <tr>
    <td style="background:linear-gradient(135deg,${C.rose} 0%,${C.roseDark} 100%);
               border-radius:16px 16px 0 0;padding:36px 40px 28px;text-align:center;">
      <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:11px;
                letter-spacing:4px;text-transform:uppercase;color:${C.pinkLight};
                font-weight:normal;">✦ Est. 2026 ✦</p>
      <h1 style="margin:0;font-family:Georgia,serif;font-size:34px;font-weight:bold;
                 color:${C.white};letter-spacing:1px;line-height:1.1;">
        ${STORE_NAME}
      </h1>
      ${subtitle ? `<p style="margin:10px 0 0;font-family:Georgia,serif;font-size:14px;
               color:${C.pinkLight};font-style:italic;">${esc(subtitle)}</p>` : ""}
    </td>
  </tr>`;
}

function emailFooter(): string {
  return `
  <!-- FOOTER -->
  <tr>
    <td style="background-color:${C.rose};border-radius:0 0 16px 16px;
               padding:28px 40px;text-align:center;">
      <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:13px;
                color:${C.pinkLight};font-style:italic;">
        "Bags that carry more than just essentials — made to stand out,<br/>
        tote-ally you, tote-ally iconic."
      </p>
      <p style="margin:14px 0 0;font-size:11px;color:${C.pinkLight};letter-spacing:1px;
                text-transform:uppercase;">
        © ${new Date().getFullYear()} ${STORE_NAME}
      </p>
    </td>
  </tr>`;
}

function emailBody(content: string): string {
  return `<tr><td style="background-color:${C.cream};padding:36px 40px;">${content}</td></tr>`;
}

function sectionHeading(text: string): string {
  return `<h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:18px;
    color:${C.rose};letter-spacing:1px;font-weight:bold;
    border-bottom:2px solid ${C.pinkLight};padding-bottom:8px;">${esc(text)}</h2>`;
}

function detailRow(label: string, value: string, bold = false): string {
  return `
  <tr>
    <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:13px;
               color:${C.muted};width:40%;vertical-align:top;">${esc(label)}</td>
    <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:13px;
               color:${C.text};font-weight:${bold ? "bold" : "normal"};
               vertical-align:top;">${value}</td>
  </tr>`;
}

// ---------------------------------------------------------------------------
// Data Types
// ---------------------------------------------------------------------------
export interface OrderEmailDetails {
  id?: string;
  _id?: string;
  created_at?: string;
  total_amount?: number;
  totalAmount?: number;
  payment_id?: string;
  paymentId?: string;
  payment_status?: string;
  status?: string;
  shipping_details?: any;
  shippingDetails?: any;
  order_items?: any[];
  products?: any[];
}

export type ContactEmailData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------
function normalizeOrder(order: OrderEmailDetails) {
  const id = order.id || order._id || "N/A";
  const invoiceNo = `INV-${(id || "").toString().slice(-8).toUpperCase()}`;
  const createdAt = order.created_at ? new Date(order.created_at).toLocaleDateString() : new Date().toLocaleDateString();
  const totalAmount = Number(order.total_amount ?? order.totalAmount ?? 0);
  const shipping = order.shipping_details || order.shippingDetails || {};
  const items = (order.order_items || order.products || []).map((item: any) => ({
    ...item,
    price: Number(item.price || 0),
    quantity: Number(item.quantity || 1)
  }));
  
  return { id, invoiceNo, createdAt, totalAmount, shipping, items };
}

// ---------------------------------------------------------------------------
// Email Template Builders
// ---------------------------------------------------------------------------

export function buildContactAdminEmailHtml(data: ContactEmailData) {
  return emailWrapper(`
    ${emailHeader("New contact submission 📬")}
    ${emailBody(`
      ${sectionHeading("Sender Details")}
      <table width="100%">
        ${detailRow("Name", data.name)}
        ${detailRow("Email", data.email)}
        ${detailRow("Subject", data.subject)}
      </table>
      ${sectionHeading("Message")}
      <p style="font-size:14px; color:${C.text}; line-height:1.6; white-space:pre-wrap;">${esc(data.message)}</p>
    `)}
    ${emailFooter()}
  `);
}

export function buildContactAutoReplyEmailHtml(data: ContactEmailData) {
  return emailWrapper(`
    ${emailHeader("Message received 💌")}
    ${emailBody(`
      <p style="font-size:16px; color:${C.rose}; font-weight:bold;">Hi ${esc(data.name.split(" ")[0])},</p>
      <p style="font-size:14px; color:${C.text}; line-height:1.6;">
        We've received your note and our team will get back to you within 24 hours. ✦
      </p>
    `)}
    ${emailFooter()}
  `);
}

export function buildNewsletterNotificationEmailHtml(email: string) {
  return emailWrapper(`
    ${emailHeader("New Subscriber! ✨")}
    ${emailBody(`
      <div style="background:${C.beige}; padding:20px; border-radius:8px; text-align:center;">
        <p style="margin:0; font-size:18px; color:${C.text}; font-weight:bold;">${esc(email)}</p>
        <p style="margin:5px 0 0; font-size:12px; color:${C.muted};">Signed up for the newsletter</p>
      </div>
    `)}
    ${emailFooter()}
  `);
}

function buildStyledOrderEmailHtml(order: OrderEmailDetails, title: string, subtitle?: string) {
  const o = normalizeOrder(order);
  const invoiceId = o.id?.slice(-8).toUpperCase() || "NEW";
  
  const itemsHtml = o.items.map((item: any) => {
    const isCustomized = item.is_customized || item.isCustomized || false;
    const price = item.price || 0;
    const qty = item.quantity || 1;
    const name = item.name || item.title || "Tote Bag";
    // For images, we try multiple sources (customization preview, database products, or direct image field)
    const imgSrc = item.customization_details?.preview_image || 
                   item.preview_image ||
                   item.image ||
                   (item.products?.images && item.products.images[0]) || 
                   (item.images && item.images[0]) ||
                   ""; 

    return `
      <tr>
        <td width="70" style="padding: 20px 0; border-bottom: 1px solid #E8D5C4; vertical-align: top;">
          <img src="${imgSrc}" width="60" height="60" style="border-radius: 8px; object-fit: cover; border: 1px solid #E8D5C4; display: block;" alt="Product">
        </td>
        <td style="padding: 20px 16px; border-bottom: 1px solid #E8D5C4; vertical-align: top;">
          <span style="font-weight: 600; color: #2D1B1B; font-size: 15px;">${esc(name)}</span><br>
          ${isCustomized ? `
            <span style="font-size:10px; color:#900C3F; font-weight:bold; background-color: #FFD6EC; padding: 4px 8px; border-radius: 6px; display: inline-block; margin-top: 8px; letter-spacing: 0.5px;">✦ CUSTOM DESIGN</span>
          ` : ''}
        </td>
        <td align="right" style="padding: 20px 0; border-bottom: 1px solid #E8D5C4; color: #2D1B1B; vertical-align: top; font-weight: 500; font-size: 15px;">
          ${qty} × INR ${Number(price).toFixed(2)}
        </td>
      </tr>
    `;
  }).join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; background-color: #FFF8F0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
    .container { max-width: 600px; margin: 40px auto; background: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 40px rgba(144, 12, 63, 0.05); }
    .header { padding: 40px; text-align: center; border-bottom: 1px solid #E8D5C4; background-color: #FFF8F0; }
    .body { padding: 48px 40px; }
    .footer { padding: 40px; background: #900C3F; text-align: center; color: #FFFFFF; }
    .btn { display: inline-block; padding: 16px 32px; background: #900C3F; color: #FFFFFF !important; text-decoration: none; border-radius: 12px; font-weight: 600; margin-top: 32px; letter-spacing: 0.5px; }
    .icon-circle { width: 48px; height: 48px; background: #FFD6EC; border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0; font-family: Georgia, serif; font-size: 36px; color: #FF69B4; font-weight: bold; line-height: 0.8;">Tote-ally</h1>
      <h1 style="margin:0; font-family: Georgia, serif; font-size: 36px; color: #900C3F; font-weight: bold;">iconic <span style="color:#FF69B4;font-size:24px;">✦</span></h1>
      <p style="margin: 5px 0 0; font-size: 12px; color: #7A5C5C; text-transform: uppercase; letter-spacing: 1px;">Mode to Be Seen.</p>
    </div>
    <div class="body">
      <div class="icon-circle">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#900C3F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top:12px;margin-left:12px;"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
      </div>
      <h1 style="color: #900C3F; text-align: center; font-size: 26px; margin-bottom: 8px;">${title}</h1>
      <p style="text-align: center; color: #7A5C5C; margin-bottom: 40px; font-size: 15px;">Order #${invoiceId}</p>
      
      ${subtitle ? `<p style="text-align: center; color: #7A5C5C; margin-bottom: 40px; font-size: 15px; line-height: 1.5; padding: 0 20px;">${subtitle}</p>` : ''}

      <div style="background: #FFF8F0; padding: 24px; border-radius: 16px; margin-bottom: 40px; border: 1px solid #E8D5C4;">
        <p style="margin:0; font-weight: 600; color: #2D1B1B; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Shipping Details</p>
        <p style="margin:12px 0 0; color: #7A5C5C; line-height: 1.6; font-size: 15px;">
          <strong>${esc(o.shipping.name || "Customer")}</strong><br>
          ${esc(o.shipping.address || "")}<br>
          ${esc(o.shipping.city || "")}, ${esc(o.shipping.state || "")} - ${esc(o.shipping.pincode || "")}
        </p>
      </div>

      <h3 style="margin: 0 0 20px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #900C3F; border-bottom: 2px solid #E8D5C4; padding-bottom: 12px;">Your Items</h3>
      
      <table width="100%" style="border-collapse: collapse;">
        ${itemsHtml}
      </table>

      <table width="100%" style="border-collapse: collapse; margin-top: 24px;">
        <tr>
          <td align="right" style="padding: 8px 0; color: #7A5C5C; font-size: 15px;">Subtotal:</td>
          <td width="120" align="right" style="padding: 8px 0; color: #2D1B1B; font-size: 15px;">INR ${o.totalAmount.toFixed(2)}</td>
        </tr>
        <tr>
          <td align="right" style="padding: 8px 0; color: #7A5C5C; font-size: 15px;">Shipping:</td>
          <td width="120" align="right" style="padding: 8px 0; color: #2D1B1B; font-size: 15px;">FREE</td>
        </tr>
        <tr>
          <td align="right" style="padding: 20px 0 0; color: #900C3F; font-size: 20px; font-weight: bold;">Total:</td>
          <td width="120" align="right" style="padding: 20px 0 0; color: #900C3F; font-size: 20px; font-weight: bold;">INR ${Number(o.totalAmount).toFixed(2)}</td>
        </tr>
      </table>

      <div style="text-align: center;">
        <a href="https://totallyiconic.in/profile" class="btn">View Order Details</a>
      </div>
    </div>
    <div class="footer">
      <p style="margin:0; font-size: 14px; font-style: italic; opacity: 0.9;">"Mode to be Seen."</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function buildOrderConfirmationEmailHtml(order: OrderEmailDetails) {
  const isManual = order.payment_id === 'MANUAL_UPI' || order.paymentId === 'MANUAL_UPI';
  const title = isManual ? "Order Received" : "Order Confirmed";
  const subtitle = isManual ? 
    "We've received your Manual UPI payment screenshot. Our team is verifying it. You'll receive another email once confirmed." :
    "Your iconic order is confirmed and is being prepared for shipping!";

  return buildStyledOrderEmailHtml(order, title, subtitle);
}

export function buildPaymentConfirmedEmailHtml(order: OrderEmailDetails) {
  return buildStyledOrderEmailHtml(order, "Payment Confirmed", "Great news! Your payment has been verified and your order is moving to production.");
}

export function buildInvoiceHtml(order: OrderEmailDetails) {
  const o = normalizeOrder(order);
  return `
    <div style="width:100%;max-width:800px;margin:0 auto;background:#fff;padding:40px;font-family:Arial,sans-serif;color:#333;line-height:1.4;">
      <div style="display:flex;justify-content:space-between;border-bottom:2px solid #900C3F;padding-bottom:20px;margin-bottom:30px;">
        <div>
          <h1 style="color:#900C3F;margin:0;font-size:28px;">${STORE_NAME}</h1>
          <p style="margin:5px 0 0;font-size:12px;color:#666;">Tax Invoice / Bill of Supply</p>
        </div>
        <div style="text-align:right;">
          <p style="margin:0;font-weight:bold;color:#900C3F;">${o.invoiceNo}</p>
          <p style="margin:5px 0 0;font-size:12px;">Date: ${o.createdAt}</p>
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;margin-bottom:40px;">
        <div style="width:48%;">
          <h3 style="font-size:12px;text-transform:uppercase;color:#900C3F;margin:0 0 10px;">Billing/Shipping Address</h3>
          <p style="margin:0;font-weight:bold;font-size:14px;">${esc(o.shipping.name)}</p>
          <p style="margin:5px 0;font-size:13px;white-space:pre-wrap;">${esc(o.shipping.address)}</p>
          <p style="margin:0;font-size:13px;">${esc(o.shipping.city)}, ${esc(o.shipping.state)} - ${esc(o.shipping.pincode)}</p>
          <p style="margin:5px 0 0;font-size:13px;">Phone: ${esc(o.shipping.phone)}</p>
        </div>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:40px;">
        <thead>
          <tr style="background:#FDF2F4;text-align:left;">
            <th style="padding:12px 15px;border:1px solid #eee;font-size:13px;color:#900C3F;">Description</th>
            <th style="padding:12px 15px;border:1px solid #eee;font-size:13px;color:#900C3F;text-align:center;">Qty</th>
            <th style="padding:12px 15px;border:1px solid #eee;font-size:13px;color:#900C3F;text-align:right;">Unit Price</th>
            <th style="padding:12px 15px;border:1px solid #eee;font-size:13px;color:#900C3F;text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${o.items.map((item: any) => `
            <tr>
              <td style="padding:12px 15px;border:1px solid #eee;font-size:13px;">
                <div style="font-weight:bold;">${esc(item.name)}</div>
                ${item.is_customized ? '<div style="font-size:11px;color:#900C3F;margin-top:2px;">✦ Custom Design Item</div>' : ""}
              </td>
              <td style="padding:12px 15px;border:1px solid #eee;font-size:13px;text-align:center;">${item.quantity}</td>
              <td style="padding:12px 15px;border:1px solid #eee;font-size:13px;text-align:right;">\u20B9${Number(item.price).toFixed(2)}</td>
              <td style="padding:12px 15px;border:1px solid #eee;font-size:13px;text-align:right;">\u20B9${(Number(item.price) * Number(item.quantity)).toFixed(2)}</td>
            </tr>
          `).join("")}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding:12px 15px;text-align:right;font-weight:bold;font-size:14px;color:#900C3F;">Grand Total</td>
            <td style="padding:12px 15px;text-align:right;font-weight:bold;font-size:18px;color:#900C3F;background:#FDF2F4;">\u20B9${o.totalAmount}</td>
          </tr>
        </tfoot>
      </table>

      <div style="border-top:1px solid #eee;padding-top:20px;text-align:center;">
        <p style="margin:0;font-size:11px;color:#999;">Thank you for shopping with Tote-ally Iconic!</p>
        <p style="margin:5px 0 0;font-size:10px;color:#bbb;">This is a computer-generated invoice and does not require a signature.</p>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Public Send Functions
// ---------------------------------------------------------------------------

export async function sendContactEmails(data: ContactEmailData) {
  if (!hasSmtpConfig()) return null;
  const transporter = getTransporter();
  const sender = process.env.EMAIL_USER;
  const admin = process.env.CONTACT_TO_EMAIL || sender;

  await transporter.sendMail({
    from: `"Tote-ally Iconic Support" <noreply.toteally@gmail.com>`,
    to: admin,
    replyTo: data.email,
    subject: `📬 Contact: ${data.subject}`,
    html: buildContactAdminEmailHtml(data),
  });

  await transporter.sendMail({
    from: `"Tote-ally Iconic" <noreply.toteally@gmail.com>`,
    to: data.email,
    subject: `We received your message! 💌`,
    html: buildContactAutoReplyEmailHtml(data),
  });
}

export async function sendNewsletterNotificationEmail(email: string) {
  if (!hasSmtpConfig()) return null;
  const to = process.env.NEWSLETTER_NOTIFY_EMAIL || process.env.CONTACT_TO_EMAIL;
  if (!to) return null;

  return getTransporter().sendMail({
    from: `"Tote-ally Iconic Newsletter" <noreply.toteally@gmail.com>`,
    to,
    subject: "✨ New Newsletter Signup",
    html: buildNewsletterNotificationEmailHtml(email),
  });
}

/**
 * Generates a professional PDF Buffer for the order invoice
 */
async function generateInvoicePdf(order: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: any[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // Header
      doc.fillColor(C.rose).fontSize(24).text(STORE_NAME, { align: "right" });
      doc.fillColor("#444444").fontSize(10).text("TAX INVOICE", { align: "right" });
      doc.moveDown();

      // Info
      const invoiceId = order.id?.slice(-8).toUpperCase() || "NEW";
      doc.fillColor("#000000").fontSize(12).text(`Order ID: #${invoiceId}`);
      doc.fontSize(10).text(`Date: ${new Date().toLocaleDateString()}`);
      doc.moveDown();

      // Shipping
      doc.fontSize(12).text("Shipping To:", { underline: true });
      const s = order.shipping_details || {};
      doc.fontSize(10).text(s.name || "Customer");
      doc.text(s.address || "");
      doc.text(`${s.city || ""}, ${s.state || ""} - ${s.pincode || ""}`);
      doc.text(`Phone: ${s.phone || ""}`);
      doc.moveDown();

      // Table
      const tableTop = 260;
      doc.font("Helvetica-Bold").text("Item Description", 50, tableTop);
      doc.text("Qty", 350, tableTop);
      doc.text("Price", 400, tableTop);
      doc.text("Total", 480, tableTop);
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      let y = tableTop + 30;
      const items = order.order_items || order.products || [];
      
      items.forEach((item: any) => {
        const name = item.name || item.title || "Tote Bag";
        doc.font("Helvetica").fontSize(10).text(name, 50, y, { width: 280 });
        doc.text((item.quantity || 1).toString(), 350, y);
        doc.text(`INR ${item.price || 0}`, 400, y);
        doc.text(`INR ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`, 480, y);
        y += 25;
      });

      // Total
      doc.moveTo(50, y + 5).lineTo(550, y + 5).stroke();
      y += 15;
      doc.font("Helvetica-Bold").fontSize(12).text("Grand Total:", 380, y);
      doc.text(`INR ${order.total_amount || 0}`, 480, y);

      // Footer
      doc.fontSize(8).fillColor("#999999").text("Thank you for shopping with Tote-ally Iconic! This is a computer-generated document.", 50, 780, { align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export async function sendOrderConfirmationEmail(to: string, orderDetails: any) {
  if (!hasSmtpConfig()) return null;
  const transporter = getTransporter();
  const sender = process.env.EMAIL_USER;

  try {
    const pdfBuffer = await generateInvoicePdf(orderDetails);
    const invoiceId = orderDetails.id?.slice(-6).toUpperCase() || "NEW";

    return transporter.sendMail({
      from: `"Tote-ally Iconic" <noreply.toteally@gmail.com>`,
      to,
      subject: `✦ Order Confirmed — #${invoiceId}`,
      html: buildOrderConfirmationEmailHtml(orderDetails),
      attachments: [
        {
          filename: `Invoice_${invoiceId}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf"
        }
      ]
    });
  } catch (err) {
    console.error("Failed to send PDF order email:", err);
    return transporter.sendMail({
      from: `"Tote-ally Iconic" <noreply.toteally@gmail.com>`,
      to,
      subject: `✦ Order Confirmed — #${orderDetails.id?.slice(-6).toUpperCase() || "NEW"}`,
      html: buildOrderConfirmationEmailHtml(orderDetails),
    });
  }
}

export async function sendPaymentConfirmedEmail(to: string, orderDetails: any) {
  if (!hasSmtpConfig()) return null;
  const transporter = getTransporter();
  const sender = process.env.EMAIL_USER;

  try {
    const pdfBuffer = await generateInvoicePdf(orderDetails);
    const invoiceId = orderDetails.id?.slice(-6).toUpperCase() || "NEW";

    return transporter.sendMail({
      from: `"Tote-ally Iconic" <noreply.toteally@gmail.com>`,
      to,
      subject: `✅ Payment Confirmed — Order #${invoiceId}`,
      html: buildPaymentConfirmedEmailHtml(orderDetails),
      attachments: [
        {
          filename: `Invoice_${invoiceId}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf"
        }
      ]
    });
  } catch (err) {
    console.error("Failed to send Payment Confirmed email:", err);
    return transporter.sendMail({
      from: `"Tote-ally Iconic" <noreply.toteally@gmail.com>`,
      to,
      subject: `✅ Payment Confirmed — Order #${orderDetails.id?.slice(-6).toUpperCase() || "NEW"}`,
      html: buildPaymentConfirmedEmailHtml(orderDetails),
    });
  }
}
