import { supabase } from './client'

const BUCKET = 'images'
const BUCKET_URL = `https://btuejeztbeisdivywrnx.supabase.co/storage/v1/object/public/${BUCKET}`

export type ImageFolder = 'profile' | 'projects' | 'gallery'

function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function getExtension(file: File): string {
  const ext = file.name.split('.').pop() ?? 'jpg'
  return ext.toLowerCase()
}

function buildPath(folder: ImageFolder, slug: string, file: File): string {
  const ext = getExtension(file)
  const timestamp = Date.now()
  const safeName = sanitizeFileName(file.name.replace(/\.[^.]+$/, ''))
  return `${folder}/${slug}/${safeName}-${timestamp}.${ext}`
}

export interface UploadResult {
  path: string
  url: string
}

export async function uploadImage(
  folder: ImageFolder,
  slug: string,
  file: File,
): Promise<UploadResult> {
  if (!supabase) throw new Error('Supabase is not configured')

  const path = buildPath(folder, slug, file)

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) throw uploadError

  return { path, url: `${BUCKET_URL}/${path}` }
}

export async function deleteImage(path: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw error
}

export async function replaceImage(
  folder: ImageFolder,
  slug: string,
  file: File,
  oldPath?: string | null,
): Promise<UploadResult> {
  if (oldPath) {
    await deleteImage(oldPath).catch(() => {})
  }
  return uploadImage(folder, slug, file)
}

export function getPublicUrl(path: string): string {
  return `${BUCKET_URL}/${path}`
}

export async function listImages(folder: ImageFolder, slug?: string): Promise<string[]> {
  if (!supabase) return []
  const path = slug ? `${folder}/${slug}` : folder
  const { data, error } = await supabase.storage.from(BUCKET).list(path)
  if (error) throw error
  return (data ?? []).map((f) => `${path}/${f.name}`)
}

export function getImageUrl(
  storagePath: string | null | undefined,
  fallback: string = '',
): string {
  if (!storagePath) return fallback
  if (storagePath.startsWith('http') || storagePath.startsWith('/')) return storagePath
  return getPublicUrl(storagePath)
}
