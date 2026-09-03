export interface NavItem {
  label: string
  href: string
}

export interface SocialLink {
  label: string
  href: string
}

export interface ProfileData {
  name: string
  firstName: string
  role: string
  intro: string
  currently: string
  photo: string
  photoStoragePath?: string
  photoCaption: string
}

export const navItems: NavItem[] = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Design', href: '#design' },
  { label: 'Contact', href: '#contact' },
]

export const social: SocialLink[] = [
  { label: 'Instagram', href: 'https://instagram.com/' },
  { label: 'WhatsApp', href: 'https://wa.me/' },
  { label: 'Github', href: 'https://github.com' },
  { label: 'Behance', href: 'https://behance.net' },
  { label: 'Email', href: 'mailto:aliemadnajm.iq@gmail.com' },
]

export const profile: ProfileData = {
  name: 'Ali Imad',
  firstName: 'Ali',
  role: 'Developer & Graphic Designer',
  intro:
    'I build software and design how it feels. Half my brain writes code, the other half draws — and I like experimenting.',
  currently: 'building: a tiny RFID attendance system',
  photo: '/portrait.svg',
  photoCaption: 'this is me, probably sketching',
}