import { describe, expect, it } from 'vitest'
import { ticketTypeFormSchema } from '../../shared/schemas/event'
import { earlyBirdEnded, earlyBirdFormValues } from '../../shared/utils/earlyBird'

const until = new Date('2026-10-31T23:59:59+07:00')
const ticket = { isEarlyBird: true, earlyBirdUntil: until }

describe('earlyBirdEnded', () => {
  it('is on sale up to the end, then ended', () => {
    expect(earlyBirdEnded(ticket, new Date('2026-10-20T00:00:00Z'))).toBe(false)
    expect(earlyBirdEnded(ticket, until)).toBe(false)
    expect(earlyBirdEnded(ticket, new Date(until.getTime() + 1000))).toBe(true)
  })

  it('never ends for a regular ticket', () => {
    expect(earlyBirdEnded({ isEarlyBird: false, earlyBirdUntil: null }, new Date('2030-01-01'))).toBe(false)
  })

  it('accepts the end as a JSON string', () => {
    expect(earlyBirdEnded({ ...ticket, earlyBirdUntil: until.toISOString() }, new Date(until.getTime() + 1000))).toBe(true)
  })
})

describe('earlyBirdFormValues', () => {
  it('turns the stored end back into the WIB day', () => {
    expect(earlyBirdFormValues(ticket)).toEqual({ isEarlyBird: true, earlyBirdUntil: '2026-10-31' })
    expect(earlyBirdFormValues({ isEarlyBird: false, earlyBirdUntil: null })).toEqual({ isEarlyBird: false, earlyBirdUntil: undefined })
  })
})

describe('ticketTypeFormSchema early bird', () => {
  const base = { eventId: '0b9a2f6e-4c1d-4f7a-9b2e-1a2b3c4d5e6f', code: 'IDEB', name: 'Indonesia Delegate (Early Bird)', price: 2_000_000, quota: 100 }
  const paths = (input: object) => {
    const r = ticketTypeFormSchema.safeParse({ ...base, ...input })
    return r.success ? [] : r.error.issues.map(i => i.path.join('.'))
  }

  it('is off by default', () => {
    expect(paths({})).toEqual([])
    expect(paths({ isEarlyBird: false, earlyBirdUntil: '' })).toEqual([])
  })

  it('accepts its own output, which the form posts to the server', () => {
    expect(paths({ isEarlyBird: false, earlyBirdUntil: null })).toEqual([])
    expect(paths({ isEarlyBird: true, earlyBirdUntil: null })).toEqual(['earlyBirdUntil'])
  })

  it('needs an end date when on', () => {
    expect(paths({ isEarlyBird: true })).toEqual(['earlyBirdUntil'])
    expect(paths({ isEarlyBird: true, earlyBirdUntil: '' })).toEqual(['earlyBirdUntil'])
    expect(paths({ isEarlyBird: true, earlyBirdUntil: '2026-10-31' })).toEqual([])
  })
})
