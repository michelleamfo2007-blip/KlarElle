-- Create the staff table
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'Admin',
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Create policies for staff table
-- Allow anyone to read staff (for the admin dashboard)
CREATE POLICY "Allow public read access to staff"
    ON public.staff
    FOR SELECT
    USING (true);

-- Allow inserting new staff
CREATE POLICY "Allow public insert access to staff"
    ON public.staff
    FOR INSERT
    WITH CHECK (true);

-- Allow updating staff (for status/role changes)
CREATE POLICY "Allow public update access to staff"
    ON public.staff
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Allow deleting staff
CREATE POLICY "Allow public delete access to staff"
    ON public.staff
    FOR DELETE
    USING (true);
