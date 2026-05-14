-- PRODUCTION ADMIN ENHANCEMENTS
-- This migration adds tables for site configuration, admin audit logs, and order tracking.

-- 1. SITE CONFIGURATION (Persistent Settings)
CREATE TABLE IF NOT EXISTS site_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT DEFAULT 'admin'
);

-- Seed default settings
INSERT INTO site_config (key, value, description) VALUES
  ('free_shipping_threshold', '99900', 'Minimum cart value in paise for free shipping'),
  ('standard_shipping_fee', '4900', 'Standard shipping fee in paise'),
  ('store_email', '"hello@totallyiconic.in"', 'Public contact email'),
  ('announcement_bar_text', '"Free Shipping on all orders above ₹999"', 'Top banner text'),
  ('announcement_bar_enabled', 'true', 'Show/hide announcement bar'),
  ('razorpay_mode', '"test"', 'test or live')
ON CONFLICT (key) DO NOTHING;

-- 2. ADMIN ACTION LOGS (Audit Trail)
CREATE TABLE IF NOT EXISTS admin_action_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,           -- 'product.create', 'order.status_update', etc.
  entity_type TEXT NOT NULL,      -- 'product', 'order', 'user', etc.
  entity_id TEXT,
  old_value JSONB,
  new_value JSONB,
  performed_by TEXT DEFAULT 'admin',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CUSTOM DESIGNS TABLE (if not already created)
CREATE TABLE IF NOT EXISTS custom_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  bag_type TEXT NOT NULL,
  canvas_data JSONB NOT NULL,
  thumbnail_url TEXT,
  price INTEGER NOT NULL,
  status TEXT DEFAULT 'pending_review' 
    CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected', 'in_production', 'completed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_action_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_designs ENABLE ROW LEVEL SECURITY;

-- 5. Policies (Admin Only)
CREATE POLICY "Admin full access to config" ON site_config FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admin full access to logs" ON admin_action_log FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admin full access to designs" ON custom_designs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Users see own designs" ON custom_designs FOR SELECT USING (auth.uid() = user_id);

-- 6. Add role column to profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';
  END IF;
END $$;
