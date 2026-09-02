export interface AboutContent {
  bio: string[]
  journey: { year: string; text: string }[]
  programming: string
  graphic: string
}

export const aboutContent: AboutContent = {
  bio: [
    'Bridging clean code architecture with crafted visual identities.',
    'I engineer scalable software with crisp logic under the hood, and design human-centric interfaces with typographic precision.',
    'Always exploring the intersection of creative technology, brand aesthetics, and modern web performance.',
  ],
  journey: [
    { year: 'Genesis', text: 'Started exploring algorithms and visual identity systems.' },
    { year: 'Python & Logic', text: 'Built automation engines, web backends, and modular logic.' },
    { year: 'Design Systems', text: 'Crafted brand aesthetics, editorial layouts, and vector art.' },
    { year: 'Full Synergy', text: 'Fusing full-stack engineering with high-impact design.' },
  ],
  programming:
    'Scalable Python architectures, reactive React & TypeScript interfaces, and resilient backend pipelines designed for speed and clarity.',
  graphic:
    'Distinctive brand identities, harmonious color systems, and typographic hierarchy that make digital products memorable.',
}