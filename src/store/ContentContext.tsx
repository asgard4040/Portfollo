import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { navItems, profile, social } from '../data/site'
import { codeSkills, designSkills, tools } from '../data/skills'
import { projects } from '../data/projects'
import { designPieces } from '../data/design'
import { aboutContent } from '../data/about'
import { DEFAULT_MODEL3D, type Model3DSettings } from '../data/model3d'
import { DEFAULT_THEME, type ThemeColors } from './colors'
import { fetchAllContent, saveAllContent, type DbContent } from '../utils/supabase/content'

export interface SiteContent {
  profile: typeof profile
  nav: typeof navItems
  social: typeof social
  codeSkills: typeof codeSkills
  designSkills: typeof designSkills
  tools: string[]
  projects: typeof projects
  designPieces: typeof designPieces
  about: typeof aboutContent
  colors: ThemeColors
  model3D: Model3DSettings
}

export const defaultContent: SiteContent = {
  profile,
  nav: navItems,
  social,
  codeSkills,
  designSkills,
  tools,
  projects,
  designPieces,
  about: aboutContent,
  colors: DEFAULT_THEME,
  model3D: DEFAULT_MODEL3D,
}

const STORAGE_KEY = 'ali-imad-portfolio-v1'

interface ContentContextValue {
  content: SiteContent
  update: (patch: Partial<SiteContent>) => void
  reset: () => void
  save: (toSave?: SiteContent) => Promise<{ ok: boolean; error?: string }>
  status: 'loading' | 'ready' | 'error'
}

const ContentContext = createContext<ContentContextValue | null>(null)

/* ---------- DB → SiteContent mapping ---------- */

function mapDbContent(db: DbContent): SiteContent {
  const c = { ...defaultContent }

  if (db.profile) {
    c.profile = {
      name: db.profile.name || c.profile.name,
      firstName: db.profile.first_name || c.profile.firstName,
      role: db.profile.role || c.profile.role,
      intro: db.profile.intro || c.profile.intro,
      currently: db.profile.currently || c.profile.currently,
      photo: db.profile.photo || c.profile.photo,
      photoStoragePath: db.profile.photo_storage_path ?? undefined,
      photoCaption: db.profile.photo_caption || c.profile.photoCaption,
    }
  }

  if (db.nav.length) c.nav = db.nav.map((n) => ({ label: n.label, href: n.href }))
  if (db.social.length) c.social = db.social.map((s) => ({ label: s.label, href: s.href }))
  if (db.codeSkills.length) c.codeSkills = db.codeSkills.map((s) => ({ name: s.name, note: s.note ?? undefined }))
  if (db.designSkills.length) c.designSkills = db.designSkills.map((s) => ({ name: s.name, note: s.note ?? undefined }))
  if (db.tools.length) c.tools = db.tools.map((t) => t.name)

  if (db.projects.length) {
    c.projects = db.projects
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((p) => ({
        id: p.slug,
        meta: p.meta,
        title: p.title,
        copy: p.copy,
        description: p.description,
        tech: p.tech ?? [],
        github: p.github ?? undefined,
        demo: p.demo ?? undefined,
        annotation: p.annotation,
        coverImage: p.cover_image ?? (p.images && p.images.length > 0 ? p.images[0] : undefined),
        images: p.images && p.images.length > 0 ? p.images : (p.cover_image ? [p.cover_image] : []),
      }))
  }

  if (db.designPieces.length) {
    const pieces = db.designPieces
      .sort((a, b) => a.sort_order - b.sort_order)
      .filter((p) => !p.is_hero)
      .map((p) => ({
        id: p.slug,
        title: p.title,
        caption: p.caption,
        category: p.category,
        code: p.code ?? undefined,
        image: p.image ?? (p.images && p.images.length > 0 ? p.images[0] : undefined),
        storagePath: p.storage_path ?? (p.images && p.images.length > 0 ? p.images[0] : undefined),
        images: p.images && p.images.length > 0 ? p.images : (p.storage_path ? [p.storage_path] : (p.image ? [p.image] : [])),
        tags: p.tags ?? undefined,
        rotation: p.rotation,
        size: p.size as DesignPieceSize,
        art: p.art as DesignPieceArt,
        palette: p.palette && p.palette.length > 0 ? p.palette : ['#14120e', '#f1efe7', '#8b8579'],
      }))
    if (pieces.length) c.designPieces = pieces
  }

  if (db.about) {
    c.about = {
      bio: db.about.bio?.length ? db.about.bio : c.about.bio,
      journey:
        db.aboutJourney.length
          ? db.aboutJourney
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((j) => ({ year: j.year, text: j.text }))
          : c.about.journey,
      programming: db.about.programming || c.about.programming,
      graphic: db.about.graphic || c.about.graphic,
    }
  }

  if (db.theme) {
    const anchors: ThemeColors = {
      paper: db.theme.paper || DEFAULT_THEME.paper,
      paper2: db.theme.paper2 || DEFAULT_THEME.paper2,
      paper3: db.theme.paper3 || DEFAULT_THEME.paper3,
      card: db.theme.card || DEFAULT_THEME.card,
      ink: db.theme.ink || DEFAULT_THEME.ink,
      inkSoft: db.theme.ink_soft || DEFAULT_THEME.inkSoft,
      inkFaint: db.theme.ink_faint || DEFAULT_THEME.inkFaint,
      line: db.theme.line || DEFAULT_THEME.line,
    }
    c.colors = anchors
  }

  if (db.model3d) {
    c.model3D = {
      scale: db.model3d.scale ?? DEFAULT_MODEL3D.scale,
      posX: db.model3d.pos_x ?? DEFAULT_MODEL3D.posX,
      posY: db.model3d.pos_y ?? DEFAULT_MODEL3D.posY,
      yawDeg: db.model3d.yaw_deg ?? DEFAULT_MODEL3D.yawDeg,
      sway: db.model3d.sway ?? DEFAULT_MODEL3D.sway,
      enterVh: db.model3d.enter_vh ?? DEFAULT_MODEL3D.enterVh,
    }
  }

  return c
}

type DesignPieceSize = 'small' | 'medium' | 'large'
type DesignPieceArt =
  | 'logo'
  | 'poster'
  | 'identity'
  | 'type'
  | 'manip'
  | 'motion'
  | 'ui'
  | 'stamp'

/* ---------- localStorage (draft cache) ---------- */

function loadLocal(): SiteContent {
  if (typeof window === 'undefined') return defaultContent
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultContent
    const parsed = JSON.parse(raw) as Partial<SiteContent>
    const merged: SiteContent = {
      profile: { ...defaultContent.profile, ...(parsed.profile ?? {}) },
      nav: parsed.nav ?? defaultContent.nav,
      social: parsed.social ?? defaultContent.social,
      codeSkills: parsed.codeSkills ?? defaultContent.codeSkills,
      designSkills: parsed.designSkills ?? defaultContent.designSkills,
      tools: parsed.tools ?? defaultContent.tools,
      projects: parsed.projects ?? defaultContent.projects,
      designPieces: parsed.designPieces ?? defaultContent.designPieces,
      about: { ...defaultContent.about, ...(parsed.about ?? {}) },
      colors: { ...DEFAULT_THEME, ...(parsed.colors ?? {}) },
      model3D: { ...DEFAULT_MODEL3D, ...(parsed.model3D ?? {}) },
    }
    return merged
  } catch {
    return defaultContent
  }
}

function writeLocal(content: SiteContent) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content))
  } catch {
    /* storage unavailable */
  }
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(defaultContent)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  /* Load from Supabase on mount. Fall back to localStorage / defaults. */
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const db = await fetchAllContent()
      if (cancelled) return

      if (db && db.profile) {
        /* DB has content — use it as source of truth */
        const mapped = mapDbContent(db)
        setContent(mapped)
        writeLocal(mapped)
        setStatus('ready')
      } else {
        /* No DB content — fall back to cached draft, then defaults */
        setContent(loadLocal())
        setStatus('ready')
      }
    }

    load().catch(() => {
      if (!cancelled) {
        setContent(loadLocal())
        setStatus('error')
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const update = useCallback((patch: Partial<SiteContent>) => {
    setContent((prev) => {
      const next = { ...prev, ...patch }
      writeLocal(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* noop */
    }
    setContent(defaultContent)
  }, [])

  const save = useCallback(async (toSave?: SiteContent) => {
    const target = toSave ?? content
    const result = await saveAllContent(target)
    if (result.ok) {
      writeLocal(target)
    }
    return result
  }, [content])

  const value = useMemo(
    () => ({ content, update, reset, save, status }),
    [content, update, reset, save, status],
  )

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useContent(): ContentContextValue {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used inside <ContentProvider>')
  return ctx
}
