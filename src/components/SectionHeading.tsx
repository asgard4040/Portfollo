import Reveal from './Reveal'
import Squiggle from './Squiggle'

interface SectionHeadingProps {
  index: string
  title: string
  note?: string
  dark?: boolean
}

export default function SectionHeading({
  index,
  title,
  note,
  dark = false,
}: SectionHeadingProps) {
  return (
    <Reveal className="relative mb-10 sm:mb-14">
      <p
        className={`micro-label ${dark ? 'text-night-soft/60' : 'text-ink-faint'}`}
      >
        {index}
      </p>
      <h2
        className={`mt-2 inline-block text-4xl leading-none tracking-tighter sm:text-6xl ${
          dark ? 'text-night-soft' : 'text-ink'
        }`}
      >
        {title}
        <Squiggle
          color={dark ? '#f4f2eb' : '#14120e'}
          className="absolute left-0 -bottom-1.5 sm:-bottom-2.5 h-3 w-full"
        />
      </h2>
      {note && (
        <p
          className={`micro-label mt-5 max-w-md ${
            dark ? 'text-night-soft/55' : 'text-ink-soft'
          }`}
        >
          {note}
        </p>
      )}
    </Reveal>
  )
}