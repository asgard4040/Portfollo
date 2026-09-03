/* Monochrome line-icon set (24×24, stroke = currentColor).
   Drawn by hand to match the paper/editorial language. */

interface IconProps {
  className?: string
}

function Base({
  className = '',
  children,
  fill = 'none',
}: IconProps & { children: React.ReactNode; fill?: 'none' | 'currentColor' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function IconMonitor({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="3" y="4" width="18" height="13" rx="1.5" />
      <path d="M12 17v3M8 20h8" />
    </Base>
  )
}
export function IconHome({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M4 11.3 12 4l8 7.3" />
      <path d="M6 10v9h12v-9" />
      <path d="M10 19v-5h4v5" />
    </Base>
  )
}

export function IconUser({ className }: IconProps) {
  return (
    <Base className={className}>
      <circle cx="12" cy="7.5" r="3.4" />
      <path d="M5 20c.8-3.6 3.7-5.5 7-5.5s6.2 1.9 7 5.5" />
    </Base>
  )
}

export function IconLayers({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="M3 13l9 5 9-5" />
    </Base>
  )
}

export function IconFolder({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M3.5 6.5A1.5 1.5 0 0 1 5 5h4l2 2h8a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 19 20H5a1.5 1.5 0 0 1-1.5-1.5Z" />
    </Base>
  )
}

export function IconPen({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M14.5 5.5 18 9 8 19H4.5V15.5Z" />
      <path d="M12 7.5 16.5 12" />
    </Base>
  )
}

export function IconMail({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
      <path d="m4.5 7 7.5 6 7.5-6" />
    </Base>
  )
}

export function IconCode({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4M13 5l-2 14" />
    </Base>
  )
}

export function IconAtom({ className }: IconProps) {
  return (
    <Base className={className}>
      <circle cx="12" cy="12" r="2" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)" />
    </Base>
  )
}

export function IconLeaf({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M6 18C6 9 12 4 20 5c-1 8-6 13-14 13" />
      <path d="M6 18C6 13 8 9 12 6" />
    </Base>
  )
}

export function IconDatabase({ className }: IconProps) {
  return (
    <Base className={className}>
      <ellipse cx="12" cy="5.5" rx="7" ry="2.8" />
      <path d="M5 5.5v13c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-13" />
      <path d="M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8" />
    </Base>
  )
}

export function IconSmartphone({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M11 18h2" />
    </Base>
  )
}

export function IconPalette({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.4 0 2.2-.8 2.2-1.9 0-.9-.5-1.4-.5-2.1 0-1.2.9-2 2.1-2H18a2.5 2.5 0 0 0 2.5-2.5C20.5 6.9 16.7 3.5 12 3.5Z" />
      <circle cx="8" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="10" r="1" fill="currentColor" stroke="none" />
    </Base>
  )
}

export function IconTag({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M3.5 12V4.5H11l9.5 9.5-6.5 6.5Z" transform="translate(1 -0.5)" />
      <circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none" />
    </Base>
  )
}

export function IconLayout({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="3.5" y="4" width="17" height="16" rx="1.5" />
      <path d="M3.5 10h17M9.5 10v10" />
    </Base>
  )
}

export function IconImage({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="3.5" y="4" width="17" height="16" rx="1.5" />
      <circle cx="9" cy="9.5" r="1.6" />
      <path d="m5 17 4.5-4 3 2.5L16 12l3 3" />
    </Base>
  )
}

export function IconWand({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M6 18 17 7" />
      <path d="m15.5 4.5 1 1.5 1.5-1-1.5-1Z" />
      <path d="M4 7l1.2.8M4.8 7.8 4 9M20 6l-.8 2.2M5.5 17l1 1.5" />
    </Base>
  )
}

export function IconType({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M5 6V4h14v2M12 4v14M9 18h6" />
    </Base>
  )
}

export function IconFingerprint({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M7 8.5A6.5 6.5 0 0 1 18.5 8.5M5 12a8 8 0 0 1 14 0" />
      <path d="M8.5 12a4.5 4.5 0 0 1 7 0M10.5 15.5V13M13.5 13v3.5" />
    </Base>
  )
}

export function IconPlay({ className }: IconProps) {
  return (
    <Base className={className} fill="currentColor">
      <path d="M8 5.5v13l11-6.5Z" fill="currentColor" />
    </Base>
  )
}

export function IconBag({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M6 9V7.5A1.5 1.5 0 0 1 7.5 6h9A1.5 1.5 0 0 1 18 7.5V9" />
      <rect x="3.5" y="9" width="17" height="11" rx="1.5" />
      <path d="M9.5 12v2a2.5 2.5 0 0 0 5 0v-2" />
    </Base>
  )
}

export function IconGitHub({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M15 21v-3.1c0-.9-.3-1.6-.8-2.1 2.6-.3 5.3-1.3 5.3-5.8 0-1.3-.4-2.4-1.2-3.3.1-.3.5-1.5-.1-3.1 0 0-1-.3-3.2 1.2a11 11 0 0 0-5.9 0C7.6 3.3 6.6 3.6 6.6 3.6c-.6 1.6-.2 2.8-.1 3.1-.8.9-1.2 2-1.2 3.3 0 4.5 2.7 5.5 5.3 5.8-.3.3-.6.7-.7 1.2-.7.3-2.3.8-3.3-.9 0 0-.6-1.1-1.7-1.2 0 0-1.1 0-.1.7 0 0 .7.4 1.2 1.7 0 0 .6 2 3.3 1.4V21" />
    </Base>
  )
}

export function IconBehance({ className }: IconProps) {
  return (
    <Base className={className}>
      <text x="7" y="17" fontSize="13" fontWeight="800" stroke="none" fill="currentColor" fontFamily="Archivo, sans-serif" transform="translate(-3 2)">
        Be
      </text>
    </Base>
  )
}

export function IconLinkedIn({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <path d="M8 10.5V17M8 7.5h.01M12 17v-4a2 2 0 0 1 4 0v4" />
    </Base>
  )
}

export function IconInstagram({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.6" />
      <path d="M17.5 6.5h.01" />
    </Base>
  )
}

export function IconWhatsApp({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      <path d="m9.5 9.5 1 2-1 1c.5 1 1.5 2 2.5 2.5l1-1 2 1" />
    </Base>
  )
}

export function IconArrowUpRight({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M7 17 17 7M9 7h8v8" />
    </Base>
  )
}

export function IconPlus({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M12 5v14M5 12h14" />
    </Base>
  )
}

export function IconTrash({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M4 6h16M9 6V4.5h6V6M6.5 6l.8 13h9.4l.8-13" />
      <path d="M10 10v6M14 10v6" />
    </Base>
  )
}

export function IconPencil({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="m5 16.5-.8 3.3 3.3-.8L18.5 8a1.9 1.9 0 0 0-2.7-2.7Z" />
      <path d="m14 7 3 3" />
    </Base>
  )
}

export function IconLock({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="4" y="10.5" width="16" height="10" rx="2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </Base>
  )
}

export function IconX({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Base>
  )
}

export function IconMenu({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" strokeWidth="2.2" />
    </Base>
  )
}

export function IconChevronUp({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="m6 14 6-6 6 6" />
    </Base>
  )
}

export function IconChevronDown({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="m6 10 6 6 6-6" />
    </Base>
  )
}

export function IconSparkle({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M12 4l1.4 6.6L20 12l-6.6 1.4L12 20l-1.4-6.6L4 12l6.6-1.4Z" />
    </Base>
  )
}

export const iconMap = {
  home: IconHome,
  user: IconUser,
  layers: IconLayers,
  folder: IconFolder,
  pen: IconPen,
  mail: IconMail,
  code: IconCode,
  atom: IconAtom,
  leaf: IconLeaf,
  database: IconDatabase,
  smartphone: IconSmartphone,
  palette: IconPalette,
  tag: IconTag,
  layout: IconLayout,
  image: IconImage,
  wand: IconWand,
  type: IconType,
  fingerprint: IconFingerprint,
  play: IconPlay,
  bag: IconBag,
  github: IconGitHub,
  behance: IconBehance,
  linkedin: IconLinkedIn,
  arrow: IconArrowUpRight,
  plus: IconPlus,
  trash: IconTrash,
  pencil: IconPencil,
  x: IconX,
  menu: IconMenu,
  chevronUp: IconChevronUp,
  chevronDown: IconChevronDown,
  sparkle: IconSparkle,
} as const

export type IconName = keyof typeof iconMap

export function Icon({ name, className }: { name: IconName; className?: string }) {
  const Cmp = iconMap[name]
  return <Cmp className={className} />
}

const SKILL_ICONS: Record<string, IconName> = {
  Python: 'code',
  JavaScript: 'code',
  React: 'atom',
  Vue: 'leaf',
  PHP: 'code',
  MySQL: 'database',
  'C++': 'code',
  HTML: 'code',
  CSS: 'palette',
  Flutter: 'smartphone',
  Branding: 'tag',
  'UI Design': 'layout',
  'Poster Design': 'image',
  'Photo Manipulation': 'wand',
  Typography: 'type',
  'Visual Identity': 'fingerprint',
  Motion: 'play',
}

export function skillIcon(name: string): IconName {
  return SKILL_ICONS[name] ?? 'sparkle'
}

const PROJECT_ICONS: Record<string, IconName> = {
  rfid: 'smartphone',
  designsys: 'pen',
  shop: 'bag',
  posters: 'image',
  idcard: 'database',
  motion: 'play',
}

export function projectIcon(id: string): IconName {
  return PROJECT_ICONS[id] ?? 'folder'
}

const NAV_ICONS: IconName[] = ['home', 'user', 'layers', 'folder', 'pen', 'mail']

export function navIcon(index: number): IconName {
  return NAV_ICONS[index] ?? 'sparkle'
}