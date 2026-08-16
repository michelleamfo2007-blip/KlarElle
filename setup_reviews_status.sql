-- Add status column to product_reviews
ALTER TABLE public.product_reviews
ADD COLUMN IF NOT EXISTS status text DEFAULT 'Approved';

-- Update any existing reviews to be Approved
UPDATE public.product_reviews
SET status = 'Approved'
WHERE status IS NULL;
