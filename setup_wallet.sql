-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create wallets table
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_email VARCHAR NOT NULL UNIQUE,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create gift_cards table
CREATE TABLE IF NOT EXISTS public.gift_cards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code VARCHAR NOT NULL UNIQUE,
    value DECIMAL(10, 2) NOT NULL,
    is_redeemed BOOLEAN DEFAULT FALSE,
    redeemed_by VARCHAR,
    redeemed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create wallet_transactions table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE,
    type VARCHAR NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'gift_card_redemption', 'purchase')),
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Setup Row Level Security (RLS)
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Allow public access (Simplified for development, adjust for production)
CREATE POLICY "Allow public read access to wallets" ON public.wallets FOR SELECT USING (true);
CREATE POLICY "Allow public insert to wallets" ON public.wallets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to wallets" ON public.wallets FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to gift_cards" ON public.gift_cards FOR SELECT USING (true);
CREATE POLICY "Allow public insert to gift_cards" ON public.gift_cards FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to gift_cards" ON public.gift_cards FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to transactions" ON public.wallet_transactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert to transactions" ON public.wallet_transactions FOR INSERT WITH CHECK (true);

-- Insert a test gift card for the user to try out!
INSERT INTO public.gift_cards (code, value) VALUES ('WELCOME50', 50.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO public.gift_cards (code, value) VALUES ('KLARELLE100', 100.00) ON CONFLICT (code) DO NOTHING;
