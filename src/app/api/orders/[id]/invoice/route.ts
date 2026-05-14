import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { buildInvoiceHtml } from "@/lib/email";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Initialize Supabase (Service Role to bypass RLS for admin/invoice access)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    // Fetch Order with Items
    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*)
      `)
      .eq("id", id)
      .single();

    if (error || !order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    // Generate Invoice HTML
    const html = buildInvoiceHtml(order);

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Invoice API Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
