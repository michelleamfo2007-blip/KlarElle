-- Create the support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open', -- 'Open', 'In Progress', 'Closed'
    priority TEXT NOT NULL DEFAULT 'Low', -- 'Low', 'Medium', 'High'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Allow public to insert support tickets (Contact Us form)
DROP POLICY IF EXISTS "Allow public to insert support tickets" ON public.support_tickets;
CREATE POLICY "Allow public to insert support tickets"
    ON public.support_tickets
    FOR INSERT
    WITH CHECK (true);

-- Allow authenticated users to view support tickets
DROP POLICY IF EXISTS "Allow authenticated to view support tickets" ON public.support_tickets;
CREATE POLICY "Allow authenticated to view support tickets"
    ON public.support_tickets
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Allow authenticated users to update support tickets
DROP POLICY IF EXISTS "Allow authenticated to update support tickets" ON public.support_tickets;
CREATE POLICY "Allow authenticated to update support tickets"
    ON public.support_tickets
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to delete support tickets
DROP POLICY IF EXISTS "Allow authenticated to delete support tickets" ON public.support_tickets;
CREATE POLICY "Allow authenticated to delete support tickets"
    ON public.support_tickets
    FOR DELETE
    USING (auth.role() = 'authenticated');
