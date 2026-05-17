-- SETUP AND SEED SITE CONFIGURATION FOR TOTE-ALLY ICONIC
-- Copy and run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/iggvqhjvplylawiciclv/sql/new)

-- 1. Create the site_config table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.site_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT DEFAULT 'admin'
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies (Allow read/write access for admins, and read-only for public if desired)
DROP POLICY IF EXISTS "Public read access to config" ON public.site_config;
CREATE POLICY "Public read access to config" ON public.site_config
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full access to config" ON public.site_config;
CREATE POLICY "Admin full access to config" ON public.site_config
  FOR ALL USING (true); -- Accessible by server-side operations (Admin dashboard API)

-- 4. Seed the table with default configuration values (matching settings options)
INSERT INTO public.site_config (key, value, description) VALUES
  ('site_name', '"Tote-ally Iconic"', 'Store brand name'),
  ('contact_email', '"toteallyiconic@gmail.com"', 'Public support email address'),
  ('whatsapp_number', '"+91 98250 63143"', 'Store contact WhatsApp number'),
  ('instagram_handle', '"tote_ally_iconic"', 'Official Instagram page handle'),
  ('currency_symbol', '"₹"', 'Store base currency symbol'),
  ('announcement_bar', '"Free Shipping on orders above ₹999!"', 'Storefront header announcement banner text'),
  ('shop_address', '"123 Iconic Lane, Style District Mumbai, Maharashtra 400001 India"', 'Headquarters or physical shop address'),
  ('free_shipping_threshold', '999', 'Minimum cart value in currency unit for free shipping'),
  ('base_shipping_cost', '50', 'Flat rate shipping fee for orders below threshold value'),
  ('maintenance_mode', 'false', 'Toggle to put the storefront offline during updates'),
  ('logo_url', '""', 'Master logo image asset URL')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 5. Enable RLS and permissions on admin logs
CREATE TABLE IF NOT EXISTS public.admin_action_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_value JSONB,
  new_value JSONB,
  performed_by TEXT DEFAULT 'admin',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_action_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access to logs" ON public.admin_action_log;
CREATE POLICY "Admin full access to logs" ON public.admin_action_log
  FOR ALL USING (true);

-- 6. Create admin_notifications table for real-time alert system
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  reference_id TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access to notifications" ON public.admin_notifications;
CREATE POLICY "Admin full access to notifications" ON public.admin_notifications
  FOR ALL USING (true);

-- 7. Trigger PostgREST schema cache reload to ensure instant recognition of new tables
NOTIFY pgrst, 'reload schema';
