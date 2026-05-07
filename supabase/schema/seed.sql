-- ToteAly Iconic: Production bootstrap
-- Run setup.sql first.
--
-- This file intentionally does not create products, customers, orders,
-- subscribers, reviews, or coupons. Real storefront data must be created
-- through the admin UI or imported from verified business records.

INSERT INTO public.settings (id, site_name, contact_email)
VALUES ('global_settings', 'ToteAly Iconic', 'hello@totealy.com')
ON CONFLICT (id) DO UPDATE SET
  site_name = EXCLUDED.site_name,
  contact_email = EXCLUDED.contact_email,
  updated_at = NOW();
