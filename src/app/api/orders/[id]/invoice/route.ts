import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { buildInvoiceHtml } from "@/lib/email";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (
            images
          )
        )
      `)
      .eq("id", id)
      .single();

    if (error || !order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    const htmlContent = buildInvoiceHtml(order);
    
    // Wrap with proper HTML structure to fix Unicode encoding issues
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice - ${order.id.slice(0, 8).toUpperCase()}</title>
        <style>
          body { margin: 0; padding: 20px; background-color: #f8f9fa; position: relative; }
          .print-btn-container {
            text-align: right;
            max-width: 800px;
            margin: 0 auto 20px auto;
          }
          .print-btn {
            background-color: #900C3F;
            color: white;
            border: none;
            padding: 10px 24px;
            font-size: 14px;
            font-weight: bold;
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 4px 6px rgba(144, 12, 63, 0.2);
            transition: background 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }
          .print-btn:hover { background-color: #6B0930; }
          @media print {
            body { padding: 0; background-color: #fff; }
            .print-btn-container { display: none !important; }
            @page { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="print-btn-container">
          <button class="print-btn" onclick="window.print()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Print Invoice
          </button>
        </div>
        ${htmlContent}
      </body>
      </html>
    `;

    return new NextResponse(fullHtml, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Invoice API Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
