-- Create the store_settings table
CREATE TABLE IF NOT EXISTS public.store_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    shipping_threshold NUMERIC NOT NULL DEFAULT 100,
    support_email TEXT NOT NULL DEFAULT 'support@klarelle.store',
    support_phone TEXT NOT NULL DEFAULT '+1 (555) 123-4567',
    maintenance_mode BOOLEAN NOT NULL DEFAULT false,
    tax_rate NUMERIC NOT NULL DEFAULT 7.5,
    default_currency TEXT NOT NULL DEFAULT 'USD',
    store_address TEXT NOT NULL DEFAULT '123 Fashion Ave, Suite 400, New York, NY 10001',
    instagram_url TEXT NOT NULL DEFAULT 'https://www.instagram.com/klarelle.store?utm_source=qr',
    tiktok_url TEXT NOT NULL DEFAULT 'https://www.tiktok.com/@klarelle_store?_r=1&_t=ZT-98rGC422fzK',
    facebook_url TEXT NOT NULL DEFAULT 'https://www.facebook.com/share/18vRTfzg9V/?mibextid=wwXIfr',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT enforce_single_row CHECK (id = 1)
);

-- Just in case you already ran this file earlier, add the column dynamically:
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS facebook_url TEXT NOT NULL DEFAULT 'https://www.facebook.com/share/18vRTfzg9V/?mibextid=wwXIfr';

-- Insert the default row if it doesn't exist
INSERT INTO public.store_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for store_settings table
-- Allow anyone to read settings
CREATE POLICY "Allow public read access to store_settings"
    ON public.store_settings
    FOR SELECT
    USING (true);

-- Allow authenticated users (admins) to update settings
CREATE POLICY "Allow authenticated update access to store_settings"
    ON public.store_settings
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
