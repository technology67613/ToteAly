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
                font-weight:normal;">✦ Est. 2024 ✦</p>
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
  const totalAmount = order.total_amount ?? order.totalAmount ?? 0;
  const shipping = order.shipping_details || order.shippingDetails || {};
  const items = order.order_items || order.products || [];
  
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

export function buildOrderConfirmationEmailHtml(order: OrderEmailDetails) {
  const o = normalizeOrder(order);
  return emailWrapper(`
    ${emailHeader("Order Confirmed! 🎉")}
    ${emailBody(`
      <p style="font-size:16px; color:${C.rose}; font-weight:bold;">Thank you for your order, ${esc(o.shipping.name || "Icon")}.</p>
      <p style="font-size:14px; color:${C.text}; line-height:1.6;">Order ${esc(o.invoiceNo)} is confirmed and being prepared. ✦</p>
    `)}
    ${emailFooter()}
  `);
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
        <div style="width:48%;text-align:right;">
          <h3 style="font-size:12px;text-transform:uppercase;color:#900C3F;margin:0 0 10px;">Payment Details</h3>
          <p style="margin:0;font-size:13px;">Method: <strong>${esc(o.shipping.payment_method || (order.payment_id === 'MANUAL_UPI' ? 'Manual UPI' : 'Online Payment'))}</strong></p>
          <p style="margin:5px 0;font-size:13px;">Status: <strong>${esc(order.payment_status || 'Pending')}</strong></p>
          ${o.shipping.payment_screenshot_url ? `
            <p style="margin:10px 0 0;font-size:11px;">
              <a href="${o.shipping.payment_screenshot_url}" target="_blank" style="color:#900C3F;text-decoration:underline;">View Payment Screenshot</a>
            </p>
          ` : ""}
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
              <td style="padding:12px 15px;border:1px solid #eee;font-size:13px;text-align:right;">\u20B9${item.price}</td>
              <td style="padding:12px 15px;border:1px solid #eee;font-size:13px;text-align:right;">\u20B9${(item.price * item.quantity).toFixed(2)}</td>
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
    from: `"${STORE_NAME} Contact" <${sender}>`,
    to: admin,
    replyTo: data.email,
    subject: `📬 Contact: ${data.subject}`,
    html: buildContactAdminEmailHtml(data),
  });

  await transporter.sendMail({
    from: `"${STORE_NAME}" <${sender}>`,
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
    from: `"${STORE_NAME} Newsletter" <${process.env.EMAIL_USER}>`,
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
    const doc = new PDFDocument({ margin: 50 });
    const chunks: any[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));

    // Logo & Header
    doc.fillColor(C.rose).fontSize(20).text(STORE_NAME, { align: "right" });
    doc.fillColor("#444444").fontSize(10).text("Tax Invoice", { align: "right" });
    doc.moveDown();

    // Order Info
    const invoiceId = order.id?.slice(-8).toUpperCase() || "NEW";
    doc.fillColor("#000000").fontSize(12).text(`Order ID: #${invoiceId}`);
    doc.fontSize(10).text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    // Shipping Details
    doc.fontSize(12).text("Shipping To:", { underline: true });
    doc.fontSize(10).text(order.shipping_details?.name || "Customer");
    doc.text(order.shipping_details?.address || "");
    doc.text(`${order.shipping_details?.city || ""}, ${order.shipping_details?.state || ""} - ${order.shipping_details?.pincode || ""}`);
    doc.text(`Phone: ${order.shipping_details?.phone || ""}`);
    doc.moveDown();

    // Payment Details
    const paymentTop = 180;
    const rightCol = 350;
    doc.fontSize(12).text("Payment:", rightCol, 180, { underline: true });
    doc.fontSize(10).text(`Method: ${order.shipping_details?.payment_method || (order.payment_id === 'MANUAL_UPI' ? 'Manual UPI' : 'Online Payment')}`, rightCol, 195);
    doc.text(`Status: ${order.payment_status || 'Pending'}`, rightCol, 210);
    if (order.shipping_details?.payment_screenshot_url) {
      doc.fillColor(C.rose).text("Screenshot Uploaded", rightCol, 225);
      doc.fillColor("#000000");
    }
    doc.moveDown();
    const tableTop = 250;
    doc.font("Helvetica-Bold").text("Item", 50, tableTop);
    doc.text("Qty", 350, tableTop);
    doc.text("Price", 400, tableTop);
    doc.text("Total", 480, tableTop);

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Table Rows
    let y = tableTop + 30;
    (order.order_items || order.products || []).forEach((item: any) => {
      doc.font("Helvetica").fontSize(10).text(item.name || item.title || "Item", 50, y, { width: 280 });
      doc.text((item.quantity || 1).toString(), 350, y);
      doc.text(`\u20B9${item.price || 0}`, 400, y);
      doc.text(`\u20B9${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`, 480, y);
      y += 20;
    });

    // Totals
    doc.moveTo(50, y + 10).lineTo(550, y + 10).stroke();
    y += 25;
    doc.font("Helvetica-Bold").text("Grand Total:", 400, y);
    doc.text(`\u20B9${order.total_amount || 0}`, 480, y);

    // Footer
    doc.fontSize(8).fillColor("#999999").text("Thank you for shopping with Tote-ally Iconic! This is a computer-generated invoice.", 50, 700, { align: "center" });

    doc.end();
  });
}

export async function sendOrderConfirmationEmail(to: string, orderDetails: any) {
  if (!hasSmtpConfig()) return null;
  const transporter = getTransporter();
  const sender = process.env.EMAIL_USER;

  try {
    // Generate PDF Buffer
    const pdfBuffer = await generateInvoicePdf(orderDetails);
    const invoiceId = orderDetails.id?.slice(-6).toUpperCase() || "NEW";

    return transporter.sendMail({
      from: `"${STORE_NAME}" <${sender}>`,
      to,
      subject: `✦ Order Confirmed — #${invoiceId}`,
      html: buildOrderConfirmationEmailHtml(orderDetails),
      attachments: [
        {
          filename: `Invoice_INV-${invoiceId}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        }
      ]
    });
  } catch (err) {
    console.error("Failed to send PDF order email:", err);
    // Fallback to no attachment if PDF fails
    return transporter.sendMail({
      from: `"${STORE_NAME}" <${sender}>`,
      to,
      subject: `✦ Order Confirmed — #${orderDetails.id?.slice(-6).toUpperCase() || "NEW"}`,
      html: buildOrderConfirmationEmailHtml(orderDetails),
    });
  }
}
