-- Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert into the waitlist (public access)
CREATE POLICY "Allow public insert to waitlist"
    ON public.waitlist
    FOR INSERT
    WITH CHECK (true);

-- Allow only admins (or no one if not needed yet) to read
CREATE POLICY "Allow public read waitlist"
    ON public.waitlist
    FOR SELECT
    USING (true);
