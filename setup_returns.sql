-- 1. Create return_requests table
CREATE TABLE IF NOT EXISTS public.return_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    customer_email TEXT NOT NULL,
    items JSONB NOT NULL,
    reason TEXT NOT NULL,
    photos JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'Pending Review',
    tracking_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Customers can read their own returns
CREATE POLICY "Customers can view their own return requests"
ON public.return_requests
FOR SELECT
USING (auth.jwt() ->> 'email' = customer_email);

-- Customers can insert their own returns
CREATE POLICY "Customers can create return requests"
ON public.return_requests
FOR INSERT
WITH CHECK (auth.jwt() ->> 'email' = customer_email);

-- Customers can update their own returns (e.g. adding tracking number)
CREATE POLICY "Customers can update their own return requests"
ON public.return_requests
FOR UPDATE
USING (auth.jwt() ->> 'email' = customer_email);

-- Admins can manage all returns
CREATE POLICY "Admins have full access to return requests"
ON public.return_requests
FOR ALL
USING (auth.role() = 'authenticated');

-- 4. Create Storage Bucket for photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('returns', 'returns', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage Policies for returns bucket
-- Allow anyone to read
CREATE POLICY "Public Access returns"
ON storage.objects FOR SELECT
USING (bucket_id = 'returns');

-- Allow authenticated users (customers) to upload
CREATE POLICY "Customers can upload return photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'returns' AND auth.role() = 'authenticated');

-- Allow admins to delete or update if needed
CREATE POLICY "Admins can manage return photos"
ON storage.objects FOR ALL
USING (bucket_id = 'returns' AND auth.role() = 'authenticated');
