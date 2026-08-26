ALTER TABLE public.products ADD COLUMN IF NOT EXISTS inventory_matrix jsonb DEFAULT '{}'::jsonb;
