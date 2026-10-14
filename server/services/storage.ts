import { S3Client } from 'bun'

/** Cloudflare R2 through Bun's built-in S3 client. */
let client: S3Client | null = null

function r2() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
    throw createError({ statusCode: 503, statusMessage: 'File storage (R2) is not configured' })
  }
  client ??= new S3Client({
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    bucket: R2_BUCKET,
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    region: 'auto'
  })
  return client
}

export const UPLOAD_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' } as const
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

/** A signed PUT URL valid for 10 minutes; the browser uploads straight to R2. */
export function presignUpload(key: string, contentType: keyof typeof UPLOAD_TYPES) {
  return r2().presign(key, { method: 'PUT', expiresIn: 600, type: contentType })
}

/** Keys handed out by `/api/admin/uploads`: `<folder>/<uuid>.<ext>`. */
const UPLOAD_KEY = /^(events|speakers|partners)\/[0-9a-f-]{36}\.(jpg|png|webp)$/

/**
 * Checks newly uploaded files before their keys are saved. A presigned PUT cannot cap the file size,
 * so size and type are read back from R2; a file that breaks the rules is deleted.
 */
export async function assertUploads(keys: (string | null | undefined)[]) {
  const list = [...new Set(keys.filter((k): k is string => !!k))]
  if (!list.length) return
  const c = r2()
  await Promise.all(list.map(async (key) => {
    if (!UPLOAD_KEY.test(key)) throw createError({ statusCode: 422, statusMessage: 'Invalid image reference' })
    const stat = await c.stat(key).catch(() => null)
    if (!stat) throw createError({ statusCode: 422, statusMessage: 'An image upload did not finish. Please upload it again.' })
    if (stat.size > MAX_UPLOAD_BYTES || !(stat.type in UPLOAD_TYPES)) {
      await c.delete(key).catch(() => null)
      throw createError({ statusCode: 422, statusMessage: 'Images must be JPG, PNG or WebP and 5 MB at most' })
    }
  }))
}

/** Deletes old objects; a failed delete never fails the request. */
export async function deleteObjects(keys: (string | null | undefined)[]) {
  const list = keys.filter((k): k is string => !!k)
  if (!list.length) return
  try {
    const c = r2()
    await Promise.all(list.map(k => c.delete(k)))
  } catch (err) {
    console.error('[r2] could not delete objects', list, err)
  }
}

export function publicUrl(key: string | null | undefined) {
  if (!key) return null
  const base = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '')
  return `${base}/${key}`
}
