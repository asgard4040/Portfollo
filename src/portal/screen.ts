/* Scroll layout for the "inside the computer" portal.
   The site starts at the Hero with the 3D retro computer.
   Scrolling immediately drives the zoom-through entry into the CRT screen.
   Once inside, further scrolling scrubs through the inner sections.
   This module is the single source of truth for turning page scrollY into
   progress, mapping section ids to exact scroll positions, and telling
   the navbar which section is active. */

import type { Model3DSettings } from '../data/model3d'

export interface SectionSlot {
  id: string
  offset: number
}

export interface ScreenLayout {
  start: number // 0
  enterPx: number // scroll pixels consumed by the dolly-in / screen entry
  travelMax: number // how far the inner content can translate
  range: number // total scroll range = enterPx + travelMax
  pEnter: number // fraction of `range` consumed by the dolly-in
  worldH: number // natural height of the inner content
  innerHeight: number
  sections: SectionSlot[]
}

let L: ScreenLayout | null = null

/* live 3D model tuning — the dashboard writes here for instant preview,
   and PinnedScreen's render loop reads it every frame */
const DEFAULT_M3D: Model3DSettings = {
  scale: 0.55,
  posX: 0.52,
  posY: 0.0,
  yawDeg: -75,
  sway: true,
  enterVh: 1.2,
}
let M3D: Model3DSettings = { ...DEFAULT_M3D }
let m3dRev = 0

export function currentIdAt(p: number): string {
  if (!L || L.travelMax <= 0) return 'about'
  if (p < L.pEnter * 0.6) return 'home'
  const e = Math.min(1, Math.max(0, (p - L.pEnter) / Math.max(0.0001, 1 - L.pEnter)))
  const k = e * L.travelMax
  let cur = 'about'
  for (const s of L.sections) {
    if (s.offset <= k + 60) cur = s.id
  }
  return cur
}

export const portalScreen = {
  set(layout: ScreenLayout | null) {
    L = layout
  },
  get() {
    return L
  },
  setModel(m: Model3DSettings) {
    M3D = { ...m }
    m3dRev++
  },
  model() {
    return M3D
  },
  modelRevision() {
    return m3dRev
  },
  /* exact scroll position that brings a section to the top of the screen */
  targetFor(id: string): number | null {
    if (id === 'home') return 0
    if (!L || !L.sections.length) return null
    const slot = L.sections.find((s) => s.id === id)
    if (!slot) return null
    return Math.round(L.enterPx + Math.min(L.travelMax, slot.offset))
  },
  /* which section the viewport is currently sitting on (for the navbar) */
  status(): string {
    const y = window.scrollY
    if (!L) return 'home'
    if (y < L.enterPx * 0.5) return 'home'
    const p = Math.min(1, Math.max(0, y / Math.max(1, L.range)))
    return currentIdAt(p)
  },
}