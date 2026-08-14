-- Create the staff table
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'Admin',
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Just in case they already ran this, dynamically add name column:
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS name TEXT;

-- Enable Row Level Security
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Create policies for staff table
-- Allow anyone to read staff (for the admin dashboard)
DROP POLICY IF EXISTS "Allow public read access to staff" ON public.staff;
CREATE POLICY "Allow public read access to staff"
    ON public.staff
    FOR SELECT
    USING (true);

-- Allow inserting new staff
DROP POLICY IF EXISTS "Allow public insert access to staff" ON public.staff;
CREATE POLICY "Allow public insert access to staff"
    ON public.staff
    FOR INSERT
    WITH CHECK (true);

-- Allow updating staff (for status/role changes)
DROP POLICY IF EXISTS "Allow public update access to staff" ON public.staff;
CREATE POLICY "Allow public update access to staff"
    ON public.staff
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Allow deleting staff
DROP POLICY IF EXISTS "Allow public delete access to staff" ON public.staff;
CREATE POLICY "Allow public delete access to staff"
    ON public.staff
    FOR DELETE
    USING (true);
