export interface DesignPiece {
  id: string
  title: string
  caption: string
  category: string
  code?: string
  image?: string
  storagePath?: string
  tags?: string[]
  rotation: string
  size: 'small' | 'medium' | 'large'
  art: 'logo' | 'poster' | 'identity' | 'type' | 'manip' | 'motion' | 'ui' | 'stamp'
  palette: [string, string, string]
}

export const heroPiece: DesignPiece = {
  id: 'working-projects-hero',
  title: 'Urban Monolith Editorial',
  caption: 'Contemporary brutalist architectural photoshoot and structural fashion study.',
  category: 'Editorial Direction',
  code: '01 / 26',
  image: '/gallery/hero_wide.jpg',
  tags: ['Brutalist Architecture', 'Monochrome', 'Editorial'],
  rotation: '0deg',
  size: 'large',
  art: 'poster',
  palette: ['#111111', '#888888', '#f5f3ec'],
}

export const designPieces: DesignPiece[] = [
  {
    id: 'avenir-identity',
    title: 'AVENIR BRAND & STATIONERY',
    caption: 'Luxury debossed gold foil identity system on textured black linen stock.',
    category: 'Brand & Identity',
    code: '10 / 23',
    image: '/gallery/branding.jpg',
    tags: ['Brand System', 'Gold Foil', 'Stationery'],
    rotation: '-2deg',
    size: 'large',
    art: 'identity',
    palette: ['#14120e', '#c8a870', '#e5e1d8'],
  },
  {
    id: 'zurich-poster',
    title: 'ZÜRICH AVANT-GARDE POSTER',
    caption: 'Brutalist Swiss typographic exhibition piece with kinetic wireframe geometries.',
    category: 'Poster & Print',
    code: '09 / 24',
    image: '/gallery/poster.jpg',
    tags: ['Swiss Grid', 'Brutalism', 'Risograph'],
    rotation: '2deg',
    size: 'medium',
    art: 'poster',
    palette: ['#121212', '#d92550', '#ebe7de'],
  },
  {
    id: 'finnovate-ui',
    title: 'FINNOVATE DASHBOARD & MOBILE UI',
    caption: 'Ultra-sleek dark mode financial mobile interface with frosted glassmorphism.',
    category: 'UI/UX Design',
    code: '06 / 25',
    image: '/gallery/ui.jpg',
    tags: ['Dark Mode', 'Glassmorphism', 'Mobile App'],
    rotation: '-1.5deg',
    size: 'medium',
    art: 'ui',
    palette: ['#0d1117', '#ff9f1c', '#00f2fe'],
  },
  {
    id: 'artifact-sculpture',
    title: 'ARTIFACT: FUTURE FORM 3D',
    caption: 'Iridescent fluid chrome glass sculpture study with chromatic refractions.',
    category: '3D & CGI Art',
    code: '04 / 26',
    image: '/gallery/sculpture.jpg',
    tags: ['3D Sculpture', 'Chrome & Glass', 'Editorial'],
    rotation: '2.5deg',
    size: 'large',
    art: 'manip',
    palette: ['#0a0a0c', '#38ef7d', '#9b51e0'],
  },
  {
    id: 'brutalist-roots',
    title: 'THE NEW FORM EDITORIAL SPREAD',
    caption: 'High-fashion architectural magazine spread exploring brutalist typographic hierarchies.',
    category: 'Typography',
    code: '03 / 26',
    image: '/gallery/editorial.jpg',
    tags: ['Magazine Layout', 'Serif Display', 'Editorial'],
    rotation: '-1deg',
    size: 'medium',
    art: 'type',
    palette: ['#111111', '#777777', '#f5f3ec'],
  },
  {
    id: 'aurum-packaging',
    title: 'AURUM SPECIALTY COFFEE PACKAGING',
    caption: 'Matte black pouch with geometric debossed gold emblem and natural warm aesthetics.',
    category: 'Packaging',
    code: '02 / 26',
    image: '/gallery/packaging.jpg',
    tags: ['Matte Black', 'Gold Foil', 'Product Design'],
    rotation: '1.5deg',
    size: 'small',
    art: 'logo',
    palette: ['#1a1714', '#c59b27', '#e8dfd2'],
  },
]