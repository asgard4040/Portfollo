import { useState } from 'react'
import { extractPaletteFromImage } from '../utils/palette'

interface GalleryPaletteFieldProps {
  palette: string[]
  imageUrl?: string
  onChange: (palette: string[]) => void
}

export default function GalleryPaletteField({
  palette = [],
  imageUrl,
  onChange,
}: GalleryPaletteFieldProps) {
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState<string | null>(null)

  const handleAutoExtract = async () => {
    if (!imageUrl) {
      setExtractError('Please upload an image first to auto-extract colors.')
      return
    }

    setExtracting(true)
    setExtractError(null)

    try {
      const colors = await extractPaletteFromImage(imageUrl, 4)
      if (colors && colors.length > 0) {
        onChange(colors)
      } else {
        setExtractError('Could not extract colors from this image.')
      }
    } catch (err) {
      console.error('Palette extraction failed:', err)
      setExtractError('Failed to extract colors.')
    } finally {
      setExtracting(false)
    }
  }

  const handleColorChange = (index: number, newColor: string) => {
    const next = [...palette]
    next[index] = newColor
    onChange(next)
  }

  const handleRemoveColor = (index: number) => {
    const next = palette.filter((_, i) => i !== index)
    onChange(next)
  }

  const handleAddColor = () => {
    onChange([...palette, '#888888'])
  }

  return (
    <div className="sm:col-span-2 rounded-btn border border-line bg-card/60 p-3.5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="field-label mb-0">Palette Breakdown (Colors)</span>
          <p className="text-[11px] text-ink-faint">
            Extracted from the artwork and showcased in the gallery lightbox
          </p>
        </div>

        <button
          type="button"
          onClick={handleAutoExtract}
          disabled={extracting || !imageUrl}
          className={`btn btn-sm ${
            !imageUrl
              ? 'opacity-40 cursor-not-allowed btn-outline'
              : extracting
              ? 'btn-outline animate-pulse'
              : 'btn-solid'
          }`}
          title={!imageUrl ? 'Upload an image first' : 'Automatically extract colors from image'}
        >
          {extracting ? 'Analyzing image…' : '✦ Auto-extract from image'}
        </button>
      </div>

      {extractError && (
        <p className="text-xs text-red-600 font-bold">{extractError}</p>
      )}

      {/* Visual specimen preview */}
      {palette.length > 0 ? (
        <div className="flex h-5 w-full overflow-hidden rounded border border-ink/15 shadow-paper-sm">
          {palette.map((color, idx) => (
            <div
              key={idx}
              className="flex-1 transition-all hover:flex-[1.5]"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs text-ink-faint italic">No colors in palette yet. Click auto-extract or add a color.</p>
      )}

      {/* Color inputs list */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {palette.map((color, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1.5 rounded border border-line bg-paper px-2 py-1 shadow-xs"
          >
            {/* Native color picker square */}
            <input
              type="color"
              value={color.startsWith('#') && color.length === 7 ? color : '#000000'}
              onChange={(e) => handleColorChange(idx, e.target.value.toUpperCase())}
              className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
              title="Pick color"
            />

            {/* Hex text input */}
            <input
              type="text"
              value={color}
              onChange={(e) => handleColorChange(idx, e.target.value)}
              className="w-full font-mono text-xs text-ink bg-transparent focus:outline-none uppercase"
              maxLength={9}
            />

            {/* Remove button */}
            <button
              type="button"
              onClick={() => handleRemoveColor(idx)}
              className="text-xs font-bold text-ink-faint hover:text-red-600 px-1"
              title="Remove color"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddColor}
          className="flex items-center justify-center rounded border border-dashed border-ink/25 text-xs font-bold text-ink-faint hover:border-ink/60 hover:text-ink transition-colors py-1"
        >
          + Add color
        </button>
      </div>
    </div>
  )
}
