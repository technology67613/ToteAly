-- PRODUCTION STABILITY & BUSINESS LOGIC ENHANCEMENTS
-- This migration addresses stock integrity, promotional logic, and spam protection.

-- 1. MARKETING & GROWTH TABLES
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INTEGER NOT NULL,
  min_order_value INTEGER DEFAULT 0,
  expiry_date TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'footer',
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CONTACT MESSAGES (if not exists)
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STOCK PROTECTION CONSTRAINTS
-- Ensure products cannot have negative stock
ALTER TABLE products ADD CONSTRAINT check_positive_stock CHECK (stock >= 0);

-- 4. AUTOMATIC STOCK DECREMENT TRIGGER
CREATE OR REPLACE FUNCTION decrement_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Only decrement for standard products that have IDs
  IF NEW.product_id IS NOT NULL THEN
    UPDATE products 
    SET stock = stock - NEW.quantity
    WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_decrement_stock ON order_items;
CREATE TRIGGER trigger_decrement_stock
AFTER INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION decrement_stock_on_order();

-- 5. RLS POLICIES
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to coupons" ON coupons FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Public can check coupons" ON coupons FOR SELECT USING (is_active = true);

CREATE POLICY "Public can subscribe" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access to subs" ON newsletter_subscribers FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public can contact" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access to messages" ON contact_messages FOR ALL USING (auth.role() = 'service_role');
