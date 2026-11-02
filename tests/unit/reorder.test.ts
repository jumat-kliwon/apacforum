import { describe, expect, it } from 'vitest'
import { reorderSchema, ticketTypeListQuery } from '../../shared/schemas/event'

const A = '01a14ac9-b46f-79ce-a4a8-2db92d71aee2'
const B = '01a14ac9-b46f-7942-b776-31b9310049b4'

describe('reorderSchema', () => {
  it('accepts the ids of the event in the new order', () => {
    expect(reorderSchema.parse({ eventId: A, ids: [B, A] }).ids).toEqual([B, A])
  })

  it('rejects an empty list, duplicates and non-uuids', () => {
    expect(reorderSchema.safeParse({ eventId: A, ids: [] }).success).toBe(false)
    expect(reorderSchema.safeParse({ eventId: A, ids: [A, A] }).success).toBe(false)
    expect(reorderSchema.safeParse({ eventId: A, ids: ['x'] }).success).toBe(false)
  })
})

describe('ticketTypeListQuery', () => {
  it('sorts by manual order by default', () => {
    expect(ticketTypeListQuery.parse({}).sort).toBe('order')
  })
})
