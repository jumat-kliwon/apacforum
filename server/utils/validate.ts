import type { H3Event } from 'h3'
import type { z } from 'zod'

function fail(error: z.ZodError): never {
  throw createError({
    statusCode: 422,
    statusMessage: error.issues[0]?.message ?? 'Data tidak valid',
    data: { issues: error.issues.map(i => ({ path: i.path.join('.'), message: i.message })) }
  })
}

export async function parseBody<S extends z.ZodType>(event: H3Event, schema: S): Promise<z.output<S>> {
  const result = schema.safeParse(await readBody(event))
  return result.success ? result.data : fail(result.error)
}

export function parseQuery<S extends z.ZodType>(event: H3Event, schema: S): z.output<S> {
  const result = schema.safeParse(getQuery(event))
  return result.success ? result.data : fail(result.error)
}

export function parseId(event: H3Event, name = 'id') {
  const id = getRouterParam(event, name) ?? ''
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw createError({ statusCode: 404, statusMessage: 'Tidak ditemukan' })
  }
  return id
}

/** Escape `%`, `_`, `\` untuk pola ILIKE. */
export const likePattern = (q: string) => `%${q.replace(/[\\%_]/g, m => `\\${m}`)}%`

/** Satu baris CSV (RFC 4180) + netralkan formula Excel. */
export function csvRow(values: unknown[]) {
  return values.map((v) => {
    let s = v == null ? '' : String(v)
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }).join(',')
}
