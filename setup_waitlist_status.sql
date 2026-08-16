-- Add status column to waitlist table
ALTER TABLE public.waitlist 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'Pending';

-- Allow anyone to update their own waitlist row (if needed, but usually just admin)
-- Or just allow public to update status (since we have a public checkout-like admin page for now)
CREATE POLICY "Allow public update to waitlist"
ON public.waitlist FOR UPDATE
USING (true);
