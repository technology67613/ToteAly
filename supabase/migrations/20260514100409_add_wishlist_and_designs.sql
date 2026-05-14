-- 1. WISHLIST TABLE
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 2. SAVED DESIGNS TABLE (Studio Canvas)
CREATE TABLE IF NOT EXISTS public.user_designs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Untitled Design',
  canvas_data JSONB NOT NULL,
  preview_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCT ENHANCEMENTS
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 4. ENABLE RLS
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_designs ENABLE ROW LEVEL SECURITY;

-- 5. POLICIES
-- Wishlist: Users can manage their own
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can manage own wishlist" ON public.wishlist;
    CREATE POLICY "Users can manage own wishlist" ON public.wishlist
      FOR ALL USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can manage own designs" ON public.user_designs;
    CREATE POLICY "Users can manage own designs" ON public.user_designs
      FOR ALL USING (auth.uid() = user_id);
END $$;

-- 6. ADMIN LOGS ENHANCEMENT
ALTER TABLE public.admin_logs ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'info';
ALTER TABLE public.admin_logs ADD COLUMN IF NOT EXISTS module TEXT;
