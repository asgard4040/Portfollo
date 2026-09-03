import { useEffect, useRef, useState } from 'react'

function rgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '').trim()
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const n = parseInt(h, 16)
  if (Number.isNaN(n)) return [20, 18, 14]
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function readTheme() {
  const s = getComputedStyle(document.documentElement)
  const ink = rgb(s.getPropertyValue('--color-ink').trim() || '#14120e')
  const paper = rgb(s.getPropertyValue('--color-paper').trim() || '#f1efe7')
  return { ink, paper }
}

interface NodePoint {
  x: number
  y: number
  originX: number
  originY: number
  r: number
  vx: number
  vy: number
  pulse: number
  pulseSpeed: number
  type: 'particle' | 'star' | 'cross'
}

export default function BackgroundFX() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768
  })

  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)')
    const onResize = () => setIsMobile(coarse.matches || window.innerWidth < 768)
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    // If on mobile or user prefers reduced motion, do not create canvas or loop
    if (isMobile) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = 0
    let height = 0
    let raf = 0
    let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 }
    let time = 0

    const count = 55
    let nodes: NodePoint[] = []

    const spawnNode = (): NodePoint => {
      const x = Math.random() * (width || window.innerWidth)
      const y = Math.random() * (height || window.innerHeight)
      const types: ('particle' | 'star' | 'cross')[] = ['particle', 'particle', 'star', 'cross']
      return {
        x,
        y,
        originX: x,
        originY: y,
        r: 1.5 + Math.random() * 2.8,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        type: types[Math.floor(Math.random() * types.length)],
      }
    }

    const resize = () => {
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const onMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX
      mouse.targetY = e.clientY
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })

    const draw = () => {
      time += 0.015
      ctx.clearRect(0, 0, width, height)

      // Smooth mouse follow
      mouse.x += (mouse.targetX - mouse.x) * 0.08
      mouse.y += (mouse.targetY - mouse.y) * 0.08

      const { ink } = readTheme()
      const inkRgb = `${ink[0]}, ${ink[1]}, ${ink[2]}`

      // 1. Ambient fluid glowing atmospheric orbs
      const orb1X = width * 0.25 + Math.sin(time * 0.4) * 80
      const orb1Y = height * 0.3 + Math.cos(time * 0.3) * 60
      const g1 = ctx.createRadialGradient(orb1X, orb1Y, 10, orb1X, orb1Y, 380)
      g1.addColorStop(0, `rgba(${inkRgb}, 0.045)`)
      g1.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = g1
      ctx.beginPath()
      ctx.arc(orb1X, orb1Y, 380, 0, Math.PI * 2)
      ctx.fill()

      const orb2X = width * 0.75 + Math.cos(time * 0.35) * 90
      const orb2Y = height * 0.7 + Math.sin(time * 0.45) * 70
      const g2 = ctx.createRadialGradient(orb2X, orb2Y, 10, orb2X, orb2Y, 440)
      g2.addColorStop(0, `rgba(${inkRgb}, 0.04)`)
      g2.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = g2
      ctx.beginPath()
      ctx.arc(orb2X, orb2Y, 440, 0, Math.PI * 2)
      ctx.fill()

      // 2. Interactive Constellation Lines between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const maxDist = 135
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.18
            ctx.strokeStyle = `rgba(${inkRgb}, ${alpha.toFixed(3)})`
            ctx.lineWidth = 0.8
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }

        // Mouse connection
        const mdx = a.x - mouse.x
        const mdy = a.y - mouse.y
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy)
        if (mDist < 160) {
          const mAlpha = (1 - mDist / 160) * 0.35
          ctx.strokeStyle = `rgba(${inkRgb}, ${mAlpha.toFixed(3)})`
          ctx.lineWidth = 1.0
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.stroke()

          // Gentle mouse push
          const pushForce = (1 - mDist / 160) * 1.8
          a.x += (mdx / (mDist || 1)) * pushForce
          a.y += (mdy / (mDist || 1)) * pushForce
        }
      }

      // 3. Draw Nodes (Particles, Stars, Crosses)
      for (const n of nodes) {
        n.pulse += n.pulseSpeed
        n.x += n.vx
        n.y += n.vy
        // Wrap around bounds
        if (n.x < -20) n.x = width + 20
        if (n.x > width + 20) n.x = -20
        if (n.y < -20) n.y = height + 20
        if (n.y > height + 20) n.y = -20

        const pulseScale = 0.8 + 0.35 * Math.sin(n.pulse)
        const nodeAlpha = 0.25 + 0.35 * Math.sin(n.pulse)

        ctx.fillStyle = `rgba(${inkRgb}, ${nodeAlpha.toFixed(3)})`
        ctx.strokeStyle = `rgba(${inkRgb}, ${nodeAlpha.toFixed(3)})`

        if (n.type === 'particle') {
          ctx.beginPath()
          ctx.arc(n.x, n.y, n.r * pulseScale, 0, Math.PI * 2)
          ctx.fill()
        } else if (n.type === 'cross') {
          const s = 3.5 * pulseScale
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.moveTo(n.x - s, n.y)
          ctx.lineTo(n.x + s, n.y)
          ctx.moveTo(n.x, n.y - s)
          ctx.lineTo(n.x, n.y + s)
          ctx.stroke()
        } else if (n.type === 'star') {
          const s = 2.8 * pulseScale
          ctx.beginPath()
          ctx.arc(n.x, n.y, s, 0, Math.PI * 2)
          ctx.fill()
          // Diamond glint
          ctx.lineWidth = 0.8
          ctx.beginPath()
          ctx.moveTo(n.x - s * 2, n.y)
          ctx.lineTo(n.x + s * 2, n.y)
          ctx.moveTo(n.x, n.y - s * 2)
          ctx.lineTo(n.x, n.y + s * 2)
          ctx.stroke()
        }
      }

      if (!running) return
      raf = requestAnimationFrame(draw)
    }

    let running = true
    let scrollTimer = 0
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }
    const start = () => {
      if (running || document.hidden) return
      running = true
      raf = requestAnimationFrame(draw)
    }
    const onScrollResume = () => {
      window.clearTimeout(scrollTimer)
      stop()
      scrollTimer = window.setTimeout(start, 120)
    }
    const onVisibility = () => {
      if (document.hidden) stop()
      else start()
    }
    window.addEventListener('scroll', onScrollResume, { passive: true })
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)
    resize()
    nodes = Array.from({ length: count }, spawnNode)
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(scrollTimer)
      window.removeEventListener('scroll', onScrollResume)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [isMobile])

  if (isMobile) return null

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-100 hidden md:block"
      style={{ mixBlendMode: 'multiply' }}
      aria-hidden="true"
    />
  )
}