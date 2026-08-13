-- Add new columns to products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS material text,
ADD COLUMN IF NOT EXISTS composition text,
ADD COLUMN IF NOT EXISTS tags text[];

-- Create product_reviews table
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
    user_name text NOT NULL,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    text text NOT NULL,
    size_bought text,
    color_bought text,
    fit text CHECK (fit IN ('Small', 'True to Size', 'Large')),
    helpful_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for product_reviews
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Allow public read access to reviews
CREATE POLICY "Allow public read access to reviews"
ON public.product_reviews FOR SELECT
USING (true);

-- Allow public insert to reviews
CREATE POLICY "Allow public insert to reviews"
ON public.product_reviews FOR INSERT
WITH CHECK (true);

-- Allow public update of helpful_count
CREATE POLICY "Allow public update of helpful_count"
ON public.product_reviews FOR UPDATE
USING (true);

-- Insert some dummy reviews for the first product so we can test the UI
DO $$
DECLARE
    first_product_id uuid;
BEGIN
    -- Get the ID of the first product in the DB
    SELECT id INTO first_product_id FROM public.products LIMIT 1;
    
    IF first_product_id IS NOT NULL THEN
        -- Insert dummy reviews
        INSERT INTO public.product_reviews (product_id, user_name, rating, text, size_bought, color_bought, fit, helpful_count)
        VALUES 
            (first_product_id, 'l***r', 5, 'super nice quality thank you', 'L', 'White', 'True to Size', 25),
            (first_product_id, 'x***1', 4, 'Good quality but the size was very big', 'M', 'White', 'Large', 10),
            (first_product_id, 'a***m', 5, 'fits perfectly, definitely buying more!', 'S', 'Black', 'True to Size', 5),
            (first_product_id, 'j***9', 3, 'a bit tight around the arms', 'M', 'Red', 'Small', 2);
            
        -- Set dummy material and tags for this product too
        UPDATE public.products 
        SET material = 'Knitted Fabric',
            composition = '95% Polyester, 5% Elastane',
            tags = ARRAY['Midi', 'Sleeveless', 'Regular']
        WHERE id = first_product_id;
    END IF;
END $$;
