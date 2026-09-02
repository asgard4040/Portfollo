import {
  IconGitHub,
  IconBehance,
  IconMail,
  IconLinkedIn,
  IconArrowUpRight,
  type IconName,
} from './icons'

const CLAIMED: Record<string, IconName> = {
  github: 'github',
  behance: 'behance',
  email: 'mail',
  mail: 'mail',
  linkedin: 'linkedin',
  dribbble: 'layout',
  instagram: 'pen',
  x: 'sparkle',
}

export function socialIcon(label: string) {
  const lower = label.trim().toLowerCase()
  const key = CLAIMED[lower]
  switch (key) {
    case 'github':
      return IconGitHub
    case 'behance':
      return IconBehance
    case 'mail':
      return IconMail
    case 'linkedin':
      return IconLinkedIn
    default:
      return IconArrowUpRight
  }
}