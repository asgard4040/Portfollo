import type { SiteContent } from '../store/ContentContext'
import type { Project } from '../data/projects'
import type { DesignPiece } from '../data/design'
import { IconArrowUpRight } from './icons'

/* A live mockup of the portfolio page, rendered from the current draft.
   Shown inside the editor so changes can be seen before saving. */

const SIZE_H: Record<DesignPiece['size'], string> = {
  small: 'h-14',
  medium: 'h-24',
  large: 'h-36',
}

function MiniProject({ p }: { p: Project }) {
  const coverUrl = p.coverImage
    ? `https://btuejeztbeisdivywrnx.supabase.co/storage/v1/object/public/images/${p.coverImage}`
    : ''
  return (
    <div className="flex flex-col justify-between rounded-sm bg-night text-night-soft">
      {coverUrl && (
        <img
          src={coverUrl}
          alt=""
          className="mb-2 aspect-[16/9] w-full rounded-sm object-cover"
        />
      )}
      <div className="flex items-center justify-between">
        <span className="font-bold uppercase text-[8px] tracking-widest text-night-soft/50">
          {p.meta || p.id}
        </span>
        <span className="text-[8px] font-semibold uppercase tracking-widest text-night-soft/30">
          {p.id.toUpperCase()}
        </span>
      </div>
      <p className="mt-2 text-[13px] font-extrabold leading-none tracking-tight text-night-soft">
        {p.title}
      </p>
      <p className="mt-1 text-[10px] italic text-night-soft/60">{p.copy}</p>
      <div className="mt-2 flex items-center justify-between border-t border-night-line pt-1.5">
        <span className="max-w-[60%] truncate text-[8px] uppercase tracking-widest text-night-soft/45">
          {p.tech.join(' · ')}
        </span>
        <IconArrowUpRight className="h-3 w-3 shrink-0 text-night-soft/60" />
      </div>
    </div>
  )
}

function MiniPiece({ p }: { p: DesignPiece }) {
  const [dark, paper, mid] = p.palette
  const imgUrl = p.storagePath
    ? `https://btuejeztbeisdivywrnx.supabase.co/storage/v1/object/public/images/${p.storagePath}`
    : ''
  return (
    <div
      className={`${SIZE_H[p.size]} flex flex-col justify-between rounded-sm p-2`}
      style={{ backgroundColor: paper, border: '1px solid ' + mid }}
      title={p.caption}
    >
      {imgUrl ? (
        <img src={imgUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <>
          <div className="flex justify-between">
            <span className="text-[9px] font-extrabold tracking-tight" style={{ color: dark }}>
              {p.title}
            </span>
            <span className="rounded-full px-1.5 text-[7px] font-bold uppercase tracking-widest" style={{ backgroundColor: dark, color: paper }}>
              {p.category}
            </span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-[8px] italic" style={{ color: mid }}>
              {p.caption}
            </span>
            <span className="flex gap-0.5">
              {p.palette.map((c) => (
                <span key={c} className="h-2 w-2 rounded-full border border-black/10" style={{ backgroundColor: c }} />
              ))}
            </span>
          </div>
        </>
      )}
    </div>
  )
}

export default function MockPreview({ draft, tab }: { draft: SiteContent; tab: string }) {
  const { profile } = draft
  const sections: Record<string, React.ReactNode> = {
    profile: (
      <>
        <p className="text-[9px] uppercase tracking-widest text-ink-faint">
          {profile.role} · 2026
        </p>
        <h1 className="mt-1 text-[22px] font-extrabold leading-none tracking-tight text-ink">
          I&apos;m {profile.firstName},
          <span className="block">Dev &amp; Designer</span>
        </h1>
        <p className="mt-2 line-clamp-3 text-[9px] leading-snug text-ink-soft">{profile.intro}</p>
        <div className="mt-3 flex items-center gap-5">
          <span className="relative grid h-14 w-14 place-items-center">
            <span className="absolute inset-0 rounded-full border border-ink/25" />
            <span className="h-6 w-6 rounded-full border border-ink/45" />
            <span className="h-1 w-1 rounded-full bg-ink/50" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-ink">the paper globe</p>
            <p className="text-[8px] uppercase tracking-widest text-ink-faint">
              scroll to spin · tilt on mobile
            </p>
          </div>
        </div>
      </>
    ),
    menu: (
      <>
        <div className="flex items-center justify-between rounded-full border border-line bg-card px-3 py-1.5">
          <p className="font-hand text-[13px] text-ink">{profile.name}</p>
          <div className="flex items-center gap-1">
            {draft.nav.slice(0, 6).map((n, i) => (
              <span
                key={n.href}
                className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide ${
                  i === 0 ? 'bg-ink text-paper' : 'text-ink-faint'
                }`}
              >
                {n.label}
              </span>
            ))}
          </div>
        </div>
      </>
    ),
    skills: (
      <div>
        <p className="micro-label mb-1.5 text-[8px]">Coding</p>
        {draft.codeSkills.map((s, i) => (
          <div key={i} className="flex items-baseline justify-between border-b border-line py-1">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-ink">
              <span className="text-[8px] text-ink-faint">{String(i + 1).padStart(2, '0')}</span>
              {s.name}
            </span>
            {s.note && <span className="text-[9px] italic text-ink-faint">{s.note}</span>}
          </div>
        ))}
        <div className="mt-1 flex flex-wrap gap-1">
          {draft.tools.map((t) => (
            <span key={t} className="rounded-full border border-line px-1.5 py-0.5 text-[8px] text-ink-soft">
              {t}
            </span>
          ))}
        </div>
      </div>
    ),
    projects: (
      <div className="grid grid-cols-2 gap-2">
        {draft.projects.slice(0, 4).map((p) => (
          <MiniProject key={p.id} p={p} />
        ))}
      </div>
    ),
    design: (
      <div className="grid grid-cols-2 gap-2">
        {draft.designPieces.slice(0, 6).map((p) => (
          <MiniPiece key={p.id} p={p} />
        ))}
      </div>
    ),
    about: (
      <div>
        {draft.about.bio.map((b, i) => (
          <p key={i} className="mb-1.5 text-[9px] leading-snug text-ink-soft">
            {b}
          </p>
        ))}
        <div className="mt-2 space-y-1">
          {draft.about.journey.map((j, i) => (
            <div key={i} className="flex gap-2 text-[9px]">
              <span className="w-9 shrink-0 font-bold text-ink">{j.year}</span>
              <span className="text-ink-soft">{j.text}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    contact: (
      <div className="rounded-sm border border-line bg-card p-3">
        <p className="font-hand text-[14px] text-ink-soft">leave a note…</p>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <span className="rounded-sm border border-line bg-paper px-2 py-1 text-[9px]">your name</span>
          <span className="rounded-sm border border-line bg-paper px-2 py-1 text-[9px]">you@email.com</span>
          <span className="col-span-2 rounded-sm border border-line bg-paper px-2 py-2 text-[9px]">message…</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {draft.social.map((l) => (
            <span key={l.label} className="text-[9px] font-bold text-ink-soft">
              {l.label} ↗
            </span>
          ))}
        </div>
      </div>
    ),
  }

  return (
    <div className="mx-auto flex min-h-[420px] w-full max-w-sm flex-col">
      {/* browser chrome */}
      <div className="relative rounded-t-lg border border-line bg-card px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-ink/20" />
          <span className="h-2 w-2 rounded-full bg-ink/20" />
          <span className="h-2 w-2 rounded-full bg-ink/20" />
          <span className="ml-3 flex-1 rounded-full border border-line bg-paper px-3 py-0.5 text-center text-[8px] text-ink-faint">
            ali-imad.dev
          </span>
        </div>
      </div>

      {/* page mock */}
      <div className="flex flex-1 flex-col gap-3 overflow-hidden rounded-b-lg border-x border-b border-line bg-paper p-4">
        {sections[tab] ?? sections.profile}
        <div className="mt-auto flex items-center justify-between border-t border-line pt-2">
          <span className="text-[8px] uppercase tracking-widest text-ink-faint">live from draft</span>
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink/60" />
        </div>
      </div>
    </div>
  )
}