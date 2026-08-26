ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS weight numeric,
ADD COLUMN IF NOT EXISTS length numeric,
ADD COLUMN IF NOT EXISTS width numeric,
ADD COLUMN IF NOT EXISTS height numeric,
ADD COLUMN IF NOT EXISTS country_of_manufacture text,
ADD COLUMN IF NOT EXISTS hs_code text;
