-- =============================================================
-- Ali Imad Portfolio - Full Database Schema
-- =============================================================

-- 1. PROFILE (single-row table for personal info)
CREATE TABLE IF NOT EXISTS profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  first_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT '',
  intro text NOT NULL DEFAULT '',
  currently text NOT NULL DEFAULT '',
  photo text NOT NULL DEFAULT '',
  photo_caption text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

-- 2. NAV ITEMS
CREATE TABLE IF NOT EXISTS nav_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  href text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 3. SOCIAL LINKS
CREATE TABLE IF NOT EXISTS social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  href text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 4. CODE SKILLS
CREATE TABLE IF NOT EXISTS code_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  note text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 5. DESIGN SKILLS
CREATE TABLE IF NOT EXISTS design_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  note text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 6. TOOLS
CREATE TABLE IF NOT EXISTS tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 7. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  meta text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  copy text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  tech text[] DEFAULT '{}',
  github text,
  demo text,
  annotation text NOT NULL DEFAULT '',
  cover_image text,
  images text[] DEFAULT '{}',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 8. DESIGN PIECES
CREATE TABLE IF NOT EXISTS design_pieces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL DEFAULT '',
  caption text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  code text,
  image text,
  tags text[] DEFAULT '{}',
  rotation text NOT NULL DEFAULT '0deg',
  size text NOT NULL DEFAULT 'medium' CHECK (size IN ('small', 'medium', 'large')),
  art text NOT NULL DEFAULT 'ui' CHECK (art IN ('logo', 'poster', 'identity', 'type', 'manip', 'motion', 'ui', 'stamp')),
  palette text[] DEFAULT '{}',
  is_hero boolean DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 9. ABOUT
CREATE TABLE IF NOT EXISTS about (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bio text[] DEFAULT '{}',
  programming text NOT NULL DEFAULT '',
  graphic text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

-- 10. ABOUT JOURNEY
CREATE TABLE IF NOT EXISTS about_journey (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year text NOT NULL,
  text text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 11. THEME COLORS (single-row table)
CREATE TABLE IF NOT EXISTS theme_colors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paper text NOT NULL DEFAULT '#f1efe7',
  paper2 text NOT NULL DEFAULT '#eae6dc',
  paper3 text NOT NULL DEFAULT '#e0dbcf',
  card text NOT NULL DEFAULT '#f8f6ef',
  ink text NOT NULL DEFAULT '#14120e',
  ink_soft text NOT NULL DEFAULT '#555149',
  ink_faint text NOT NULL DEFAULT '#8b8579',
  line text NOT NULL DEFAULT '#cfcabf',
  updated_at timestamptz DEFAULT now()
);

-- 12. MODEL 3D SETTINGS (single-row table)
CREATE TABLE IF NOT EXISTS model_3d_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scale numeric NOT NULL DEFAULT 0.55,
  pos_x numeric NOT NULL DEFAULT 0.52,
  pos_y numeric NOT NULL DEFAULT 0.0,
  yaw_deg numeric NOT NULL DEFAULT -75,
  sway boolean NOT NULL DEFAULT true,
  enter_vh numeric NOT NULL DEFAULT 1.2,
  updated_at timestamptz DEFAULT now()
);

-- 13. CONTACT MESSAGES
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 14. TODOS (basic test table)
CREATE TABLE IF NOT EXISTS todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- =============================================================
-- SEED DATA
-- =============================================================

-- Profile
INSERT INTO profile (name, first_name, role, intro, currently, photo, photo_caption)
VALUES (
  'Ali Imad',
  'Ali',
  'Developer & Graphic Designer',
  'I build software and design how it feels. Half my brain writes code, the other half draws — and I like experimenting.',
  'building: a tiny RFID attendance system',
  '/portrait.svg',
  'this is me, probably sketching'
);

-- Nav Items
INSERT INTO nav_items (label, href, sort_order) VALUES
  ('Home', '#home', 0),
  ('About', '#about', 1),
  ('Skills', '#skills', 2),
  ('Projects', '#projects', 3),
  ('Design', '#design', 4),
  ('Contact', '#contact', 5);

-- Social Links
INSERT INTO social_links (label, href, sort_order) VALUES
  ('Github', 'https://github.com', 0),
  ('Behance', 'https://behance.net', 1),
  ('Email', 'mailto:hello@ali.dev', 2);

-- Code Skills
INSERT INTO code_skills (name, note, sort_order) VALUES
  ('Python', 'serial problem-solver', 0),
  ('JavaScript', NULL, 1),
  ('React', NULL, 2),
  ('Vue', NULL, 3),
  ('PHP', NULL, 4),
  ('MySQL', NULL, 5),
  ('C++', NULL, 6),
  ('HTML', NULL, 7),
  ('CSS', NULL, 8),
  ('Flutter', NULL, 9);

-- Design Skills
INSERT INTO design_skills (name, note, sort_order) VALUES
  ('Branding', 'systems that stick', 0),
  ('UI Design', NULL, 1),
  ('Poster Design', NULL, 2),
  ('Photo Manipulation', NULL, 3),
  ('Typography', NULL, 4),
  ('Visual Identity', NULL, 5),
  ('Motion', NULL, 6);

-- Tools
INSERT INTO tools (name, sort_order) VALUES
  ('Git', 0),
  ('Figma', 1),
  ('Illustrator', 2),
  ('Photoshop', 3),
  ('VS Code', 4),
  ('InDesign', 5),
  ('Terminal', 6);

-- Projects
INSERT INTO projects (slug, meta, title, copy, description, tech, github, demo, annotation, sort_order) VALUES
  ('rfid', '01 / Software', 'Smart RFID Attendance', 'Tap in. Walk on.', 'A hands-free attendance system that reads RFID cards and logs students the moment they walk in — no queues, no paper sign-ins.', ARRAY['Python', 'Flask', 'MySQL'], NULL, NULL, 'tap = present', 0),
  ('designsys', '02 / Branding', 'Visual Identity System', 'One brand, every surface.', 'A full visual identity for a local café — logo, color system, menu templates and signage. Consistent, warm, unforgettable.', ARRAY['Illustrator', 'Photoshop', 'Identity'], NULL, NULL, 'logo to all touchpoints', 1),
  ('shop', '03 / Software', 'Plant Shop Web App', 'Greenery, clickable.', 'A small e-commerce experiment with a playful twist — cart states, stock handling and a friendly checkout flow.', ARRAY['React', 'Tailwind', 'Node'], NULL, NULL, 'cart is out of stock jk', 2),
  ('posters', '04 / Print', 'Poster Series', 'Type, texture, tension.', 'A short-run series of gig posters built around big type and paper textures. Each one a different experiment in hierarchy and rhythm.', ARRAY['Photoshop', 'Typography'], NULL, NULL, 'side A done', 3),
  ('idcard', '05 / Software', 'Student ID Card System', 'Everyone gets a badge.', 'A generator that takes a student record and pops out a clean, printable ID card — photos, codes and barcodes handled automatically.', ARRAY['Python', 'Pillow', 'SQLite'], NULL, NULL, 'zero manual layout', 4),
  ('motion', '06 / Motion', 'Micro-Animation Pack', 'Small moves, big feel.', 'A growing collection of tiny UI animations and transitions — buttons, hovers, loads — done with CSS and a bit of SVG. Lively, never loud.', ARRAY['CSS', 'SVG', 'JavaScript'], NULL, NULL, 'ease in, feel good', 5);

-- Design Pieces
INSERT INTO design_pieces (slug, title, caption, category, code, image, tags, rotation, size, art, palette, is_hero, sort_order) VALUES
  ('working-projects-hero', 'Urban Monolith Editorial', 'Contemporary brutalist architectural photoshoot and structural fashion study.', 'Editorial Direction', '01 / 26', '/gallery/hero_wide.jpg', ARRAY['Brutalist Architecture', 'Monochrome', 'Editorial'], '0deg', 'large', 'poster', ARRAY['#111111', '#888888', '#f5f3ec'], true, 0),
  ('avenir-identity', 'AVENIR BRAND & STATIONERY', 'Luxury debossed gold foil identity system on textured black linen stock.', 'Brand & Identity', '10 / 23', '/gallery/branding.jpg', ARRAY['Brand System', 'Gold Foil', 'Stationery'], '-2deg', 'large', 'identity', ARRAY['#14120e', '#c8a870', '#e5e1d8'], false, 1),
  ('zurich-poster', 'ZÜRICH AVANT-GARDE POSTER', 'Brutalist Swiss typographic exhibition piece with kinetic wireframe geometries.', 'Poster & Print', '09 / 24', '/gallery/poster.jpg', ARRAY['Swiss Grid', 'Brutalism', 'Risograph'], '2deg', 'medium', 'poster', ARRAY['#121212', '#d92550', '#ebe7de'], false, 2),
  ('finnovate-ui', 'FINNOVATE DASHBOARD & MOBILE UI', 'Ultra-sleek dark mode financial mobile interface with frosted glassmorphism.', 'UI/UX Design', '06 / 25', '/gallery/ui.jpg', ARRAY['Dark Mode', 'Glassmorphism', 'Mobile App'], '-1.5deg', 'medium', 'ui', ARRAY['#0d1117', '#ff9f1c', '#00f2fe'], false, 3),
  ('artifact-sculpture', 'ARTIFACT: FUTURE FORM 3D', 'Iridescent fluid chrome glass sculpture study with chromatic refractions.', '3D & CGI Art', '04 / 26', '/gallery/sculpture.jpg', ARRAY['3D Sculpture', 'Chrome & Glass', 'Editorial'], '2.5deg', 'large', 'manip', ARRAY['#0a0a0c', '#38ef7d', '#9b51e0'], false, 4),
  ('brutalist-roots', 'THE NEW FORM EDITORIAL SPREAD', 'High-fashion architectural magazine spread exploring brutalist typographic hierarchies.', 'Typography', '03 / 26', '/gallery/editorial.jpg', ARRAY['Magazine Layout', 'Serif Display', 'Editorial'], '-1deg', 'medium', 'type', ARRAY['#111111', '#777777', '#f5f3ec'], false, 5),
  ('aurum-packaging', 'AURUM SPECIALTY COFFEE PACKAGING', 'Matte black pouch with geometric debossed gold emblem and natural warm aesthetics.', 'Packaging', '02 / 26', '/gallery/packaging.jpg', ARRAY['Matte Black', 'Gold Foil', 'Product Design'], '1.5deg', 'small', 'logo', ARRAY['#1a1714', '#c59b27', '#e8dfd2'], false, 6);

-- About
INSERT INTO about (bio, programming, graphic)
VALUES (
  ARRAY[
    'Bridging clean code architecture with crafted visual identities.',
    'I engineer scalable software with crisp logic under the hood, and design human-centric interfaces with typographic precision.',
    'Always exploring the intersection of creative technology, brand aesthetics, and modern web performance.'
  ],
  'Scalable Python architectures, reactive React & TypeScript interfaces, and resilient backend pipelines designed for speed and clarity.',
  'Distinctive brand identities, harmonious color systems, and typographic hierarchy that make digital products memorable.'
);

-- About Journey
INSERT INTO about_journey (year, text, sort_order) VALUES
  ('Genesis', 'Started exploring algorithms and visual identity systems.', 0),
  ('Python & Logic', 'Built automation engines, web backends, and modular logic.', 1),
  ('Design Systems', 'Crafted brand aesthetics, editorial layouts, and vector art.', 2),
  ('Full Synergy', 'Fusing full-stack engineering with high-impact design.', 3);

-- Theme Colors
INSERT INTO theme_colors (paper, paper2, paper3, card, ink, ink_soft, ink_faint, line)
VALUES ('#f1efe7', '#eae6dc', '#e0dbcf', '#f8f6ef', '#14120e', '#555149', '#8b8579', '#cfcabf');

-- Model 3D Settings
INSERT INTO model_3d_settings (scale, pos_x, pos_y, yaw_deg, sway, enter_vh)
VALUES (0.55, 0.52, 0.0, -75, true, 1.2);

-- Sample Todos
INSERT INTO todos (name) VALUES
  ('Build RFID attendance system'),
  ('Design brand identity for café'),
  ('Create plant shop web app');

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE nav_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE about ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_journey ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_3d_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Public read policies (anyone can view)
CREATE POLICY "Public read profile" ON profile FOR SELECT USING (true);
CREATE POLICY "Public read nav_items" ON nav_items FOR SELECT USING (true);
CREATE POLICY "Public read social_links" ON social_links FOR SELECT USING (true);
CREATE POLICY "Public read code_skills" ON code_skills FOR SELECT USING (true);
CREATE POLICY "Public read design_skills" ON design_skills FOR SELECT USING (true);
CREATE POLICY "Public read tools" ON tools FOR SELECT USING (true);
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read design_pieces" ON design_pieces FOR SELECT USING (true);
CREATE POLICY "Public read about" ON about FOR SELECT USING (true);
CREATE POLICY "Public read about_journey" ON about_journey FOR SELECT USING (true);
CREATE POLICY "Public read theme_colors" ON theme_colors FOR SELECT USING (true);
CREATE POLICY "Public read model_3d_settings" ON model_3d_settings FOR SELECT USING (true);
CREATE POLICY "Public read todos" ON todos FOR SELECT USING (true);

-- Contact messages: public insert, no public read
CREATE POLICY "Public insert contact_messages" ON contact_messages FOR INSERT WITH CHECK (true);

-- Todos: full public access (test table)
CREATE POLICY "Public all todos" ON todos FOR ALL USING (true);
