-- Per-product size chart used by the storefront Size Guide and Check My Size.
-- Run this in Supabase SQL Editor.
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS size_chart jsonb;
