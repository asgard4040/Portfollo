import { IconSparkle, IconArrowUpRight } from './icons'
import { socialIcon } from './social'
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