import { useEffect, useState, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import Reveal from '../components/Reveal'
import { designPieces, type DesignPiece } from '../data/design'
import { useContent } from '../store/ContentContext'
import { getImageUrl } from '../utils/supabase/storage'
import { extractPaletteFromImage } from '../utils/palette'

export default function Design() {
  const { content } = useContent()
  const [activePiece, setActivePiece] = useState<DesignPiece | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [extractedPalette, setExtractedPalette] = useState<string[] | null>(null)
  const [copiedHex, setCopiedHex] = useState<string | null>(null)

  // Touch swipe support for mobile photo carousel
  const touchStartX = useRef<number | null>(null)

  const allPieces = useMemo(() => {
    return content.designPieces && content.designPieces.length > 0
      ? content.designPieces
      : designPieces
  }, [content.designPieces])

  // Full gallery list (no placeholder hero) for lightbox navigation.
  // The hero featured piece is only promoted from the first real piece.
  const fullList = useMemo<DesignPiece[]>(
    () => (allPieces.length > 0 ? allPieces : []),
    [allPieces],
  )
  const heroPieceRef = allPieces.length > 0 ? allPieces[0] : null
  const activeIndex = activePiece ? fullList.findIndex((p) => p.id === activePiece.id) : -1

  // Resolve all images for the currently active piece
  const pieceImages = useMemo(() => {
    if (!activePiece) return []
    if (activePiece.images && activePiece.images.length > 0) return activePiece.images
    if (activePiece.storagePath) return [activePiece.storagePath]
    if (activePiece.image) return [activePiece.image]
    return []
  }, [activePiece])

  // Reset active photo index when switching to a different artwork
  useEffect(() => {
    setActiveImageIndex(0)
  }, [activePiece?.id])

  const currentPieceImage = pieceImages[activeImageIndex] || (activePiece?.storagePath || activePiece?.image)
  const currentImageUrl = currentPieceImage ? getImageUrl(currentPieceImage) : ''

  // Automatic Color Extraction from the active displayed photo
  useEffect(() => {
    if (!activePiece || !currentImageUrl) {
      setExtractedPalette(null)
      return
    }

    let isMounted = true
    extractPaletteFromImage(currentImageUrl, 4)
      .then((colors) => {
        if (isMounted) {
          if (colors && colors.length > 0) {
            setExtractedPalette(colors)
          } else {
            setExtractedPalette(null)
          }
        }
      })
      .catch(() => {
        if (isMounted) setExtractedPalette(null)
      })

    return () => {
      isMounted = false
    }
  }, [activePiece, currentImageUrl])

  // Palette to display: auto-extracted colors take precedence, falling back to piece.palette
  const displayPalette =
    extractedPalette && extractedPalette.length > 0
      ? extractedPalette
      : activePiece?.palette && activePiece.palette.length > 0
      ? activePiece.palette
      : ['#14120E', '#F1EFE7', '#8B8579']

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!activePiece) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActivePiece(null)
      } else if (e.key === 'ArrowRight') {
        if (pieceImages.length > 1 && activeImageIndex < pieceImages.length - 1) {
          setActiveImageIndex((i) => i + 1)
        } else {
          const idx = fullList.findIndex((p) => p.id === activePiece.id)
          if (idx !== -1 && idx < fullList.length - 1) {
            setActivePiece(fullList[idx + 1])
          } else if (idx === fullList.length - 1) {
            setActivePiece(fullList[0])
          }
        }
      } else if (e.key === 'ArrowLeft') {
        if (pieceImages.length > 1 && activeImageIndex > 0) {
          setActiveImageIndex((i) => i - 1)
        } else {
          const idx = fullList.findIndex((p) => p.id === activePiece.id)
          if (idx > 0) {
            setActivePiece(fullList[idx - 1])
          } else if (idx === 0) {
            setActivePiece(fullList[fullList.length - 1])
          }
        }
      }
    }

    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [activePiece, fullList, pieceImages, activeImageIndex])

  const copyColor = (hex: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard?.writeText?.(hex)
    setCopiedHex(hex)
    setTimeout(() => setCopiedHex(null), 1500)
  }

  // Next / Prev photo handlers
  const handlePrevPhoto = (e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation()
    if (pieceImages.length > 1) {
      setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : pieceImages.length - 1))
    } else {
      const idx = activeIndex > 0 ? activeIndex - 1 : fullList.length - 1
      setActivePiece(fullList[idx])
    }
  }

  const handleNextPhoto = (e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation()
    if (pieceImages.length > 1) {
      setActiveImageIndex((prev) => (prev < pieceImages.length - 1 ? prev + 1 : 0))
    } else {
      const idx = activeIndex < fullList.length - 1 ? activeIndex + 1 : 0
      setActivePiece(fullList[idx])
    }
  }

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diffX = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(diffX) > 40) {
      if (diffX < 0) {
        handleNextPhoto()
      } else {
        handlePrevPhoto()
      }
    }
  }

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

        {/* Hero Wide Panoramic Featured Image (first real piece) */}
        {heroPieceRef && (
          <Reveal className="mt-8">
            <div
              onClick={() => setActivePiece(heroPieceRef)}
              className="surface surface-lift group relative aspect-[16/9] w-full cursor-pointer overflow-hidden bg-night sm:aspect-[21/9]"
            >
              <img
                src={getImageUrl(
                  heroPieceRef.storagePath,
                  heroPieceRef.images && heroPieceRef.images.length > 0 ? heroPieceRef.images[0] : heroPieceRef.image,
                )}
                alt={heroPieceRef.title}
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
        )}

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
        {allPieces.length === 0 ? (
          <Reveal className="mt-10 flex flex-col items-center gap-3 py-16 text-center">
            <span className="chip chip-strong">EMPTY ARCHIVE</span>
            <p className="font-mono text-sm text-ink-faint">
              No design pieces have been added yet. Manage them from the dashboard.
            </p>
          </Reveal>
        ) : (
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
                      src={getImageUrl(
                        piece.storagePath,
                        piece.images && piece.images.length > 0 ? piece.images[0] : piece.image,
                      )}
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
        )}
      </div>

      {/* Lightbox Modal — mounted via portal directly to document.body to center on viewport */}
      {activePiece &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
            style={{
              paddingTop: 'max(5.5rem, calc(env(safe-area-inset-top) + 4.5rem))',
              paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
            }}
            role="dialog"
            aria-modal="true"
            aria-label={`${activePiece.title} — full view`}
            onClick={() => setActivePiece(null)}
          >
            {/* Ambient Backdrop */}
            <div className="fixed inset-0 bg-night/90 backdrop-blur-md transition-opacity duration-300" />

            {/* Modal Container */}
            <div
              className="surface relative z-10 my-auto flex w-full max-w-5xl max-h-[86vh] flex-col overflow-y-auto shadow-paper-lg transition-all duration-300 md:flex-row md:overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left: Artwork Display with object-contain to show entire artwork */}
              <div
                className="relative flex-1 bg-night flex flex-col items-center justify-center overflow-hidden min-h-[280px] md:min-h-[520px] p-4 sm:p-6 pt-6 sm:pt-6 select-none"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div className="relative w-full flex-1 flex items-center justify-center min-h-0">
                  <img
                    src={currentImageUrl}
                    alt={`${activePiece.title} - Image ${activeImageIndex + 1}`}
                    decoding="async"
                    className="h-full w-full object-contain max-h-[48vh] md:max-h-[68vh] rounded-btn shadow-md mt-2 sm:mt-0 transition-all duration-300 pointer-events-none"
                  />

                  {/* Left & Right Navigation Arrows for cycling photos on phone and desktop */}
                  {(pieceImages.length > 1 || fullList.length > 1) && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevPhoto}
                        onTouchEnd={(e) => {
                          e.stopPropagation()
                          handlePrevPhoto()
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-30 h-10 w-10 sm:h-9 sm:w-9 flex items-center justify-center rounded-full bg-black/60 text-white border border-white/30 shadow-lg backdrop-blur-md hover:bg-black/80 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        aria-label={pieceImages.length > 1 ? "Previous photo" : "Previous artwork"}
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={handleNextPhoto}
                        onTouchEnd={(e) => {
                          e.stopPropagation()
                          handleNextPhoto()
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-30 h-10 w-10 sm:h-9 sm:w-9 flex items-center justify-center rounded-full bg-black/60 text-white border border-white/30 shadow-lg backdrop-blur-md hover:bg-black/80 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        aria-label={pieceImages.length > 1 ? "Next photo" : "Next artwork"}
                      >
                        ›
                      </button>
                    </>
                  )}

                  {/* Image Counter Badge when piece has multiple images */}
                  {pieceImages.length > 1 && (
                    <span className="absolute bottom-2 right-2 chip chip-strong text-[11px] font-mono shadow-md backdrop-blur-sm bg-night/80 text-paper z-20">
                      {activeImageIndex + 1} / {pieceImages.length}
                    </span>
                  )}
                </div>

                {/* Multiple Images Thumbnail Strip */}
                {pieceImages.length > 1 && (
                  <div className="mt-3 flex items-center justify-center gap-2 overflow-x-auto max-w-full py-1 px-1 z-20">
                    {pieceImages.map((imgItem, idx) => {
                      const thumbUrl = getImageUrl(imgItem)
                      const isCurrent = idx === activeImageIndex
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveImageIndex(idx)
                          }}
                          className={`relative h-11 w-11 flex-shrink-0 overflow-hidden rounded border transition-all ${
                            isCurrent
                              ? 'border-accent ring-2 ring-accent/40 scale-105 opacity-100'
                              : 'border-white/20 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={thumbUrl}
                            alt={`Thumb ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Right: Curated Spec & Description Panel */}
              <div className="flex w-full flex-col justify-between border-t border-line p-5 sm:p-8 md:w-[380px] md:border-l md:border-t-0 md:overflow-y-auto">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="micro-label font-bold uppercase tracking-wider text-ink-faint">
                      {activePiece.category || 'Artwork'}
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

                  <h3 className="mt-4 text-2xl font-bold uppercase tracking-tight text-ink sm:text-3xl">
                    {activePiece.title}
                  </h3>

                  {/* Description Section */}
                  <div className="mt-4 border-t border-line pt-4">
                    <span className="micro-label text-ink-faint">Description</span>
                    <p className="mt-1.5 text-sm sm:text-base leading-relaxed text-ink/90 font-medium">
                      {activePiece.caption}
                    </p>
                  </div>

                  {/* Tags if available */}
                  {activePiece.tags && activePiece.tags.length > 0 && (
                    <div className="mt-4 border-t border-line pt-4">
                      <span className="micro-label text-ink-faint">Tags</span>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {activePiece.tags.map((tag) => (
                          <span key={tag} className="chip text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Number & Code */}
                  {activePiece.code && (
                    <div className="mt-4 border-t border-line pt-3 flex items-center justify-between">
                      <span className="font-mono text-xs text-ink-faint">INDEX REF</span>
                      <span className="font-mono text-lg font-light text-ink">{activePiece.code}</span>
                    </div>
                  )}

                  {/* Color Palette Specimen — Automatically extracted or saved */}
                  {displayPalette && displayPalette.length > 0 && (
                    <div className="surface-muted mt-5 p-4">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-faint">
                        Palette Breakdown
                      </span>
                      <div className="mt-2.5 flex flex-col gap-1.5">
                        {displayPalette.map((color, cIdx) => (
                          <div
                            key={cIdx}
                            onClick={(e) => copyColor(color, e)}
                            className="group/row flex cursor-pointer items-center justify-between rounded-btn p-1.5 transition-colors hover:bg-card"
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className="h-4 w-4 rounded-full border border-ink/15 shadow-paper-sm flex-shrink-0"
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
                <div className="mt-6 border-t border-line pt-4 flex items-center justify-between">
                  <span className="font-mono text-xs text-ink-faint">
                    0{activeIndex + 1} / 0{fullList.length}
                  </span>

                  <div className="flex items-center gap-2">
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
          </div>,
          document.body,
        )}
    </section>
  )
}
