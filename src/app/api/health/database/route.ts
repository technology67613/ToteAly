import { NextResponse } from "next/server";
import { isSupabaseAdminConfigured, isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const REQUIRED_TABLES = [
  "profiles",
  "products",
  "orders",
  "order_items",
  "settings",
  "coupons",
  "newsletter_subscribers",
  "contact_messages",
  "admin_logs",
  "reviews",
];

export async function GET() {
  if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Supabase is not fully configured.",
        requiredEnv: [
          "NEXT_PUBLIC_SUPABASE_URL",
          "NEXT_PUBLIC_SUPABASE_ANON_KEY",
          "SUPABASE_SERVICE_ROLE_KEY",
        ],
      },
      { status: 503 }
    );
  }

  const tableChecks = await Promise.all(
    REQUIRED_TABLES.map(async (table) => {
      const { count, error } = await supabaseAdmin
        .from(table)
        .select("*", { count: "exact", head: true });

      return {
        table,
        ok: !error,
        count: count ?? 0,
        error: error?.message,
      };
    })
  );

  const { data: bucketData, error: bucketError } = await supabaseAdmin.storage.getBucket("totealy-assets");
  const failed = tableChecks.filter((check) => !check.ok);

  return NextResponse.json(
    {
      ok: failed.length === 0 && !bucketError,
      tables: tableChecks,
      storage: {
        bucket: "totealy-assets",
        ok: !bucketError && Boolean(bucketData),
        error: bucketError?.message,
      },
    },
    { status: failed.length === 0 && !bucketError ? 200 : 500 }
  );
}
