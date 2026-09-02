/* A small library of monochrome hand-drawn SVG marks used across the site.
   All strokes use currentColor so they adapt to paper or inverted sections.
   Animated via CSS (.draw-path) when revealed. */

interface DoodleProps {
  className?: string
}

export function DrawArrow({ className = '' }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 80 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 34 C 22 34, 34 30, 42 22 C 48 16, 52 10, 58 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="draw-path"
      />
      <path
        d="M50 4 L 59 5 L 57 14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Paperclip({ className = '' }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 21 20 9a3 3 0 0 0-4.2-4.2L4 16.6a2 2 0 0 0 2.8 2.8L18 8.2a1 1 0 0 0-1.4-1.4L6 17.4" />
    </svg>
  )
}

export function Zigzag({ className = '' }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 120 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M2 8 L14 3 L26 8 L38 3 L50 8 L62 3 L74 8 L86 3 L98 8 L110 3 L118 8" />
    </svg>
  )
}

/* Minimal eye / aperture mark for the reserved 3D stage. */
export function EyeMark({ className = '' }: DoodleProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="33" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="1.4" strokeDasharray="4 5" />
      <circle cx="50" cy="50" r="5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M50 2v14M50 84v14M2 50h14M84 50h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

/* Small pencil / scribble mark used on paper cards. */
export function PencilMark({ className = '' }: DoodleProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 10 L22 10 M6 18 L22 18 M6 26 L18 26"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="26" cy="10" r="1.6" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="26" cy="18" r="1.6" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="24" cy="26" r="1.6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

/* Small handheld arrow-knob used as a "goto" marker. */
export function KnobMark({ className = '' }: DoodleProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 12h14M14 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="draw-path" />
    </svg>
  )
}