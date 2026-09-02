import { useEffect, useRef } from 'react'

/* Subtle mouse parallax for desktop. Applies small translate/rotate
   offsets to child elements based on cursor position. Automatically
   disabled on touch devices and when prefers-reduced-motion is set. */

interface ParallaxItem {
  strength: number
  ref: React.RefObject<HTMLElement | null>
}

export default function useParallax(
  items: ParallaxItem[],
  maxShift = 12,
) {
  const sectionRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    // Skip on touch / reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(hover: none)').matches) return

    let raf = 0

    const onMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect()
      const cx = (e.clientX - rect.left) / rect.width - 0.5
      const cy = (e.clientY - rect.top) / rect.height - 0.5

      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        items.forEach((item) => {
          const el = item.ref.current
          if (!el) return
          const strength = item.strength * maxShift
          el.style.transform = `translate3d(${cx * strength}px, ${cy * strength}px, 0)`
        })
      })
    }

    const onLeave = () => {
      items.forEach((item) => {
        if (item.ref.current) item.ref.current.style.transform = ''
      })
    }

    section.addEventListener('mousemove', onMove, { passive: true })
    section.addEventListener('mouseleave', onLeave)
    return () => {
      section.removeEventListener('mousemove', onMove)
      section.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [items, maxShift])

  return sectionRef
}
