import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import SectionHeading from '../components/SectionHeading'
import ProjectPreview from '../components/ProjectPreview'
import { Icon, projectIcon, IconArrowUpRight, IconX } from '../components/icons'
import { useContent } from '../store/ContentContext'
import { getImageUrl } from '../utils/supabase/storage'
import type { Project } from '../data/projects'

function ProjectCard({
  project,
  onSelect,
}: {
  project: Project
  onSelect: (project: Project) => void
}) {
  return (
    <article
      onClick={() => onSelect(project)}
      className="group relative flex cursor-pointer flex-col bg-night text-night-soft transition-all duration-200 hover:bg-paper hover:text-ink focus-within:bg-paper focus-within:text-ink select-none"
    >
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
      <div className="px-5 pt-4 opacity-80 transition-opacity duration-200 group-hover:opacity-100 sm:px-7 sm:pt-5">
        <ProjectPreview project={project} />
      </div>

      {/* copy */}
      <div className="flex flex-1 flex-col px-5 pb-5 pt-5 sm:px-7 sm:pb-6 sm:pt-6">
        <h3 className="display text-[1.75rem] sm:text-4xl">{project.title}</h3>
        <p className="mt-2 font-hand text-xl text-night-soft/75 transition-colors duration-200 group-hover:text-ink/75">
          {project.copy}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-night-soft/60 transition-colors duration-200 group-hover:text-ink/60 line-clamp-3">
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
        <div className="flex items-center gap-2">
          <span className="micro-label flex items-center gap-1 font-bold underline decoration-dotted underline-offset-4 text-night-soft group-hover:text-ink transition-colors">
            Details
            <IconArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </article>
  )
}

export default function Projects() {
  const { content } = useContent()
  const [expanded, setExpanded] = useState(false)
  const [activeProject, setActiveProject] = useState<Project | null>(null)

  const allProjects = content.projects
  const visibleProjects = expanded ? allProjects : allProjects.slice(0, 4)

  // Keyboard navigation & body scroll lock for modal
  useEffect(() => {
    if (!activeProject) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveProject(null)
      } else if (e.key === 'ArrowRight') {
        const idx = allProjects.findIndex((p) => p.id === activeProject.id)
        if (idx !== -1 && idx < allProjects.length - 1) {
          setActiveProject(allProjects[idx + 1])
        } else if (idx === allProjects.length - 1) {
          setActiveProject(allProjects[0])
        }
      } else if (e.key === 'ArrowLeft') {
        const idx = allProjects.findIndex((p) => p.id === activeProject.id)
        if (idx > 0) {
          setActiveProject(allProjects[idx - 1])
        } else if (idx === 0) {
          setActiveProject(allProjects[allProjects.length - 1])
        }
      }
    }

    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [activeProject, allProjects])

  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Reset active image index whenever a different project is opened
  useEffect(() => {
    setActiveImageIndex(0)
  }, [activeProject?.id])

  const activeIndex = activeProject
    ? allProjects.findIndex((p) => p.id === activeProject.id)
    : -1

  const projectImages = activeProject
    ? activeProject.images && activeProject.images.length > 0
      ? activeProject.images
      : activeProject.coverImage
        ? [activeProject.coverImage]
        : []
    : []

  const currentImagePath = projectImages[activeImageIndex] ?? projectImages[0]
  const currentImageUrl = currentImagePath ? getImageUrl(currentImagePath) : null

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
          <ProjectCard
            key={project.id}
            project={project}
            onSelect={(p) => setActiveProject(p)}
          />
        ))}
      </div>

      {allProjects.length > 4 && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="btn btn-outline btn-round btn-lg flex items-center gap-2.5 shadow-paper transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>
              {expanded
                ? 'Show Less'
                : `View More Projects (+${allProjects.length - 4})`}
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

      {/* Project Details Modal — mounted via portal directly to document.body to center on viewport */}
      {activeProject &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
            style={{
              paddingTop: 'max(5.5rem, calc(env(safe-area-inset-top) + 4.5rem))',
              paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
            }}
            role="dialog"
            aria-modal="true"
            aria-label={`${activeProject.title} — project details`}
            onClick={() => setActiveProject(null)}
          >
            {/* Backdrop */}
            <div className="fixed inset-0 bg-night/90 backdrop-blur-md transition-opacity duration-300" />

            {/* Modal Container */}
            <div
              className="surface relative z-10 my-auto flex w-full max-w-4xl max-h-[86vh] flex-col overflow-y-auto shadow-paper-lg transition-all duration-300 md:flex-row md:overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left Column: Visual Artwork / Multi-Image Gallery Carousel */}
              <div className="relative flex-1 bg-night flex flex-col items-center justify-center overflow-hidden min-h-[260px] md:min-h-[460px] p-5 sm:p-6 pt-6 sm:pt-6">
                {currentImageUrl ? (
                  <div className="relative flex items-center justify-center w-full flex-1 min-h-[220px]">
                    <img
                      key={currentImageUrl}
                      src={currentImageUrl}
                      alt={`${activeProject.title} screenshot ${activeImageIndex + 1}`}
                      className="h-full w-full object-contain max-h-[44vh] md:max-h-[56vh] rounded-btn shadow-md mt-2 sm:mt-0 transition-opacity duration-200"
                    />

                    {/* Intra-project Image Prev / Next Navigation */}
                    {projectImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveImageIndex((prev) =>
                              prev > 0 ? prev - 1 : projectImages.length - 1,
                            )
                          }}
                          className="btn btn-outline btn-icon btn-sm btn-round absolute left-2 top-1/2 -translate-y-1/2 shadow-lg backdrop-blur-md"
                          aria-label="Previous image"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveImageIndex((prev) =>
                              prev < projectImages.length - 1 ? prev + 1 : 0,
                            )
                          }}
                          className="btn btn-outline btn-icon btn-sm btn-round absolute right-2 top-1/2 -translate-y-1/2 shadow-lg backdrop-blur-md"
                          aria-label="Next image"
                        >
                          ›
                        </button>

                        <span className="micro-label absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-mono text-white backdrop-blur-xs">
                          {activeImageIndex + 1} / {projectImages.length}
                        </span>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="w-full max-w-sm mt-2 sm:mt-0">
                    <ProjectPreview project={activeProject} />
                  </div>
                )}

                {/* Multiple Images Thumbnail Strip */}
                {projectImages.length > 1 && (
                  <div className="mt-3 flex w-full max-w-full items-center gap-2 overflow-x-auto pb-1 px-1 justify-start sm:justify-center">
                    {projectImages.map((imgPath, imgIdx) => {
                      const thumbUrl = getImageUrl(imgPath)
                      const isSelected = imgIdx === activeImageIndex
                      return (
                        <button
                          key={`${imgPath}-${imgIdx}`}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveImageIndex(imgIdx)
                          }}
                          className={`relative h-12 w-16 sm:h-14 sm:w-20 flex-shrink-0 overflow-hidden rounded-btn border transition-all ${
                            isSelected
                              ? 'border-white ring-2 ring-white/90 scale-105 shadow-md'
                              : 'border-white/20 opacity-50 hover:opacity-100'
                          }`}
                          aria-label={`View image ${imgIdx + 1}`}
                        >
                          <img
                            src={thumbUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Details & Actions */}
              <div className="flex w-full flex-col justify-between border-t border-line p-5 sm:p-8 md:w-[420px] md:border-l md:border-t-0 md:overflow-y-auto">
                <div>
                  {/* Meta header */}
                  <div className="flex items-center justify-between">
                    <span className="micro-label flex items-center gap-2 text-ink-faint">
                      <Icon name={projectIcon(activeProject.id)} className="h-4 w-4" />
                      {activeProject.meta}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveProject(null)}
                      className="btn btn-outline btn-icon btn-sm btn-round"
                      aria-label="Close"
                    >
                      <IconX className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Title and Tagline */}
                  <h2 className="display mt-4 text-2xl sm:text-3xl text-ink">
                    {activeProject.title}
                  </h2>
                  <p className="mt-1 font-hand text-xl text-ink-soft">
                    {activeProject.copy}
                  </p>

                  {/* Full Description */}
                  <div className="mt-4 border-t border-line pt-4">
                    <span className="micro-label text-ink-faint">About the project</span>
                    <p className="mt-2 text-sm sm:text-base leading-relaxed text-ink/90">
                      {activeProject.description}
                    </p>
                  </div>

                  {/* Tech Stack */}
                  <div className="mt-5 border-t border-line pt-4">
                    <span className="micro-label text-ink-faint">Technologies used</span>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {activeProject.tech.map((t) => (
                        <span key={t} className="chip chip-strong text-xs">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Annotation */}
                  {activeProject.annotation && (
                    <div className="mt-4 rounded-md border border-line/60 bg-paper-2/60 px-3 py-2">
                      <p className="font-hand text-base text-ink-soft">
                        ✦ {activeProject.annotation}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons & Bottom Navigation */}
                <div className="mt-8 border-t border-line pt-5">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {activeProject.demo ? (
                      <a
                        href={activeProject.demo}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-solid btn-lg flex-1 text-center"
                      >
                        Live Demo
                        <IconArrowUpRight className="h-4 w-4" />
                      </a>
                    ) : null}

                    {activeProject.github ? (
                      <a
                        href={activeProject.github}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-lg flex-1 text-center"
                      >
                        Source Code
                        <IconArrowUpRight className="h-4 w-4" />
                      </a>
                    ) : null}

                    {!activeProject.demo && !activeProject.github ? (
                      <a
                        href="#contact"
                        onClick={() => setActiveProject(null)}
                        className="btn btn-solid btn-lg w-full text-center"
                      >
                        Ask About This Project
                        <IconArrowUpRight className="h-4 w-4" />
                      </a>
                    ) : null}
                  </div>

                  {/* Navigation Footer */}
                  <div className="mt-5 flex items-center justify-between text-ink-faint font-mono text-xs">
                    <span>
                      0{activeIndex + 1} / 0{allProjects.length}
                    </span>

                    <div className="hidden md:flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const idx =
                            activeIndex > 0 ? activeIndex - 1 : allProjects.length - 1
                          setActiveProject(allProjects[idx])
                        }}
                        className="btn btn-outline btn-icon btn-sm btn-round"
                        aria-label="Previous project"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const idx =
                            activeIndex < allProjects.length - 1 ? activeIndex + 1 : 0
                          setActiveProject(allProjects[idx])
                        }}
                        className="btn btn-outline btn-icon btn-sm btn-round"
                        aria-label="Next project"
                      >
                        →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  )
}