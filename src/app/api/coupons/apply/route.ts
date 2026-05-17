import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { code, amount } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    // Fetch the coupon
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !coupon) {
      return NextResponse.json({ error: "Invalid or inactive coupon code" }, { status: 404 });
    }

    // Check expiry
    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
    }

    // Check minimum order value
    if (amount < coupon.min_order_value) {
      return NextResponse.json({ 
        error: `Minimum order value for this coupon is ₹${coupon.min_order_value}` 
      }, { status: 400 });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (amount * coupon.discount_value) / 100;
    } else {
      discount = coupon.discount_value;
    }

    // Ensure discount doesn't exceed amount
    discount = Math.min(discount, amount);

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
      },
      discount: Math.round(discount)
    });

  } catch (error: any) {
    console.error("Coupon application error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
