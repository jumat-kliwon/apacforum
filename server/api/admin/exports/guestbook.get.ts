import { guestbookListQuery } from '~~/shared/schemas/guestbook'
import { exportGuestbook } from '~~/server/services/guestbook'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const rows = await exportGuestbook(parseQuery(event, guestbookListQuery))
  const lines = [
    csvRow(['Name', 'Email', 'Institution', 'Position', 'Country', 'Topic', 'Message', 'Submitted at']),
    ...rows.map(r => csvRow([r.name, r.email, r.institution, r.position, r.country, r.topic, r.message, r.createdAt.toISOString()]))
  ]
  setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setHeader(event, 'Content-Disposition', `attachment; filename="guestbook-${new Date().toISOString().slice(0, 10)}.csv"`)
  return `﻿${lines.join('\r\n')}`
})
