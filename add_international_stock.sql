-- Add international warehouse stock tracking
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS stock_international integer DEFAULT 0;
