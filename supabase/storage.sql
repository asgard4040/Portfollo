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

DROP POLICY IF EXISTS "Content write" ON profile;
CREATE POLICY "Content write" ON profile FOR INSERT WITH CHECK (true);
CREATE POLICY "Content write" ON profile FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Content write" ON nav_items;
CREATE POLICY "Content write" ON nav_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Content write" ON nav_items FOR UPDATE USING (true);
CREATE POLICY "Content write" ON nav_items FOR DELETE USING (true);

DROP POLICY IF EXISTS "Content write" ON social_links;
CREATE POLICY "Content write" ON social_links FOR INSERT WITH CHECK (true);
CREATE POLICY "Content write" ON social_links FOR UPDATE USING (true);
CREATE POLICY "Content write" ON social_links FOR DELETE USING (true);

DROP POLICY IF EXISTS "Content write" ON code_skills;
CREATE POLICY "Content write" ON code_skills FOR INSERT WITH CHECK (true);
CREATE POLICY "Content write" ON code_skills FOR UPDATE USING (true);
CREATE POLICY "Content write" ON code_skills FOR DELETE USING (true);

DROP POLICY IF EXISTS "Content write" ON design_skills;
CREATE POLICY "Content write" ON design_skills FOR INSERT WITH CHECK (true);
CREATE POLICY "Content write" ON design_skills FOR UPDATE USING (true);
CREATE POLICY "Content write" ON design_skills FOR DELETE USING (true);

DROP POLICY IF EXISTS "Content write" ON tools;
CREATE POLICY "Content write" ON tools FOR INSERT WITH CHECK (true);
CREATE POLICY "Content write" ON tools FOR UPDATE USING (true);
CREATE POLICY "Content write" ON tools FOR DELETE USING (true);

DROP POLICY IF EXISTS "Content write" ON projects;
CREATE POLICY "Content write" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Content write" ON projects FOR UPDATE USING (true);
CREATE POLICY "Content write" ON projects FOR DELETE USING (true);

DROP POLICY IF EXISTS "Content write" ON design_pieces;
CREATE POLICY "Content write" ON design_pieces FOR INSERT WITH CHECK (true);
CREATE POLICY "Content write" ON design_pieces FOR UPDATE USING (true);
CREATE POLICY "Content write" ON design_pieces FOR DELETE USING (true);

DROP POLICY IF EXISTS "Content write" ON about;
CREATE POLICY "Content write" ON about FOR INSERT WITH CHECK (true);
CREATE POLICY "Content write" ON about FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Content write" ON about_journey;
CREATE POLICY "Content write" ON about_journey FOR INSERT WITH CHECK (true);
CREATE POLICY "Content write" ON about_journey FOR UPDATE USING (true);
CREATE POLICY "Content write" ON about_journey FOR DELETE USING (true);

DROP POLICY IF EXISTS "Content write" ON theme_colors;
CREATE POLICY "Content write" ON theme_colors FOR INSERT WITH CHECK (true);
CREATE POLICY "Content write" ON theme_colors FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Content write" ON model_3d_settings;
CREATE POLICY "Content write" ON model_3d_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Content write" ON model_3d_settings FOR UPDATE USING (true);
