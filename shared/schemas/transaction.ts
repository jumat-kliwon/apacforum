import * as z from 'zod'

/** Invoice lines — `transactions.items`. Amounts are whole rupiah. */
export const transactionItemsSchema = z.object({
  lines: z.array(z.object({
    description: z.string().min(1),
    note: z.string().optional(),
    qty: z.number().int().positive(),
    unitPrice: z.number().int().nonnegative(),
    subtotal: z.number().int().nonnegative()
  })).min(1),
  subtotal: z.number().int().nonnegative(),
  discount: z.number().int().nonnegative()
})

/** Payment details from DOKU — `transactions.payment`. */
export const transactionPaymentSchema = z.object({
  channel: z.string().optional(),
  vaNumber: z.string().optional(),
  dokuRequestId: z.string().optional(),
  dokuPaymentUrl: z.string().url().optional(),
  dokuTokenId: z.string().optional(),
  dokuReference: z.string().optional(),
  refundAmount: z.number().int().nonnegative().optional(),
  refundedAt: z.iso.datetime({ offset: true }).optional(),
  adminNote: z.string().optional(),
  reminderSentAt: z.iso.datetime({ offset: true }).optional(),
  raw: z.unknown().optional()
})

export const transactionHistoryTypes = ['created', 'invoice_sent', 'paid', 'ticket_sent', 'expired', 'refunded', 'note'] as const

/** Append-only status history — `transactions.history`. */
export const transactionHistorySchema = z.array(z.object({
  type: z.enum(transactionHistoryTypes),
  at: z.iso.datetime({ offset: true }),
  description: z.string().optional(),
  actor: z.object({ id: z.string(), name: z.string() }).nullable().optional()
}))

export type TransactionItems = z.infer<typeof transactionItemsSchema>
export type TransactionPayment = z.infer<typeof transactionPaymentSchema>
export type TransactionHistory = z.infer<typeof transactionHistorySchema>
export type TransactionHistoryEntry = TransactionHistory[number]
