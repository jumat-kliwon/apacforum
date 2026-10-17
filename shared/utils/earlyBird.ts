type EarlyBirdTicket = { isEarlyBird: boolean, earlyBirdUntil: Date | string | null }

/** An early-bird ticket whose end has passed can no longer be bought. */
export const earlyBirdEnded = (t: EarlyBirdTicket, at: Date = new Date()) =>
  t.isEarlyBird && t.earlyBirdUntil != null && at > new Date(t.earlyBirdUntil)

/** The ticket-type form values of a saved ticket type's early-bird columns; the end becomes its WIB day. */
export const earlyBirdFormValues = (t: EarlyBirdTicket) => ({
  isEarlyBird: t.isEarlyBird,
  earlyBirdUntil: t.earlyBirdUntil ? new Date(new Date(t.earlyBirdUntil).getTime() + 7 * 3600_000).toISOString().slice(0, 10) : undefined
})
