import { useCallback, useRef, useState } from 'react'
import {
  uploadImage,
  deleteImage,
  getImageUrl,
  type ImageFolder,
} from '../utils/supabase/storage'

interface ImageUploadProps {
  folder: ImageFolder
  slug: string
  currentPath?: string | null
  onUploaded: (path: string, url: string) => void
  onRemoved?: () => void
  className?: string
  label?: string
  aspectClass?: string
}

export default function ImageUpload({
  folder,
  slug,
  currentPath,
  onUploaded,
  onRemoved,
  className = '',
  label = 'Upload image',
  aspectClass = 'aspect-[16/9]',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const displayUrl = preview ?? getImageUrl(currentPath)

  const handleFile = useCallback(
    async (file: File) => {
      setUploading(true)
      setUploadError(null)
      try {
        const objectUrl = URL.createObjectURL(file)
        setPreview(objectUrl)

        const { path, url } = await uploadImage(folder, slug, file)
        onUploaded(path, url)
      } catch (err) {
        console.error('Upload failed:', err)
        const message =
          err instanceof Error && err.message
            ? err.message
            : 'Upload failed. Check that Supabase is configured.'
        setUploadError(message)
        setPreview(null)
      } finally {
        setUploading(false)
      }
    },
    [folder, slug, onUploaded],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) handleFile(file)
    },
    [handleFile],
  )

  const handleRemove = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()
      if (currentPath) {
        await deleteImage(currentPath).catch(() => {})
      }
      setPreview(null)
      onRemoved?.()
    },
    [currentPath, onRemoved],
  )

  return (
    <div
      className={`group relative overflow-hidden border-2 border-dashed border-ink/20 transition-colors hover:border-ink/40 ${aspectClass} ${className}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      {displayUrl ? (
        <>
          <img
            src={displayUrl}
            alt=""
            className="h-full w-full object-cover"
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/50">
              <span className="text-sm font-bold text-paper">Uploading…</span>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition-all group-hover:bg-ink/40 group-hover:opacity-100">
            <span className="rounded-full bg-paper px-4 py-2 text-xs font-bold text-ink shadow-paper">
              Change image
            </span>
          </div>
          {onRemoved && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-paper text-xs font-bold text-ink shadow-paper opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove image"
            >
              ✕
            </button>
          )}
        </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
            {uploading ? (
              <span className="text-sm font-bold text-ink-faint">Uploading…</span>
            ) : (
              <>
                {uploadError ? (
                  <span className="text-[11px] font-bold leading-tight text-red-600">
                    {uploadError}
                  </span>
                ) : (
                  <>
                    <span className="text-3xl text-ink-faint">+</span>
                    <span className="text-xs font-bold text-ink-faint">{label}</span>
                    <span className="text-[10px] text-ink-faint/60">
                      Click or drag & drop
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        )}
    </div>
  )
}
