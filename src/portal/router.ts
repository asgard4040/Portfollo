import { portalScreen } from './screen'

/* Route in-page anchors (#about, #projects, …) through the portal math:
   the sections live inside the scrubbed screen, so the browser's default
   scrollIntoView can't reach them — we jump to the exact page position
   that puts the section at the top of the screen. */

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
  const y = portalScreen.targetFor(id)
  if (y === null) return
  e.preventDefault()
  window.scrollTo({ top: y, behavior: 'smooth' })
}