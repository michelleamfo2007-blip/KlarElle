-- Editable storefront pages (Privacy, Terms, Returns, FAQ, etc.)
-- Run this in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS public.site_pages (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "SitePages_Public_Read" ON public.site_pages;
DROP POLICY IF EXISTS "SitePages_Authenticated_Write" ON public.site_pages;

CREATE POLICY "SitePages_Public_Read"
  ON public.site_pages
  FOR SELECT
  USING (true);

CREATE POLICY "SitePages_Authenticated_Write"
  ON public.site_pages
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
