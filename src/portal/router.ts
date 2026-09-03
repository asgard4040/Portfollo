import { portalScreen } from './screen'

/* Route in-page anchors (#about, #projects, …):
   - On desktop, sections live inside the scrubbed screen, so we jump to
     the exact page position that puts the section at the top of the screen.
   - On mobile/touch, sections live in the standard document flow, so we
     smoothly scroll to the target element. */

let started = false

export function initRouter() {
  if (started) return
  started = true
  document.addEventListener('click', onClick)
}

export function destroyRouter() {
  started = false
  document.removeEventListener('click', onClick)
}

function onClick(e: MouseEvent) {
  const target = e.target as HTMLElement | null
  const anchor = target?.closest?.('a[href^="#"]') as HTMLAnchorElement | null
  if (!anchor) return
  const id = anchor.getAttribute('href')?.slice(1) ?? ''
  if (!id) return

  const isCoarse =
    typeof window !== 'undefined' &&
    (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768)

  if (isCoarse) {
    if (id === 'home') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const targetEl = document.getElementById(id)
    if (targetEl) {
      e.preventDefault()
      targetEl.scrollIntoView({ behavior: 'smooth' })
      return
    }
  }

  const y = portalScreen.targetFor(id)
  if (y === null) return
  e.preventDefault()
  window.scrollTo({ top: y, behavior: 'smooth' })
}