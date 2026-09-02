import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { navItems, profile, social } from '../data/site'
import { codeSkills, designSkills, tools } from '../data/skills'
import { projects } from '../data/projects'
import { designPieces } from '../data/design'
import { aboutContent } from '../data/about'
import { DEFAULT_MODEL3D, type Model3DSettings } from '../data/model3d'
import { DEFAULT_THEME, type ThemeColors } from './colors'

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
}

const ContentContext = createContext<ContentContextValue | null>(null)

function loadContent(): SiteContent {
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

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(loadContent)

  const update = useCallback((patch: Partial<SiteContent>) => {
    setContent((prev) => {
      const next = { ...prev, ...patch }
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        /* storage unavailable — keep in-memory edits */
      }
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

  const value = useMemo(() => ({ content, update, reset }), [content, update, reset])

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useContent(): ContentContextValue {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used inside <ContentProvider>')
  return ctx
}