import Reveal from '../components/Reveal'
import SectionHeading from '../components/SectionHeading'
import { Icon, skillIcon } from '../components/icons'
import { useContent } from '../store/ContentContext'
import type { Skill } from '../data/skills'

function Ledger({ title, note, skills }: { title: string; note: string; skills: Skill[] }) {
  return (
    <Reveal rot={note === 'the brain side' ? '-1deg' : '1deg'}>
      <div className="paper relative h-full overflow-hidden">
        <span className="tape absolute -top-2.5 left-8 h-5 w-16 -rotate-3" />
        <div className="flex items-baseline justify-between gap-3 border-b border-line px-5 pb-4 pt-6 sm:px-6">
          <h3 className="text-2xl font-bold tracking-tight text-ink">{title}</h3>
          <p className="font-hand text-lg text-ink-faint">{note}</p>
        </div>
        <ul className="divide-y divide-line">
          {skills.map((skill, i) => (
              <li key={skill.name}>
                <span className="group flex items-baseline justify-between gap-4 px-5 py-3.5 transition-colors duration-150 hover:bg-ink hover:text-paper sm:px-6">
                  <span className="flex items-center gap-4">
                    <Icon name={skillIcon(skill.name)} className="h-5 w-5 shrink-0 text-ink-faint group-hover:text-paper/70" />
                    <span className="micro-label w-6 text-ink-faint group-hover:text-paper/60">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-base font-semibold tracking-tight text-current sm:text-xl">
                      {skill.name}
                    </span>
                  </span>
                  {skill.note && (
                    <span className="hidden font-hand text-base text-ink-faint group-hover:text-paper/70 sm:block">
                      {skill.note}
                    </span>
                  )}
                </span>
              </li>
            ))}
        </ul>
      </div>
    </Reveal>
  )
}

export default function Skills() {
  const { content } = useContent()

  return (
    <section id="skills" className="border-t border-line px-4 py-16 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          index="02 / What I can do"
          title="The skill shelf"
          note="two toolboxes, one messy desk."
        />

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
          <Ledger title="Programming" note="the brain side" skills={content.codeSkills} />
          <div className="lg:mt-10">
            <Ledger title="Graphic Design" note="the feel side" skills={content.designSkills} />
          </div>
        </div>

        {/* note */}
        <Reveal className="mt-10">
          <p className="surface-muted rotate-[-0.4deg] px-5 py-4 text-center font-hand text-xl text-ink sm:text-2xl">
            psst — the best work happens where these two collide.
          </p>
        </Reveal>
      </div>
    </section>
  )
}