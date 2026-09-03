import { useEffect, useRef, useState } from 'react'
import { useContent, defaultContent, type SiteContent } from '../store/ContentContext'
import { deriveTheme, DEFAULT_THEME, type ThemeColors } from '../store/colors'
import { portalScreen } from '../portal/screen'
import MockPreview from './MockPreview'
import ImageUpload from './ImageUpload'
import MultiImageUpload from './MultiImageUpload'
import GalleryPaletteField from './GalleryPaletteField'
import { getImageUrl } from '../utils/supabase/storage'
import { extractPaletteFromImage } from '../utils/palette'
import {
  IconPlus,
  IconTrash,
  IconX,
  IconChevronUp,
  IconChevronDown,
  IconHome,
  IconUser,
  IconLayers,
  IconFolder,
  IconPen,
  IconMail,
  IconSparkle,
  IconMonitor,
  IconPencil,
  IconArrowUpRight,
  IconPalette,
  IconLock,
} from './icons'
import type { DesignPiece } from '../data/design'
import type { Model3DSettings } from '../data/model3d'

type Tab =
  | 'profile'
  | 'menu'
  | 'skills'
  | 'projects'
  | 'design'
  | 'about'
  | 'contact'
  | '3d'
  | 'colors'

const TABS: { id: Tab; label: string; icon: typeof IconHome; note: string }[] = [
  { id: 'profile', label: 'Profile', icon: IconUser, note: 'name, role, intro and portrait photo.' },
  { id: 'menu', label: 'Menu', icon: IconHome, note: 'the links in the top navigation.' },
  { id: 'skills', label: 'Skills', icon: IconLayers, note: 'coding, graphic design and desk tools.' },
  { id: 'projects', label: 'Projects', icon: IconFolder, note: 'the dark work cards with links.' },
  { id: 'design', label: 'Design', icon: IconPen, note: 'the pinned collage pieces.' },
  { id: 'about', label: 'About', icon: IconSparkle, note: 'bio, timeline and the two blurbs.' },
  { id: 'contact', label: 'Contact', icon: IconMail, note: 'the social / contact links.' },
  { id: '3d', label: '3D model', icon: IconMonitor, note: 'scale, position, rotation and dolly of the computer.' },
  { id: 'colors', label: 'Colors', icon: IconPalette, note: 'paper & ink anchors that tint the whole site.' },
]

/* ---------- field helpers ---------- */

function Field({
  label,
  value,
  onChange,
  hint,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  hint?: string
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input
        className="field-input"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? <span className="mt-1 block text-[11px] text-ink-faint">{hint}</span> : null}
    </label>
  )
}

function Area({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <textarea
        className="field-input"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <select
        className="field-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}

function TechTagsField({
  value,
  onChange,
}: {
  value: string[]
  onChange: (tech: string[]) => void
}) {
  const [text, setText] = useState(() => (value || []).join(', '))
  const isFocusedRef = useRef(false)

  useEffect(() => {
    if (!isFocusedRef.current) {
      setText((value || []).join(', '))
    }
  }, [value])

  const handleInputChange = (raw: string) => {
    setText(raw)
    const parsed = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    onChange(parsed)
  }

  const handleBlur = () => {
    isFocusedRef.current = false
    const parsed = text
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    setText(parsed.join(', '))
    onChange(parsed)
  }

  const removeTag = (indexToRemove: number) => {
    const updated = (value || []).filter((_, idx) => idx !== indexToRemove)
    setText(updated.join(', '))
    onChange(updated)
  }

  return (
    <div className="block sm:col-span-2">
      <label className="block">
        <span className="field-label">Tech (comma separated)</span>
        <input
          className="field-input"
          value={text}
          placeholder="e.g. Python, Flask, MySQL"
          onFocus={() => {
            isFocusedRef.current = true
          }}
          onBlur={handleBlur}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (text.trim() && !text.trim().endsWith(',')) {
                handleInputChange(text + ', ')
              }
            }
          }}
        />
        <span className="mt-1 block text-[11px] text-ink-faint">
          Type tech names separated by commas (e.g. React, Tailwind, Node)
        </span>
      </label>

      {value && value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {value.map((t, idx) => (
            <span
              key={`${t}-${idx}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper-2 px-2.5 py-0.5 text-xs font-mono text-ink"
            >
              <span>{t}</span>
              <button
                type="button"
                onClick={() => removeTag(idx)}
                className="text-ink-faint hover:text-ink font-bold leading-none cursor-pointer"
                title={`Remove ${t}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function PaletteField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <div className="flex items-center gap-2">
        <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border border-line">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -top-2 -left-2 h-14 w-14 cursor-pointer border-0 p-0"
            aria-label={`${label} color`}
          />
        </span>
        <input
          type="text"
          value={value}
          spellCheck={false}
          onChange={(e) => {
            const v = e.target.value.trim()
            if (/^#[0-9a-fA-F]{3}$/.test(v)) {
              onChange('#' + v.slice(1).split('').map((c) => c + c).join(''))
            } else if (/^#[0-9a-fA-F]{6}$/.test(v)) {
              onChange(v)
            }
          }}
          className="field-input font-mono text-xs uppercase"
        />
      </div>
    </label>
  )
}

function ToneRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line/60 py-2 last:border-0">
      <span className="text-xs font-semibold text-ink-soft">{label}</span>
      <span className="flex items-center gap-2">
        <code className="font-mono text-[10px] text-ink-faint">{value}</code>
        <span
          className="h-6 w-10 rounded border border-line"
          style={{ backgroundColor: value }}
          title={label}
        />
      </span>
    </div>
  )
}

function Slider({
  label,
  value,
  min,
  max,
  step = 0.01,
  suffix = '',
  hint,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  suffix?: string
  hint?: string
  onChange: (v: number) => void
}) {
  return (
    <label className="block">
      <span className="field-label flex items-center justify-between gap-2">
        <span>{label}</span>
        <code className="font-mono text-[11px] text-ink-soft">
          {value.toFixed(step < 1 ? (step >= 1 ? 0 : 2) : 2)}
          {suffix}
        </code>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="mt-1 w-full cursor-pointer accent-ink"
      />
      {hint ? <span className="mt-1 block text-[11px] text-ink-faint">{hint}</span> : null}
    </label>
  )
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="surface-muted flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
    >
      <span className="text-sm font-semibold text-ink-soft">{label}</span>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          value ? 'bg-ink' : 'bg-line/70'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-paper shadow transition-transform ${
            value ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  )
}

function ModelPanel(d: SiteContent, set: (updater: (prev: SiteContent) => SiteContent) => void) {
  const m = d.model3D
  const patch = (p: Partial<Model3DSettings>) => {
    portalScreen.setModel({ ...m, ...p })
    set((prev) => ({ ...prev, model3D: { ...prev.model3D, ...p } }))
  }

  return (
    <>
      <Card
        title="The 3D computer"
        note="Size, float position, facing and how long the scroll-to-enter takes. Changes preview live behind the editor — hit Save to keep them."
      >
        <div className="space-y-5">
          <Slider label="Scale · rest size" value={m.scale} min={0.2} max={1.4} hint="fraction of viewport height at rest" onChange={(v) => patch({ scale: v })} />
          <Slider label="Position X · left ↔ right" value={m.posX} min={-1} max={1} hint="0 = centered, 1 = right edge, -1 = left edge" onChange={(v) => patch({ posX: v })} />
          <Slider label="Position Y · bottom ↔ top" value={m.posY} min={-1} max={1} hint="0 = middle, 1 = top, -1 = bottom" onChange={(v) => patch({ posY: v })} />
          <Slider label="Rotation yaw" value={m.yawDeg} min={-180} max={180} step={1} suffix="°" hint="turn the machine so its screen faces you (try 90° steps)" onChange={(v) => patch({ yawDeg: v })} />
          <Toggle label="Idle sway" value={m.sway} onChange={(v) => patch({ sway: v })} />
          <Slider label="Scroll to enter" value={m.enterVh} min={0.5} max={3} step={0.05} suffix="vh" hint="how many viewport-heights the dolly-in takes" onChange={(v) => patch({ enterVh: v })} />
        </div>
      </Card>
    </>
  )
}

function ColorsPanel(d: SiteContent, set: (updater: (prev: SiteContent) => SiteContent) => void) {
  const c = d.colors
  const setAnchors = (patch: Partial<ThemeColors>) =>
    set((prev) => ({ ...prev, colors: { ...deriveTheme(patch.paper ?? c.paper, patch.ink ?? c.ink), ...patch } }))

  return (
    <>
      <Card
        title="Anchor colors"
        note="The site is monochrome: everything is mixed from Paper (light background) and Ink (text & dark cards). Change these and the whole ramp plus the canvas particles follow."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <PaletteField label="Paper · background" value={c.paper} onChange={(v) => setAnchors({ paper: v })} />
          <PaletteField label="Ink · text & dark" value={c.ink} onChange={(v) => setAnchors({ ink: v })} />
        </div>

        {/* live ramp preview */}
        <div className="mt-5 flex h-10 overflow-hidden rounded-btn border border-line">
          {([c.paper, c.card, c.line, c.inkFaint, c.inkSoft, c.ink] as string[]).map((tone, i) => (
            <span
              key={i}
              className="flex-1"
              style={{ backgroundColor: tone, borderLeft: i ? '1px solid rgba(0,0,0,0.06)' : undefined }}
              title={tone}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => set((prev) => ({ ...prev, colors: { ...DEFAULT_THEME } }))}
          className="btn btn-ghost btn-sm mt-4"
        >
          Reset palette to defaults
        </button>
      </Card>

      <Card title="Derived tones" note="Read-only — greys mixed between the two anchors.">
        <ToneRow label="Paper 2 · hover fill" value={c.paper2} />
        <ToneRow label="Paper 3 · fill" value={c.paper3} />
        <ToneRow label="Card · sheets & inputs" value={c.card} />
        <ToneRow label="Line · hairlines" value={c.line} />
        <ToneRow label="Ink faint · captions" value={c.inkFaint} />
        <ToneRow label="Ink soft · body text" value={c.inkSoft} />
        <div className="pt-2">
          <ToneRow label="Night · inverted band" value={c.ink} />
        </div>
      </Card>
    </>
  )
}

function RowButtons({
  onUp,
  onDown,
  onRemove,
}: {
  onUp: () => void
  onDown: () => void
  onRemove: () => void
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button type="button" onClick={onUp} aria-label="Move up" className="icon-btn">
        <IconChevronUp className="h-4 w-4" />
      </button>
      <button type="button" onClick={onDown} aria-label="Move down" className="icon-btn">
        <IconChevronDown className="h-4 w-4" />
      </button>
      <button type="button" onClick={onRemove} aria-label="Remove" className="icon-btn icon-danger">
        <IconTrash className="h-4 w-4" />
      </button>
    </div>
  )
}

function Card({
  title,
  note,
  aside,
  children,
}: {
  title: string
  note?: string
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="surface overflow-hidden">
      <header className="flex items-start justify-between gap-3 border-b border-line bg-paper-2/50 px-5 py-3.5">
        <div className="min-w-0">
          <h4 className="micro-label text-ink">{title}</h4>
          {note ? <p className="mt-1 text-[11px] leading-snug text-ink-faint">{note}</p> : null}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </header>
      <div className="p-5">{children}</div>
    </section>
  )
}

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T

/* ---------- editor lock ----------
   The passphrase is never stored in the bundle, only these digests, so it
   cannot be read straight out of the JavaScript. Be clear-eyed about what that
   buys: everything here runs in the visitor's browser, so this keeps the editor
   out of the way of anyone who stumbles onto the pencil or the shortcut — it is
   not a security boundary. Anything that must actually stay private needs a
   server that refuses to answer without credentials. */
const UNLOCK_KEY = 'ali-imad-editor-unlocked'
const PASS_SHA256 = '3a783ea7a37291bbc37408839a0cc937117c6be6084857661f81c13ded643d13'
/* fallback for pages served without a secure context, where crypto.subtle is
   undefined — weaker, but it still keeps the phrase out of the source */
const PASS_FALLBACK = '117d2730'

function weakHash(value: string): string {
  let h = 5381
  for (let i = 0; i < value.length; i++) h = ((h * 33) ^ value.charCodeAt(i)) >>> 0
  return h.toString(16)
}

async function checkPassphrase(value: string): Promise<boolean> {
  const subtle = globalThis.crypto?.subtle
  if (subtle) {
    try {
      const bytes = new TextEncoder().encode(value)
      const digest = await subtle.digest('SHA-256', bytes)
      const hex = [...new Uint8Array(digest)]
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
      return hex === PASS_SHA256
    } catch {
      /* fall through to the non-crypto path */
    }
  }
  return weakHash(value) === PASS_FALLBACK
}

function readUnlocked(): boolean {
  try {
    return sessionStorage.getItem(UNLOCK_KEY) === '1'
  } catch {
    return false
  }
}

function LockScreen({
  onUnlock,
  onCancel,
  name,
}: {
  onUnlock: () => void
  onCancel: () => void
  name: string
}) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    const ok = await checkPassphrase(value)
    setBusy(false)
    if (ok) {
      try {
        sessionStorage.setItem(UNLOCK_KEY, '1')
      } catch {
        /* private mode — the unlock just won't be remembered */
      }
      onUnlock()
      return
    }
    setError(true)
    setValue('')
    inputRef.current?.focus()
  }

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center px-5 py-10">
      <form onSubmit={submit} className="surface w-full max-w-sm p-6 sm:p-8">
        <span className="flex h-10 w-10 items-center justify-center rounded-btn bg-ink text-paper">
          <IconLock className="h-4 w-4" />
        </span>
        <h2 className="display mt-5 text-3xl text-ink">Editor locked</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {name}&apos;s site editor. Enter the passphrase to make changes.
        </p>

        <label className="mt-6 block">
          <span className="field-label">Passphrase</span>
          <input
            ref={inputRef}
            type="password"
            className="field-input"
            value={value}
            autoComplete="current-password"
            placeholder="•••••••••"
            onChange={(e) => {
              setValue(e.target.value)
              if (error) setError(false)
            }}
            aria-invalid={error}
            aria-describedby={error ? 'editor-lock-error' : undefined}
          />
        </label>

        <p
          id="editor-lock-error"
          role="alert"
          className={`mt-2 text-xs font-semibold text-ink ${error ? '' : 'invisible'}`}
        >
          That is not the passphrase — try again.
        </p>

        <div className="btn-row mt-5 sm:flex sm:items-center sm:gap-2">
          <button type="submit" className="btn btn-solid" disabled={busy || !value}>
            {busy ? 'Checking…' : 'Unlock'}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-ghost">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

type ListKind = 'string' | 'skill' | 'nav' | 'social' | 'journey'

function RefList({
  kind,
  items,
  setItems,
  title,
  note,
}: {
  kind: ListKind
  items: unknown[]
  setItems: (next: unknown[]) => void
  title: string
  note?: string
}) {
  const update = (i: number, patch: Record<string, string>) => {
    const next = [...items]
    const item: Record<string, string> = next[i] as Record<string, string>
    next[i] = { ...item, ...patch }
    setItems(next)
  }

  const add = () => {
    if (kind === 'string') setItems([...items, ''])
    else if (kind === 'skill') setItems([...items, { name: '', note: '' }])
    else if (kind === 'journey') setItems([...items, { year: '', text: '' }])
    else setItems([...items, { label: '', href: '' }])
  }

  const swap = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    setItems(next)
  }

  const remove = (i: number) => setItems(items.filter((_, idx) => idx !== i))

  return (
    <Card title={title} note={note} aside={<span className="chip">{items.length}</span>}>
      <div className="space-y-3">
        {items.length === 0 && (
          <p className="surface-muted px-4 py-6 text-center text-xs text-ink-faint">
            Nothing here yet — add the first entry below.
          </p>
        )}
        {items.map((item, i) => {
          if (kind === 'string') {
            return (
              <div key={i} className="flex items-center gap-2">
                <input
                  className="field-input flex-1"
                  value={String(item)}
                  onChange={(e) => {
                    const next = [...items]
                    next[i] = e.target.value
                    setItems(next)
                  }}
                />
                <RowButtons
                  onUp={() => swap(i, -1)}
                  onDown={() => swap(i, 1)}
                  onRemove={() => remove(i)}
                />
              </div>
            )
          }
          const rec = item as Record<string, string>
          return (
            <div key={i} className="surface-muted p-3">
              <div className="grid gap-2">
                {Object.keys(rec).map((k) => (
                  <Field
                    key={k}
                    label={k}
                    value={rec[k] ?? ''}
                    onChange={(v) => update(i, { [k]: v })}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-end">
                <RowButtons
                  onUp={() => swap(i, -1)}
                  onDown={() => swap(i, 1)}
                  onRemove={() => remove(i)}
                />
              </div>
            </div>
          )
        })}
      </div>
      <button type="button" onClick={add} className="btn btn-outline btn-sm mt-4">
        <IconPlus className="h-4 w-4" /> Add
      </button>
    </Card>
  )
}

/* ---------- tab panels ---------- */

function ProfilePanel(d: SiteContent, set: (updater: (prev: SiteContent) => SiteContent) => void) {
  const setIn = (key: keyof SiteContent['profile'], value: string) =>
    set((prev) => ({ ...prev, profile: { ...prev.profile, [key]: value } }))

  return (
    <>
      <Card title="Details" note="Shown in the navigation brand, the hero headline and the about card.">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Full name" value={d.profile.name} onChange={(v) => setIn('name', v)} />
          <Field label="First name" value={d.profile.firstName} onChange={(v) => setIn('firstName', v)} />
          <div className="sm:col-span-2">
            <Field label="Role line" value={d.profile.role} onChange={(v) => setIn('role', v)} />
          </div>
          <div className="sm:col-span-2">
            <Area label="Intro paragraph" value={d.profile.intro} onChange={(v) => setIn('intro', v)} rows={3} />
          </div>
          <Field label="Currently building…" value={d.profile.currently} onChange={(v) => setIn('currently', v)} />
        </div>
      </Card>

      <Card
        title="Portrait"
        note="Upload a profile picture to Supabase Storage — or point at a path in /public."
      >
        <div className="flex flex-col gap-4 sm:flex-row">
          <ImageUpload
            folder="profile"
            slug="ali"
            currentPath={d.profile.photoStoragePath}
            aspectClass="h-40 w-32 shrink-0 aspect-auto"
            label="Upload portrait"
            onUploaded={(path, url) => {
              set((prev) => ({
                ...prev,
                profile: { ...prev.profile, photoStoragePath: path, photo: url },
              }))
            }}
            onRemoved={() =>
              set((prev) => ({ ...prev, profile: { ...prev.profile, photoStoragePath: undefined } }))
            }
          />
          <div className="grid flex-1 gap-3">
            <Field
              label="Photo URL or path"
              value={d.profile.photo}
              onChange={(v) => setIn('photo', v)}
            />
            <Field
              label="Caption under the photo"
              value={d.profile.photoCaption}
              onChange={(v) => setIn('photoCaption', v)}
            />
          </div>
        </div>
      </Card>
    </>
  )
}

export default function Dashboard() {
  const { content, update, reset, save } = useContent()
  const [open, setOpen] = useState(false)
  const [unlocked, setUnlocked] = useState(readUnlocked)
  const [tab, setTab] = useState<Tab>('profile')
  const [draft, setDraft] = useState<SiteContent>(() => clone(content))
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  const handleSave = async () => {
    update(draft)
    setSaving(true)
    setSaveMsg(null)
    const result = await save(draft)
    setSaving(false)
    if (result.ok) {
      setSaveMsg('Saved to database')
      setOpen(false)
    } else {
      setSaveMsg(result.error ?? 'Saved to this browser only — check Supabase env vars.')
    }
  }

  useEffect(() => {
    if (open) setDraft(clone(content))
  }, [open, content])

  /* hidden triggers: Ctrl/Cmd+Shift+E, or the tiny pencil in the footer */
  useEffect(() => {
    const onOpen = () => setOpen(true)
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener('ali:open-editor', onOpen)
    document.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('ali:open-editor', onOpen)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  const set = (updater: (prev: SiteContent) => SiteContent) => setDraft(updater)

  /* projects tab */
  const setProject = (i: number, key: keyof SiteContent['projects'][number], value: unknown) =>
    set((prev) => {
      const projects = prev.projects.map((p, idx) => (idx === i ? { ...p, [key]: value } : p))
      return { ...prev, projects }
    })
  const moveProject = (i: number, dir: -1 | 1) =>
    set((prev) => {
      const arr = [...prev.projects]
      const j = i + dir
      if (j < 0 || j >= arr.length) return prev
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
      return { ...prev, projects: arr }
    })

  /* design tab */
  const setPiece = (i: number, key: keyof DesignPiece, value: unknown) =>
    set((prev) => {
      const pieces = prev.designPieces.map((p, idx) =>
        idx === i ? { ...p, [key]: value } : p,
      )
      return { ...prev, designPieces: pieces }
    })
  const movePiece = (i: number, dir: -1 | 1) =>
    set((prev) => {
      const arr = [...prev.designPieces]
      const j = i + dir
      if (j < 0 || j >= arr.length) return prev
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
      return { ...prev, designPieces: arr }
    })

  const setTabContent = (tab: Tab): React.ReactNode => {
    switch (tab) {
      case 'profile':
        return ProfilePanel(draft, set)
      case 'menu':
        return (
          <RefList
            kind="nav"
            title="Navigation links"
            items={draft.nav as unknown[]}
            setItems={(next) => set((prev) => ({ ...prev, nav: next as typeof prev.nav }))}
          />
        )
      case 'skills':
        return (
          <div className="space-y-6">
            <RefList
              kind="skill"
              title="Programming"
              items={draft.codeSkills as unknown[]}
              setItems={(next) => set((prev) => ({ ...prev, codeSkills: next as typeof prev.codeSkills }))}
            />
            <RefList
              kind="skill"
              title="Graphic Design"
              items={draft.designSkills as unknown[]}
              setItems={(next) => set((prev) => ({ ...prev, designSkills: next as typeof prev.designSkills }))}
            />
            <RefList
              kind="string"
              title="Tools on the desk"
              items={draft.tools as unknown[]}
              setItems={(next) => set((prev) => ({ ...prev, tools: next as string[] }))}
            />
          </div>
        )
      case 'projects': {
        const list = draft.projects
        return (
          <div className="space-y-5">
            {list.map((p, i) => (
              <Card
                key={`${p.id}-${i}`}
                title={`Project ${i + 1} · ${p.title || p.id}`}
                aside={
                  <RowButtons
                    onUp={() => moveProject(i, -1)}
                    onDown={() => moveProject(i, 1)}
                    onRemove={() => set((prev) => ({ ...prev, projects: prev.projects.filter((_, idx) => idx !== i) }))}
                  />
                }
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="ID (unique)" value={p.id} onChange={(v) => setProject(i, 'id', v)} />
                  <Field label="Meta (e.g. 01 / Software)" value={p.meta} onChange={(v) => setProject(i, 'meta', v)} />
                  <div className="sm:col-span-2">
                    <Field label="Title" value={p.title} onChange={(v) => setProject(i, 'title', v)} />
                  </div>
                  <Field label="Tagline / copy" value={p.copy} onChange={(v) => setProject(i, 'copy', v)} />
                  <div className="sm:col-span-2">
                    <Area label="Description" value={p.description} onChange={(v) => setProject(i, 'description', v)} rows={3} />
                  </div>
                  <div className="sm:col-span-2">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="field-label mb-0">Project Images (Multiple)</span>
                      <span className="text-[11px] text-ink-faint">★ The first image is the cover</span>
                    </div>
                    <MultiImageUpload
                      folder="projects"
                      slug={p.id}
                      images={p.images && p.images.length > 0 ? p.images : (p.coverImage ? [p.coverImage] : [])}
                      onChange={(nextImages) => {
                        setProject(i, 'images', nextImages)
                        setProject(i, 'coverImage', nextImages[0] ?? undefined)
                      }}
                    />
                  </div>
                  <TechTagsField value={p.tech} onChange={(nextTech) => setProject(i, 'tech', nextTech)} />
                  <Field label="Github URL" value={p.github ?? ''} onChange={(v) => setProject(i, 'github', v)} />
                  <Field label="Demo URL" value={p.demo ?? ''} onChange={(v) => setProject(i, 'demo', v)} />
                  <Field label="Hover annotation" value={p.annotation} onChange={(v) => setProject(i, 'annotation', v)} />
                </div>
              </Card>
            ))}
            <button type="button" onClick={() => set((prev) => ({ ...prev, projects: [...prev.projects, { id: `new-${Math.random().toString(36).slice(2, 6)}`, meta: '07 / Unknown', title: 'New project', copy: 'one-liner', description: 'Short description here.', tech: [], annotation: 'a note', github: '', demo: '', coverImage: undefined, images: [] }] }))} className="btn btn-outline">
              <IconPlus className="h-4 w-4" /> Add project
            </button>
          </div>
        )
      }
      case 'design': {
        const arts = ['logo', 'poster', 'identity', 'type', 'manip', 'ui', 'stamp', 'motion']
        return (
          <div className="space-y-5">
            <Card
              title="Gallery Header Image (Banner Only)"
              note="This panoramic image appears only as the wide header banner at the top of the gallery. It is NOT inserted as a piece card in the grid below."
            >
              <div className="space-y-3">
                <Field
                  label="Header Tagline / Title (optional)"
                  value={draft.galleryHero?.title ?? ''}
                  onChange={(v) =>
                    set((prev) => ({
                      ...prev,
                      galleryHero: { ...(prev.galleryHero ?? {}), title: v },
                    }))
                  }
                />
                <div>
                  <span className="field-label">Header Banner Image</span>
                  <ImageUpload
                    folder="gallery"
                    slug="header-banner"
                    currentPath={draft.galleryHero?.storagePath}
                    aspectClass="aspect-[21/9]"
                    label="Upload Gallery Header Banner"
                    onUploaded={(path) =>
                      set((prev) => ({
                        ...prev,
                        galleryHero: { ...(prev.galleryHero ?? {}), storagePath: path, image: path },
                      }))
                    }
                    onRemoved={() =>
                      set((prev) => ({
                        ...prev,
                        galleryHero: undefined,
                      }))
                    }
                  />
                </div>
              </div>
            </Card>

            <div className="border-t border-line/60 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-faint">
                Gallery Grid Pieces ({draft.designPieces.length})
              </span>
            </div>

            {draft.designPieces.map((p, i) => (
              <Card
                key={`${p.id}-${i}`}
                title={`Piece ${i + 1} · ${p.title || p.id}`}
                aside={
                  <RowButtons
                    onUp={() => movePiece(i, -1)}
                    onDown={() => movePiece(i, 1)}
                    onRemove={() => set((prev) => ({ ...prev, designPieces: prev.designPieces.filter((_, idx) => idx !== i) }))}
                  />
                }
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="ID" value={p.id} onChange={(v) => setPiece(i, 'id', v)} />
                  <Field label="Title" value={p.title} onChange={(v) => setPiece(i, 'title', v)} />
                  <Field label="Caption" value={p.caption} onChange={(v) => setPiece(i, 'caption', v)} />
                  <Field label="Category" value={p.category} onChange={(v) => setPiece(i, 'category', v)} />
                  <Field label="Rotation (e.g. -2.5deg)" value={p.rotation} onChange={(v) => setPiece(i, 'rotation', v)} />
                  <Select label="Size" value={p.size} options={['small', 'medium', 'large']} onChange={(v) => setPiece(i, 'size', v as DesignPiece['size'])} />
                  <Select label="Art style" value={p.art} options={arts} onChange={(v) => setPiece(i, 'art', v as DesignPiece['art'])} />
                  <div className="sm:col-span-2">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="field-label mb-0">Gallery Images (Multiple)</span>
                      <span className="text-[11px] text-ink-faint">★ The first image is the card cover</span>
                    </div>
                    <MultiImageUpload
                      folder="gallery"
                      slug={p.id}
                      images={p.images && p.images.length > 0 ? p.images : (p.storagePath ? [p.storagePath] : (p.image ? [p.image] : []))}
                      onChange={async (nextImages) => {
                        setPiece(i, 'images', nextImages)
                        const first = nextImages[0] ?? undefined
                        setPiece(i, 'storagePath', first)
                        setPiece(i, 'image', first)
                        if (first) {
                          const url = getImageUrl(first)
                          if (url) {
                            try {
                              const colors = await extractPaletteFromImage(url, 4)
                              if (colors && colors.length > 0) {
                                setPiece(i, 'palette', colors)
                              }
                            } catch {}
                          }
                        }
                      }}
                    />
                  </div>
                  <GalleryPaletteField
                    palette={p.palette ?? []}
                    imageUrl={getImageUrl(p.storagePath || p.image || (p.images && p.images[0])) ?? undefined}
                    onChange={(nextPalette) => setPiece(i, 'palette', nextPalette)}
                  />
                </div>
              </Card>
            ))}
            <button type="button" onClick={() => set((prev) => ({ ...prev, designPieces: [...prev.designPieces, { id: `new-${Math.random().toString(36).slice(2, 6)}`, title: 'New piece', caption: 'caption', category: 'Misc', rotation: '2deg', size: 'medium', art: 'type', palette: ['#14120E', '#F1EFE7', '#8B8579'], images: [] }] }))} className="btn btn-outline">
              <IconPlus className="h-4 w-4" /> Add piece
            </button>
          </div>
        )
      }
      case 'about':
        return (
          <div className="space-y-6">
            <RefList
              kind="string"
              title="Bio (one line per paragraph)"
              items={draft.about.bio}
              setItems={(next) =>
                set((prev) => ({ ...prev, about: { ...prev.about, bio: next as string[] } }))
              }
            />
            <RefList
              kind="journey"
              title="Timeline entries"
              items={draft.about.journey as unknown[]}
              setItems={(next) =>
                set((prev) => ({ ...prev, about: { ...prev.about, journey: next as typeof prev.about.journey } }))
              }
            />
            <Card title="Interest blurbs" note="The two long-form paragraphs about code and design.">
              <div className="grid gap-3">
                <Area label="Programming" value={draft.about.programming} onChange={(v) => set((prev) => ({ ...prev, about: { ...prev.about, programming: v } }))} rows={3} />
                <Area label="Graphic design" value={draft.about.graphic} onChange={(v) => set((prev) => ({ ...prev, about: { ...prev.about, graphic: v } }))} rows={3} />
              </div>
            </Card>
          </div>
        )
      case 'contact':
        return (
          <RefList
            kind="social"
            title="Social / contact links"
            note="Recognized labels: Instagram, WhatsApp, Github, Behance, Email, LinkedIn. Links update both the Contact section and the Footer instantly."
            items={draft.social as unknown[]}
            setItems={(next) => set((prev) => ({ ...prev, social: next as typeof prev.social }))}
          />
        )
      case 'colors':
        return ColorsPanel(draft, set)
      case '3d':
        return ModelPanel(draft, set)
    }
  }

  const activeTab = TABS.find((t) => t.id === tab) ?? TABS[0]

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[70] flex flex-col overflow-hidden bg-paper"
          role="dialog"
          aria-modal="true"
          aria-label="Site editor"
        >
          {/* top toolbar */}
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-card/85 px-4 py-3 backdrop-blur sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-btn bg-ink text-paper">
                {unlocked ? <IconPencil className="h-4 w-4" /> : <IconLock className="h-4 w-4" />}
              </span>
              <div className="min-w-0">
                <p className="display text-base leading-none text-ink">Editor</p>
                <p className="mt-1 truncate text-[11px] text-ink-faint">
                  {content.profile.name} · portfolio
                </p>
              </div>
            </div>

            {!unlocked && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn btn-outline btn-icon btn-sm shrink-0"
                aria-label="Close editor"
              >
                <IconX className="h-4 w-4" />
              </button>
            )}

            <div className={`shrink-0 items-center gap-2 ${unlocked ? 'flex' : 'hidden'}`}>
              <span className="chip hidden lg:inline-flex">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink/50" />
                {localStorage.getItem('ali-imad-portfolio-v1') ? 'draft in browser' : 'defaults'}
              </span>
              {saveMsg && (
                <span className={`hidden text-[11px] lg:inline ${saveMsg === 'Saved to database' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {saveMsg}
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  const ok = window.confirm('Reset all content to the site defaults? This erases the saved draft in this browser.')
                  if (ok) {
                    reset()
                    setDraft(clone(defaultContent))
                  }
                }}
                className="btn btn-ghost btn-sm hidden sm:inline-flex"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn btn-solid btn-sm"
              >
                {saving ? 'Saving…' : 'Save'}
                <IconArrowUpRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn btn-outline btn-icon btn-sm"
                aria-label="Close editor"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>
          </header>

          {!unlocked && (
            <LockScreen
              name={content.profile.name}
              onUnlock={() => setUnlocked(true)}
              onCancel={() => setOpen(false)}
            />
          )}

          {unlocked && (
            <>
          {/* section rail — horizontal scroller on phones, sidebar from lg up */}
          <nav
            className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-line bg-paper-2/40 px-4 py-2.5 lg:hidden"
            aria-label="Editor sections"
          >
            {TABS.map((t) => {
              const IconCmp = t.icon
              const isActive = t.id === tab
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  title={t.note}
                  className={`btn btn-sm btn-round shrink-0 ${isActive ? 'btn-solid' : 'btn-ghost'}`}
                >
                  <IconCmp className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              )
            })}
          </nav>

          {/* body */}
          <div className="flex min-h-0 flex-1">
            {/* section sidebar */}
            <aside
              className="hidden w-64 shrink-0 flex-col gap-1 overflow-y-auto border-r border-line bg-paper-2/40 p-3 lg:flex"
              aria-label="Editor sections"
            >
              {TABS.map((t, i) => {
                const IconCmp = t.icon
                const isActive = t.id === tab
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`flex w-full items-start gap-3 rounded-btn px-3 py-2.5 text-left transition-colors ${
                      isActive ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper-2'
                    }`}
                  >
                    <IconCmp
                      className={`mt-0.5 h-4 w-4 shrink-0 ${isActive ? 'text-paper/80' : 'text-ink-faint'}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold leading-tight">{t.label}</span>
                      <span
                        className={`mt-0.5 block text-[11px] leading-snug ${
                          isActive ? 'text-paper/60' : 'text-ink-faint'
                        }`}
                      >
                        {t.note}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 font-mono text-[10px] ${
                        isActive ? 'text-paper/50' : 'text-ink-faint/70'
                      }`}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </button>
                )
              })}
            </aside>

            {/* forms */}
            <div
              className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8 lg:px-10 lg:py-8"
              style={{
                backgroundImage:
                  'radial-gradient(circle, color-mix(in srgb, var(--color-ink) 5%, transparent) 1px, transparent 1px)',
                backgroundSize: '22px 22px',
              }}
            >
              <div className="mx-auto max-w-2xl">
                <div className="mb-6">
                  <p className="micro-label text-ink-faint">
                    {String(TABS.findIndex((t) => t.id === tab) + 1).padStart(2, '0')} / {String(TABS.length).padStart(2, '0')} · section
                  </p>
                  <h2 className="display mt-1 text-4xl text-ink">{activeTab.label}</h2>
                  <p className="mt-2 text-sm text-ink-soft">{activeTab.note}</p>
                </div>
                <div className="space-y-5">{setTabContent(tab)}</div>
              </div>
            </div>

            {/* mockup preview */}
            <aside className="hidden w-[400px] shrink-0 flex-col border-l border-line bg-paper-2/60 2xl:flex">
              <div className="flex items-center justify-between border-b border-line px-5 py-3">
                <span className="micro-label flex items-center gap-1.5 text-ink-soft">
                  <IconMonitor className="h-3.5 w-3.5" />
                  Live mockup
                </span>
                <span className="text-[11px] text-ink-faint">updates as you type</span>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <MockPreview draft={draft} tab={tab} />
              </div>
              <div className="border-t border-line px-5 py-3 text-center">
                <p className="micro-label text-ink-faint">
                  press <span className="rounded border border-line bg-paper px-1.5 py-0.5">Esc</span> to close
                </p>
              </div>
            </aside>
          </div>
            </>
          )}

          {/* bottom action bar (mobile/footer) */}
          <footer
            className={`shrink-0 items-center justify-between gap-4 border-t border-line bg-card/85 px-4 py-3 backdrop-blur sm:px-6 2xl:hidden ${
              unlocked ? 'flex' : 'hidden'
            }`}
          >
            <p className="hidden text-[11px] text-ink-faint sm:block">
              Changes preview live behind the editor.
            </p>
            <div className="btn-row sm:flex sm:items-center sm:gap-2">
              <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn btn-solid"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
            {saveMsg && (
              <p className={`text-[11px] ${saveMsg === 'Saved to database' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {saveMsg}
              </p>
            )}
          </footer>
        </div>
      )}
    </>
  )
}

export function openDashboard() {
  window.dispatchEvent(new Event('ali:open-editor'))
}