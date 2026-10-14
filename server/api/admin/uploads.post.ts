import * as z from 'zod'
import { uuidv7 } from '~~/server/db/columns'
import { MAX_UPLOAD_BYTES, presignUpload, publicUrl, UPLOAD_TYPES } from '~~/server/services/storage'

const schema = z.object({
  folder: z.enum(['events', 'speakers', 'partners', 'articles']),
  contentType: z.enum(Object.keys(UPLOAD_TYPES) as [keyof typeof UPLOAD_TYPES], { error: 'Only JPG, PNG or WebP' }),
  size: z.number().int().positive().max(MAX_UPLOAD_BYTES, '5 MB at most')
})

/** Direct-to-R2 upload URL. The browser then `PUT`s the file to `uploadUrl` and keeps `key` in the form. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { folder, contentType } = await parseBody(event, schema)
  const key = `${folder}/${uuidv7()}.${UPLOAD_TYPES[contentType]}`
  return { key, uploadUrl: presignUpload(key, contentType), publicUrl: publicUrl(key) }
})
