-- =============================================================
-- Supabase Storage Policies for "images" bucket
-- Run this AFTER the initial schema.sql
-- =============================================================

-- 1. Add image-path columns used by the content sync
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cover_image text;
ALTER TABLE profile ADD COLUMN IF NOT EXISTS photo_storage_path text;
ALTER TABLE design_pieces ADD COLUMN IF NOT EXISTS storage_path text;

-- 2. Storage policies for the "images" bucket
-- Public read: anyone can view images
DROP POLICY IF EXISTS "Public read access for images" ON storage.objects;
CREATE POLICY "Public read access for images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Public insert: anyone can upload (portfolio is public)
DROP POLICY IF EXISTS "Public upload access for images" ON storage.objects;
CREATE POLICY "Public upload access for images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images');

-- Public update
DROP POLICY IF EXISTS "Public update access for images" ON storage.objects;
CREATE POLICY "Public update access for images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'images');

-- Public delete
DROP POLICY IF EXISTS "Public delete access for images" ON storage.objects;
CREATE POLICY "Public delete access for images"
ON storage.objects FOR DELETE
USING (bucket_id = 'images');

-- =============================================================
-- WRITE POLICIES for the content tables (needed for the editor to
-- save from the browser using the anon key).
-- NOTE: the editor's lock screen is a client-side gate only; these
-- policies let anyone with the anon key write. Add auth if needed.
-- =============================================================

-- First, remove ANY write-policy left over from earlier runs, using
-- every name variant we've ever used (Postgres policy names must be
-- unique per table, and CREATE POLICY would error if one already exists).
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT p.polname, c.relname
    FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    WHERE p.polname IN
      ('Content write', 'Content write insert', 'Content write update', 'Content write delete')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.polname, r.relname);
  END LOOP;
END $$;

-- Now create one policy per operation, each with a DISTINCT name
-- (required — a table cannot hold two policies with the same name).
CREATE POLICY "Content write insert" ON profile FOR INSERT WITH CHECK (true);
CREATE POLICY "Content write update" ON profile FOR UPDATE USING (true);

CREATE POLICY "Content write insert" ON nav_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Content write update" ON nav_items FOR UPDATE USING (true);
CREATE POLICY "Content write delete" ON nav_items FOR DELETE USING (true);

CREATE POLICY "Content write insert" ON social_links FOR INSERT WITH CHECK (true);
CREATE POLICY "Content write update" ON social_links FOR UPDATE USING (true);
CREATE POLICY "Content write delete" ON social_links FOR DELETE USING (true);

CREATE POLICY "Content write insert" ON code_skills FOR INSERT WITH CHECK (true);
CREATE POLICY "Content write update" ON code_skills FOR UPDATE USING (true);
CREATE POLICY "Content write delete" ON code_skills FOR DELETE USING (true);

CREATE POLICY "Content write insert" ON design_skills FOR INSERT WITH CHECK (true);
CREATE POLICY "Content write update" ON design_skills FOR UPDATE USING (true);
CREATE POLICY "Content write delete" ON design_skills FOR DELETE USING (true);

CREATE POLICY "Content write insert" ON tools FOR INSERT WITH CHECK (true);
CREATE POLICY "Content write update" ON tools FOR UPDATE USING (true);
CREATE POLICY "Content write delete" ON tools FOR DELETE USING (true);

CREATE POLICY "Content write insert" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Content write update" ON projects FOR UPDATE USING (true);
CREATE POLICY "Content write delete" ON projects FOR DELETE USING (true);

CREATE POLICY "Content write insert" ON design_pieces FOR INSERT WITH CHECK (true);
CREATE POLICY "Content write update" ON design_pieces FOR UPDATE USING (true);
CREATE POLICY "Content write delete" ON design_pieces FOR DELETE USING (true);

CREATE POLICY "Content write insert" ON about FOR INSERT WITH CHECK (true);
CREATE POLICY "Content write update" ON about FOR UPDATE USING (true);

CREATE POLICY "Content write insert" ON about_journey FOR INSERT WITH CHECK (true);
CREATE POLICY "Content write update" ON about_journey FOR UPDATE USING (true);
CREATE POLICY "Content write delete" ON about_journey FOR DELETE USING (true);

CREATE POLICY "Content write insert" ON theme_colors FOR INSERT WITH CHECK (true);
CREATE POLICY "Content write update" ON theme_colors FOR UPDATE USING (true);

CREATE POLICY "Content write insert" ON model_3d_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Content write update" ON model_3d_settings FOR UPDATE USING (true);
