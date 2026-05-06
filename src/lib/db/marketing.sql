-- MARKETING & SETTINGS TABLES

-- 1. Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')) NOT NULL,
  discount_value DECIMAL NOT NULL,
  min_order_value DECIMAL DEFAULT 0,
  max_discount DECIMAL, -- For percentage type
  expiry_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  usage_limit INTEGER DEFAULT 100,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Store Settings Table (Singleton)
CREATE TABLE IF NOT EXISTS store_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  store_name TEXT DEFAULT 'Tote-ally Iconic',
  support_email TEXT,
  gst_number TEXT,
  free_shipping_threshold DECIMAL DEFAULT 999,
  base_shipping_cost DECIMAL DEFAULT 50,
  announcement_bar TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO store_settings (id, store_name) 
VALUES (1, 'Tote-ally Iconic')
ON CONFLICT (id) DO NOTHING;
