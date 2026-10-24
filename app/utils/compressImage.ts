/** Longest side an uploaded image is scaled down to, per upload slot. */
export const MAX_IMAGE_SIDE = { banner: 1920, square: 800 } as const

/** Width and height that fit inside `maxSide` while keeping the aspect ratio; never scales up. */
export function fitWithin(width: number, height: number, maxSide: number) {
  const scale = Math.min(1, maxSide / Math.max(width, height))
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) }
}

/**
 * Scales an image down and converts it to WebP before upload. Uses the browser's encoder, or a
 * WebAssembly one for browsers whose canvas cannot write WebP (Safari).
 */
export async function compressImage(file: File, maxSide: number, quality = 0.82): Promise<File> {
  const bitmap = await createImageBitmap(file)
  const { width, height } = fitWithin(bitmap.width, bitmap.height, maxSide)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('This browser cannot process images')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  let blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', quality))
  if (blob?.type !== 'image/webp') {
    const { default: encode } = await import('@jsquash/webp/encode')
    const webp = await encode(ctx.getImageData(0, 0, width, height), { quality: Math.round(quality * 100) })
    blob = new Blob([webp], { type: 'image/webp' })
  }
  const name = file.name.replace(/\.[^.]+$/, '') + '.webp'
  return new File([blob], name, { type: 'image/webp', lastModified: Date.now() })
}
