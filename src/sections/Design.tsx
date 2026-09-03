import { useEffect, useState, useMemo } from 'react'
import Reveal from '../components/Reveal'
import { heroPiece, designPieces, type DesignPiece } from '../data/design'
import { useContent } from '../store/ContentContext'
import { getImageUrl } from '../utils/supabase/storage'

export default function Design() {
  const { content } = useContent()
  const [activePiece, setActivePiece] = useState<DesignPiece | null>(null)
  const [copiedHex, setCopiedHex] = useState<string | null>(null)

  const allPieces = useMemo(() => {
    return content.designPieces && content.designPieces.length > 0
      ? content.designPieces
      : designPieces
  }, [content.designPieces])

  // Full gallery list including heroPiece for lightbox navigation
  const fullList = useMemo(() => [heroPiece, ...allPieces], [allPieces])

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!activePiece) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActivePiece(null)
      } else if (e.key === 'ArrowRight') {
        const idx = fullList.findIndex((p) => p.id === activePiece.id)
        if (idx !== -1 && idx < fullList.length - 1) {
          setActivePiece(fullList[idx + 1])
        } else if (idx === fullList.length - 1) {
          setActivePiece(fullList[0])
        }
      } else if (e.key === 'ArrowLeft') {
        const idx = fullList.findIndex((p) => p.id === activePiece.id)
        if (idx > 0) {
          setActivePiece(fullList[idx - 1])
        } else if (idx === 0) {
          setActivePiece(fullList[fullList.length - 1])
        }
      }
    }

    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [activePiece, fullList])

  const copyColor = (hex: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard?.writeText?.(hex)
    setCopiedHex(hex)
    setTimeout(() => setCopiedHex(null), 1500)
  }

  const activeIndex = activePiece ? fullList.findIndex((p) => p.id === activePiece.id) : -1

  return (
    <section id="design" className="relative border-t border-line bg-transparent px-4 py-16 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        {/* Editorial Top Meta Bar */}
        <Reveal className="flex items-center justify-between border-b border-line pb-4 font-mono text-[11px] uppercase tracking-widest text-ink-faint">
          <span>ARCHIVE // 04</span>
          <span className="hidden sm:inline">ALI IMAD © 2026</span>
          <span>SELECTED WORK</span>
        </Reveal>

        {/* Big Editorial Header */}
        <Reveal className="mt-8 flex flex-col justify-between gap-2 sm:flex-row sm:items-baseline">
          <h2 className="text-4xl font-extrabold uppercase tracking-tight text-ink sm:text-6xl md:text-7xl">
            DESIGNS
          </h2>
          <span className="font-serif text-4xl font-normal italic tracking-tight text-ink sm:text-6xl md:text-7xl">
            GALLERY
          </span>
        </Reveal>

        {/* Hero Wide Panoramic Featured Image */}
        <Reveal className="mt-8">
          <div
            onClick={() => setActivePiece(heroPiece)}
            className="surface surface-lift group relative aspect-[16/9] w-full cursor-pointer overflow-hidden bg-night sm:aspect-[21/9]"
          >
            <img
              src={getImageUrl(heroPiece.storagePath, heroPiece.image)}
              alt={heroPiece.title}
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-night/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="chip chip-strong backdrop-blur-sm">
                View Editorial
              </span>
            </div>
          </div>
        </Reveal>

        {/* Sub-Nav Bar: PREV / NEXT style editorial strip without filters */}
        <Reveal className="mt-6 flex items-center justify-between border-y border-line py-2 font-mono text-xs font-bold uppercase tracking-wider text-ink">
          <button
            type="button"
            onClick={() => {
              const prevIdx = activeIndex > 0 ? activeIndex - 1 : fullList.length - 1
              setActivePiece(fullList[prevIdx])
            }}
            className="btn btn-ghost btn-sm btn-round"
          >
            <span>PREV</span>
          </button>

          <span className="text-ink">
            ALL ({allPieces.length.toString().padStart(2, '0')})
          </span>

          <button
            type="button"
            onClick={() => {
              const nextIdx = activeIndex < fullList.length - 1 ? activeIndex + 1 : 0
              setActivePiece(fullList[nextIdx])
            }}
            className="btn btn-ghost btn-sm btn-round"
          >
            <span>NEXT</span>
          </button>
        </Reveal>

        {/* 2-Column Editorial Grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-12 md:grid-cols-2 md:gap-x-8 md:gap-y-12">
          {allPieces.map((piece, i) => (
            <Reveal key={piece.id} delay={i * 70}>
              <div
                onClick={() => setActivePiece(piece)}
                className="surface surface-lift group flex cursor-pointer flex-col overflow-hidden"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-night">
                  <img
                    src={getImageUrl(piece.storagePath, piece.image)}
                    alt={piece.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-night/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>

                {/* Bottom Metadata & Number Layout */}
                <div className="flex items-start justify-between gap-4 border-t border-line p-4 sm:p-5">
                  <div className="flex-1 pr-2">
                    <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink group-hover:text-ink-soft transition-colors">
                      {piece.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-ink-faint">
                      {piece.caption}
                    </p>
                  </div>

                  {/* Big Editorial Index Number */}
                  <div className="font-mono text-2xl font-light tracking-tight text-ink sm:text-3xl flex-shrink-0">
                    {piece.code || `0${i + 1} / 26`}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activePiece && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`${activePiece.title} — full view`}
          onClick={() => setActivePiece(null)}
        >
          {/* Ambient Backdrop */}
          <div className="absolute inset-0 bg-night/90 backdrop-blur-md transition-opacity duration-300" />

          {/* Modal Container */}
          <div
            className="surface relative z-10 flex w-full max-w-5xl flex-col overflow-hidden shadow-paper-lg transition-all duration-300 md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: High-Res Artwork Display */}
            <div className="relative flex-1 bg-night flex items-center justify-center overflow-hidden min-h-[320px] md:min-h-[500px]">
              <img
                src={getImageUrl(activePiece.storagePath, activePiece.image)}
                alt={activePiece.title}
                decoding="async"
                className="h-full w-full object-cover max-h-[75vh]"
              />

              {/* Mobile Prev / Next overlay */}
              <div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-between pointer-events-none md:hidden">
                <button
                  type="button"
                  onClick={() => {
                    const idx = activeIndex > 0 ? activeIndex - 1 : fullList.length - 1
                    setActivePiece(fullList[idx])
                  }}
                  className="btn btn-outline btn-icon btn-sm btn-round pointer-events-auto backdrop-blur-md"
                  aria-label="Previous"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const idx = activeIndex < fullList.length - 1 ? activeIndex + 1 : 0
                    setActivePiece(fullList[idx])
                  }}
                  className="btn btn-outline btn-icon btn-sm btn-round pointer-events-auto backdrop-blur-md"
                  aria-label="Next"
                >
                  →
                </button>
              </div>
            </div>

            {/* Right: Curated Spec & Metadata Panel */}
            <div className="flex w-full flex-col justify-between border-t border-line p-6 md:w-96 md:border-l md:border-t-0 sm:p-8">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink-faint">
                    {activePiece.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivePiece(null)}
                    className="btn btn-outline btn-icon btn-sm btn-round"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                <h3 className="mt-5 text-xl font-bold uppercase tracking-tight text-ink sm:text-2xl">
                  {activePiece.title}
                </h3>
                
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  {activePiece.caption}
                </p>

                {/* Number & Code */}
                {activePiece.code && (
                  <div className="mt-6 border-t border-line pt-4 flex items-center justify-between">
                    <span className="font-mono text-xs text-ink-faint">INDEX REF</span>
                    <span className="font-mono text-xl font-light text-ink">{activePiece.code}</span>
                  </div>
                )}

                {/* Color Palette Specimen */}
                {activePiece.palette && (
                  <div className="surface-muted mt-6 p-4">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-faint">
                      Palette Breakdown
                    </span>
                    <div className="mt-2.5 flex flex-col gap-1.5">
                      {activePiece.palette.map((color, cIdx) => (
                        <div
                          key={cIdx}
                          onClick={(e) => copyColor(color, e)}
                          className="group/row flex cursor-pointer items-center justify-between rounded-btn p-1.5 transition-colors hover:bg-card"
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className="h-4 w-4 rounded-full border border-ink/15 shadow-paper-sm"
                              style={{ backgroundColor: color }}
                            />
                            <span className="font-mono text-xs font-semibold text-ink">{color}</span>
                          </div>
                          <span className="font-mono text-[10px] text-ink-faint group-hover/row:text-ink">
                            {copiedHex === color ? 'Copied!' : 'Copy'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Lightbox Navigation Footer */}
              <div className="mt-8 border-t border-line pt-4 flex items-center justify-between">
                <span className="font-mono text-xs text-ink-faint">
                  0{activeIndex + 1} / 0{fullList.length}
                </span>

                <div className="hidden md:flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const idx = activeIndex > 0 ? activeIndex - 1 : fullList.length - 1
                      setActivePiece(fullList[idx])
                    }}
                    className="btn btn-outline btn-icon btn-sm btn-round"
                    aria-label="Previous artwork"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const idx = activeIndex < fullList.length - 1 ? activeIndex + 1 : 0
                      setActivePiece(fullList[idx])
                    }}
                    className="btn btn-outline btn-icon btn-sm btn-round"
                    aria-label="Next artwork"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
