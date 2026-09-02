/* Theme palette — the site is strictly monochrome, so the whole ramp is
   derived from two anchors: `paper` (light) and `ink` (dark). */ 

export interface ThemeColors {
  paper: string
  paper2: string
  paper3: string
  card: string
  ink: string
  inkSoft: string
  inkFaint: string
  line: string
}

export const DEFAULT_THEME: ThemeColors = {
  paper: '#f1efe7',
  paper2: '#eae6dc',
  paper3: '#e0dbcf',
  card: '#f8f6ef',
  ink: '#14120e',
  inkSoft: '#555149',
  inkFaint: '#8b8579',
  line: '#cfcabf',
}

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '').trim()
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const n = parseInt(h, 16)
  if (Number.isNaN(n)) return [20, 18, 14]
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function toHex(r: number, g: number, b: number): string {
  const c = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

export function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a)
  const [br, bg, bb] = hexToRgb(b)
  return toHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t)
}

/** Rebuild the full gray ramp from the two anchor colors. */
export function deriveTheme(paper: string, ink: string): ThemeColors {
  return {
    paper,
    ink,
    paper2: mix(paper, ink, 0.06),
    paper3: mix(paper, ink, 0.13),
    card: mix(paper, '#ffffff', 0.28),
    line: mix(paper, ink, 0.2),
    inkSoft: mix(paper, ink, 0.72),
    inkFaint: mix(paper, ink, 0.5),
  }
}

/** Everything Tailwind + the canvas read, as CSS custom properties. */
export function themeVars(theme: ThemeColors): Record<string, string> {
  const [ir, ig, ib] = hexToRgb(theme.ink)
  const shadow = (alpha: number) => `rgba(${ir},${ig},${ib},${alpha})`
  return {
    '--color-paper': theme.paper,
    '--color-paper-2': theme.paper2,
    '--color-paper-3': theme.paper3,
    '--color-card': theme.card,
    '--color-ink': theme.ink,
    '--color-ink-soft': theme.inkSoft,
    '--color-ink-faint': theme.inkFaint,
    '--color-line': theme.line,

    /* inverted (night) sections derive from the anchors too */
    '--color-night': theme.ink,
    '--color-night-soft': theme.paper,
    '--color-night-line': shadow(0.22),

    /* soft shadows follow the ink tone */
    '--shadow-paper': `0 1px 2px ${shadow(0.05)}, 0 10px 22px ${shadow(0.1)}`,
    '--shadow-paper-sm': `0 1px 3px ${shadow(0.08)}`,
    '--shadow-paper-lg': `0 4px 10px ${shadow(0.08)}, 0 22px 44px ${shadow(0.16)}`,
  }
}