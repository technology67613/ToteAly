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
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

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
END $$;
