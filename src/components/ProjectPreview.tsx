import { getImageUrl } from '../utils/supabase/storage'
import type { Project } from '../data/projects'

export default function ProjectPreview({ project }: { project: Project }) {
  const coverUrl = getImageUrl(project.coverImage || (project.images && project.images[0]))

  if (coverUrl) {
    return (
      <div className="relative aspect-[16/9] w-full overflow-hidden border border-current/25 text-current" aria-hidden="true">
        <img
          src={coverUrl}
          alt={`${project.title} screenshot`}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <span className="micro-label absolute left-3 top-2 bg-paper/85 px-2 py-0.5 text-ink backdrop-blur-sm">
          {project.id}
        </span>
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-night/80 to-transparent px-3 pb-2 pt-8">
          <p className="font-hand text-sm text-paper">{project.copy}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden border border-current/25 text-current" aria-hidden="true">
      {/* wireframe bars */}
      <div className="absolute inset-x-4 inset-y-5 flex flex-col justify-between opacity-50">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-px w-2/3 bg-current" style={{ marginLeft: i === 1 ? 'auto' : 0 }} />
        ))}
      </div>
      {/* index marker */}
      <span className="micro-label absolute left-3 top-2 opacity-70">{project.id}</span>
      {/* center glyph */}
      <div className="relative">
        <div className="mx-auto mb-2 h-12 w-12 rounded-full border border-current/70" />
        <p className="text-right font-hand text-sm sm:text-base">{project.copy}</p>
      </div>
    </div>
  )
}
