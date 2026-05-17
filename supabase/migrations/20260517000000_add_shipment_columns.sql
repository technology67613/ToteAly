-- Add tracking and delivery partner columns to orders table
ALTER TABLE IF EXISTS public.orders 
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS delivery_partner TEXT;

-- Add comments for admin clarity
COMMENT ON COLUMN public.orders.tracking_number IS 'Carrier AWB or tracking ID for shipment';
COMMENT ON COLUMN public.orders.delivery_partner IS 'Name of the logistics provider (e.g., Delhivery, BlueDart)';
