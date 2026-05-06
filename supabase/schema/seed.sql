-- ToteAly Iconic: Seed Data
-- Run this AFTER setup.sql

-- 1. Insert Sample Products
INSERT INTO public.products (id, title, description, price, category, images, stock, is_customizable)
VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Plain Tote Bag', 'Standard eco-friendly beige canvas bag.', 129.00, 'Plain Totes', '{"/mockups/plain.png"}', 100, true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Black Tote Bag', 'Sleek minimalist black canvas bag.', 199.00, 'Black Totes', '{"/mockups/black.png"}', 80, true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Regular Tote Bag', 'Sturdy everyday canvas bag.', 199.00, 'Regular Totes', '{"/mockups/regular.png"}', 50, true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Premium Tote Bag', 'High-quality textured luxury canvas.', 249.00, 'Premium Totes', '{"/mockups/premium.png"}', 30, true)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Sample Settings
INSERT INTO public.settings (id, site_name, contact_email) 
VALUES ('global_settings', 'ToteAly Iconic', 'hello@totealy.com')
ON CONFLICT (id) DO NOTHING;

-- 3. Newsletter table is intentionally left empty for real subscribers.

-- Note: To seed Orders or Profiles, you need real UUIDs from auth.users. 
-- Below is a template for a sample profile (manually link to a user id if needed)
-- INSERT INTO public.profiles (id, email, name, role) VALUES ('<UUID_FROM_AUTH>', 'admin@example.com', 'Admin User', 'admin');
