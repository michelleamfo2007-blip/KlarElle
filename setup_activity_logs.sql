-- Create the activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_type TEXT NOT NULL,
    description TEXT NOT NULL,
    actor TEXT NOT NULL DEFAULT 'System',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow authenticated read access to activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Allow authenticated insert access to activity_logs" ON public.activity_logs;

-- Allow authenticated users to read logs
CREATE POLICY "Allow authenticated read access to activity_logs"
    ON public.activity_logs
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert logs
CREATE POLICY "Allow authenticated insert access to activity_logs"
    ON public.activity_logs
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Insert an initial system event to populate the table (only if empty)
INSERT INTO public.activity_logs (action_type, description, actor)
SELECT 'System', 'Activity logging system initialized.', 'System'
WHERE NOT EXISTS (SELECT 1 FROM public.activity_logs LIMIT 1);
