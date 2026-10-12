import { relations } from 'drizzle-orm'
import { accounts, sessions, users } from './auth'
import { agendaDays, events, partners, speakers, ticketTypes } from './events'
import { participants } from './participants'
import { transactions } from './transactions'

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  participations: many(participants, { relationName: 'participantUser' }),
  transactions: many(transactions)
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] })
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] })
}))

export const eventsRelations = relations(events, ({ many }) => ({
  agendaDays: many(agendaDays),
  speakers: many(speakers),
  partners: many(partners),
  ticketTypes: many(ticketTypes),
  participants: many(participants),
  transactions: many(transactions)
}))

export const agendaDaysRelations = relations(agendaDays, ({ one, many }) => ({
  event: one(events, { fields: [agendaDays.eventId], references: [events.id] }),
  speakers: many(speakers)
}))

export const speakersRelations = relations(speakers, ({ one }) => ({
  event: one(events, { fields: [speakers.eventId], references: [events.id] }),
  agendaDay: one(agendaDays, { fields: [speakers.agendaDayId], references: [agendaDays.id] })
}))

export const partnersRelations = relations(partners, ({ one }) => ({
  event: one(events, { fields: [partners.eventId], references: [events.id] })
}))

export const ticketTypesRelations = relations(ticketTypes, ({ one, many }) => ({
  event: one(events, { fields: [ticketTypes.eventId], references: [events.id] }),
  participants: many(participants)
}))

export const participantsRelations = relations(participants, ({ one, many }) => ({
  user: one(users, { fields: [participants.userId], references: [users.id], relationName: 'participantUser' }),
  verifier: one(users, { fields: [participants.verifiedBy], references: [users.id] }),
  event: one(events, { fields: [participants.eventId], references: [events.id] }),
  ticketType: one(ticketTypes, { fields: [participants.ticketTypeId], references: [ticketTypes.id] }),
  transactions: many(transactions)
}))

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  participant: one(participants, { fields: [transactions.participantId], references: [participants.id] }),
  event: one(events, { fields: [transactions.eventId], references: [events.id] })
}))
