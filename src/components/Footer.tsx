import { IconSparkle, IconArrowUpRight, IconPencil } from './icons'
import { socialIcon } from './social'
import { openDashboard } from './Dashboard'
import { useContent } from '../store/ContentContext'

export default function Footer() {
  const { content } = useContent()

  return (
    <footer className="relative bg-transparent px-4 pb-8 pt-4 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-sm text-ink-faint">
          <span>© {new Date().getFullYear()} {content.profile.name || 'Ali Imad'}</span>
          <IconSparkle className="h-3.5 w-3.5" />
          <span>make the web feel handmade</span>
          <button
            type="button"
            onClick={openDashboard}
            className="btn btn-outline btn-icon btn-sm btn-round ml-1"
            aria-label="Open site editor (Ctrl+Shift+E)"
            title="Site editor — Ctrl/⌘+Shift+E"
          >
            <IconPencil className="h-3 w-3" />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {content.social.map((l) => {
            const IconCmp = socialIcon(l.label)
            return (
              <a
                key={l.label + l.href}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost btn-sm btn-round"
              >
                <IconCmp className="h-4 w-4" />
                {l.label}
                <IconArrowUpRight className="h-3 w-3" />
              </a>
            )
          })}
        </div>
      </div>
    </footer>
  )
}