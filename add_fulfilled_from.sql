ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS fulfilled_from text;
