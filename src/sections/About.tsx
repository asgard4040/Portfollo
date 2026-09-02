import Reveal from '../components/Reveal'
import SectionHeading from '../components/SectionHeading'
import { IconSparkle } from '../components/icons'
import { useContent } from '../store/ContentContext'
import { getImageUrl } from '../utils/supabase/storage'

const VALUES = ['Clean Architecture', 'Human-Centric UX', 'Pixel Perfection', 'Fast Iteration']

export default function About() {
  const { content } = useContent()
  const { bio } = content.about
  const { tools, profile } = content

  const quote = bio[0] ?? 'Bridging clean code with crafted visual identities.'
  const subtitle =
    bio[1] ??
    'Building software that feels good to use: rigorous logic under the hood and refined charm on the surface.'

  return (
    <section
      id="about"
      className="relative overflow-hidden border-t border-line bg-transparent px-4 py-16 sm:px-8 sm:py-28"
    >
      <div className="relative z-10 mx-auto max-w-6xl">
        <SectionHeading
          index="Profile & Philosophy"
          title="The Mind & The Method"
          note="a glimpse into how I think, build, and design."
        />

        <div className="mt-10 grid gap-4 sm:mt-14 sm:gap-6 md:grid-cols-12">

          {/* Portrait — the single card that replaces the old metric tiles */}
          <Reveal className="md:col-span-5 md:order-2">
            <figure className="surface surface-lift flex h-full flex-col overflow-hidden">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-paper-2 sm:aspect-[4/5]">
                <img
                  src={getImageUrl(profile.photoStoragePath, profile.photo)}
                  alt={`${profile.name} — portrait`}
                  loading="lazy"
                  className="h-full w-full object-cover object-center"
                />
                <span className="micro-label absolute left-3 top-3 rounded-chip border border-line bg-paper/85 px-2.5 py-1 text-ink-soft backdrop-blur-sm">
                  {profile.firstName}
                </span>
              </div>

              <figcaption className="flex items-center justify-between gap-3 border-t border-line px-4 py-4 sm:px-5">
                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-ink sm:text-lg">{profile.name}</p>
                  <p className="truncate text-xs text-ink-soft sm:text-sm">{profile.role}</p>
                </div>
                <p className="hidden shrink-0 font-hand text-lg text-ink-faint sm:block">
                  {profile.photoCaption}
                </p>
              </figcaption>
            </figure>
          </Reveal>

          {/* Core statement */}
          <Reveal className="md:col-span-7 md:order-1">
            <div className="surface surface-lift flex h-full flex-col justify-between p-5 sm:p-8">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="chip">
                    <IconSparkle className="h-3.5 w-3.5 text-ink" />
                    <span className="micro-label">Core Philosophy</span>
                  </span>
                  <span className="micro-label text-ink-faint">ALI IMAD // 2026</span>
                </div>

                <blockquote className="mt-6 text-xl font-bold leading-snug text-ink sm:mt-7 sm:text-3xl">
                  &ldquo;{quote}&rdquo;
                </blockquote>

                <p className="mt-4 text-sm leading-relaxed text-ink-soft sm:mt-5 sm:text-lg">
                  {subtitle}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-5 sm:mt-8 sm:pt-6">
                {VALUES.map((val) => (
                  <span key={val} className="chip">
                    ✦ {val}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Tools strip */}
          <Reveal delay={120} className="md:col-span-12 md:order-3">
            <div className="surface flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-7">
              <div className="min-w-0">
                <span className="micro-label text-ink-faint">Tools on the workbench</span>
                <p className="mt-1.5 text-sm text-ink-soft">
                  What I reach for daily to ideate, write code, and create.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {tools.map((tool) => (
                  <span key={tool} className="chip chip-strong">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  )
}
