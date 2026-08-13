-- Create the subscribers table
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert into subscribers (so users can subscribe without logging in)
CREATE POLICY "Allow public insert to subscribers" ON public.subscribers
    FOR INSERT
    WITH CHECK (true);

-- Only authenticated users (admins) can view subscribers
CREATE POLICY "Allow authenticated users to view subscribers" ON public.subscribers
    FOR SELECT
    USING (auth.role() = 'authenticated');
