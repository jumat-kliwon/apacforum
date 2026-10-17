import * as z from 'zod'
import { participantListQuery } from '~~/shared/schemas/participant'
import { PAYMENT_STATUS, REGISTRATION_STATUS } from '~~/shared/utils/labels'
import { exportParticipants } from '~~/server/services/lists'

const query = participantListQuery.extend({ ids: z.string().optional() })

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'exports.manage')
  const q = parseQuery(event, query)
  const ids = q.ids?.split(',').filter(id => /^[0-9a-f-]{36}$/i.test(id))
  const rows = await exportParticipants(q, ids)
  const lines = [
    csvRow(['Registration no.', 'Name', 'Email', 'Phone', 'Organization', 'Job title', 'Country', 'Event', 'Participant type', 'Registration status', 'Payment status', 'E-ticket code', 'Registered at']),
    ...rows.map(r => csvRow([
      r.regNo, r.name, r.email, r.phone, r.organization, r.jobTitle, r.country, r.eventName, r.ticketTypeName,
      REGISTRATION_STATUS[r.status].label, PAYMENT_STATUS[r.paymentStatus].label, r.ticketCode, r.createdAt.toISOString()
    ]))
  ]
  setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setHeader(event, 'Content-Disposition', `attachment; filename="participants-${new Date().toISOString().slice(0, 10)}.csv"`)
  return `﻿${lines.join('\r\n')}`
})
