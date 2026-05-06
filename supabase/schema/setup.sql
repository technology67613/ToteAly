-- ToteAly Iconic: Database Schema Setup (Safe Version 2.0)

-- 0. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) 
VALUES ('totealy-assets', 'totealy-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for public access (Safe recreate)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public Access" ON storage.objects;
    CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'totealy-assets');
    
    DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
    CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'totealy-assets');
END $$;

-- 1. USERS TABLE (PROFILES)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  phone TEXT,
  address JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Keep existing projects compatible with NextAuth users. NextAuth user IDs are
-- not Supabase Auth user IDs, so profiles must not require auth.users rows.
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  FOR constraint_name IN
    SELECT tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND tc.table_name = 'profiles'
      AND kcu.column_name = 'id'
      AND ccu.table_schema = 'auth'
      AND ccu.table_name = 'users'
  LOOP
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS %I', constraint_name);
  END LOOP;
END $$;

ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address JSONB DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT DEFAULT 'Plain Totes',
  images TEXT[] DEFAULT '{}',
  stock INTEGER DEFAULT 50,
  is_customizable BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORDERS TABLE
-- LINKED TO PROFILES INSTEAD OF AUTH.USERS FOR BETTER JOINS
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled')),
  payment_status TEXT DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Failed')),
  payment_id TEXT,
  shipping_details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders ON DELETE CASCADE,
  product_id UUID REFERENCES public.products ON DELETE SET NULL,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER DEFAULT 1,
  is_customized BOOLEAN DEFAULT false,
  customization_details JSONB DEFAULT '{}'
);

-- 5. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY DEFAULT 'global_settings',
  site_name TEXT DEFAULT 'ToteAly Iconic',
  maintenance_mode BOOLEAN DEFAULT false,
  logo_url TEXT,
  contact_email TEXT,
  gst_number TEXT,
  free_shipping_threshold INTEGER DEFAULT 999,
  base_shipping_cost INTEGER DEFAULT 50,
  announcement_bar TEXT DEFAULT 'Free Shipping on orders above ₹999!',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. COUPONS TABLE (MARKETING)
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INTEGER NOT NULL,
  min_order_value INTEGER DEFAULT 0,
  expiry_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. NEWSLETTER SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'footer',
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CONTACT / BULK INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  quantity INTEGER,
  bag_type TEXT,
  logo_url TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- POLICIES (Fixed Recursion)
DO $$ 
BEGIN
    -- Profiles: Users can manage own, Admins can view all (Recursion-free)
    DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
    CREATE POLICY "Users can manage own profile" ON public.profiles FOR ALL 
      USING (auth.uid() = id);

    DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
    CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT 
      USING ( EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND (raw_user_meta_data->>'role')::text = 'admin') OR id = auth.uid());
    
    -- Note: Since NextAuth doesn't set auth.users metadata, 
    -- we actually rely on the 'id = auth.uid()' check or service role for the API.
    -- For the Admin Dashboard, we use the admin_token override.

    -- Products
    DROP POLICY IF EXISTS "Public can view products" ON public.products;
    CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
    CREATE POLICY "Admins can manage products" ON public.products FOR ALL 
      USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

    -- Orders
    DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
    CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT 
      USING (auth.uid() = user_id);
      
    DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
    CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL 
      USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

    -- Newsletter
    DROP POLICY IF EXISTS "Public can subscribe to newsletter" ON public.newsletter_subscribers;
    CREATE POLICY "Public can subscribe to newsletter" ON public.newsletter_subscribers FOR INSERT
      WITH CHECK (true);

    -- Contact messages
    DROP POLICY IF EXISTS "Service role can manage contact messages" ON public.contact_messages;
    CREATE POLICY "Service role can manage contact messages" ON public.contact_messages FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
END $$;

-- 8. ADMINISTRATIVE AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  user_email TEXT NOT NULL,
  target TEXT,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PRODUCT REVIEWS (SOCIAL PROOF)
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE RLS
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- POLICIES
DROP POLICY IF EXISTS "Admins can manage logs" ON public.admin_logs;
CREATE POLICY "Admins can manage logs" ON public.admin_logs FOR ALL 
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
CREATE POLICY "Public can view approved reviews" ON public.reviews FOR SELECT 
  USING (status = 'approved');

DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.reviews;
CREATE POLICY "Admins can manage all reviews" ON public.reviews FOR ALL 
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );
