import { useCallback, useRef, useState } from 'react'
import {
  uploadImage,
  deleteImage,
  getImageUrl,
  type ImageFolder,
} from '../utils/supabase/storage'

interface MultiImageUploadProps {
  folder: ImageFolder
  slug: string
  images: string[]
  onChange: (images: string[]) => void
  label?: string
}

export default function MultiImageUpload({
  folder,
  slug,
  images = [],
  onChange,
  label = 'Add Project Images',
}: MultiImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'))
      if (!files.length) return

      setUploading(true)
      setUploadError(null)
      const uploadedPaths: string[] = []

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          setUploadProgress(`Uploading ${i + 1} of ${files.length}…`)
          const { path } = await uploadImage(folder, slug, file)
          uploadedPaths.push(path)
        }

        onChange([...images, ...uploadedPaths])
      } catch (err) {
        console.error('Multi-upload failed:', err)
        const message =
          err instanceof Error && err.message
            ? err.message
            : 'Upload failed. Check that Supabase is configured.'
        setUploadError(message)
      } finally {
        setUploading(false)
        setUploadProgress(null)
        if (inputRef.current) inputRef.current.value = ''
      }
    },
    [folder, slug, images, onChange],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files)
      }
    },
    [handleFiles],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles],
  )

  const handleRemove = useCallback(
    async (indexToRemove: number, e: React.MouseEvent) => {
      e.stopPropagation()
      const pathToRemove = images[indexToRemove]
      if (pathToRemove) {
        await deleteImage(pathToRemove).catch(() => {})
      }
      const next = images.filter((_, idx) => idx !== indexToRemove)
      onChange(next)
    },
    [images, onChange],
  )

  const handleSetCover = useCallback(
    (indexToCover: number, e: React.MouseEvent) => {
      e.stopPropagation()
      if (indexToCover === 0) return
      const item = images[indexToCover]
      const rest = images.filter((_, idx) => idx !== indexToCover)
      onChange([item, ...rest])
    },
    [images, onChange],
  )

  const handleMove = useCallback(
    (index: number, direction: -1 | 1, e: React.MouseEvent) => {
      e.stopPropagation()
      const target = index + direction
      if (target < 0 || target >= images.length) return
      const next = [...images]
      ;[next[index], next[target]] = [next[target], next[index]]
      onChange(next)
    },
    [images, onChange],
  )

  return (
    <div className="space-y-3">
      {/* Thumbnails grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((path, idx) => {
          const url = getImageUrl(path)
          const isCover = idx === 0
          return (
            <div
              key={`${path}-${idx}`}
              className="group relative aspect-[16/10] overflow-hidden rounded-btn border border-line bg-night shadow-paper-sm"
            >
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Cover badge */}
              {isCover && (
                <span className="micro-label absolute left-1.5 top-1.5 rounded-full bg-paper/90 px-2 py-0.5 font-bold text-ink shadow-sm backdrop-blur-xs">
                  ★ Cover
                </span>
              )}

              {/* Index chip */}
              <span className="micro-label absolute left-1.5 bottom-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                #{idx + 1}
              </span>

              {/* Hover overlay controls */}
              <div className="absolute inset-0 flex flex-col justify-between bg-night/60 p-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <div className="flex items-center justify-between">
                  {!isCover ? (
                    <button
                      type="button"
                      onClick={(e) => handleSetCover(idx, e)}
                      className="rounded bg-paper px-1.5 py-0.5 text-[10px] font-bold text-ink hover:bg-white shadow-sm"
                      title="Set as project cover"
                    >
                      ★ Set cover
                    </button>
                  ) : (
                    <span />
                  )}

                  <button
                    type="button"
                    onClick={(e) => handleRemove(idx, e)}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white hover:bg-red-700 shadow-sm"
                    title="Delete image"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex items-center justify-end gap-1">
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={(e) => handleMove(idx, -1, e)}
                      className="flex h-5 w-5 items-center justify-center rounded bg-paper/90 text-xs font-bold text-ink hover:bg-white"
                      title="Move left"
                    >
                      ←
                    </button>
                  )}
                  {idx < images.length - 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleMove(idx, 1, e)}
                      className="flex h-5 w-5 items-center justify-center rounded bg-paper/90 text-xs font-bold text-ink hover:bg-white"
                      title="Move right"
                    >
                      →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* Upload card button */}
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`flex aspect-[16/10] cursor-pointer flex-col items-center justify-center rounded-btn border-2 border-dashed border-ink/25 p-3 text-center transition-colors hover:border-ink/60 hover:bg-paper-2/50 ${
            uploading ? 'opacity-60 cursor-not-allowed' : ''
          }`}
          role="button"
          tabIndex={0}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleChange}
            disabled={uploading}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg animate-pulse">⏳</span>
              <span className="text-xs font-bold text-ink">{uploadProgress || 'Uploading…'}</span>
            </div>
          ) : (
            <>
              <span className="text-2xl text-ink-faint leading-none">+</span>
              <span className="mt-1 text-xs font-bold text-ink">{label}</span>
              <span className="text-[10px] text-ink-faint">Select 1 or multiple</span>
            </>
          )}
        </div>
      </div>

      {uploadError && (
        <p className="text-xs font-bold text-red-600" role="alert">
          {uploadError}
        </p>
      )}
    </div>
  )
}
