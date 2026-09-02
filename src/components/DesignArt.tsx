import type { DesignPiece } from '../data/design'

export default function DesignArt({ piece }: { piece: DesignPiece }) {
  const [a, b, c] = piece.palette

  switch (piece.art) {
    case 'logo':
      return (
        <svg viewBox="0 0 400 320" className="h-full w-full select-none" aria-hidden="true">
          <defs>
            <linearGradient id="logo-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={b} />
              <stop offset="100%" stopColor={c} stopOpacity="0.35" />
            </linearGradient>
            <radialGradient id="logo-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={a} stopOpacity="0.08" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <rect width="400" height="320" fill="url(#logo-bg)" />
          <circle cx="200" cy="160" r="130" fill="url(#logo-glow)" />

          {/* Outer circle stamp with dashes */}
          <circle cx="200" cy="150" r="95" fill="none" stroke={a} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
          <circle cx="200" cy="150" r="86" fill="none" stroke={a} strokeWidth="2.5" />

          {/* Central Monogram / Icon */}
          <path d="M155 165 C155 125, 245 125, 245 165 C245 195, 155 195, 155 165 Z" fill="none" stroke={a} strokeWidth="4" />
          <circle cx="200" cy="135" r="14" fill={a} />
          <path d="M185 110 L215 110" stroke={c} strokeWidth="2" strokeLinecap="round" />
          <path d="M175 190 L225 190" stroke={a} strokeWidth="3" strokeLinecap="round" />

          {/* Typography */}
          <text x="200" y="80" textAnchor="middle" fontSize="11" fontWeight="800" letterSpacing="6" fill={a} opacity="0.85">
            ARTISANAL CRAFT
          </text>
          <text x="200" y="275" textAnchor="middle" fontSize="13" fontWeight="900" letterSpacing="4" fill={a}>
            EST. 2026 // STUDIO
          </text>
        </svg>
      )

    case 'poster':
      return (
        <svg viewBox="0 0 400 320" className="h-full w-full select-none" aria-hidden="true">
          <defs>
            <pattern id="grid-dots" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="8" cy="8" r="1" fill={c} opacity="0.5" />
            </pattern>
          </defs>
          <rect width="400" height="320" fill={b} />
          <rect width="400" height="320" fill="url(#grid-dots)" />

          {/* Big brutalist block */}
          <rect x="25" y="25" width="350" height="135" fill={a} rx="4" />
          <text x="45" y="85" fontSize="46" fontWeight="900" letterSpacing="-2" fill={b}>
            SYNTH
          </text>
          <text x="45" y="135" fontSize="42" fontWeight="900" letterSpacing="6" fill={c}>
            WAVE // 04
          </text>

          {/* Graphic Lines & Bars */}
          <path d="M25 185 L375 185" stroke={a} strokeWidth="4" />
          <path d="M25 195 L280 195" stroke={c} strokeWidth="2" />
          <circle cx="340" cy="235" r="32" fill={a} />
          <circle cx="340" cy="235" r="18" fill={b} />

          {/* Barcode graphic */}
          <g transform="translate(45, 230)">
            {[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7].map((w, i) => (
              <rect key={i} x={i * 12} y="0" width={w} height="40" fill={a} />
            ))}
          </g>
          <text x="45" y="290" fontSize="10" font-family="monospace" letterSpacing="3" fill={c}>
            SWISS GRID // EXPERIMENT
          </text>
        </svg>
      )

    case 'identity':
      return (
        <svg viewBox="0 0 400 320" className="h-full w-full select-none" aria-hidden="true">
          <defs>
            <linearGradient id="id-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={b} />
              <stop offset="100%" stopColor={c} stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <rect width="400" height="320" fill="url(#id-grad)" />

          {/* Stacked Business Cards Mockup */}
          <g transform="translate(60, 45) rotate(-6)">
            <rect width="180" height="110" rx="6" fill={c} opacity="0.3" />
          </g>
          <g transform="translate(70, 55) rotate(-3)">
            <rect width="180" height="110" rx="6" fill={b} stroke={a} strokeWidth="1.5" />
            <circle cx="35" cy="35" r="12" fill={a} />
            <rect x="55" y="30" width="70" height="6" rx="3" fill={a} />
            <rect x="55" y="42" width="40" height="4" rx="2" fill={c} />
            <rect x="25" y="75" width="130" height="2" fill={c} opacity="0.5" />
            <rect x="25" y="85" width="80" height="3" rx="1.5" fill={a} opacity="0.7" />
          </g>

          {/* Stationery Envelope */}
          <g transform="translate(160, 130) rotate(4)">
            <rect width="190" height="130" rx="8" fill={a} />
            <path d="M0 0 L95 65 L190 0" fill="none" stroke={b} strokeWidth="2" opacity="0.4" />
            <circle cx="95" cy="65" r="14" fill={b} />
            <circle cx="95" cy="65" r="8" fill={c} />
          </g>
        </svg>
      )

    case 'type':
      return (
        <svg viewBox="0 0 400 320" className="h-full w-full select-none" aria-hidden="true">
          <rect width="400" height="320" fill={b} />
          
          {/* Subtle typography metrics guide lines */}
          <path d="M30 65 L370 65" stroke={c} strokeWidth="0.75" strokeDasharray="3 3" opacity="0.7" />
          <path d="M30 190 L370 190" stroke={c} strokeWidth="0.75" opacity="0.7" />
          <path d="M30 250 L370 250" stroke={c} strokeWidth="0.75" strokeDasharray="3 3" opacity="0.7" />

          {/* Large Serif 'Aa' */}
          <text x="140" y="215" textAnchor="middle" fontSize="180" fontWeight="900" fontFamily="serif" fill={a}>
            A
          </text>
          <text x="270" y="215" textAnchor="middle" fontSize="140" fontWeight="400" fontStyle="italic" fontFamily="serif" fill={c}>
            g
          </text>

          {/* Typographic badges */}
          <text x="40" y="55" fontSize="10" fontWeight="700" letterSpacing="3" fill={a}>
            OPTICAL WEIGHT · 800
          </text>
          <text x="40" y="285" fontSize="11" fontFamily="monospace" letterSpacing="4" fill={c}>
            KERNING: -0.04em · GLYPH MATRIX
          </text>
        </svg>
      )

    case 'manip':
      return (
        <svg viewBox="0 0 400 320" className="h-full w-full select-none" aria-hidden="true">
          <defs>
            <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={a} />
              <stop offset="60%" stopColor={c} />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <rect width="400" height="320" fill={a} />

          {/* Celestial rings */}
          <circle cx="200" cy="160" r="120" fill="none" stroke={b} strokeWidth="1" opacity="0.2" />
          <circle cx="200" cy="160" r="95" fill="none" stroke={c} strokeWidth="1.5" opacity="0.4" />
          <circle cx="200" cy="160" r="70" fill={b} />

          {/* Eclipse Moon & Arch */}
          <circle cx="180" cy="150" r="58" fill={a} />
          <ellipse cx="200" cy="160" rx="140" ry="35" fill="none" stroke={c} strokeWidth="2.5" transform="rotate(-20 200 160)" />

          {/* Star nodes */}
          <circle cx="90" cy="80" r="2.5" fill={b} />
          <circle cx="310" cy="70" r="3" fill={b} />
          <circle cx="330" cy="240" r="2" fill={c} />
          <circle cx="80" cy="230" r="2.5" fill={b} />

          <text x="200" y="285" textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="6" fill={b} opacity="0.8">
            CELESTIAL // 09
          </text>
        </svg>
      )

    case 'ui':
      return (
        <svg viewBox="0 0 400 320" className="h-full w-full select-none" aria-hidden="true">
          <rect width="400" height="320" fill={b} />

          {/* Mobile App Screen Frame 1 */}
          <g transform="translate(60, 30)">
            <rect width="130" height="260" rx="18" fill={a} />
            {/* Screen Header */}
            <circle cx="30" cy="35" r="10" fill={b} />
            <rect x="48" y="28" width="50" height="6" rx="3" fill={b} />
            <rect x="48" y="38" width="30" height="4" rx="2" fill={c} />
            {/* Card Widget */}
            <rect x="15" y="60" width="100" height="65" rx="10" fill={c} opacity="0.25" />
            <rect x="25" y="75" width="45" height="12" rx="4" fill={b} />
            <rect x="25" y="95" width="80" height="18" rx="4" fill={b} opacity="0.9" />
            {/* Bottom pills */}
            <rect x="15" y="140" width="100" height="36" rx="8" fill={b} opacity="0.15" />
            <rect x="15" y="186" width="100" height="36" rx="8" fill={b} opacity="0.15" />
          </g>

          {/* Mobile App Screen Frame 2 (Shifted Glass Overlap) */}
          <g transform="translate(210, 50)">
            <rect width="130" height="240" rx="18" fill={b} stroke={a} strokeWidth="3" />
            {/* Header */}
            <rect x="20" y="25" width="60" height="8" rx="4" fill={a} />
            <rect x="20" y="45" width="90" height="40" rx="8" fill={a} />
            <circle cx="100" cy="115" r="18" fill={c} />
            <path d="M20 145 L110 145 M20 165 L90 165 M20 185 L105 185" stroke={c} strokeWidth="3" strokeLinecap="round" />
          </g>
        </svg>
      )

    case 'stamp':
      return (
        <svg viewBox="0 0 400 320" className="h-full w-full select-none" aria-hidden="true">
          <rect width="400" height="320" fill={b} />
          
          {/* Postage Stamp Outline with serrated border */}
          <g transform="translate(85, 35)">
            <rect width="230" height="250" fill={a} rx="6" />
            <rect x="12" y="12" width="206" height="226" fill={b} rx="4" stroke={a} strokeWidth="1.5" />
            
            {/* Inner Art */}
            <circle cx="115" cy="110" r="48" fill={a} />
            <path d="M95 110 L135 110 M115 90 L115 130" stroke={b} strokeWidth="4" strokeLinecap="round" />
            <circle cx="115" cy="110" r="32" fill="none" stroke={c} strokeWidth="2" strokeDasharray="3 3" />

            <text x="115" y="190" textAnchor="middle" fontSize="14" fontWeight="900" letterSpacing="4" fill={a}>
              POSTAGE // 26
            </text>
            <text x="115" y="210" textAnchor="middle" fontSize="9" fontWeight="700" letterSpacing="2" fill={c}>
              AIRMAIL EDITION
            </text>
          </g>
        </svg>
      )

    case 'motion':
      return (
        <svg viewBox="0 0 400 320" className="h-full w-full select-none" aria-hidden="true">
          <rect width="400" height="320" fill={b} />
          
          {/* Bezier wave paths */}
          <path
            d="M30 250 C 100 250, 130 90, 200 90 C 270 90, 300 230, 370 230"
            fill="none"
            stroke={a}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M30 270 C 100 270, 130 110, 200 110 C 270 110, 300 250, 370 250"
            fill="none"
            stroke={c}
            strokeWidth="3"
            strokeDasharray="6 6"
            strokeLinecap="round"
          />

          {/* Dynamic Motion Tracker Nodes */}
          <circle cx="200" cy="90" r="12" fill={a} />
          <circle cx="200" cy="90" r="6" fill={b} />
          
          <circle cx="300" cy="230" r="10" fill={c} />
          <circle cx="300" cy="230" r="4" fill={b} />

          {/* Timeline marks */}
          <g transform="translate(40, 45)">
            <rect width="320" height="6" rx="3" fill={c} opacity="0.3" />
            <rect width="180" height="6" rx="3" fill={a} />
            <circle cx="180" cy="3" r="8" fill={a} />
          </g>
          <text x="40" y="75" fontSize="11" fontFamily="monospace" fontWeight="700" letterSpacing="3" fill={a}>
            EASE-IN-OUT-CUBIC // 60 FPS
          </text>
        </svg>
      )

    default:
      return null
  }
}
