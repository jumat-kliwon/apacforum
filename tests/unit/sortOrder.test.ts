import { describe, expect, it } from 'vitest'
import { sortOrderSchema, ticketTypeListQuery } from '../../shared/schemas/event'

describe('sortOrderSchema', () => {
  it('accepts 0 and positive whole numbers', () => {
    expect(sortOrderSchema.parse({ sortOrder: 0 }).sortOrder).toBe(0)
    expect(sortOrderSchema.parse({ sortOrder: '3' }).sortOrder).toBe(3)
    expect(sortOrderSchema.parse({ sortOrder: 9999 }).sortOrder).toBe(9999)
  })

  it('rejects negatives, fractions, too large and non-numbers', () => {
    for (const sortOrder of [-1, 1.5, 10000, 'abc']) {
      expect(sortOrderSchema.safeParse({ sortOrder }).success).toBe(false)
    }
  })
})

describe('ticketTypeListQuery', () => {
  it('sorts by manual order by default', () => {
    expect(ticketTypeListQuery.parse({}).sort).toBe('order')
  })
})
