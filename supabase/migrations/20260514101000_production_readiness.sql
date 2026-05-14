-- 1. EXTEND PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  price INTEGER NOT NULL, -- in INR
  category TEXT,
  images TEXT[] DEFAULT '{}',
  is_customizable BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. NEWSLETTER SUBSCRIBERS
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CONTACT MESSAGES
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  quantity INTEGER,
  bag_type TEXT,
  logo_url TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. POLICIES
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Public can view active products
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public can view products" ON public.products;
    CREATE POLICY "Public can view products" ON public.products
      FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public can subscribe to newsletter" ON public.newsletter_subscribers;
    CREATE POLICY "Public can subscribe to newsletter" ON public.newsletter_subscribers
      FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "Public can send contact messages" ON public.contact_messages;
    CREATE POLICY "Public can send contact messages" ON public.contact_messages
      FOR INSERT WITH CHECK (true);
END $$;

-- 5. SEED PRODUCTS
INSERT INTO public.products (id, title, price, description, category, images, is_customizable, is_featured, stock)
VALUES
  ('plain-canvas-tote', 'Everyday Canvas Tote', 599, 'A clean cotton canvas tote for daily errands.', 'Plain Totes', ARRAY['/products/plain.png'], true, true, 50),
  ('premium-structured-tote', 'Premium Structured Tote', 1199, 'A sturdier statement tote with a premium finish.', 'Premium', ARRAY['/products/premium.png'], true, true, 30),
  ('midnight-black-tote', 'Midnight Black Tote', 899, 'A bold black tote made for high-contrast prints.', 'Premium', ARRAY['/products/black.png'], true, true, 20),
  ('gift-ready-hamper', 'Gift Ready Hamper', 1599, 'A curated tote gift set for bridesmaids.', 'Hampers', ARRAY['/products/hamper.png'], false, true, 10)
ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  is_featured = EXCLUDED.is_featured;
