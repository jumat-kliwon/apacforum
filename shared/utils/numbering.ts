/** Two-digit year, e.g. 2026 → "26". */
const yy = (date: Date) => String(date.getFullYear()).slice(-2)

/** `REG-APCR-26-01248` */
export const formatRegNo = (eventCode: string, seq: number, at: Date) =>
  `REG-${eventCode}-${yy(at)}-${String(seq).padStart(5, '0')}`

/** `INV-APCR-26-01248` */
export const formatInvoiceNo = (eventCode: string, seq: number, at: Date) =>
  `INV-${eventCode}-${yy(at)}-${String(seq).padStart(5, '0')}`

/** `APCR26-ID-0712` — the year comes from the event start date. */
export const formatTicketCode = (eventCode: string, eventStart: Date, ticketTypeCode: string, seq: number) =>
  `${eventCode}${yy(eventStart)}-${ticketTypeCode}-${String(seq).padStart(4, '0')}`
