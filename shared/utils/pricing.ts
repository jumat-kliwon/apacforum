type PricedTicket = { price: number, earlyBirdPrice: number | null, earlyBirdUntil: Date | string | null }

/** Whether the early-bird price applies to a registration made at `at`. */
export const isEarlyBird = (t: PricedTicket, at: Date = new Date()) =>
  t.earlyBirdPrice != null && t.earlyBirdUntil != null && at <= new Date(t.earlyBirdUntil)

/** The price a registration made at `at` pays: the early-bird price until it ends, then the regular price. */
export const ticketPriceAt = (t: PricedTicket, at: Date = new Date()) =>
  isEarlyBird(t, at) ? t.earlyBirdPrice! : t.price

/** The WIB calendar day of an early-bird end, `YYYY-MM-DD`, for the date input of the ticket form. */
export const earlyBirdUntilDate = (d: Date | string) =>
  new Date(new Date(d).getTime() + 7 * 3600_000).toISOString().slice(0, 10)

/** The ticket-type form values that mirror a saved ticket type's early-bird columns. */
export const earlyBirdFormValues = (t: Omit<PricedTicket, 'price'>) => ({
  earlyBird: t.earlyBirdPrice != null,
  earlyBirdPrice: t.earlyBirdPrice ?? undefined,
  earlyBirdUntil: t.earlyBirdUntil ? earlyBirdUntilDate(t.earlyBirdUntil) : undefined
})
