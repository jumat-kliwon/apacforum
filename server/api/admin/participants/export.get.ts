import { z } from 'zod'
import { participantListQuery } from '~~/shared/schemas/participant'
import { PAYMENT_STATUS, REGISTRATION_STATUS } from '~~/shared/utils/labels'
import { exportParticipants } from '~~/server/services/lists'

const query = participantListQuery.extend({ ids: z.string().optional() })

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const q = parseQuery(event, query)
  const ids = q.ids?.split(',').filter(id => /^[0-9a-f-]{36}$/i.test(id))
  const rows = await exportParticipants(q, ids)
  const lines = [
    csvRow(['No. pendaftaran', 'Nama', 'Email', 'Telepon', 'Instansi', 'Jabatan', 'Negara', 'Acara', 'Tipe peserta', 'Status pendaftaran', 'Status pembayaran', 'Kode e-tiket', 'Tanggal daftar']),
    ...rows.map(r => csvRow([
      r.regNo, r.name, r.email, r.phone, r.organization, r.jobTitle, r.country, r.eventName, r.ticketTypeName,
      REGISTRATION_STATUS[r.status].label, PAYMENT_STATUS[r.paymentStatus].label, r.ticketCode, r.createdAt.toISOString()
    ]))
  ]
  setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setHeader(event, 'Content-Disposition', `attachment; filename="peserta-${new Date().toISOString().slice(0, 10)}.csv"`)
  return `﻿${lines.join('\r\n')}`
})
