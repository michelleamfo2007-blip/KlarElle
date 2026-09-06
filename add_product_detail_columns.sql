ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS material text,
ADD COLUMN IF NOT EXISTS composition text,
ADD COLUMN IF NOT EXISTS fit text,
ADD COLUMN IF NOT EXISTS features text,
ADD COLUMN IF NOT EXISTS measurements text,
ADD COLUMN IF NOT EXISTS preorder_lead_time text;
