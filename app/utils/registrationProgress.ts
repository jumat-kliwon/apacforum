type Stamp = string | Date | null

export type ProgressInput = {
  status: 'pending_verification' | 'verified' | 'rejected' | 'cancelled'
  paymentStatus: 'none' | 'pending' | 'paid' | 'expired' | 'refunded'
  createdAt: string | Date
  verifiedAt: Stamp
  rejectedAt: Stamp
  cancelledAt: Stamp
  ticketIssuedAt: Stamp
  checkedInAt: Stamp
  /** When its transaction was paid. */
  paidAt: Stamp
}

export type StepKey = 'registered' | 'verified' | 'paid' | 'ticket' | 'checkedIn'
export type Step = { key: StepKey, label: string, state: 'done' | 'current' | 'upcoming' | 'failed', at: Stamp }

/** What the admin is looking at, which decides the next-step box on the registration card. */
export type Outcome = 'review' | 'awaiting-invoice' | 'awaiting-payment' | 'paid' | 'ticket-issued' | 'checked-in'
  | 'rejected' | 'expired' | 'cancelled'

/**
 * Where a registration is on Registered → Verified → Paid → E-ticket → Checked in.
 * The first unfinished step is `current`, or `failed` when the registration was rejected, cancelled or its invoice expired.
 */
export function registrationProgress(r: ProgressInput): { steps: Step[], outcome: Outcome } {
  const paid = r.paymentStatus === 'paid' || r.paymentStatus === 'refunded'
  const reached: [StepKey, string, boolean, Stamp][] = [
    ['registered', 'Registered', true, r.createdAt],
    ['verified', 'Verified', !!r.verifiedAt || r.status === 'verified', r.verifiedAt],
    ['paid', 'Paid', paid, r.paidAt],
    ['ticket', 'E-ticket', !!r.ticketIssuedAt, r.ticketIssuedAt],
    ['checkedIn', 'Checked in', !!r.checkedInAt, r.checkedInAt]
  ]

  const outcome: Outcome
    = r.status === 'rejected' ? 'rejected'
      : r.status === 'cancelled' ? 'cancelled'
        : r.paymentStatus === 'expired' && !paid ? 'expired'
          : r.checkedInAt ? 'checked-in'
            : r.ticketIssuedAt ? 'ticket-issued'
              : paid ? 'paid'
                : r.status === 'verified' ? (r.paymentStatus === 'pending' ? 'awaiting-payment' : 'awaiting-invoice')
                  : 'review'
  const failedAt = { rejected: r.rejectedAt, cancelled: r.cancelledAt, expired: null } as Partial<Record<Outcome, Stamp>>
  const failed = outcome in failedAt

  let open = false
  const steps = reached.map(([key, label, done, at]): Step => {
    if (done && !open) return { key, label, state: 'done', at }
    if (open) return { key, label, state: 'upcoming', at: null }
    open = true
    return failed ? { key, label, state: 'failed', at: failedAt[outcome] ?? null } : { key, label, state: 'current', at: null }
  })
  return { steps, outcome }
}
