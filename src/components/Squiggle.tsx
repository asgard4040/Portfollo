interface SquiggleProps {
  color?: string
  className?: string
}

export default function Squiggle({ color = '#14120e', className = '' }: SquiggleProps) {
  return (
    <svg
      className={`s-line-wrap ${className}`}
      viewBox="0 0 200 12"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        className="draw-path"
        d="M3 8 C 20 3, 38 3, 52 7 S 82 12, 98 6 S 128 2, 146 7 S 182 11, 197 5"
        fill="none"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  )
}
