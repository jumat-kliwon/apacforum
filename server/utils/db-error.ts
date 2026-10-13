/** SQLSTATE code + constraint from a Postgres error (DrizzleQueryError wraps it in `cause`). */
export function pgError(err: unknown): { code?: string, constraint?: string, detail?: string } {
  const e = err as { cause?: unknown, errno?: string, constraint?: string, detail?: string }
  const pg = (e?.cause ?? e) as { errno?: string, constraint?: string, detail?: string }
  return { code: pg?.errno, constraint: pg?.constraint, detail: pg?.detail }
}
