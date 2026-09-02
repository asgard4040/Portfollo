# Ali Imad — Developer & Graphic Designer Portfolio

A playful, handmade, paper-and-scrapbook styled personal portfolio built with **React**, **TypeScript**, and **Tailwind CSS**.

## Running locally

```bash
npm install
npm run dev
```

Open the printed local URL. To build for production:

```bash
npm run build
npm run preview
```

## Project structure

```
src/
├── components/   # Reusable UI pieces (Reveal, Squiggle, Doodles, Navigation, Footer…)
├── sections/     # One file per page section (Hero, About, Skills, Projects, Design, Contact)
├── hooks/        # Small behaviour hooks (useParallax)
├── data/         # Editable content (projects, skills, design pieces, site copy)
└── assets/       # SVGs and image assets
```

## Editing content

Keep your data and UI separate. All copy lives in `src/data/`:

- `site.ts` — name, role, intro and navigation labels
- `projects.ts` — the development projects grid
- `skills.ts` — programming + graphic design skill cards and tools
- `design.ts` — the graphic design gallery (each piece renders an inline SVG placeholder)

Project previews and design gallery art are lightweight inline SVG/CSS placeholders with no image downloads. When you have real screenshots, drop them in `src/assets/`, then swap the `ProjectPreview` and `DesignArt` component internals for `<img>` tags. Add a `screenshot` field to the `Project` type and load it with `loading="lazy"`.

## Notes

- The Hero reserves a `#hero-3d-stage` area for a future small interactive 3D element — the current version stays fully 2D.
- Animations respect `prefers-reduced-motion` and are disabled on touch devices where appropriate.
- Mobile-first: navigation collapses to a menu, project cards stack vertically, and the design gallery scrolls naturally without hover-dependent interactions.
