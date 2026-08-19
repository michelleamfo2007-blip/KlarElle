-- Run this in your Supabase SQL Editor to create the page_views table

CREATE TABLE IF NOT EXISTS page_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  path text NOT NULL,
  referrer text,
  user_agent text,
  session_id text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security) so anonymous users can insert views, but only authenticated users can read.
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts
CREATE POLICY "Allow anonymous inserts for page views"
  ON page_views FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to view
CREATE POLICY "Allow authenticated read access for page views"
  ON page_views FOR SELECT
  TO authenticated
  USING (true);
