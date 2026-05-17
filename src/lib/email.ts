import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";

import { supabaseAdmin as supabase } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// SMTP Transporter Logic
// ---------------------------------------------------------------------------
function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 465,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

const EMAIL_USER = process.env.EMAIL_USER;

// Fetch config dynamically from DB
async function getEmailConfig() {
  try {
    const { data } = await supabase.from('site_config').select('key, value');
    const config = data?.reduce((acc: any, row: any) => ({ ...acc, [row.key]: row.value }), {}) || {};
    return {
      storeName: config.site_name || process.env.NEXT_PUBLIC_STORE_NAME || "Tote-ally Iconic",
      supportEmail: config.contact_email || "hello@totallyiconic.in",
    };
  } catch (e) {
    return { storeName: process.env.NEXT_PUBLIC_STORE_NAME || "Tote-ally Iconic", supportEmail: "hello@totallyiconic.in" };
  }
}

// ---------------------------------------------------------------------------
// HTML escape
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

// ─── Shared Types ───────────────────────────────────────────

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  is_customized: boolean;
  image?: string;
}

export interface ShippingDetails {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export interface Order {
  id: string;
  total_amount: number;
  payment_method?: string;
  payment_screenshot_url?: string;
  shipping_details: ShippingDetails;
  order_items: OrderItem[];
}

// ─── Shared Shell ────────────────────────────────────────────

const shell = (content: string, preheader = "") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Tote-ally Iconic</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background-color:#F2F2F0;-webkit-font-smoothing:antialiased;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ""}

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F2F2F0;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" style="max-width:560px;" cellpadding="0" cellspacing="0" border="0">

          <!-- WORDMARK -->
          <tr>
            <td style="padding:0 0 20px;text-align:center;">
              <p style="margin:0;font-family:'DM Serif Display',Georgia,serif;font-size:20px;font-weight:400;color:#1A1A1A;letter-spacing:0.5px;">Tote-ally Iconic</p>
            </td>
          </tr>

          <!-- CARD -->
          <tr>
            <td style="background:#FFFFFF;border-radius:4px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.07);">
              ${content}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:24px 0 0;text-align:center;">
              <p style="margin:0 0 4px;font-family:'DM Sans',sans-serif;font-size:11px;color:#AAAAAA;letter-spacing:0.3px;">
                &copy; ${new Date().getFullYear()} Tote-ally Iconic &nbsp;&middot;&nbsp;
                <a href="#" style="color:#AAAAAA;text-decoration:underline;">Unsubscribe</a>
                &nbsp;&middot;&nbsp;
                <a href="#" style="color:#AAAAAA;text-decoration:underline;">Privacy Policy</a>
              </p>
              <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:11px;color:#CCCCCC;">Mode to be seen.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

// ─── Shared Helpers ──────────────────────────────────────────

const divider = `<div style="height:1px;background:#F0F0EE;"></div>`;

const ctaButton = (label: string, href = "https://totallyiconic.in") =>
  `<a href="${href}" style="display:inline-block;background:#900C3F;color:#FFFFFF;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;letter-spacing:1px;text-transform:uppercase;text-decoration:none;padding:13px 32px;border-radius:2px;">${label}</a>`;

// ─── 1. Order Confirmation (Detailed) ──────────────────────────

export function buildCustomerConfirmationEmailHtml(
  order: Order,
  estimatedDelivery: string = "3-5 business days"
): string {
  const { id, total_amount, shipping_details: s, order_items } = order;

  const itemRows = order_items
    .map(
      (item) => `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #F4F4F2;vertical-align:middle;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align:middle;width:50px;">
                ${
                  item.image
                    ? `<img src="${item.image}" width="42" height="42" alt="${esc(item.name)}"
                        style="display:block;border-radius:3px;object-fit:cover;border:1px solid #EBEBEB;" />`
                    : `<div style="width:42px;height:42px;border-radius:3px;background:#F8F4F4;border:1px solid #EBEBEB;"></div>`
                }
              </td>
              <td style="padding-left:14px;vertical-align:middle;">
                <p style="margin:0 0 2px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:#1A1A1A;">${esc(item.name)}</p>
                <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:12px;color:#999999;">
                  Qty: ${item.quantity}
                  ${item.is_customized ? `&nbsp;&nbsp;<span style="color:#900C3F;font-weight:500;">Custom</span>` : ""}
                </p>
              </td>
              <td style="text-align:right;vertical-align:middle;white-space:nowrap;">
                <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:#1A1A1A;">
                  &#8377;${(item.price * item.quantity).toLocaleString("en-IN")}
                </p>
                ${item.quantity > 1 ? `<p style="margin:2px 0 0;font-family:'DM Sans',sans-serif;font-size:11px;color:#BBBBBB;">&#8377;${item.price.toLocaleString("en-IN")} each</p>` : ""}
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    )
    .join("");

  const content = `
    <div style="height:3px;background:#900C3F;"></div>

    <div style="padding:36px 32px 24px;">
      <p style="margin:0 0 8px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:#900C3F;">Order Confirmed</p>
      <h1 style="margin:0 0 10px;font-family:'DM Serif Display',Georgia,serif;font-size:26px;font-weight:400;color:#1A1A1A;line-height:1.3;">Thank you for your order, ${esc(s.name.split(" ")[0])}.</h1>
      <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:14px;color:#666666;line-height:1.65;">We've received your order and are getting it ready. You'll receive a shipping confirmation once it's dispatched.</p>
    </div>

    ${divider}

    <div style="padding:18px 32px;background:#FAFAFA;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-right:16px;">
            <p style="margin:0 0 3px;font-family:'DM Sans',sans-serif;font-size:11px;color:#AAAAAA;letter-spacing:1px;text-transform:uppercase;">Order ID</p>
            <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:#1A1A1A;">#${esc(id)}</p>
          </td>
          <td>
            <p style="margin:0 0 3px;font-family:'DM Sans',sans-serif;font-size:11px;color:#AAAAAA;letter-spacing:1px;text-transform:uppercase;">Date</p>
            <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:#1A1A1A;">${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
          </td>
          <td style="text-align:right;">
            <p style="margin:0 0 3px;font-family:'DM Sans',sans-serif;font-size:11px;color:#AAAAAA;letter-spacing:1px;text-transform:uppercase;">Est. Delivery</p>
            <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:#900C3F;">${esc(estimatedDelivery)}</p>
          </td>
        </tr>
      </table>
    </div>

    ${divider}

    <div style="padding:12px 32px 0;">
      <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:#AAAAAA;">Your Items</p>
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:0 32px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemRows}</table></td></tr>
    </table>

    <div style="padding:18px 32px;background:#FAFAFA;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-family:'DM Sans',sans-serif;font-size:13px;color:#888888;padding-bottom:8px;">Subtotal</td>
          <td style="font-family:'DM Sans',sans-serif;font-size:13px;color:#1A1A1A;text-align:right;padding-bottom:8px;">&#8377;${total_amount.toLocaleString("en-IN")}</td>
        </tr>
        <tr>
          <td style="font-family:'DM Sans',sans-serif;font-size:13px;color:#888888;padding-bottom:16px;">Shipping</td>
          <td style="font-family:'DM Sans',sans-serif;font-size:13px;color:#1A1A1A;text-align:right;padding-bottom:16px;">Free</td>
        </tr>
        <tr>
          <td style="font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;color:#1A1A1A;border-top:1px solid #E8E8E6;padding-top:14px;">Total Paid</td>
          <td style="font-family:'DM Serif Display',Georgia,serif;font-size:20px;color:#900C3F;text-align:right;border-top:1px solid #E8E8E6;padding-top:12px;">&#8377;${total_amount.toLocaleString("en-IN")}</td>
        </tr>
      </table>
    </div>

    ${divider}

    <div style="padding:22px 32px;">
      <p style="margin:0 0 10px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:#AAAAAA;">Shipping Address</p>
      <p style="margin:0 0 2px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;color:#1A1A1A;">${esc(s.name)}</p>
      <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:13px;color:#666666;line-height:1.7;">${esc(s.address)}<br />${esc(s.city)}, ${esc(s.state)} &ndash; ${esc(s.pincode)}<br />${esc(s.phone)}</p>
    </div>

    <!-- Payment Details (UPI Screenshot) -->
    ${
      order.payment_method === "Manual UPI" && order.payment_screenshot_url
        ? `
    <div style="padding:24px 32px;background:#FFF8F0;border-top:1px solid #F0F0EE;text-align:center;">
      <p style="margin:0 0 12px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:#900C3F;">Payment Proof Received</p>
      <div style="border-radius:4px;overflow:hidden;border:1px solid #EBEBEB;display:inline-block;max-width:200px;">
        <img src="${order.payment_screenshot_url}" alt="Payment Screenshot" style="width:100%;height:auto;display:block;" />
      </div>
      <p style="margin:12px 0 0;font-family:'DM Sans',sans-serif;font-size:12px;color:#888888;line-height:1.5;">Our team is verifying your manual payment.</p>
    </div>`
        : ""
    }

    ${divider}

    <div style="padding:22px 32px;">
      <p style="margin:0 0 14px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:#AAAAAA;">What happens next</p>
      ${[
        ["Processing", "We're reviewing your order and preparing it for dispatch."],
        ["Dispatch notification", "You'll receive an email with your tracking details once shipped."],
        ["Delivery", `Expected by ${estimatedDelivery}.`],
      ]
        .map(
          ([title, desc]) => `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
            <tr>
              <td style="vertical-align:top;width:6px;padding-top:5px;">
                <div style="width:6px;height:6px;border-radius:50%;background:#900C3F;"></div>
              </td>
              <td style="vertical-align:top;padding-left:14px;">
                <p style="margin:0 0 1px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:#1A1A1A;">${esc(title)}</p>
                <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:12px;color:#888888;line-height:1.6;">${esc(desc)}</p>
              </td>
            </tr>
          </table>`
        )
        .join("")}
    </div>

    ${divider}

    <div style="padding:26px 32px 34px;text-align:center;">
      ${ctaButton("View Your Order", `https://totallyiconic.in/orders/${id}`)}
      <p style="margin:14px 0 0;font-family:'DM Sans',sans-serif;font-size:12px;color:#AAAAAA;">Questions? Reply to this email or write to <a href="mailto:hello@totallyiconic.in" style="color:#900C3F;text-decoration:none;">hello@totallyiconic.in</a></p>
    </div>
  `;

  return shell(content, `Your order #${esc(id)} is confirmed — estimated delivery by ${esc(estimatedDelivery)}.`);
}

// ─── 2. Welcome Email (New Account) ─────────────────────────

export function buildWelcomeEmailHtml(name: string): string {
  const content = `
    <div style="height:3px;background:#900C3F;"></div>

    <div style="padding:48px 32px 36px;text-align:center;">
      <p style="margin:0 0 8px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:#900C3F;">Welcome</p>
      <h1 style="margin:0 0 14px;font-family:'DM Serif Display',Georgia,serif;font-size:30px;font-weight:400;color:#1A1A1A;line-height:1.25;">Hello, ${esc(name)}.</h1>
      <p style="margin:0 auto;font-family:'DM Sans',sans-serif;font-size:14px;color:#666666;line-height:1.7;max-width:380px;">Your account is all set. You're now part of a community that carries with intention — welcome to Tote-ally Iconic.</p>
    </div>

    ${divider}

    <div style="padding:32px;">
      ${[
        ["Early Access", "Be first to shop new arrivals before they go public."],
        ["Custom Orders", "Design a tote that's entirely yours — print, colour, and strap."],
        ["Order History", "Track every order and reorder favourites with ease."],
      ]
        .map(
          ([title, desc], i) => `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${i > 0 ? "margin-top:18px;" : ""}">
          <tr>
            <td style="vertical-align:top;width:6px;padding-top:5px;">
              <div style="width:6px;height:6px;border-radius:50%;background:#900C3F;"></div>
            </td>
            <td style="vertical-align:top;padding-left:14px;">
              <p style="margin:0 0 3px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;color:#1A1A1A;">${esc(title)}</p>
              <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:13px;color:#888888;line-height:1.6;">${esc(desc)}</p>
            </td>
          </tr>
        </table>`
        )
        .join("")}
    </div>

    ${divider}

    <div style="padding:28px 32px 36px;text-align:center;">
      ${ctaButton("Explore the Collection")}
    </div>
  `;

  return shell(content, `Welcome to Tote-ally Iconic, ${esc(name)} — your account is ready.`);
}

// ─── 3. Newsletter Welcome + Discount ───────────────────────

export function buildNewsletterNotificationEmailHtml(email: string): string {
  const discountCode = "ICONIC10";

  const content = `
    <div style="height:3px;background:#900C3F;"></div>

    <div style="padding:40px 32px 28px;">
      <p style="margin:0 0 8px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:#900C3F;">You're Subscribed</p>
      <h1 style="margin:0 0 12px;font-family:'DM Serif Display',Georgia,serif;font-size:26px;font-weight:400;color:#1A1A1A;line-height:1.3;">You're on the list.</h1>
      <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:14px;color:#666666;line-height:1.65;">As a welcome, here is 10% off your first order. Use the code below at checkout — valid for 30 days.</p>
    </div>

    ${divider}

    <div style="padding:32px;text-align:center;">
      <div style="border:1.5px dashed #DDCCD2;border-radius:3px;padding:24px 40px;display:inline-block;">
        <p style="margin:0 0 6px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:#AAAAAA;">Your discount code</p>
        <p style="margin:0;font-family:'DM Serif Display',Georgia,serif;font-size:34px;font-weight:400;color:#900C3F;letter-spacing:5px;">${discountCode}</p>
        <p style="margin:8px 0 0;font-family:'DM Sans',sans-serif;font-size:11px;color:#BBBBBB;">One use per customer &nbsp;&middot;&nbsp; Min. order &#8377;999</p>
      </div>
    </div>

    ${divider}

    <div style="padding:28px 32px;">
      <p style="margin:0 0 14px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:#AAAAAA;">What to expect</p>
      ${[
        "New collections and seasonal edits",
        "Subscriber-only offers and early access",
        "Stories from behind the craft",
      ]
        .map(
          (item) => `
          <p style="margin:0 0 10px;font-family:'DM Sans',sans-serif;font-size:13px;color:#555555;line-height:1.5;padding-left:14px;border-left:2px solid #E8D8DC;">${esc(item)}</p>`
        )
        .join("")}
    </div>

    ${divider}

    <div style="padding:28px 32px 36px;text-align:center;">
      ${ctaButton("Shop Now")}
      <p style="margin:14px 0 0;font-family:'DM Sans',sans-serif;font-size:11px;color:#AAAAAA;">Subscribed as ${esc(email)}</p>
    </div>
  `;

  return shell(content, `Your 10% welcome code is inside — valid for 30 days.`);
}

// ─── 4. Contact Form Auto-Reply ──────────────────────────────

export function buildContactAutoReplyEmailHtml(data: { name: string, subject: string }): string {
  const content = `
    <div style="height:3px;background:#900C3F;"></div>

    <div style="padding:40px 32px 28px;">
      <p style="margin:0 0 8px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:#900C3F;">We're on it</p>
      <h1 style="margin:0 0 12px;font-family:'DM Serif Display',Georgia,serif;font-size:26px;font-weight:400;color:#1A1A1A;line-height:1.3;">Message received, ${esc(data.name.split(" ")[0])}.</h1>
      <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:14px;color:#666666;line-height:1.65;">Thank you for getting in touch. A member of our team will review your enquiry and respond within 1&ndash;2 business days.</p>
    </div>

    ${divider}

    <div style="padding:24px 32px;background:#FAFAFA;">
      <p style="margin:0 0 6px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:#AAAAAA;">Your Enquiry</p>
      <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;color:#1A1A1A;">${esc(data.subject)}</p>
    </div>

    ${divider}

    <div style="padding:28px 32px;">
      <p style="margin:0 0 18px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:#AAAAAA;">What happens next</p>
      ${[
        ["Review", "Your message is with our team and under review."],
        ["Response", "We will reply to you within 1–2 business days."],
        ["Resolution", "We will make sure your query is fully resolved."],
      ]
        .map(
          ([step, desc], i) => `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${i > 0 ? "margin-top:16px;" : ""}">
            <tr>
              <td style="vertical-align:top;width:6px;padding-top:5px;">
                <div style="width:6px;height:6px;border-radius:50%;background:#900C3F;"></div>
              </td>
              <td style="vertical-align:top;padding-left:14px;">
                <p style="margin:0 0 2px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:#1A1A1A;">${esc(step)}</p>
                <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:13px;color:#888888;line-height:1.6;">${esc(desc)}</p>
              </td>
            </tr>
          </table>`
        )
        .join("")}
    </div>

    ${divider}

    <div style="padding:28px 32px 36px;text-align:center;">
      <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:13px;color:#888888;line-height:1.7;">For urgent matters, reply directly to this email<br />and we will prioritise your request.</p>
    </div>
  `;

  return shell(content, `We've received your message and will be in touch within 1–2 business days.`);
}

// ─── 5. Shipment Completed (Shipped) ────────────────────────

export function buildShipmentCompletedEmailHtml(
  order: Pick<Order, "id" | "shipping_details">,
  trackingNumber: string,
  courier: string,
  trackingUrl: string
): string {
  const { id, shipping_details: s } = order;

  const content = `
    <div style="height:3px;background:#900C3F;"></div>

    <div style="padding:36px 32px 28px;">
      <p style="margin:0 0 8px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:#900C3F;">Shipment Update</p>
      <h1 style="margin:0 0 10px;font-family:'DM Serif Display',Georgia,serif;font-size:26px;font-weight:400;color:#1A1A1A;line-height:1.3;">Your order has shipped, ${esc(s.name.split(" ")[0])}.</h1>
      <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:14px;color:#666666;line-height:1.65;">Great news — your order is on its way. Use the tracking details below to follow its journey.</p>
    </div>

    ${divider}

    <div style="padding:24px 32px;background:#FAFAFA;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-bottom:16px;">
            <p style="margin:0 0 4px;font-family:'DM Sans',sans-serif;font-size:11px;color:#AAAAAA;letter-spacing:1px;text-transform:uppercase;">Order ID</p>
            <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;color:#1A1A1A;">#${esc(id)}</p>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom:16px;">
            <p style="margin:0 0 4px;font-family:'DM Sans',sans-serif;font-size:11px;color:#AAAAAA;letter-spacing:1px;text-transform:uppercase;">Courier</p>
            <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;color:#1A1A1A;">${esc(courier)}</p>
          </td>
        </tr>
        <tr>
          <td>
            <p style="margin:0 0 4px;font-family:'DM Sans',sans-serif;font-size:11px;color:#AAAAAA;letter-spacing:1px;text-transform:uppercase;">Tracking Number</p>
            <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;color:#900C3F;">${esc(trackingNumber)}</p>
          </td>
        </tr>
      </table>
    </div>

    ${divider}

    <div style="padding:24px 32px;">
      <p style="margin:0 0 10px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:#AAAAAA;">Delivering To</p>
      <p style="margin:0 0 2px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;color:#1A1A1A;">${esc(s.name)}</p>
      <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:13px;color:#666666;line-height:1.7;">${esc(s.address)}<br />${esc(s.city)}, ${esc(s.state)} &ndash; ${esc(s.pincode)}</p>
    </div>

    ${divider}

    <div style="padding:28px 32px 36px;text-align:center;">
      ${ctaButton("Track Your Order", trackingUrl)}
      <p style="margin:16px 0 0;font-family:'DM Sans',sans-serif;font-size:12px;color:#AAAAAA;">Questions? Reply to this email.</p>
    </div>
  `;

  return shell(content, `Your order #${esc(id)} has shipped — track it anytime.`);
}

// ─── 6. Out For Delivery ─────────────────────────────────────

export function buildOutForDeliveryEmailHtml(
  order: Pick<Order, "id" | "shipping_details">,
  trackingUrl: string,
  estimatedTime?: string
): string {
  const { id, shipping_details: s } = order;

  const content = `
    <div style="height:3px;background:#900C3F;"></div>

    <div style="padding:36px 32px 28px;">
      <p style="margin:0 0 8px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:#900C3F;">Out for Delivery</p>
      <h1 style="margin:0 0 10px;font-family:'DM Serif Display',Georgia,serif;font-size:26px;font-weight:400;color:#1A1A1A;line-height:1.3;">Your order is almost there.</h1>
      <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:14px;color:#666666;line-height:1.65;">Your order #${esc(id)} is out for delivery today. Please ensure someone is available to receive it.${estimatedTime ? ` Estimated arrival: <strong style="color:#1A1A1A;font-weight:500;">${esc(estimatedTime)}</strong>.` : ""}</p>
    </div>

    ${divider}

    <div style="padding:24px 32px;background:#FAFAFA;">
      <p style="margin:0 0 10px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:#AAAAAA;">Delivering To</p>
      <p style="margin:0 0 2px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;color:#1A1A1A;">${esc(s.name)}</p>
      <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:13px;color:#666666;line-height:1.7;">${esc(s.address)}<br />${esc(s.city)}, ${esc(s.state)} &ndash; ${esc(s.pincode)}<br />${esc(s.phone)}</p>
    </div>

    ${divider}

    <div style="padding:28px 32px 36px;text-align:center;">
      ${ctaButton("Live Tracking", trackingUrl)}
      <p style="margin:16px 0 0;font-family:'DM Sans',sans-serif;font-size:12px;color:#AAAAAA;">If you miss the delivery, the courier will attempt again the next business day.</p>
    </div>
  `;

  return shell(content, `Your order #${esc(id)} is out for delivery today.`);
}

// ─── 7. Delivered ────────────────────────────────────────────

export function buildDeliveredEmailHtml(
  order: Pick<Order, "id" | "shipping_details">,
  reviewUrl: string
): string {
  const { id, shipping_details: s } = order;

  const content = `
    <div style="height:3px;background:#900C3F;"></div>

    <div style="padding:40px 32px 28px;">
      <p style="margin:0 0 8px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:#900C3F;">Delivered</p>
      <h1 style="margin:0 0 10px;font-family:'DM Serif Display',Georgia,serif;font-size:26px;font-weight:400;color:#1A1A1A;line-height:1.3;">Your order has arrived, ${esc(s.name.split(" ")[0])}.</h1>
      <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:14px;color:#666666;line-height:1.65;">Order #${esc(id)} was successfully delivered. We hope you love it.</p>
    </div>

    ${divider}

    <div style="padding:24px 32px;background:#FAFAFA;">
      <p style="margin:0 0 4px;font-family:'DM Sans',sans-serif;font-size:11px;color:#AAAAAA;letter-spacing:1px;text-transform:uppercase;">Delivered To</p>
      <p style="margin:0 0 2px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;color:#1A1A1A;">${esc(s.name)}</p>
      <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:13px;color:#666666;">${esc(s.city)}, ${esc(s.state)}</p>
    </div>

    ${divider}

    <div style="padding:28px 32px;">
      <p style="margin:0 0 10px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:#AAAAAA;">Anything wrong?</p>
      ${[
        ["Item not received", "If you haven't received your order, reply to this email within 48 hours."],
        ["Damaged or incorrect item", "Take a photo and reply — we'll resolve it immediately."],
        ["Return or exchange", "We offer hassle-free returns within 7 days of delivery."],
      ]
        .map(
          ([title, desc]) => `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
          <tr>
            <td style="vertical-align:top;width:6px;padding-top:5px;">
              <div style="width:6px;height:6px;border-radius:50%;background:#900C3F;"></div>
            </td>
            <td style="vertical-align:top;padding-left:14px;">
              <p style="margin:0 0 2px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:#1A1A1A;">${esc(title)}</p>
              <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:12px;color:#888888;line-height:1.6;">${esc(desc)}</p>
            </td>
          </tr>
        </table>`
        )
        .join("")}
    </div>

    ${divider}

    <div style="padding:28px 32px 36px;text-align:center;">
      ${ctaButton("Leave a Review", reviewUrl)}
      <p style="margin:16px 0 0;font-family:'DM Sans',sans-serif;font-size:12px;color:#AAAAAA;">Your feedback helps us improve.</p>
    </div>
  `;

  return shell(content, `Your order #${esc(id)} has been delivered — thank you for shopping with us.`);
}

// ─── 8. Order Cancelled ──────────────────────────────────────

export function buildOrderCancelledEmailHtml(
  order: Pick<Order, "id" | "total_amount" | "shipping_details">,
  reason?: string,
  refundDays = 5
): string {
  const { id, total_amount, shipping_details: s } = order;

  const content = `
    <div style="height:3px;background:#555555;"></div>

    <div style="padding:36px 32px 28px;">
      <p style="margin:0 0 8px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:#555555;">Order Cancelled</p>
      <h1 style="margin:0 0 10px;font-family:'DM Serif Display',Georgia,serif;font-size:26px;font-weight:400;color:#1A1A1A;line-height:1.3;">Your order has been cancelled.</h1>
      <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:14px;color:#666666;line-height:1.65;">Hi ${esc(s.name.split(" ")[0])}, order #${esc(id)} has been cancelled.${reason ? ` Reason: ${esc(reason)}.` : ""} We're sorry for the inconvenience.</p>
    </div>

    ${divider}

    <div style="padding:24px 32px;background:#FAFAFA;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-bottom:14px;">
            <p style="margin:0 0 4px;font-family:'DM Sans',sans-serif;font-size:11px;color:#AAAAAA;letter-spacing:1px;text-transform:uppercase;">Order ID</p>
            <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;color:#1A1A1A;">#${esc(id)}</p>
          </td>
        </tr>
        <tr>
          <td>
            <p style="margin:0 0 4px;font-family:'DM Sans',sans-serif;font-size:11px;color:#AAAAAA;letter-spacing:1px;text-transform:uppercase;">Refund Amount</p>
            <p style="margin:0;font-family:'DM Serif Display',Georgia,serif;font-size:20px;color:#1A1A1A;">&#8377;${total_amount.toLocaleString("en-IN")}</p>
          </td>
        </tr>
      </table>
    </div>

    ${divider}

    <div style="padding:24px 32px;">
      <p style="margin:0 0 10px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:#AAAAAA;">Refund Information</p>
      ${[
        ["Refund initiated", "Your refund has been processed to the original payment method."],
        [`Timeline`, `Allow ${refundDays} business days for the amount to reflect in your account.`],
        ["Need help?", "Reply to this email if you have any questions about your refund."],
      ]
        .map(
          ([title, desc]) => `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
            <tr>
              <td style="vertical-align:top;width:6px;padding-top:5px;">
                <div style="width:6px;height:6px;border-radius:50%;background:#AAAAAA;"></div>
              </td>
              <td style="vertical-align:top;padding-left:14px;">
                <p style="margin:0 0 2px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:#1A1A1A;">${esc(title)}</p>
                <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:12px;color:#888888;line-height:1.6;">${esc(desc)}</p>
              </td>
            </tr>
          </table>`
        )
        .join("")}
    </div>

    ${divider}

    <div style="padding:28px 32px 36px;text-align:center;">
      ${ctaButton("Shop Again")}
      <p style="margin:16px 0 0;font-family:'DM Sans',sans-serif;font-size:12px;color:#AAAAAA;">We hope to serve you again soon.</p>
    </div>
  `;

  return shell(content, `Order #${esc(id)} has been cancelled — your refund is on its way.`);
}

// ─── 9. Payment Failed ───────────────────────────────────────

export function buildPaymentFailedEmailHtml(
  order: Pick<Order, "id" | "total_amount" | "shipping_details">,
  retryUrl: string,
  failureReason?: string
): string {
  const { id, total_amount, shipping_details: s } = order;

  const content = `
    <div style="height:3px;background:#B91C1C;"></div>

    <div style="padding:36px 32px 28px;">
      <p style="margin:0 0 8px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:#B91C1C;">Payment Failed</p>
      <h1 style="margin:0 0 10px;font-family:'DM Serif Display',Georgia,serif;font-size:26px;font-weight:400;color:#1A1A1A;line-height:1.3;">We couldn't process your payment.</h1>
      <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:14px;color:#666666;line-height:1.65;">Hi ${esc(s.name.split(" ")[0])}, the payment for order #${esc(id)} was unsuccessful.${failureReason ? ` Reason: ${esc(failureReason)}.` : ""} Your order has not been placed.</p>
    </div>

    ${divider}

    <div style="padding:24px 32px;background:#FEF9F9;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-bottom:14px;">
            <p style="margin:0 0 4px;font-family:'DM Sans',sans-serif;font-size:11px;color:#AAAAAA;letter-spacing:1px;text-transform:uppercase;">Order ID</p>
            <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;color:#1A1A1A;">#${esc(id)}</p>
          </td>
        </tr>
        <tr>
          <td>
            <p style="margin:0 0 4px;font-family:'DM Sans',sans-serif;font-size:11px;color:#AAAAAA;letter-spacing:1px;text-transform:uppercase;">Amount Due</p>
            <p style="margin:0;font-family:'DM Serif Display',Georgia,serif;font-size:20px;color:#1A1A1A;">&#8377;${total_amount.toLocaleString("en-IN")}</p>
          </td>
        </tr>
      </table>
    </div>

    ${divider}

    <div style="padding:24px 32px;">
      <p style="margin:0 0 10px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:#AAAAAA;">Common reasons for failure</p>
      ${[
        ["Insufficient funds", "Ensure your account has sufficient balance and try again."],
        ["Card details incorrect", "Double-check your card number, expiry, and CVV."],
        ["Bank declined", "Contact your bank or try a different payment method."],
      ]
        .map(
          ([title, desc]) => `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
            <tr>
              <td style="vertical-align:top;width:6px;padding-top:5px;">
                <div style="width:6px;height:6px;border-radius:50%;background:#B91C1C;"></div>
              </td>
              <td style="vertical-align:top;padding-left:14px;">
                <p style="margin:0 0 2px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:#1A1A1A;">${esc(title)}</p>
                <p style="margin:0;font-family:'DM Sans',sans-serif;font-size:12px;color:#888888;line-height:1.6;">${esc(desc)}</p>
              </td>
            </tr>
          </table>`
        )
        .join("")}
    </div>

    ${divider}

    <div style="padding:28px 32px 36px;text-align:center;">
      ${ctaButton("Retry Payment", retryUrl)}
      <p style="margin:16px 0 0;font-family:'DM Sans',sans-serif;font-size:12px;color:#AAAAAA;">Your cart is saved. No charges have been made.</p>
    </div>
  `;

  return shell(content, `Action required — payment for order #${esc(id)} was unsuccessful.`);
}

export function buildPaymentConfirmedEmailHtml(order: Order) {
  return buildCustomerConfirmationEmailHtml(order, "Order Confirmed ✅");
}

// ─── 11. Admin Order Notification ────────────────────────────
// Internal alert sent to the store owner/admin whenever a new
// order is placed. No decorative shell — dense, scannable info.

export interface AdminNotificationOptions {
  adminName?: string;          // e.g. "Team"
  dashboardUrl?: string;       // link to admin panel order detail
}

export function buildAdminOrderNotificationEmailHtml(
  order: Order,
  options: AdminNotificationOptions = {}
): string {
  const {
    adminName = "Team",
    dashboardUrl = `https://totallyiconic.in/admin/orders`,
  } = options;

  const { id, total_amount, shipping_details: s, order_items } = order;

  const hasCustomItem = order_items.some((i) => i.is_customized);
  const itemCount = order_items.reduce((sum, i) => sum + i.quantity, 0);

  const adminShell = (body: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Order — Admin</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background:#EFEFED;font-family:'DM Sans',sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EFEFED;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" style="max-width:560px;" cellpadding="0" cellspacing="0">

          <!-- Internal badge -->
          <tr>
            <td style="padding:0 0 14px;">
              <span style="font-size:10px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:#888888;">Internal &nbsp;·&nbsp; Tote-ally Iconic</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#FFFFFF;border-radius:4px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.07);">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:18px 0 0;text-align:center;">
              <p style="margin:0;font-size:11px;color:#AAAAAA;">This is an automated internal notification. Do not forward externally.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const itemList = order_items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #F4F4F2;font-size:13px;color:#1A1A1A;vertical-align:middle;">
          ${esc(item.name)}
          ${item.is_customized ? `<span style="margin-left:8px;font-size:10px;font-weight:500;background:#FDF0F4;color:#900C3F;padding:2px 7px;border-radius:2px;letter-spacing:0.5px;text-transform:uppercase;">Custom</span>` : ""}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #F4F4F2;font-size:13px;color:#555555;text-align:center;vertical-align:middle;">×${item.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #F4F4F2;font-size:13px;font-weight:500;color:#1A1A1A;text-align:right;vertical-align:middle;white-space:nowrap;">&#8377;${(item.price * item.quantity).toLocaleString("en-IN")}</td>
      </tr>`
    )
    .join("");

  const body = `
    <!-- Alert bar -->
    <div style="height:3px;background:#1A1A1A;"></div>

    <!-- Header -->
    <div style="padding:24px 28px 20px;border-bottom:1px solid #F0F0EE;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <p style="margin:0 0 2px;font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:#888888;">New Order Received</p>
            <p style="margin:0;font-size:20px;font-weight:500;color:#1A1A1A;">
              #${esc(id)}
              ${hasCustomItem ? `<span style="margin-left:10px;font-size:11px;font-weight:500;background:#FDF0F4;color:#900C3F;padding:3px 9px;border-radius:2px;letter-spacing:0.5px;text-transform:uppercase;vertical-align:middle;">Custom Item</span>` : ""}
            </p>
          </td>
          <td style="text-align:right;white-space:nowrap;">
            <p style="margin:0 0 2px;font-size:11px;color:#AAAAAA;">Total</p>
            <p style="margin:0;font-size:22px;font-weight:500;color:#1A1A1A;">&#8377;${total_amount.toLocaleString("en-IN")}</p>
          </td>
        </tr>
      </table>
    </div>

    <!-- Quick stats -->
    <div style="padding:16px 28px;background:#FAFAFA;border-bottom:1px solid #F0F0EE;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-right:24px;">
            <p style="margin:0 0 2px;font-size:10px;font-weight:500;letter-spacing:1px;text-transform:uppercase;color:#AAAAAA;">Items</p>
            <p style="margin:0;font-size:14px;font-weight:500;color:#1A1A1A;">${itemCount} unit${itemCount > 1 ? "s" : ""}</p>
          </td>
          <td style="padding-right:24px;">
            <p style="margin:0 0 2px;font-size:10px;font-weight:500;letter-spacing:1px;text-transform:uppercase;color:#AAAAAA;">Date</p>
            <p style="margin:0;font-size:14px;font-weight:500;color:#1A1A1A;">${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
          </td>
          <td style="text-align:right;">
            <p style="margin:0 0 2px;font-size:10px;font-weight:500;letter-spacing:1px;text-transform:uppercase;color:#AAAAAA;">Time</p>
            <p style="margin:0;font-size:14px;font-weight:500;color:#1A1A1A;">${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
          </td>
        </tr>
      </table>
    </div>

    ${order.payment_method === 'Manual UPI' ? `
    <div style="padding:12px 28px; background: #FFF8F0; border-bottom: 1px solid #F0F0EE;">
      <p style="margin:0; font-size:12px; color: #900C3F; font-weight: 500;">⚠️ Manual UPI Payment - Verification Needed</p>
      ${order.payment_screenshot_url ? `<img src="${order.payment_screenshot_url}" style="margin-top:10px; max-width:200px; border-radius:4px;" />` : ""}
    </div>
    ` : ""}

    <!-- Items table -->
    <div style="padding:16px 28px 0;">
      <p style="margin:0 0 8px;font-size:10px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:#AAAAAA;">Order Items</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${itemList}
        <tr>
          <td colspan="2" style="padding-top:12px;font-size:13px;font-weight:500;color:#1A1A1A;">Total</td>
          <td style="padding-top:12px;font-size:15px;font-weight:500;color:#1A1A1A;text-align:right;white-space:nowrap;">&#8377;${total_amount.toLocaleString("en-IN")}</td>
        </tr>
      </table>
    </div>

    <!-- Shipping -->
    <div style="padding:20px 28px;margin-top:16px;border-top:1px solid #F0F0EE;background:#FAFAFA;">
      <p style="margin:0 0 10px;font-size:10px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:#AAAAAA;">Ship To</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:13px;font-weight:500;color:#1A1A1A;padding-bottom:3px;">${esc(s.name)}</td>
          <td style="text-align:right;font-size:12px;color:#666666;">${esc(s.phone)}</td>
        </tr>
        <tr>
          <td colspan="2" style="font-size:13px;color:#555555;line-height:1.65;">${esc(s.address)}, ${esc(s.city)}, ${esc(s.state)} &ndash; ${esc(s.pincode)}</td>
        </tr>
      </table>
    </div>

    <!-- CTA -->
    <div style="padding:22px 28px 28px;text-align:center;">
      <a href="${dashboardUrl}" style="display:inline-block;background:#1A1A1A;color:#FFFFFF;font-size:12px;font-weight:500;letter-spacing:1px;text-transform:uppercase;text-decoration:none;padding:12px 28px;border-radius:2px;">View in Dashboard</a>
      <p style="margin:12px 0 0;font-size:11px;color:#AAAAAA;">Reply to this email to contact the customer directly at their registered address.</p>
    </div>
  `;

  return adminShell(body);
}

// ─── Invoice HTML (browser preview / print) ─────────────────
// Used by /api/orders/[id]/invoice to render a printable invoice page.

export function buildInvoiceHtml(order: any): string {
  const id = order.id || "N/A";
  const invoiceId = id.slice(-8).toUpperCase();
  const totalAmount = Number(order.total_amount ?? 0);
  const sd = order.shipping_details || {};
  const items: any[] = order.order_items || [];
  const orderDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const paymentMethod = order.payment_method || "Online";

  const itemRows = items
    .map((item: any) => {
      const name = item.name || item.product_title || item.products?.name || "Iconic Tote";
      const price = Number(item.price || 0);
      const qty = Number(item.quantity || 1);
      const lineTotal = price * qty;
      const customization = item.customization_details || item.customizationDetails;
      const isCustom = !!(item.is_customized || customization);
      const image = customization?.preview || item.image || item.image_url || item.product_image || item.products?.images?.[0] || 'https://images.unsplash.com/photo-1591337676887-a217a6970c8a?w=100';

      return `
        <tr>
          <td style="padding:16px 12px;border-bottom:1px solid #eee;font-size:13px;color:#333;vertical-align:middle;">
            <div style="display:flex;align-items:center;gap:15px;">
              <img src="${image}" width="64" height="64" style="border-radius:8px;object-fit:contain;border:1px solid #eee;background:#f9f9f9;padding:4px;" />
              <div style="flex:1;">
                <p style="margin:0;font-weight:700;color:#1A1A1A;font-size:14px;">${esc(name)}</p>
                ${isCustom ? '<span style="font-size:9px;font-weight:800;background:#FDF0F4;color:#900C3F;padding:2px 6px;border-radius:3px;text-transform:uppercase;margin-top:4px;display:inline-block;letter-spacing:0.5px;">Custom Design</span>' : ""}
              </div>
            </div>
          </td>
          <td style="padding:12px;border-bottom:1px solid #eee;font-size:14px;color:#555;text-align:center;vertical-align:middle;">${qty}</td>
          <td style="padding:12px;border-bottom:1px solid #eee;font-size:14px;color:#555;text-align:right;white-space:nowrap;vertical-align:middle;">&#8377;${price.toLocaleString("en-IN")}</td>
          <td style="padding:12px;border-bottom:1px solid #eee;font-size:14px;font-weight:700;color:#1A1A1A;text-align:right;white-space:nowrap;vertical-align:middle;">&#8377;${lineTotal.toLocaleString("en-IN")}</td>
        </tr>`;
    })
    .join("");

  const itemsTotal = items.reduce((acc: number, item: any) => acc + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
  const subtotal = itemsTotal === totalAmount ? (itemsTotal - 50) : itemsTotal;
  const shipping = totalAmount - subtotal;

  return `
    <div style="max-width:800px;margin:0 auto;background:#fff;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.08);overflow:hidden;font-family:'DM Sans','Segoe UI',sans-serif;">
      <!-- Brand Header -->
      <div style="background:#900C3F;padding:28px 32px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <p style="margin:0;font-family:'DM Serif Display',Georgia,serif;font-size:22px;color:#fff;letter-spacing:0.5px;">Tote-ally Iconic</p>
          <p style="margin:4px 0 0;font-size:11px;color:rgba(255,255,255,0.7);letter-spacing:1px;text-transform:uppercase;">Tax Invoice</p>
        </div>
        <div style="text-align:right;">
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.8);">Invoice #${esc(invoiceId)}</p>
          <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.65);">${esc(orderDate)}</p>
        </div>
      </div>

      <!-- Info Row -->
      <div style="padding:24px 32px;display:flex;gap:32px;background:#FAFAFA;border-bottom:1px solid #eee;">
        <div style="flex:1;">
          <p style="margin:0 0 6px;font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#999;">Billed To</p>
          <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#1A1A1A;">${esc(sd.name || "Customer")}</p>
          <p style="margin:0;font-size:12px;color:#666;line-height:1.6;">
            ${esc(sd.address || "")}<br/>
            ${esc(sd.city || "")}, ${esc(sd.state || "")} &ndash; ${esc(sd.pincode || "")}<br/>
            ${sd.phone ? `Phone: ${esc(sd.phone)}` : ""}
          </p>
        </div>
        <div style="flex:1;">
          <p style="margin:0 0 6px;font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#999;">From</p>
          <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#1A1A1A;">Tote-ally Iconic</p>
          <p style="margin:0;font-size:12px;color:#666;line-height:1.6;">
            toteallyiconic@gmail.com<br/>
            totallyiconic.in
          </p>
        </div>
        <div>
          <p style="margin:0 0 6px;font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#999;">Payment</p>
          <p style="margin:0;font-size:13px;font-weight:500;color:#1A1A1A;">${esc(paymentMethod)}</p>
        </div>
      </div>

      <!-- Items Table -->
      <div style="padding:24px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <thead>
            <tr style="background:#F5F5F5;">
              <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#888;letter-spacing:1px;text-transform:uppercase;border-bottom:2px solid #ddd;">Item</th>
              <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:600;color:#888;letter-spacing:1px;text-transform:uppercase;border-bottom:2px solid #ddd;">Qty</th>
              <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:600;color:#888;letter-spacing:1px;text-transform:uppercase;border-bottom:2px solid #ddd;">Price</th>
              <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:600;color:#888;letter-spacing:1px;text-transform:uppercase;border-bottom:2px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>
      </div>

      <!-- Totals -->
      <div style="padding:0 32px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;max-width:320px;margin-left:auto;">
          <tr>
            <td style="padding:8px 12px;font-size:13px;color:#666;">Subtotal</td>
            <td style="padding:8px 12px;font-size:13px;color:#333;text-align:right;white-space:nowrap;">&#8377;${subtotal.toLocaleString("en-IN")}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;font-size:13px;color:#666;">Shipping</td>
            <td style="padding:8px 12px;font-size:13px;color:#333;text-align:right;">&#8377;${shipping.toLocaleString("en-IN")}</td>
          </tr>
          <tr style="border-top:2px solid #900C3F;">
            <td style="padding:12px;font-size:15px;font-weight:700;color:#1A1A1A;">Grand Total</td>
            <td style="padding:12px;font-size:18px;font-weight:700;color:#900C3F;text-align:right;white-space:nowrap;font-family:'DM Serif Display',Georgia,serif;">&#8377;${totalAmount.toLocaleString("en-IN")}</td>
          </tr>
        </table>
      </div>

      <!-- Footer -->
      <div style="background:#FAFAFA;padding:20px 32px;border-top:1px solid #eee;text-align:center;">
        <p style="margin:0;font-size:11px;color:#999;">Thank you for shopping with Tote-ally Iconic &middot; totallyiconic.in</p>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Normalization helpers
// ---------------------------------------------------------------------------
function normalizeOrder(order: any): Order {
  const id = order.id || order._id || "N/A";
  const total_amount = Number(order.total_amount ?? order.totalAmount ?? 0);
  const sd = order.shipping_details || order.shippingDetails || {};
  
  const shipping_details: ShippingDetails = {
    name: sd.name || sd.full_name || "Customer",
    address: sd.address || "",
    city: sd.city || "",
    state: sd.state || "",
    pincode: sd.pincode || "",
    phone: sd.phone || ""
  };

  const order_items: OrderItem[] = (order.order_items || order.products || order.items || []).map((item: any) => ({
    name: item.name || item.title || item.product_title || "Iconic Tote",
    price: Number(item.price || 0),
    quantity: Number(item.quantity || 1),
    is_customized: !!(item.is_customized || item.isCustomized),
    image: item.image || item.image_url || item.product_image || item.customizationDetails?.preview || item.customization_details?.preview || 'https://images.unsplash.com/photo-1591337676887-a217a6970c8a?w=100'
  }));
  
  return { 
    id, 
    total_amount, 
    shipping_details, 
    order_items,
    payment_method: order.payment_method || sd.payment_method || (order.payment_id === "MANUAL_UPI" ? "Manual UPI" : "Online"),
    payment_screenshot_url: order.payment_screenshot_url || sd.payment_screenshot_url
  };
}

// ---------------------------------------------------------------------------
// Public Send Functions (SMTP Implementation)
// ---------------------------------------------------------------------------

export async function sendContactEmails(data: { name: string, email: string, subject: string, message: string }) {
  const transporter = getTransporter();
  const config = await getEmailConfig();
  const adminEmails = (process.env.CONTACT_TO_EMAIL || config.supportEmail).split(",");

  // 1. Send to Admin
  await transporter.sendMail({
    from: `"${config.storeName} Support" <${EMAIL_USER}>`,
    to: adminEmails,
    replyTo: data.email,
    subject: `📬 Contact: ${data.subject}`,
    text: `From: ${data.name} (${data.email})\nSubject: ${data.subject}\n\nMessage:\n${data.message}`,
  });

  // 2. Send Auto-Reply to User
  await transporter.sendMail({
    from: `"${config.storeName}" <${EMAIL_USER}>`,
    to: data.email,
    subject: `We received your message! 💌`,
    html: buildContactAutoReplyEmailHtml(data),
  });
}

export async function sendNewsletterNotificationEmail(email: string) {
  const transporter = getTransporter();
  const config = await getEmailConfig();
  const adminEmails = (process.env.NEWSLETTER_NOTIFY_EMAIL || config.supportEmail).split(",");

  return transporter.sendMail({
    from: `"${config.storeName}" <${EMAIL_USER}>`,
    to: adminEmails,
    subject: "✨ New Newsletter Signup",
    html: buildNewsletterNotificationEmailHtml(email),
  });
}

/**
 * Generates a professional PDF Buffer for the order invoice
 */
export async function generateInvoicePdf(order: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: any[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // Header
      const roseColor = "#900C3F";
      doc.fillColor(roseColor).fontSize(24).text("Tote-ally Iconic", { align: "right" });
      doc.fillColor("#444444").fontSize(10).text("TAX INVOICE", { align: "right" });
      doc.moveDown();

      const normalized = normalizeOrder(order);
      const invoiceId = normalized.id?.slice(-8).toUpperCase() || "NEW";
      doc.fillColor("#000000").fontSize(12).text(`Order ID: #${invoiceId}`);
      doc.fontSize(10).text(`Date: ${new Date().toLocaleDateString()}`);
      doc.moveDown();

      doc.fontSize(12).text("Shipping To:", { underline: true });
      const s = normalized.shipping_details;
      doc.fontSize(10).text(s.name);
      doc.text(s.address);
      doc.text(`${s.city}, ${s.state} - ${s.pincode}`);
      doc.text(`Phone: ${s.phone}`);
      doc.moveDown();

      const tableTop = 260;
      doc.font("Helvetica-Bold").text("Item Description", 50, tableTop);
      doc.text("Qty", 350, tableTop);
      doc.text("Price", 400, tableTop);
      doc.text("Total", 480, tableTop);
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      let y = tableTop + 30;
      normalized.order_items.forEach((item: OrderItem) => {
        doc.font("Helvetica").fontSize(10).text(item.name, 50, y, { width: 280 });
        doc.text(item.quantity.toString(), 350, y);
        doc.text(`INR ${item.price}`, 400, y);
        doc.text(`INR ${(item.price * item.quantity).toFixed(2)}`, 480, y);
        y += 25;
      });

      doc.moveTo(50, y + 5).lineTo(550, y + 5).stroke();
      y += 15;

      const itemsTotal = normalized.order_items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const subtotal = itemsTotal === normalized.total_amount ? (itemsTotal - 50) : itemsTotal;
      const shipping = normalized.total_amount - subtotal;

      doc.font("Helvetica").fontSize(10).text("Subtotal:", 380, y);
      doc.text(`INR ${subtotal.toFixed(2)}`, 480, y);
      y += 20;
      doc.text("Shipping:", 380, y);
      doc.text(`INR ${shipping.toFixed(2)}`, 480, y);
      y += 25;

      doc.font("Helvetica-Bold").fontSize(12).text("Grand Total:", 380, y);
      doc.text(`INR ${normalized.total_amount}`, 480, y);

      doc.fontSize(8).fillColor("#999999").text("Thank you for shopping with Tote-ally Iconic!", 50, 780, { align: "center" });
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export async function sendOrderConfirmationEmail(to: string, orderDetails: any) {
  const transporter = getTransporter();
  const config = await getEmailConfig();
  try {
    const pdfBuffer = await generateInvoicePdf(orderDetails);
    const normalized = normalizeOrder(orderDetails);
    const invoiceId = normalized.id?.slice(-6).toUpperCase() || "NEW";

    const attachments: any[] = [
      {
        filename: `Invoice_${invoiceId}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf"
      }
    ];

    // Attach Payment Proof if exists
    if (normalized.payment_screenshot_url) {
      attachments.push({
        filename: 'Payment_Proof.jpg',
        path: normalized.payment_screenshot_url
      });
    }

    // Attach Custom Design Photos
    normalized.order_items.forEach((item, index) => {
      if (item.is_customized && item.image) {
        attachments.push({
          filename: `Design_Photo_${index + 1}.jpg`,
          path: item.image
        });
      }
    });

    return transporter.sendMail({
      from: `"${config.storeName}" <${EMAIL_USER}>`,
      to,
      subject: `✦ Order Confirmed — #${invoiceId}`,
      html: buildCustomerConfirmationEmailHtml(normalized),
      attachments
    });
  } catch (err) {
    console.error("Failed to send SMTP order email:", err);
    const normalized = normalizeOrder(orderDetails);
    return transporter.sendMail({
      from: `"${config.storeName}" <${EMAIL_USER}>`,
      to,
      subject: `✦ Order Confirmed — #${normalized.id?.slice(-6).toUpperCase() || "NEW"}`,
      html: buildCustomerConfirmationEmailHtml(normalized),
    });
  }
}

export async function sendPaymentConfirmedEmail(to: string, orderDetails: any) {
  const transporter = getTransporter();
  const config = await getEmailConfig();
  try {
    const pdfBuffer = await generateInvoicePdf(orderDetails);
    const normalized = normalizeOrder(orderDetails);
    const invoiceId = normalized.id?.slice(-6).toUpperCase() || "NEW";

    const attachments: any[] = [
      {
        filename: `Invoice_${invoiceId}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf"
      }
    ];

    // Attach Payment Proof if exists
    if (normalized.payment_screenshot_url) {
      attachments.push({
        filename: 'Payment_Proof.jpg',
        path: normalized.payment_screenshot_url
      });
    }

    // Attach Custom Design Photos
    normalized.order_items.forEach((item, index) => {
      if (item.is_customized && item.image) {
        attachments.push({
          filename: `Design_Photo_${index + 1}.jpg`,
          path: item.image
        });
      }
    });

    return transporter.sendMail({
      from: `"${config.storeName}" <${EMAIL_USER}>`,
      to,
      subject: `✅ Payment Confirmed — Order #${invoiceId}`,
      html: buildPaymentConfirmedEmailHtml(normalized),
      attachments
    });
  } catch (err) {
    console.error("Failed to send SMTP Payment Confirmed email:", err);
    const normalized = normalizeOrder(orderDetails);
    return transporter.sendMail({
      from: `"${config.storeName}" <${EMAIL_USER}>`,
      to,
      subject: `✅ Payment Confirmed — Order #${normalized.id?.slice(-6).toUpperCase() || "NEW"}`,
      html: buildPaymentConfirmedEmailHtml(normalized),
    });
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  const transporter = getTransporter();
  const config = await getEmailConfig();
  return transporter.sendMail({
    from: `"${config.storeName}" <${EMAIL_USER}>`,
    to,
    subject: `You are Officially In. ✨`,
    html: buildWelcomeEmailHtml(name),
  });
}

/**
 * Sends a notification to the admin about a new order.
 */
export async function sendAdminOrderNotification(order: any) {
  const transporter = getTransporter();
  const config = await getEmailConfig();
  const adminEmails = (process.env.CONTACT_TO_EMAIL || config.supportEmail).split(",");
  const normalized = normalizeOrder(order);
  const isManual = normalized.payment_method === "Manual UPI";

  return transporter.sendMail({
    from: `"${config.storeName} System" <${EMAIL_USER}>`,
    to: adminEmails,
    subject: `${isManual ? '⚠️ Action Required: ' : ''}New Order #${normalized.id.slice(-6)} - ₹${normalized.total_amount}`,
    html: buildAdminOrderNotificationEmailHtml(normalized),
  });
}

/**
 * Sends a shipment update email to the customer.
 */
export async function sendShipmentUpdateEmail(to: string, orderDetails: any, trackingNumber: string, courier: string, trackingUrl: string) {
  const transporter = getTransporter();
  const config = await getEmailConfig();
  const normalized = normalizeOrder(orderDetails);
  return transporter.sendMail({
    from: `"${config.storeName}" <${EMAIL_USER}>`,
    to,
    subject: `🚚 Your order #${normalized.id.slice(-6)} has shipped!`,
    html: buildShipmentCompletedEmailHtml(normalized, trackingNumber, courier, trackingUrl),
  });
}

/**
 * Sends an out for delivery email to the customer.
 */
export async function sendOutForDeliveryEmail(to: string, orderDetails: any, trackingUrl: string, estimatedTime?: string) {
  const transporter = getTransporter();
  const config = await getEmailConfig();
  const normalized = normalizeOrder(orderDetails);
  return transporter.sendMail({
    from: `"${config.storeName}" <${EMAIL_USER}>`,
    to,
    subject: `📍 Out for Delivery: Order #${normalized.id.slice(-6)}`,
    html: buildOutForDeliveryEmailHtml(normalized, trackingUrl, estimatedTime),
  });
}

/**
 * Sends a delivered email to the customer.
 */
export async function sendDeliveredEmail(to: string, orderDetails: any, reviewUrl: string = "https://totallyiconic.in/shop") {
  const transporter = getTransporter();
  const config = await getEmailConfig();
  const normalized = normalizeOrder(orderDetails);
  return transporter.sendMail({
    from: `"${config.storeName}" <${EMAIL_USER}>`,
    to,
    subject: `✨ Delivered: Order #${normalized.id.slice(-6)}`,
    html: buildDeliveredEmailHtml(normalized, reviewUrl),
  });
}

/**
 * Sends an order cancellation email to the customer.
 */
export async function sendOrderCancelledEmail(to: string, orderDetails: any, reason?: string) {
  const transporter = getTransporter();
  const config = await getEmailConfig();
  const normalized = normalizeOrder(orderDetails);
  return transporter.sendMail({
    from: `"${config.storeName}" <${EMAIL_USER}>`,
    to,
    subject: `🚫 Order Cancelled: #${normalized.id.slice(-6)}`,
    html: buildOrderCancelledEmailHtml(normalized, reason),
  });
}

/**
 * Sends a payment failed email to the customer.
 */
export async function sendPaymentFailedEmail(to: string, orderDetails: any, retryUrl: string, failureReason?: string) {
  const transporter = getTransporter();
  const config = await getEmailConfig();
  const normalized = normalizeOrder(orderDetails);
  return transporter.sendMail({
    from: `"${config.storeName}" <${EMAIL_USER}>`,
    to,
    subject: `⚠️ Payment Failed: Order #${normalized.id.slice(-6)}`,
    html: buildPaymentFailedEmailHtml(normalized, retryUrl, failureReason),
  });
}
