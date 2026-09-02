import { useRef } from 'react'
import Reveal from '../components/Reveal'
import Squiggle from '../components/Squiggle'
import { DrawArrow } from '../components/Doodles'
import { IconCode, IconPen, IconArrowUpRight } from '../components/icons'
import useParallax from '../hooks/useParallax'
import { useContent } from '../store/ContentContext'

export default function Hero() {
  const { content } = useContent()
  const { profile } = content
  const markRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useParallax([{ strength: 0.3, ref: markRef }], 12)

  return (
    <section
      ref={stageRef}
      id="home"
      className="relative flex min-h-screen items-start pt-3 sm:items-center sm:pt-0 overflow-hidden px-4 pb-12 sm:px-8 sm:pb-16 lg:px-12"
    >
      {/* faint outer marks */}
      <div className="pointer-events-none absolute inset-0 text-ink-faint" aria-hidden="true">
        <div ref={markRef} className="absolute inset-0">
          <p className="micro-label absolute right-6 top-28 hidden lg:block">( 2026 )</p>
          <p className="absolute bottom-24 left-6 hidden rotate-90 font-hand text-lg lg:block">
            sketchbook / 01
          </p>
          <span className="absolute right-[7%] bottom-[18%] hidden h-2 w-2 rounded-full bg-ink/40 lg:block" />
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-6xl sm:translate-y-[6vh]">
        {/* Left — statement */}
        <Reveal className="relative max-w-xl md:max-w-md lg:max-w-xl">
          <p className="micro-label mb-4 sm:mb-7 flex items-center gap-2 text-sm sm:text-base text-ink-faint">
            <IconCode className="h-4 w-4" />
            {profile.role}
            <IconPen className="h-4 w-4" />
          </p>

          <h1 className="display text-[clamp(3.4rem,11.5vw,6.5rem)] leading-[0.90] text-ink">
            I&apos;m{' '}
            <span className="relative inline-block whitespace-nowrap">
              {profile.firstName}
              <Squiggle className="absolute -bottom-1 left-0 h-3 w-full sm:-bottom-2" />
            </span>
            <span className="block mt-1 sm:mt-2">Dev &amp;</span>
            <span className="block">Designer</span>
          </h1>

          <p className="mt-4 sm:mt-8 text-base sm:text-xl leading-relaxed text-ink-soft">
            {profile.intro}
          </p>

          {/* currently building annotation (hidden on phones) */}
          <div className="hidden sm:inline-block relative mt-6 sm:mt-8">
            <p className="tape absolute -inset-x-2 -inset-y-1 -z-10" />
            <p className="font-hand text-lg sm:text-xl text-ink-soft">
              currently {profile.currently}
            </p>
            <DrawArrow className="absolute -right-14 -top-4 hidden w-12 sm:block sm:w-14 sm:-right-16" />
          </div>

          {/* CTA row — two equal columns on phones, natural width above */}
          <div className="btn-row mt-7 sm:mt-10 sm:flex sm:flex-wrap sm:gap-4">
            <a href="#projects" className="btn btn-solid btn-lg">
              View my work
              <IconArrowUpRight className="h-4 w-4" />
            </a>
            <a href="#contact" className="btn btn-outline btn-lg">
              Contact
              <IconArrowUpRight className="h-4 w-4" />
            </a>
          </div>

        </Reveal>

        {/* scroll hint — pinned to the bottom of the stage so it stays out of
            the heading's vertical rhythm */}
        <p className="pointer-events-none absolute -bottom-[9vh] left-0 hidden items-center gap-3 font-hand text-xl text-ink-faint sm:flex">
          <span className="h-px w-12 bg-ink-faint" />
          scroll to enter the computer screen ▸
        </p>
      </div>
    </section>
  )
}