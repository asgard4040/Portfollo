/**
 * Intelligent color palette extraction from an image using HTML5 Canvas.
 * Extracts dominant, distinct, and vibrant colors in Hex format (#RRGGBB).
 */

interface RGB {
  r: number
  g: number
  b: number
}

function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (c: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

function colorDistance(c1: RGB, c2: RGB): number {
  // Perceptually weighted Euclidean color distance
  const dr = c1.r - c2.r
  const dg = c1.g - c2.g
  const db = c1.b - c2.b
  return Math.sqrt(dr * dr * 0.299 + dg * dg * 0.587 + db * db * 0.114)
}

function getSaturation({ r, g, b }: RGB): number {
  const max = Math.max(r, g, b) / 255
  const min = Math.min(r, g, b) / 255
  if (max === min) return 0
  const l = (max + min) / 2
  return l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min)
}

/**
 * Extracts a palette of `count` distinct hex colors from an image URL or image element.
 */
export async function extractPaletteFromImage(
  src: string,
  count = 4,
): Promise<string[]> {
  if (!src) return []

  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    // Prevent hanging
    const timeout = setTimeout(() => {
      resolve([])
    }, 4000)

    img.onload = () => {
      clearTimeout(timeout)
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) {
          resolve([])
          return
        }

        // Downscale for fast and noise-filtered sampling
        const sampleSize = 64
        canvas.width = sampleSize
        canvas.height = sampleSize
        ctx.drawImage(img, 0, 0, sampleSize, sampleSize)

        const imgData = ctx.getImageData(0, 0, sampleSize, sampleSize).data
        const colorBuckets = new Map<string, { rgb: RGB; count: number; weight: number }>()

        // Step 1: Quantize pixels into 5-bit color buckets
        for (let i = 0; i < imgData.length; i += 4) {
          const a = imgData[i + 3]
          if (a < 128) continue // Ignore transparent

          const r = imgData[i]
          const g = imgData[i + 1]
          const b = imgData[i + 2]

          // Ignore extreme near-white or extreme near-black as sole representation
          const isExtreme = (r > 250 && g > 250 && b > 250) || (r < 5 && g < 5 && b < 5)

          // 5-bit quantization (32 bins per channel)
          const qr = (r >> 3) << 3
          const qg = (g >> 3) << 3
          const qb = (b >> 3) << 3
          const key = `${qr},${qg},${qb}`

          const sat = getSaturation({ r, g, b })
          // Boost vibrant and saturated colors slightly so palette isn't pure muddy gray
          const weight = (1 + sat * 1.5) * (isExtreme ? 0.3 : 1)

          const existing = colorBuckets.get(key)
          if (existing) {
            existing.count += 1
            existing.weight += weight
          } else {
            colorBuckets.set(key, { rgb: { r: qr, g: qg, b: qb }, count: 1, weight })
          }
        }

        if (colorBuckets.size === 0) {
          resolve([])
          return
        }

        // Step 2: Sort candidates by weighted frequency
        const sorted = Array.from(colorBuckets.values()).sort((a, b) => b.weight - a.weight)

        // Step 3: Greedily pick distinct colors with minimum distance
        const picked: RGB[] = []
        const minDistance = 38 // Minimum perceptual difference threshold

        for (const candidate of sorted) {
          if (picked.length >= count) break
          const isTooClose = picked.some((p) => colorDistance(p, candidate.rgb) < minDistance)
          if (!isTooClose) {
            picked.push(candidate.rgb)
          }
        }

        // If not enough distinct colors found, relax distance
        if (picked.length < count) {
          for (const candidate of sorted) {
            if (picked.length >= count) break
            const isTooClose = picked.some((p) => colorDistance(p, candidate.rgb) < 20)
            if (!isTooClose) {
              picked.push(candidate.rgb)
            }
          }
        }

        const hexPalette = picked.map(rgbToHex)
        resolve(hexPalette)
      } catch (err) {
        console.warn('Palette extraction failed (possibly CORS restricted):', err)
        resolve([])
      }
    }

    img.onerror = () => {
      clearTimeout(timeout)
      resolve([])
    }

    img.src = src
  })
}
