import { useState } from 'react'
import SectionHeading from '../components/SectionHeading'
import ProjectPreview from '../components/ProjectPreview'
import { Icon, projectIcon, IconArrowUpRight } from '../components/icons'
import { useContent } from '../store/ContentContext'
import type { Project } from '../data/projects'

function ProjectCard({ project }: { project: Project }) {
  const hasLink = Boolean(project.github || project.demo)
  return (
    <article className="group relative flex flex-col bg-night text-night-soft transition-colors duration-200 hover:bg-paper hover:text-ink focus-within:bg-paper focus-within:text-ink">
      {/* top micro meta */}
      <div className="flex items-baseline justify-between px-5 pt-5 sm:px-7 sm:pt-6">
        <span className="micro-label flex items-center gap-2 text-night-soft/60 transition-colors duration-200 group-hover:text-ink/60">
          <Icon name={projectIcon(project.id)} className="h-4 w-4" />
          {project.meta}
        </span>
        <span className="micro-label text-night-soft/40 transition-colors duration-200 group-hover:text-ink/40">
          {project.id.toUpperCase()}
        </span>
      </div>

      {/* preview */}
      <div className="px-5 pt-4 opacity-80 sm:px-7 sm:pt-5">
        <ProjectPreview project={project} />
      </div>

      {/* copy */}
      <div className="flex flex-1 flex-col px-5 pb-5 pt-5 sm:px-7 sm:pb-6 sm:pt-6">
        <h3 className="display text-[1.75rem] sm:text-4xl">{project.title}</h3>
        <p className="mt-2 font-hand text-xl text-night-soft/75 transition-colors duration-200 group-hover:text-ink/75">
          {project.copy}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-night-soft/60 transition-colors duration-200 group-hover:text-ink/60">
          {project.description}
        </p>
      </div>

      {/* footer row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-night-line px-5 py-4 transition-colors duration-200 group-hover:border-line sm:px-7">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {project.tech.map((t) => (
            <span
              key={t}
              className="micro-label text-night-soft/55 transition-colors duration-200 group-hover:text-ink/55"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {hasLink && (
            <a
              href={project.demo ?? project.github}
              target="_blank"
              rel="noreferrer"
              className={`micro-label flex items-center gap-1 underline decoration-dotted underline-offset-4 transition-colors ${
                project.demo ? '' : 'sm:hidden'
              }`}
            >
              open
              <IconArrowUpRight className="h-3.5 w-3.5" />
            </a>
          )}
          <p className="font-hand text-base opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {project.annotation}
          </p>
        </div>
      </div>
    </article>
  )
}

export default function Projects() {
  const { content } = useContent()
  const [expanded, setExpanded] = useState(false)

  const visibleProjects = expanded ? content.projects : content.projects.slice(0, 4)

  return (
    <section id="projects" className="bg-night px-4 py-16 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          index="03 / Things I built"
          title="Projects"
          note="looking for anomalies in my own notebook."
          dark
        />
      </div>

      <div
        className={`mx-auto grid max-w-6xl gap-px overflow-hidden rounded-card border border-night-line bg-night-line sm:grid-cols-2 ${
          expanded ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
        }`}
      >
        {visibleProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {content.projects.length > 4 && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="btn btn-outline btn-round btn-lg flex items-center gap-2.5 shadow-paper transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>
              {expanded ? 'Show Less' : `View More Projects (+${content.projects.length - 4})`}
            </span>
            <span
              className="text-xs transition-transform duration-200"
              style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
            >
              ▼
            </span>
          </button>
        </div>
      )}
    </section>
  )
}