import {
  IconGitHub,
  IconBehance,
  IconMail,
  IconLinkedIn,
  IconArrowUpRight,
  IconInstagram,
  IconWhatsApp,
} from './icons'

export function socialIcon(label: string) {
  const lower = label.trim().toLowerCase()
  if (lower.includes('instagram') || lower.includes('insta')) {
    return IconInstagram
  }
  if (lower.includes('whatsapp') || lower.includes('wa.me') || lower.includes('phone')) {
    return IconWhatsApp
  }
  if (lower.includes('github') || lower.includes('git')) {
    return IconGitHub
  }
  if (lower.includes('behance')) {
    return IconBehance
  }
  if (lower.includes('mail') || lower.includes('email')) {
    return IconMail
  }
  if (lower.includes('linkedin')) {
    return IconLinkedIn
  }
  return IconArrowUpRight
}