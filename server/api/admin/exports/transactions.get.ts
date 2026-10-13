import * as z from 'zod'
import { transactionListQuery } from '~~/shared/schemas/participant'
import { PAYMENT_METHOD, TRANSACTION_STATUS } from '~~/shared/utils/labels'
import { exportTransactions } from '~~/server/services/lists'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const q = parseQuery(event, transactionListQuery.extend({ ids: z.string().optional() }))
  const ids = q.ids?.split(',').filter(id => /^[0-9a-f-]{36}$/i.test(id))
  const rows = await exportTransactions(q, ids)
  const lines = [
    csvRow(['Transaction ID', 'Participant', 'Email', 'Event', 'Ticket type', 'Amount', 'Method', 'Bank/channel', 'Status', 'Created', 'Paid']),
    ...rows.map(r => csvRow([
      r.invoiceNo, r.participantName, r.participantEmail, r.eventName, r.ticketTypeName, r.total,
      r.method ? PAYMENT_METHOD[r.method] : '', r.channel, TRANSACTION_STATUS[r.status].label,
      r.createdAt.toISOString(), r.paidAt?.toISOString()
    ]))
  ]
  setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setHeader(event, 'Content-Disposition', `attachment; filename="transactions-${new Date().toISOString().slice(0, 10)}.csv"`)
  return `﻿${lines.join('\r\n')}`
})
