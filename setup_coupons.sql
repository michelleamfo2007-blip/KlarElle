-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS coupons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    usage_limit INTEGER,
    times_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Set up RLS (Row Level Security)
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active coupons so checkout can verify them
CREATE POLICY "Allow public read access to active coupons" ON coupons
    FOR SELECT USING (true);

-- Allow authenticated admins to do everything
CREATE POLICY "Allow authenticated full access to coupons" ON coupons
    FOR ALL USING (auth.role() = 'authenticated');
