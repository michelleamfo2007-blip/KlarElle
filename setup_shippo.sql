-- Add Shipping Tracking Columns to Orders Table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shipping_provider text,
ADD COLUMN IF NOT EXISTS shipping_service text,
ADD COLUMN IF NOT EXISTS shippo_rate_id text,
ADD COLUMN IF NOT EXISTS tracking_number text,
ADD COLUMN IF NOT EXISTS shipping_label_url text;
