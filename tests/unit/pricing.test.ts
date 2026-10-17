import { describe, expect, it } from 'vitest'
import { ticketTypeFormSchema } from '../../shared/schemas/event'
import { earlyBirdFormValues, isEarlyBird, ticketPriceAt } from '../../shared/utils/pricing'

const until = new Date('2026-10-31T23:59:59+07:00')
const ticket = { price: 2_500_000, earlyBirdPrice: 2_000_000, earlyBirdUntil: until }

describe('ticketPriceAt', () => {
  it('charges the early-bird price up to the end', () => {
    expect(ticketPriceAt(ticket, new Date('2026-10-20T00:00:00Z'))).toBe(2_000_000)
    expect(ticketPriceAt(ticket, until)).toBe(2_000_000)
    expect(isEarlyBird(ticket, until)).toBe(true)
  })

  it('charges the regular price after the end', () => {
    expect(ticketPriceAt(ticket, new Date(until.getTime() + 1000))).toBe(2_500_000)
    expect(isEarlyBird(ticket, new Date(until.getTime() + 1000))).toBe(false)
  })

  it('charges the regular price without an early bird', () => {
    expect(ticketPriceAt({ price: 750_000, earlyBirdPrice: null, earlyBirdUntil: null }, new Date('2026-01-01'))).toBe(750_000)
  })

  it('accepts the end as a JSON string', () => {
    expect(ticketPriceAt({ ...ticket, earlyBirdUntil: until.toISOString() }, new Date('2026-10-20T00:00:00Z'))).toBe(2_000_000)
  })
})

describe('earlyBirdFormValues', () => {
  it('turns the stored end back into the WIB day', () => {
    expect(earlyBirdFormValues(ticket)).toEqual({ earlyBird: true, earlyBirdPrice: 2_000_000, earlyBirdUntil: '2026-10-31' })
    expect(earlyBirdFormValues({ earlyBirdPrice: null, earlyBirdUntil: null })).toEqual({ earlyBird: false, earlyBirdPrice: undefined, earlyBirdUntil: undefined })
  })
})

describe('ticketTypeFormSchema early bird', () => {
  const base = { eventId: '0b9a2f6e-4c1d-4f7a-9b2e-1a2b3c4d5e6f', code: 'ID', name: 'Indonesia Delegate', price: 2_500_000, quota: 800 }
  const paths = (input: object) => {
    const r = ticketTypeFormSchema.safeParse({ ...base, ...input })
    return r.success ? [] : r.error.issues.map(i => i.path.join('.'))
  }

  it('is optional', () => {
    expect(paths({})).toEqual([])
    expect(paths({ earlyBird: false, earlyBirdPrice: 9_999_999, earlyBirdUntil: '' })).toEqual([])
  })

  it('needs a price and an end date when on', () => {
    expect(paths({ earlyBird: true })).toEqual(['earlyBirdPrice', 'earlyBirdUntil'])
    expect(paths({ earlyBird: true, earlyBirdPrice: '', earlyBirdUntil: '2026-10-31' })).toEqual(['earlyBirdPrice'])
    expect(paths({ earlyBird: true, earlyBirdPrice: 2_000_000, earlyBirdUntil: '2026-10-31' })).toEqual([])
  })

  it('must be cheaper than the regular price', () => {
    expect(paths({ earlyBird: true, earlyBirdPrice: 2_500_000, earlyBirdUntil: '2026-10-31' })).toEqual(['earlyBirdPrice'])
  })
})
