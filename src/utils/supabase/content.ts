import { supabase } from './client'
import type { SiteContent } from '../../store/ContentContext'

export interface DbProject {
  slug: string
  meta: string
  title: string
  copy: string
  description: string
  tech: string[] | null
  github: string | null
  demo: string | null
  annotation: string
  cover_image: string | null
  images?: string[] | null
  sort_order: number
}

export interface DbDesignPiece {
  slug: string
  title: string
  caption: string
  category: string
  code: string | null
  image: string | null
  storage_path: string | null
  images?: string[] | null
  tags: string[] | null
  rotation: string
  size: string
  art: string
  palette: string[] | null
  is_hero: boolean
  sort_order: number
}

export interface DbAboutJourney {
  year: string
  text: string
  sort_order: number
}

export interface DbNav {
  label: string
  href: string
  sort_order: number
}

export interface DbSocial {
  label: string
  href: string
  sort_order: number
}

export interface DbSkill {
  name: string
  note: string | null
  sort_order: number
}

export interface DbTool {
  name: string
  sort_order: number
}

export interface DbProfile {
  name: string
  first_name: string
  role: string
  intro: string
  currently: string
  photo: string
  photo_storage_path: string | null
  photo_caption: string
}

export interface DbAbout {
  bio: string[] | null
  programming: string
  graphic: string
}

export interface DbTheme {
  paper: string
  paper2: string
  paper3: string
  card: string
  ink: string
  ink_soft: string
  ink_faint: string
  line: string
}

export interface DbModel3D {
  scale: number
  pos_x: number
  pos_y: number
  yaw_deg: number
  sway: boolean
  enter_vh: number
}

export interface DbContent {
  profile: DbProfile | null
  nav: DbNav[]
  social: DbSocial[]
  codeSkills: DbSkill[]
  designSkills: DbSkill[]
  tools: DbTool[]
  projects: DbProject[]
  designPieces: DbDesignPiece[]
  about: DbAbout | null
  aboutJourney: DbAboutJourney[]
  theme: DbTheme | null
  model3d: DbModel3D | null
}

export async function fetchAllContent(): Promise<DbContent | null> {
  const sb = supabase
  if (!sb) return null

  const [
    profile,
    nav,
    social,
    codeSkills,
    designSkills,
    tools,
    projects,
    designPieces,
    about,
    aboutJourney,
    theme,
    model3d,
  ] = await Promise.all([
    sb.from('profile').select('*').limit(1).maybeSingle(),
    sb.from('nav_items').select('*').order('sort_order'),
    sb.from('social_links').select('*').order('sort_order'),
    sb.from('code_skills').select('*').order('sort_order'),
    sb.from('design_skills').select('*').order('sort_order'),
    sb.from('tools').select('*').order('sort_order'),
    sb.from('projects').select('*').order('sort_order'),
    sb.from('design_pieces').select('*').order('sort_order'),
    sb.from('about').select('*').limit(1).maybeSingle(),
    sb.from('about_journey').select('*').order('sort_order'),
    sb.from('theme_colors').select('*').limit(1).maybeSingle(),
    sb.from('model_3d_settings').select('*').limit(1).maybeSingle(),
  ])

  const errors = [
    profile.error,
    nav.error,
    social.error,
    codeSkills.error,
    designSkills.error,
    tools.error,
    projects.error,
    designPieces.error,
    about.error,
    aboutJourney.error,
    theme.error,
    model3d.error,
  ].filter(Boolean)
  if (errors.length) {
    return null
  }

  return {
    profile: (profile.data as DbProfile) ?? null,
    nav: (nav.data as DbNav[]) ?? [],
    social: (social.data as DbSocial[]) ?? [],
    codeSkills: (codeSkills.data as DbSkill[]) ?? [],
    designSkills: (designSkills.data as DbSkill[]) ?? [],
    tools: (tools.data as DbTool[]) ?? [],
    projects: (projects.data as DbProject[]) ?? [],
    designPieces: (designPieces.data as DbDesignPiece[]) ?? [],
    about: (about.data as DbAbout) ?? null,
    aboutJourney: (aboutJourney.data as DbAboutJourney[]) ?? [],
    theme: (theme.data as DbTheme) ?? null,
    model3d: (model3d.data as DbModel3D) ?? null,
  }
}

/* ---------- Save: delete + insert (full content sync) ----------
   The editor manages the whole content set, so we replace list rows each
   save. Single-row tables stay as one stable row. */

export async function saveAllContent(
  content: SiteContent,
): Promise<{ ok: boolean; error?: string }> {
  const sb = supabase
  if (!sb) return { ok: false, error: 'Supabase is not configured' }

  const profileRow: DbProfile = {
    name: content.profile.name,
    first_name: content.profile.firstName,
    role: content.profile.role,
    intro: content.profile.intro,
    currently: content.profile.currently,
    photo: content.profile.photo,
    photo_storage_path: content.profile.photoStoragePath ?? null,
    photo_caption: content.profile.photoCaption,
  }
  const aboutRow: DbAbout = {
    bio: content.about.bio,
    programming: content.about.programming,
    graphic: content.about.graphic,
  }
  const themeRow: DbTheme = {
    paper: content.colors.paper,
    paper2: content.colors.paper2,
    paper3: content.colors.paper3,
    card: content.colors.card,
    ink: content.colors.ink,
    ink_soft: content.colors.inkSoft,
    ink_faint: content.colors.inkFaint,
    line: content.colors.line,
  }
  const modelRow: DbModel3D = {
    scale: content.model3D.scale,
    pos_x: content.model3D.posX,
    pos_y: content.model3D.posY,
    yaw_deg: content.model3D.yawDeg,
    sway: content.model3D.sway,
    enter_vh: content.model3D.enterVh,
  }
  const navRows: Record<string, unknown>[] = content.nav.map((n, i) => ({ label: n.label, href: n.href, sort_order: i }))
  const socialRows: Record<string, unknown>[] = content.social.map((s, i) => ({ label: s.label, href: s.href, sort_order: i }))
  const codeRows: Record<string, unknown>[] = content.codeSkills.map((s, i) => ({ name: s.name, note: s.note ?? null, sort_order: i }))
  const designRows: Record<string, unknown>[] = content.designSkills.map((s, i) => ({ name: s.name, note: s.note ?? null, sort_order: i }))
  const toolRows: Record<string, unknown>[] = content.tools.map((t, i) => ({ name: t, sort_order: i }))
  const projectRows: Record<string, unknown>[] = content.projects.map((p, i) => {
    const images = p.images && p.images.length > 0 ? p.images : (p.coverImage ? [p.coverImage] : [])
    return {
      slug: p.id,
      meta: p.meta,
      title: p.title,
      copy: p.copy,
      description: p.description,
      tech: p.tech,
      github: p.github ?? null,
      demo: p.demo ?? null,
      annotation: p.annotation,
      cover_image: images[0] ?? p.coverImage ?? null,
      images: images,
      sort_order: i,
    }
  })
  const pieceRows: Record<string, unknown>[] = content.designPieces.map((p, i) => {
    const images = p.images && p.images.length > 0 ? p.images : (p.storagePath ? [p.storagePath] : (p.image ? [p.image] : []))
    return {
      slug: p.id,
      title: p.title,
      caption: p.caption,
      category: p.category,
      code: p.code ?? null,
      image: images[0] ?? p.image ?? null,
      storage_path: images[0] ?? p.storagePath ?? null,
      images: images,
      tags: p.tags ?? null,
      rotation: p.rotation,
      size: p.size,
      art: p.art,
      palette: p.palette as string[],
      is_hero: false,
      sort_order: i,
    }
  })
  const journeyRows: Record<string, unknown>[] = content.about.journey.map((j, i) => ({
    year: j.year,
    text: j.text,
    sort_order: i,
  }))

  const tables: string[] = [
    'nav_items',
    'social_links',
    'code_skills',
    'design_skills',
    'tools',
    'projects',
    'design_pieces',
    'about_journey',
  ]
  const rowSets: Record<string, Record<string, unknown>[]> = {
    nav_items: navRows,
    social_links: socialRows,
    code_skills: codeRows,
    design_skills: designRows,
    tools: toolRows,
    projects: projectRows,
    design_pieces: pieceRows,
    about_journey: journeyRows,
  }

  // List tables that are fully replaced (keep hero out of design_pieces).
  const listOps = tables.map(async (table) => {
    const rows = rowSets[table] ?? []
    if (table === 'design_pieces') {
      await sb.from(table).delete().eq('is_hero', false)
      let ok = true
      if (rows.length > 0) {
        const res = await sb.from(table).insert(rows)
        if (res.error) {
          // Fallback if "images" column has not been added to design_pieces yet
          const fallbackRows = rows.map((r) => {
            const { images: _ignored, ...rest } = r as { images?: unknown }
            return rest
          })
          const retry = await sb.from(table).insert(fallbackRows)
          ok = !retry.error
        }
      }

      // Save/update the hero banner row if galleryHero is provided
      if (content.galleryHero && (content.galleryHero.storagePath || content.galleryHero.image)) {
        await sb.from(table).delete().eq('is_hero', true)
        const heroRow = {
          slug: 'editorial-hero',
          title: content.galleryHero.title || 'Featured Editorial',
          caption: 'Gallery Header',
          category: 'Editorial',
          storage_path: content.galleryHero.storagePath ?? null,
          image: content.galleryHero.image ?? null,
          images: content.galleryHero.storagePath ? [content.galleryHero.storagePath] : (content.galleryHero.image ? [content.galleryHero.image] : []),
          is_hero: true,
          sort_order: -1,
        }
        const heroRes = await sb.from(table).insert(heroRow)
        if (heroRes.error) {
          const { images: _ignored, ...fallbackHero } = heroRow
          await sb.from(table).insert(fallbackHero)
        }
      } else if (content.galleryHero === null) {
        await sb.from(table).delete().eq('is_hero', true)
      }

      return ok
    }
    await sb.from(table).delete().gte('sort_order', 0)
    const res = await sb.from(table).insert(rows)
    if (res.error && table === 'projects') {
      // Fallback if "images" column has not been added to the Supabase projects table yet
      const fallbackRows = rows.map((r) => {
        const { images: _ignored, ...rest } = r as { images?: unknown }
        return rest
      })
      const retry = await sb.from(table).insert(fallbackRows)
      return !retry.error
    }
    return !res.error
  })

  const listResults = await Promise.all(listOps)

  // Single-row tables: update the one existing row, else insert.
  const singleOps = [
    ['profile', profileRow],
    ['about', aboutRow],
    ['theme_colors', themeRow],
    ['model_3d_settings', modelRow],
  ] as const

  const singleResults = await Promise.all(
    singleOps.map(async ([table, row]) => {
      const { data } = await sb.from(table).select('id').limit(1).maybeSingle()
      if (data && (data as { id: string }).id) {
        const { error } = await sb
          .from(table)
          .update(row as never)
          .eq('id', (data as { id: string }).id)
        return !error
      }
      const { error } = await sb.from(table).insert([row as never])
      return !error
    }),
  )

  const ok = listResults.every(Boolean) && singleResults.every(Boolean)
  if (ok) return { ok: true }
  return {
    ok: false,
    error:
      'Database write blocked. Run supabase/storage.sql in the Supabase SQL Editor to add the write policies and missing columns.',
  }
}
