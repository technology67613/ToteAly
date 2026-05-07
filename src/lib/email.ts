import * as nodemailer from "nodemailer";

type ShippingDetails = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  payment_method?: string;
  payment_screenshot_url?: string;
};

type InvoiceItem = {
  name?: string;
  title?: string;
  price?: number;
  quantity?: number;
  is_customized?: boolean;
  isCustomized?: boolean;
  customization_details?: Record<string, unknown>;
  customizationDetails?: Record<string, unknown>;
};

export type OrderEmailDetails = {
  id?: string;
  _id?: string;
  created_at?: string;
  total_amount?: number;
  totalAmount?: number;
  payment_id?: string;
  paymentId?: string;
  payment_status?: string;
  status?: string;
  shipping_details?: ShippingDetails;
  shippingDetails?: ShippingDetails;
  order_items?: InvoiceItem[];
  products?: InvoiceItem[];
};

export type ContactEmailData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const BRAND = {
  cream: "#FFF8F0",
  beige: "#F5ECD7",
  rose: "#900C3F",
  pink: "#FF69B4",
  ink: "#2F1020",
  muted: "#8E6374",
};

export function hasSmtpConfig() {
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
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_PORT === "465",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Optimization for concurrent sending
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });
  }
  
  return transporterInstance;
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatCurrency(value: number) {
  return `Rs. ${Number(value || 0).toLocaleString("en-IN")}.00`;
}

function formatDate(value?: string) {
  return new Date(value || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStoreName() {
  return process.env.NEXT_PUBLIC_STORE_NAME || "Tote-ally Iconic";
}

function getOrderId(order: OrderEmailDetails) {
  return order.id || order._id || `order-${Date.now()}`;
}

function getInvoiceNo(order: OrderEmailDetails) {
  return `ORD-${getOrderId(order).slice(-6).toUpperCase()}`;
}

function getItems(order: OrderEmailDetails) {
  return order.order_items || order.products || [];
}

function getShipping(order: OrderEmailDetails) {
  return order.shipping_details || order.shippingDetails || {};
}

function getTotal(order: OrderEmailDetails) {
  return Number(order.total_amount ?? order.totalAmount ?? 0);
}

function getPaymentId(order: OrderEmailDetails) {
  return order.payment_id || order.paymentId || "N/A";
}

function getPaymentMethod(order: OrderEmailDetails) {
  return getPaymentId(order) === "MANUAL_UPI" ? "Manual UPI" : "Online Payment";
}

function getPaymentStatus(order: OrderEmailDetails) {
  return order.payment_status || "Paid";
}

function getOrderStatus(order: OrderEmailDetails) {
  return order.status || "Confirmed";
}

function getSubtotal(items: InvoiceItem[]) {
  return items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
}

function getTotalItems(items: InvoiceItem[]) {
  return items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}

function getCustomizationPreview(item: InvoiceItem) {
  const details = item.customization_details || item.customizationDetails || {};
  const preview = details.preview_image || details.preview || details.canvasData;
  return typeof preview === "string" && preview.startsWith("data:image/")
    ? preview
    : typeof preview === "string" && preview.startsWith("http")
      ? preview
      : "";
}

function buildAddress(details: ShippingDetails) {
  return [
    details.address,
    [details.city, details.pincode].filter(Boolean).join(" - "),
    details.state,
    details.country,
  ]
    .filter(Boolean)
    .map((part) => escapeHtml(part))
    .join("<br />");
}

function buildPill(label: string, value: string) {
  return `
    <td style="padding: 6px;">
      <div style="border: 1px solid ${BRAND.beige}; border-radius: 999px; padding: 9px 12px; background: #FFFFFF;">
        <span style="display: block; font-size: 10px; letter-spacing: 1.6px; color: ${BRAND.muted}; text-transform: uppercase;">${escapeHtml(label)}</span>
        <strong style="display: block; color: ${BRAND.rose}; font-size: 13px; margin-top: 3px;">${escapeHtml(value)}</strong>
      </div>
    </td>
  `;
}

function buildEmailShell({
  eyebrow,
  title,
  intro,
  children,
  ctaHref,
  ctaLabel,
  footerNote,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: string;
  ctaHref?: string;
  ctaLabel?: string;
  footerNote?: string;
}) {
  const cta = ctaHref && ctaLabel
    ? `
      <tr>
        <td align="center" style="padding: 8px 28px 30px;">
          <a href="${escapeHtml(ctaHref)}" style="display: inline-block; background: ${BRAND.rose}; color: #FFFFFF; text-decoration: none; padding: 13px 24px; border-radius: 8px; font-family: Arial, Helvetica, sans-serif; font-size: 12px; font-weight: 800; letter-spacing: 1.8px; text-transform: uppercase;">${escapeHtml(ctaLabel)}</a>
        </td>
      </tr>
    `
    : "";

  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin: 0; padding: 0; background: ${BRAND.cream}; color: ${BRAND.rose};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: ${BRAND.cream}; border-collapse: collapse;">
      <tr>
        <td align="center" style="padding: 28px 14px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 680px; border-collapse: collapse; background: #FFFFFF; border: 1px solid ${BRAND.beige}; border-radius: 14px; overflow: hidden;">
            <tr>
              <td align="center" style="background: ${BRAND.rose}; padding: 26px 24px;">
                <div style="font-family: Georgia, 'Times New Roman', serif; color: #FFFFFF; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">${escapeHtml(getStoreName())}</div>
                <div style="font-family: Arial, Helvetica, sans-serif; color: #FFD5E8; font-size: 10px; letter-spacing: 2.4px; text-transform: uppercase; margin-top: 7px;">${escapeHtml(eyebrow)}</div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 30px 28px 12px;">
                <h1 style="font-family: Georgia, 'Times New Roman', serif; color: ${BRAND.rose}; font-size: 34px; line-height: 1.1; margin: 0;">${escapeHtml(title)}</h1>
                <p style="font-family: Arial, Helvetica, sans-serif; color: ${BRAND.muted}; font-size: 15px; line-height: 1.65; margin: 14px 0 0;">${escapeHtml(intro)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 28px 22px;">
                ${children}
              </td>
            </tr>
            ${cta}
            <tr>
              <td align="center" style="background: ${BRAND.beige}; padding: 18px 24px;">
                <p style="font-family: Arial, Helvetica, sans-serif; color: ${BRAND.muted}; font-size: 12px; line-height: 1.5; margin: 0;">${escapeHtml(footerNote || "Need help? Reply to this email and the Tote-ally Iconic team will help you out.")}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildOrderItemsRows(items: InvoiceItem[]) {
  return items
    .map((item) => {
      const name = item.name || item.title || "Tote Bag";
      const quantity = Number(item.quantity || 0);
      const price = Number(item.price || 0);
      const customized = item.is_customized || item.isCustomized;
      const preview = getCustomizationPreview(item);

      return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid ${BRAND.beige}; font-family: Arial, Helvetica, sans-serif; color: ${BRAND.ink};">
            <strong>${escapeHtml(name)}</strong>
            ${customized ? `<div style="font-size: 11px; color: ${BRAND.pink}; font-weight: 800; margin-top: 3px;">Custom design applied</div>` : ""}
            ${preview ? `<img src="${preview}" alt="Custom design preview" style="display: block; width: 140px; max-width: 100%; border: 1px solid ${BRAND.beige}; border-radius: 10px; margin-top: 10px;" />` : ""}
          </td>
          <td align="center" style="padding: 12px 8px; border-bottom: 1px solid ${BRAND.beige}; font-family: Arial, Helvetica, sans-serif; color: ${BRAND.muted};">${quantity}</td>
          <td align="right" style="padding: 12px 0; border-bottom: 1px solid ${BRAND.beige}; font-family: Arial, Helvetica, sans-serif; color: ${BRAND.rose}; font-weight: 800;">${formatCurrency(price * quantity)}</td>
        </tr>
      `;
    })
    .join("");
}

function buildInvoiceItemsRows(items: InvoiceItem[]) {
  return items
    .map((item, index) => {
      const quantity = Number(item.quantity || 0);
      const price = Number(item.price || 0);
      const name = item.name || item.title || "Tote Bag";
      const customized = item.is_customized || item.isCustomized;
      const preview = getCustomizationPreview(item);

      return `
        <tr>
          <td style="padding: 10px; border-right: 2px solid #111; text-align: center;">${index + 1}</td>
          <td style="padding: 10px; border-right: 2px solid #111;">
            <strong>${escapeHtml(name)}</strong>
            ${customized ? '<div style="font-size: 11px; color: #db2777; font-weight: 700;">Custom Design Applied</div>' : ""}
            ${preview ? `<img src="${preview}" alt="Custom design preview" style="display: block; width: 120px; max-width: 100%; border: 1px solid #ddd; margin-top: 8px;" />` : ""}
          </td>
          <td style="padding: 10px; border-right: 2px solid #111; text-align: center;">${quantity}</td>
          <td style="padding: 10px; border-right: 2px solid #111; text-align: right;">${formatCurrency(price)}</td>
          <td style="padding: 10px; text-align: right; font-weight: 700;">${formatCurrency(price * quantity)}</td>
        </tr>
      `;
    })
    .join("");
}

function buildEmptyInvoiceRows(count: number) {
  return Array.from({ length: count })
    .map(
      () => `
        <tr style="height: 38px;">
          <td style="border-right: 2px solid #111; border-top: 1px solid #eee;"></td>
          <td style="border-right: 2px solid #111; border-top: 1px solid #eee;"></td>
          <td style="border-right: 2px solid #111; border-top: 1px solid #eee;"></td>
          <td style="border-right: 2px solid #111; border-top: 1px solid #eee;"></td>
          <td style="border-top: 1px solid #eee;"></td>
        </tr>
      `
    )
    .join("");
}

export function buildInvoiceHtml(order: OrderEmailDetails) {
  const invoiceNo = getInvoiceNo(order);
  const shipping = getShipping(order);
  const items = getItems(order);
  const subtotal = getSubtotal(items);
  const grandTotal = getTotal(order);
  const shippingFee = Math.max(0, grandTotal - subtotal);
  const totalItems = getTotalItems(items);
  const address = buildAddress(shipping) || "Address not provided";

  return `
<!doctype html>
<html>
  <head><meta charset="utf-8" /><title>Tax Invoice #${escapeHtml(invoiceNo)}</title></head>
  <body style="margin: 0; padding: 24px; background: #ffffff; color: #111; font-family: Arial, Helvetica, sans-serif;">
    <div style="max-width: 860px; margin: 0 auto;">
      <div style="border: 2px solid #111;">
        <div style="padding: 24px; border-bottom: 2px solid #111; text-align: center;">
          <h1 style="margin: 0 0 12px; font-size: 42px; letter-spacing: -1px; text-transform: uppercase;">Tax Invoice</h1>
          <div style="font-size: 22px; font-weight: 800; text-transform: uppercase;">${escapeHtml(getStoreName())}</div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; border-bottom: 2px solid #111; background: #f8f9fa;">
          <div style="padding: 12px; border-right: 2px solid #111;"><strong>INVOICE NO. :</strong> #${escapeHtml(invoiceNo)}</div>
          <div style="padding: 12px; text-align: right;"><div><strong>Invoice Date:</strong> ${escapeHtml(formatDate(order.created_at))}</div><div><strong>Payment Method:</strong> ${escapeHtml(getPaymentMethod(order))}</div></div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; border-bottom: 2px solid #111;">
          <div style="padding: 16px; border-right: 2px solid #111;"><h3 style="margin: 0 0 10px; padding: 6px 8px; background: #f3f4f6; border-bottom: 1px solid #111; font-size: 13px;">BILL TO</h3><div style="font-size: 14px; line-height: 1.45;"><strong style="font-size: 16px;">${escapeHtml(shipping.name || "Customer")}</strong><br />${address}<br /><strong>Email:</strong> ${escapeHtml(shipping.email || "N/A")}<br /><strong>Phone:</strong> ${escapeHtml(shipping.phone || "N/A")}</div></div>
          <div style="padding: 16px;"><h3 style="margin: 0 0 10px; padding: 6px 8px; background: #f3f4f6; border-bottom: 1px solid #111; font-size: 13px;">SHIP TO</h3><div style="font-size: 14px; line-height: 1.45;"><strong style="font-size: 16px;">${escapeHtml(shipping.name || "Customer")}</strong><br />${address}</div></div>
        </div>
        <table style="width: 100%; border-collapse: collapse; border-bottom: 2px solid #111; font-size: 14px;">
          <thead><tr style="background: #1f2937; color: #fff;"><th style="padding: 10px; border-right: 2px solid #fff; width: 56px;">SN</th><th style="padding: 10px; border-right: 2px solid #fff; text-align: left;">DESCRIPTION</th><th style="padding: 10px; border-right: 2px solid #fff; width: 70px;">QTY</th><th style="padding: 10px; border-right: 2px solid #fff; text-align: right; width: 130px;">UNIT PRICE</th><th style="padding: 10px; text-align: right; width: 130px;">TOTAL</th></tr></thead>
          <tbody>${buildInvoiceItemsRows(items)}${buildEmptyInvoiceRows(Math.max(0, 8 - items.length))}</tbody>
        </table>
        <div style="display: grid; grid-template-columns: 1fr 1fr;">
          <div style="border-right: 2px solid #111;"><div style="padding: 16px; min-height: 96px; border-bottom: 1px solid #111;"><h4 style="margin: 0 0 8px; font-size: 11px; text-transform: uppercase; text-decoration: underline;">Terms & Instructions</h4><p style="margin: 0; font-size: 11px; line-height: 1.45;">1. No returns on customized totes except damaged, wrong, or defective products. 2. Payment verification is required for manual UPI orders. 3. Standard delivery is usually 3-7 business days after dispatch.</p></div><div style="padding: 16px; background: #f8f9fa; min-height: 110px;"><p style="margin: 0 0 4px; font-size: 12px; font-weight: 800; text-transform: uppercase;">Payment Status: ${escapeHtml(getPaymentStatus(order).toUpperCase())}</p><p style="margin: 0; font-size: 11px; opacity: 0.7;">ID: ${escapeHtml(getPaymentId(order))}</p><div style="margin-top: 42px; padding-top: 8px; border-top: 1px solid #111; text-align: center; font-size: 11px; font-weight: 800;">Authorized Seal & Signature</div></div></div>
          <div><div style="display: flex; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #111;"><span>SUBTOTAL</span><strong>${formatCurrency(subtotal)}</strong></div><div style="display: flex; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #111;"><span>SHIPPING</span><strong>${formatCurrency(shippingFee)}</strong></div><div style="display: flex; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #111; background: #f8f9fa; font-weight: 800;"><span>TOTAL ITEMS</span><span>${totalItems}</span></div><div style="display: flex; justify-content: space-between; align-items: center; padding: 18px 20px; margin-top: 72px; border-top: 2px solid #111; background: #fefce8;"><div><div style="font-size: 12px; font-weight: 800; color: #900C3F; text-transform: uppercase;">Grand Total</div><div style="font-size: 10px; opacity: 0.5;">Net Amount Payable</div></div><strong style="font-size: 28px;">${formatCurrency(grandTotal)}</strong></div></div>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 20px; font-size: 10px; opacity: 0.5;"><span>System Generated Tax Invoice | Tote-ally Iconic Command Center</span><span>Verified Secure Transaction</span></div>
    </div>
  </body>
</html>`;
}

export function buildOrderConfirmationEmailHtml(order: OrderEmailDetails) {
  const shipping = getShipping(order);
  const items = getItems(order);
  const paymentStatus = getPaymentStatus(order);
  const intro = paymentStatus.toLowerCase() === "pending"
    ? "Your order has been received. We will confirm it after payment verification."
    : "Your order has been placed successfully and your payment is confirmed.";

  return buildEmailShell({
    eyebrow: "Order confirmation",
    title: "Thank you for your order",
    intro,
    ctaHref: `${process.env.NEXTAUTH_URL || "https://totealy.com"}/shop`,
    ctaLabel: "Shop more icons",
    children: `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 18px;"><tr>${buildPill("Invoice", `#${getInvoiceNo(order)}`)}${buildPill("Payment", paymentStatus)}</tr><tr>${buildPill("Order Status", getOrderStatus(order))}${buildPill("Total", formatCurrency(getTotal(order)))}</tr></table>
      <div style="border: 1px solid ${BRAND.beige}; border-radius: 12px; padding: 18px; background: ${BRAND.cream}; margin-bottom: 18px;"><p style="font-family: Arial, Helvetica, sans-serif; color: ${BRAND.ink}; font-size: 15px; line-height: 1.6; margin: 0;">Hi <strong>${escapeHtml(shipping.name || "there")}</strong>, your printable tax invoice is attached to this email. We will keep you posted as your tote moves ahead.</p></div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 18px;"><thead><tr><th align="left" style="font-family: Arial, Helvetica, sans-serif; color: ${BRAND.muted}; font-size: 11px; letter-spacing: 1.4px; text-transform: uppercase; padding-bottom: 8px;">Item</th><th align="center" style="font-family: Arial, Helvetica, sans-serif; color: ${BRAND.muted}; font-size: 11px; letter-spacing: 1.4px; text-transform: uppercase; padding-bottom: 8px;">Qty</th><th align="right" style="font-family: Arial, Helvetica, sans-serif; color: ${BRAND.muted}; font-size: 11px; letter-spacing: 1.4px; text-transform: uppercase; padding-bottom: 8px;">Total</th></tr></thead><tbody>${buildOrderItemsRows(items)}</tbody></table>
      <div style="border: 1px solid ${BRAND.beige}; border-radius: 12px; padding: 18px; background: #FFFFFF;"><h2 style="font-family: Georgia, 'Times New Roman', serif; color: ${BRAND.rose}; font-size: 20px; margin: 0 0 10px;">Shipping Details</h2><p style="font-family: Arial, Helvetica, sans-serif; color: ${BRAND.ink}; font-size: 14px; line-height: 1.6; margin: 0;">${escapeHtml(shipping.name || "Customer")}<br />${buildAddress(shipping) || "Address not provided"}<br />Phone: ${escapeHtml(shipping.phone || "N/A")}</p></div>
    `,
  });
}

export function buildAdminOrderEmailHtml(customerEmail: string, order: OrderEmailDetails) {
  const shipping = getShipping(order);
  const items = getItems(order);

  return buildEmailShell({
    eyebrow: "Command center alert",
    title: "New order received",
    intro: `Order #${getInvoiceNo(order)} has been placed and is ready for review.`,
    footerNote: "Open the admin dashboard to verify payment, customizations, and fulfillment status.",
    children: `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 18px;"><tr>${buildPill("Invoice", `#${getInvoiceNo(order)}`)}${buildPill("Grand Total", formatCurrency(getTotal(order)))}</tr><tr>${buildPill("Payment", `${getPaymentMethod(order)} / ${getPaymentStatus(order)}`)}${buildPill("Status", getOrderStatus(order))}</tr></table>
      <div style="border: 1px solid ${BRAND.beige}; border-radius: 12px; padding: 18px; background: ${BRAND.cream}; margin-bottom: 18px;"><h2 style="font-family: Georgia, 'Times New Roman', serif; color: ${BRAND.rose}; font-size: 20px; margin: 0 0 10px;">Customer</h2><p style="font-family: Arial, Helvetica, sans-serif; color: ${BRAND.ink}; font-size: 14px; line-height: 1.6; margin: 0;"><strong>${escapeHtml(shipping.name || "Customer")}</strong><br />${escapeHtml(customerEmail)}<br />Phone: ${escapeHtml(shipping.phone || "N/A")}<br />${buildAddress(shipping) || "Address not provided"}</p></div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;"><tbody>${buildOrderItemsRows(items)}</tbody></table>
    `,
  });
}

export function buildContactAdminEmailHtml(data: ContactEmailData) {
  return buildEmailShell({
    eyebrow: "Contact form",
    title: "New customer message",
    intro: `${data.name} sent a message from the Tote-ally Iconic website.`,
    footerNote: "Reply directly to this email to respond to the customer.",
    children: `
      <div style="border: 1px solid ${BRAND.beige}; border-radius: 12px; padding: 18px; background: ${BRAND.cream};"><p style="font-family: Arial, Helvetica, sans-serif; color: ${BRAND.ink}; font-size: 14px; line-height: 1.7; margin: 0;"><strong>From:</strong> ${escapeHtml(data.name)} &lt;${escapeHtml(data.email)}&gt;<br /><strong>Subject:</strong> ${escapeHtml(data.subject)}<br /><strong>Received:</strong> ${escapeHtml(new Date().toLocaleString("en-IN"))}</p></div>
      <div style="border-left: 4px solid ${BRAND.pink}; padding: 14px 0 14px 16px; margin-top: 18px;"><p style="font-family: Arial, Helvetica, sans-serif; color: ${BRAND.ink}; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${escapeHtml(data.message)}</p></div>
    `,
  });
}

export function buildContactAutoReplyEmailHtml(data: ContactEmailData) {
  return buildEmailShell({
    eyebrow: "Message received",
    title: "We heard you",
    intro: "Thanks for reaching out. The Tote-ally Iconic team will get back to you within 24 hours.",
    ctaHref: `${process.env.NEXTAUTH_URL || "https://totealy.com"}/shop`,
    ctaLabel: "Browse the collection",
    children: `
      <div style="border: 1px solid ${BRAND.beige}; border-radius: 12px; padding: 18px; background: ${BRAND.cream};"><p style="font-family: Arial, Helvetica, sans-serif; color: ${BRAND.ink}; font-size: 15px; line-height: 1.65; margin: 0 0 12px;">Hi <strong>${escapeHtml(data.name)}</strong>, we received your note and saved the details below.</p><p style="font-family: Arial, Helvetica, sans-serif; color: ${BRAND.ink}; font-size: 14px; line-height: 1.7; margin: 0;"><strong>Subject:</strong> ${escapeHtml(data.subject)}<br /><strong>Message:</strong><br />${escapeHtml(data.message)}</p></div>
    `,
  });
}

export function buildNewsletterNotificationEmailHtml(email: string) {
  return buildEmailShell({
    eyebrow: "Newsletter",
    title: "New subscriber",
    intro: "Someone joined the iconic club from the footer newsletter form.",
    footerNote: "This signup is also stored in Supabase when the newsletter table is available.",
    children: `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;"><tr>${buildPill("Subscriber", email)}</tr><tr>${buildPill("Source", "Footer newsletter form")}</tr><tr>${buildPill("Time", new Date().toLocaleString("en-IN"))}</tr></table>`,
  });
}

export async function sendContactEmails(data: ContactEmailData) {
  if (!hasSmtpConfig()) {
    console.warn("Contact email skipped because SMTP is not configured.");
    return null;
  }

  const transporter = getTransporter();
  const senderEmail = process.env.EMAIL_USER;
  const recipientEmail = process.env.CONTACT_TO_EMAIL || senderEmail;

  const adminInfo = await transporter.sendMail({
    from: `"Tote-ally Iconic Contact" <${senderEmail}>`,
    to: recipientEmail,
    replyTo: data.email,
    subject: `[Contact Form] ${data.subject}`,
    html: buildContactAdminEmailHtml(data),
  });

  await transporter.sendMail({
    from: `"Tote-ally Iconic" <${senderEmail}>`,
    to: data.email,
    subject: `We received your message, ${data.name}`,
    html: buildContactAutoReplyEmailHtml(data),
  });

  return adminInfo;
}

export async function sendNewsletterNotificationEmail(email: string) {
  if (!hasSmtpConfig()) {
    console.warn("Newsletter email skipped because SMTP is not configured.");
    return null;
  }

  const to = process.env.NEWSLETTER_NOTIFY_EMAIL || process.env.CONTACT_TO_EMAIL;
  if (!to) return null;

  return getTransporter().sendMail({
    from: `"Tote-ally Iconic Newsletter" <${process.env.EMAIL_USER}>`,
    to,
    subject: "New newsletter signup",
    html: buildNewsletterNotificationEmailHtml(email),
  });
}

export async function sendOrderConfirmationEmail(to: string, orderDetails: OrderEmailDetails) {
  try {
    if (!hasSmtpConfig()) {
      console.warn("Order email skipped because SMTP is not configured.");
      return null;
    }

    const transporter = getTransporter();
    const senderEmail = process.env.EMAIL_USER;
    const adminEmail = process.env.CONTACT_TO_EMAIL || senderEmail;
    const invoiceNo = getInvoiceNo(orderDetails);
    const invoiceHtml = buildInvoiceHtml(orderDetails);
    const invoiceAttachment = {
      filename: `tax-invoice-${invoiceNo}.html`,
      content: invoiceHtml,
      contentType: "text/html",
    };
    const customDesignAttachments = getItems(orderDetails).reduce<Array<{
      filename: string;
      content: Buffer;
      contentType: string;
    }>>((attachments, item, index) => {
      const preview = getCustomizationPreview(item);
      const match = preview.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/);
      if (match) {
        const extension = match[1].replace("image/", "").replace("jpeg", "jpg");
        attachments.push({
          filename: `custom-design-${index + 1}.${extension}`,
          content: Buffer.from(match[2], "base64"),
          contentType: match[1],
        });
      }
      return attachments;
    }, []);
    const attachments = [invoiceAttachment, ...customDesignAttachments];

    const customerInfo = await transporter.sendMail({
      from: `"Tote-ally Iconic" <${senderEmail}>`,
      to,
      subject: `Thank you for your order - Invoice #${invoiceNo}`,
      html: buildOrderConfirmationEmailHtml(orderDetails),
      attachments,
    });

    if (adminEmail) {
      await transporter.sendMail({
        from: `"Tote-ally Iconic Orders" <${senderEmail}>`,
        to: adminEmail,
        subject: `New order received - #${invoiceNo}`,
        html: buildAdminOrderEmailHtml(to, orderDetails),
        attachments,
      });
    }

    return customerInfo;
  } catch (error) {
    console.error("Order email sending error:", error);
    return null;
  }
}
