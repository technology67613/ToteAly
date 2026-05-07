-- ToteAly Iconic: Database verification
-- Run after setup.sql and production bootstrap.

SELECT 'profiles' AS object_name, to_regclass('public.profiles') IS NOT NULL AS ok;
SELECT 'products' AS object_name, to_regclass('public.products') IS NOT NULL AS ok;
SELECT 'orders' AS object_name, to_regclass('public.orders') IS NOT NULL AS ok;
SELECT 'order_items' AS object_name, to_regclass('public.order_items') IS NOT NULL AS ok;
SELECT 'settings' AS object_name, to_regclass('public.settings') IS NOT NULL AS ok;
SELECT 'coupons' AS object_name, to_regclass('public.coupons') IS NOT NULL AS ok;
SELECT 'newsletter_subscribers' AS object_name, to_regclass('public.newsletter_subscribers') IS NOT NULL AS ok;
SELECT 'contact_messages' AS object_name, to_regclass('public.contact_messages') IS NOT NULL AS ok;
SELECT 'admin_logs' AS object_name, to_regclass('public.admin_logs') IS NOT NULL AS ok;
SELECT 'reviews' AS object_name, to_regclass('public.reviews') IS NOT NULL AS ok;
SELECT 'totealy-assets bucket' AS object_name, EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'totealy-assets'
) AS ok;
SELECT 'global_settings row' AS object_name, EXISTS (
  SELECT 1 FROM public.settings WHERE id = 'global_settings'
) AS ok;
