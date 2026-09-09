-- Package size for every product: 45 cm long × 35 cm wide × 5 cm high (35 × 5 × 45).
-- Run in the Supabase SQL editor.

ALTER TABLE public.products
  ALTER COLUMN length SET DEFAULT 45,
  ALTER COLUMN width SET DEFAULT 35,
  ALTER COLUMN height SET DEFAULT 5;

UPDATE public.products
SET
  length = 45,
  width = 35,
  height = 5;
