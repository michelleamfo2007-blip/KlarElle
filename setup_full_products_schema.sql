-- Add all missing columns to products table for the new admin form
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS sku text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS old_price numeric,
ADD COLUMN IF NOT EXISTS stock integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS low_stock_threshold integer DEFAULT 5,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS visibility boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS hover_image_url text,
ADD COLUMN IF NOT EXISTS pattern_type text,
ADD COLUMN IF NOT EXISTS care_instructions text,
ADD COLUMN IF NOT EXISTS style text,
ADD COLUMN IF NOT EXISTS sizes text[],
ADD COLUMN IF NOT EXISTS colors text[],
ADD COLUMN IF NOT EXISTS variant_images jsonb;
