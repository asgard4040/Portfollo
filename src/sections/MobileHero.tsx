import { useEffect, useRef } from 'react'
import Squiggle from '../components/Squiggle'
import { IconCode, IconPen, IconArrowUpRight } from '../components/icons'
import { useContent } from '../store/ContentContext'

export default function MobileHero() {
  const { content } = useContent()
  const { profile } = content
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Pause video decoding when hero is off-screen to save 100% GPU/CPU decoder work
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: 0.05 },
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  const handleScrollTo = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    const target = document.getElementById(id)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden px-5 pb-8 pt-20"
    >
      {/* Background Header Video */}
      <video
        ref={videoRef}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        src={(import.meta.env.BASE_URL || '/') + 'header.mp4'}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />

      {/* Atmospheric gradient overlay for contrast and paper blending */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(10,8,6,0.55) 0%, rgba(10,8,6,0.25) 40%, color-mix(in srgb, var(--color-paper) 75%, transparent) 80%, var(--color-paper) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Main hero statement */}
      <div className="relative z-10 my-auto pt-6">
        <p className="micro-label mb-3 inline-flex items-center gap-2 rounded-full border border-line/60 bg-paper/85 px-3 py-1 text-xs text-ink backdrop-blur-sm shadow-sm">
          <IconCode className="h-3.5 w-3.5" />
          <span>{profile.role}</span>
          <IconPen className="h-3.5 w-3.5" />
        </p>

        <h1 className="display text-[clamp(3.2rem,13vw,5.5rem)] leading-[0.92] text-ink drop-shadow-sm">
          I&apos;m{' '}
          <span className="relative inline-block whitespace-nowrap">
            {profile.firstName}
            <Squiggle className="absolute -bottom-1 left-0 h-2.5 w-full text-ink" />
          </span>
          <span className="block mt-1">Dev &amp;</span>
          <span className="block">Designer</span>
        </h1>

        <p className="mt-4 max-w-md text-base leading-relaxed text-ink/90 font-medium drop-shadow-xs">
          {profile.intro}
        </p>

        {profile.currently && (
          <div className="mt-4 inline-block rounded-md border border-line/50 bg-paper/75 px-3 py-1 backdrop-blur-xs">
            <p className="font-hand text-base text-ink-soft">
              currently {profile.currently}
            </p>
          </div>
        )}
      </div>

      {/* CTA action buttons anchored at bottom */}
      <div className="relative z-10 pt-4">
        <div className="flex w-full gap-3">
          <a
            href="#projects"
            onClick={(e) => handleScrollTo('projects', e)}
            className="btn btn-solid btn-lg flex-1 shadow-paper"
          >
            View my work
            <IconArrowUpRight className="h-4 w-4" />
          </a>
          <a
            href="#contact"
            onClick={(e) => handleScrollTo('contact', e)}
            className="btn btn-outline btn-lg flex-1 border-ink/30 bg-paper/80 backdrop-blur-sm"
          >
            Contact
            <IconArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
