export interface Project {
  id: string
  meta: string
  title: string
  copy: string
  description: string
  tech: string[]
  github?: string
  demo?: string
  annotation: string
  coverImage?: string
}

export const projects: Project[] = [
  {
    id: 'rfid',
    meta: '01 / Software',
    title: 'Smart RFID Attendance',
    copy: 'Tap in. Walk on.',
    description:
      'A hands-free attendance system that reads RFID cards and logs students the moment they walk in — no queues, no paper sign-ins.',
    tech: ['Python', 'Flask', 'MySQL'],
    annotation: 'tap = present',
  },
  {
    id: 'designsys',
    meta: '02 / Branding',
    title: 'Visual Identity System',
    copy: 'One brand, every surface.',
    description:
      'A full visual identity for a local café — logo, color system, menu templates and signage. Consistent, warm, unforgettable.',
    tech: ['Illustrator', 'Photoshop', 'Identity'],
    annotation: 'logo to all touchpoints',
  },
  {
    id: 'shop',
    meta: '03 / Software',
    title: 'Plant Shop Web App',
    copy: 'Greenery, clickable.',
    description:
      'A small e-commerce experiment with a playful twist — cart states, stock handling and a friendly checkout flow.',
    tech: ['React', 'Tailwind', 'Node'],
    annotation: 'cart is out of stock jk',
  },
  {
    id: 'posters',
    meta: '04 / Print',
    title: 'Poster Series',
    copy: 'Type, texture, tension.',
    description:
      'A short-run series of gig posters built around big type and paper textures. Each one a different experiment in hierarchy and rhythm.',
    tech: ['Photoshop', 'Typography'],
    annotation: 'side A done',
  },
  {
    id: 'idcard',
    meta: '05 / Software',
    title: 'Student ID Card System',
    copy: 'Everyone gets a badge.',
    description:
      'A generator that takes a student record and pops out a clean, printable ID card — photos, codes and barcodes handled automatically.',
    tech: ['Python', 'Pillow', 'SQLite'],
    annotation: 'zero manual layout',
  },
  {
    id: 'motion',
    meta: '06 / Motion',
    title: 'Micro-Animation Pack',
    copy: 'Small moves, big feel.',
    description:
      'A growing collection of tiny UI animations and transitions — buttons, hovers, loads — done with CSS and a bit of SVG. Lively, never loud.',
    tech: ['CSS', 'SVG', 'JavaScript'],
    annotation: 'ease in, feel good',
  },
]