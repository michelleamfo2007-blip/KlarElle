-- Add missing size and color columns to order_items table
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS size text,
ADD COLUMN IF NOT EXISTS color text;
