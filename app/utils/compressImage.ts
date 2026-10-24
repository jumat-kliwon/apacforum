/** Longest side an uploaded image is scaled down to, per upload slot. */
export const MAX_IMAGE_SIDE = { banner: 1920, square: 800 } as const

/** Width and height that fit inside `maxSide` while keeping the aspect ratio; never scales up. */
export function fitWithin(width: number, height: number, maxSide: number) {
  const scale = Math.min(1, maxSide / Math.max(width, height))
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) }
}

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' } as const

/**
 * Scales an image down and re-encodes it as WebP (JPEG/PNG when the browser cannot encode WebP)
 * before upload. Returns the original file when re-encoding would not make it smaller.
 */
export async function compressImage(file: File, maxSide: number, quality = 0.82): Promise<File> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return file
  }
  const { width, height } = fitWithin(bitmap.width, bitmap.height, maxSide)
  const resized = width !== bitmap.width || height !== bitmap.height
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    return file
  }
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const encode = (type: string) => new Promise<Blob | null>(resolve => canvas.toBlob(resolve, type, quality))
  let blob = await encode('image/webp')
  // Browsers without a WebP encoder hand back a PNG; keep transparency for PNGs, otherwise use JPEG.
  if (blob?.type !== 'image/webp') blob = await encode(file.type === 'image/png' ? 'image/png' : 'image/jpeg')
  if (!blob || !(blob.type in EXT)) return file
  if (!resized && blob.size >= file.size) return file

  const name = file.name.replace(/\.[^.]+$/, '') + '.' + EXT[blob.type as keyof typeof EXT]
  return new File([blob], name, { type: blob.type, lastModified: Date.now() })
}
