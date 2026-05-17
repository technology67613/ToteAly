import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { phrase, usid, password } = await req.json();

    // 1. Validate inputs
    if (phrase !== "I want to delete my database") {
      return NextResponse.json({ error: 'Confirmation phrase is incorrect.' }, { status: 400 });
    }

    const envUser = process.env.ADMIN_USERNAME || "Nova_Cool";
    const envPass = process.env.ADMIN_PASSWORD || "Git@Hub2006";

    if (usid !== envUser || password !== envPass) {
      return NextResponse.json({ error: 'Invalid administrator credentials.' }, { status: 401 });
    }

    console.log("⚠️ STARTING FULL STOREFRONT DATABASE PURGE...");

    // 2. Perform table wipe operations inside try-catch to be extremely resilient
    const tablesToPurge = [
      { name: 'order_items', column: 'quantity', isNumeric: true },
      { name: 'orders', column: 'total_amount', isNumeric: true },
      { name: 'reviews', column: 'rating', isNumeric: true },
      { name: 'custom_designs', column: 'price', isNumeric: true },
      { name: 'contact_messages', column: 'created_at', isDate: true },
      { name: 'newsletter_subscribers', column: 'created_at', isDate: true },
      { name: 'products', column: 'price', isNumeric: true },
      { name: 'profiles', column: 'created_at', isDate: true },
      { name: 'coupons', column: 'created_at', isDate: true },
      { name: 'notifications', column: 'created_at', isDate: true },
      { name: 'admin_action_log', column: 'created_at', isDate: true }
    ];

    for (const table of tablesToPurge) {
      try {
        let query = supabase.from(table.name).delete();
        if (table.isNumeric) {
          query = query.neq(table.column, -99999);
        } else {
          query = query.not(table.column, 'is', null);
        }
        const { error } = await query;
        if (error) {
          console.warn(`[WIPE WARNING] Failed to wipe table ${table.name}:`, error.message);
        } else {
          console.log(`[WIPE SUCCESS] Wiped table ${table.name}`);
        }
      } catch (e: any) {
        console.error(`[WIPE ERROR] Exception wiping ${table.name}:`, e.message || e);
      }
    }

    // 3. Re-seed default settings so layout configuration remains fully intact and fresh
    const defaultSettings = [
      { key: 'site_name', value: 'Tote-ally Iconic', description: 'Store brand name' },
      { key: 'contact_email', value: 'support@totealy.com', description: 'Public support email address' },
      { key: 'whatsapp_number', value: '+91 98765 43210', description: 'Store contact WhatsApp number' },
      { key: 'instagram_handle', value: 'totealy.iconic', description: 'Official Instagram page handle' },
      { key: 'currency_symbol', value: '₹', description: 'Store base currency symbol' },
      { key: 'announcement_bar', value: 'Free Shipping on orders above ₹999!', description: 'Storefront header announcement banner text' },
      { key: 'shop_address', value: '123 Iconic Lane, Style District Mumbai, Maharashtra 400001 India', description: 'Headquarters or physical shop address' },
      { key: 'free_shipping_threshold', value: 999, description: 'Minimum cart value in currency unit for free shipping' },
      { key: 'base_shipping_cost', value: 50, description: 'Flat rate shipping fee for orders below threshold value' },
      { key: 'maintenance_mode', value: false, description: 'Toggle to put the storefront offline during updates' },
      { key: 'logo_url', value: '', description: 'Master logo image asset URL' }
    ];

    const { error: seedError } = await supabase
      .from('site_config')
      .upsert(siteConfigSettingsFormat(defaultSettings), { onConflict: 'key' });

    if (seedError) {
      console.error("[SEED ERROR] Failed to seed site_config:", seedError.message);
    } else {
      console.log("[SEED SUCCESS] Re-seeded site_config with fresh factory values.");
    }

    // 4. Log the reset action
    try {
      await supabase.from('admin_action_log').insert({
        action: 'system.factory_reset',
        entity_type: 'system',
        new_value: { msg: "Full database factory reset completed." },
        performed_by: 'system'
      });
    } catch {
      // log table may have been cleared
    }

    return NextResponse.json({ success: true, message: "Database successfully wiped and reverted to factory settings!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper to format settings properly matching layout expectance
function siteConfigSettingsFormat(settings: any[]) {
  return settings.map(item => ({
    key: item.key,
    value: typeof item.value === 'string' ? `"${item.value}"` : item.value,
    description: item.description,
    updated_at: new Date().toISOString(),
    updated_by: 'system'
  }));
}
