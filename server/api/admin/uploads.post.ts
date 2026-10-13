import { z } from 'zod'
import { uuidv7 } from '~~/server/db/columns'
import { MAX_UPLOAD_BYTES, presignUpload, publicUrl, UPLOAD_TYPES } from '~~/server/services/storage'

const schema = z.object({
  folder: z.enum(['events', 'speakers', 'partners']),
  contentType: z.enum(Object.keys(UPLOAD_TYPES) as [keyof typeof UPLOAD_TYPES], { error: 'Hanya JPG, PNG, atau WebP' }),
  size: z.number().int().positive().max(MAX_UPLOAD_BYTES, 'Ukuran maksimal 5 MB')
})

/** URL upload langsung ke R2. Browser lalu `PUT` file ke `uploadUrl`, dan menyimpan `key` di form. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { folder, contentType } = await parseBody(event, schema)
  const key = `${folder}/${uuidv7()}.${UPLOAD_TYPES[contentType]}`
  return { key, uploadUrl: presignUpload(key, contentType), publicUrl: publicUrl(key) }
})
