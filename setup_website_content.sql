-- Create the website_content table
CREATE TABLE IF NOT EXISTS public.website_content (
    id INTEGER PRIMARY KEY DEFAULT 1,
    announcement_text TEXT NOT NULL DEFAULT 'Free shipping on all orders over $100!',
    hero_title TEXT NOT NULL DEFAULT 'New Arrival Collection',
    hero_subtitle TEXT NOT NULL DEFAULT 'Discover the latest trends in fashion and accessories.',
    featured_collection TEXT NOT NULL DEFAULT 'Summer 2026',
    about_text TEXT NOT NULL DEFAULT 'KlarElle is a premium brand dedicated to bringing you the finest clothing and accessories.',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT enforce_single_row CHECK (id = 1)
);

-- Insert the default row if it doesn't exist
INSERT INTO public.website_content (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access to website_content" ON public.website_content;
DROP POLICY IF EXISTS "Allow authenticated update access to website_content" ON public.website_content;

-- Allow anyone to read content
CREATE POLICY "Allow public read access to website_content"
    ON public.website_content
    FOR SELECT
    USING (true);

-- Allow authenticated users (admins) to update content
CREATE POLICY "Allow authenticated update access to website_content"
    ON public.website_content
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
