import { describe, expect, it } from 'vitest'
import { registrationProgress, type ProgressInput } from '../../app/utils/registrationProgress'

const base: ProgressInput = {
  status: 'pending_verification',
  paymentStatus: 'none',
  createdAt: '2026-10-12T02:00:00Z',
  verifiedAt: null,
  rejectedAt: null,
  cancelledAt: null,
  ticketIssuedAt: null,
  checkedInAt: null,
  paidAt: null
}
const states = (i: ProgressInput) => registrationProgress(i).steps.map(s => `${s.key}:${s.state}`)

describe('registrationProgress', () => {
  it('pending verification: review is the next step', () => {
    const p = registrationProgress(base)
    expect(states(base)).toEqual(['registered:done', 'verified:current', 'paid:upcoming', 'ticket:upcoming', 'checkedIn:upcoming'])
    expect(p.steps[0]!.at).toBe(base.createdAt)
    expect(p.outcome).toBe('review')
  })

  it('verified with an open invoice: waiting for payment', () => {
    const i = { ...base, status: 'verified', paymentStatus: 'pending', verifiedAt: '2026-10-12T03:00:00Z' } as const
    expect(states(i)).toEqual(['registered:done', 'verified:done', 'paid:current', 'ticket:upcoming', 'checkedIn:upcoming'])
    expect(registrationProgress(i).steps[1]!.at).toBe(i.verifiedAt)
    expect(registrationProgress(i).outcome).toBe('awaiting-payment')
  })

  it('verified before an invoice exists: waiting for the invoice', () => {
    const i = { ...base, status: 'verified', verifiedAt: '2026-10-12T03:00:00Z' } as const
    expect(registrationProgress(i).outcome).toBe('awaiting-invoice')
    expect(states(i)[2]).toBe('paid:current')
  })

  it('paid with a ticket: ready for check-in', () => {
    const i = { ...base, status: 'verified', paymentStatus: 'paid', verifiedAt: 'v', paidAt: 'p', ticketIssuedAt: 't' } as const
    expect(states(i)).toEqual(['registered:done', 'verified:done', 'paid:done', 'ticket:done', 'checkedIn:current'])
    expect(registrationProgress(i).steps.map(s => s.at)).toEqual([base.createdAt, 'v', 'p', 't', null])
    expect(registrationProgress(i).outcome).toBe('ticket-issued')
  })

  it('paid but the ticket is not issued yet: the ticket is current', () => {
    const i = { ...base, status: 'verified', paymentStatus: 'paid', verifiedAt: 'v', paidAt: 'p' } as const
    expect(states(i)[3]).toBe('ticket:current')
    expect(registrationProgress(i).outcome).toBe('paid')
  })

  it('checked in: every step is done', () => {
    const i = { ...base, status: 'verified', paymentStatus: 'paid', verifiedAt: 'v', paidAt: 'p', ticketIssuedAt: 't', checkedInAt: 'c' } as const
    expect(states(i).every(s => s.endsWith(':done'))).toBe(true)
    expect(registrationProgress(i).outcome).toBe('checked-in')
  })

  it('rejected: verification failed, the rest never happens', () => {
    const i = { ...base, status: 'rejected', rejectedAt: 'r' } as const
    expect(states(i)).toEqual(['registered:done', 'verified:failed', 'paid:upcoming', 'ticket:upcoming', 'checkedIn:upcoming'])
    expect(registrationProgress(i).steps[1]!.at).toBe('r')
    expect(registrationProgress(i).outcome).toBe('rejected')
  })

  it('invoice expired: payment failed', () => {
    const i = { ...base, status: 'verified', paymentStatus: 'expired', verifiedAt: 'v' } as const
    expect(states(i)[2]).toBe('paid:failed')
    expect(registrationProgress(i).outcome).toBe('expired')
  })

  it('cancelled after a refund: the first unfinished step failed at the cancel time', () => {
    const i = { ...base, status: 'cancelled', paymentStatus: 'refunded', verifiedAt: 'v', paidAt: 'p', ticketIssuedAt: 't', cancelledAt: 'x' } as const
    expect(states(i)).toEqual(['registered:done', 'verified:done', 'paid:done', 'ticket:done', 'checkedIn:failed'])
    expect(registrationProgress(i).steps[4]!.at).toBe('x')
    expect(registrationProgress(i).outcome).toBe('cancelled')
  })

  it('cancelled wins over an expired invoice', () => {
    const i = { ...base, status: 'cancelled', paymentStatus: 'expired', verifiedAt: 'v', cancelledAt: 'x' } as const
    expect(registrationProgress(i).outcome).toBe('cancelled')
  })
})
