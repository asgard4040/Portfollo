-- =============================================================
-- Supabase Storage Policies for "images" bucket
-- Run this AFTER the initial schema.sql
-- =============================================================

-- 1. Add cover_image column to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cover_image text;

-- 2. Storage policies for the "images" bucket
-- Public read: anyone can view images
CREATE POLICY "Public read access for images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Authenticated insert: anyone can upload (portfolio is public)
CREATE POLICY "Public upload access for images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images');

-- Authenticated update: anyone can update their uploads
CREATE POLICY "Public update access for images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'images');

-- Authenticated delete: anyone can delete from images
CREATE POLICY "Public delete access for images"
ON storage.objects FOR DELETE
USING (bucket_id = 'images');
