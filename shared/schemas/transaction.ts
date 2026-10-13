import { z } from 'zod'

/** Rincian tagihan — kolom `transactions.items`. Nominal dalam rupiah utuh. */
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

/** Info pembayaran dari DOKU — kolom `transactions.payment`. */
export const transactionPaymentSchema = z.object({
  channel: z.string().optional(),
  vaNumber: z.string().optional(),
  dokuRequestId: z.string().optional(),
  dokuPaymentUrl: z.string().url().optional(),
  dokuReference: z.string().optional(),
  refundAmount: z.number().int().nonnegative().optional(),
  refundedAt: z.iso.datetime({ offset: true }).optional(),
  adminNote: z.string().optional(),
  reminderSentAt: z.iso.datetime({ offset: true }).optional(),
  raw: z.unknown().optional()
})

export const transactionHistoryTypes = ['created', 'invoice_sent', 'paid', 'ticket_sent', 'expired', 'refunded', 'note'] as const

/** Riwayat status, append-only — kolom `transactions.history`. */
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
