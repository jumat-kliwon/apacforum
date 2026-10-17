import { describe, expect, it } from 'vitest'
import { SECTION_PERMISSION, eventPath, landingPath, pageSkeleton, switchEventPath } from '../../app/utils/adminRoutes'

const A = '0190a0b0-0000-7000-8000-00000000000a'
const B = '0190a0b0-0000-7000-8000-00000000000b'

describe('eventPath', () => {
  it('builds the dashboard path', () => {
    expect(eventPath(A)).toBe(`/admin/e/${A}`)
  })
  it('builds a section path', () => {
    expect(eventPath(A, 'registrations')).toBe(`/admin/e/${A}/registrations`)
  })
  it('builds a record path', () => {
    expect(eventPath(A, 'transactions', 't1')).toBe(`/admin/e/${A}/transactions/t1`)
    expect(eventPath(A, 'settings', 'edit')).toBe(`/admin/e/${A}/settings/edit`)
  })
})

describe('switchEventPath', () => {
  it('keeps the dashboard', () => {
    expect(switchEventPath(`/admin/e/${A}`, {}, B)).toBe(`/admin/e/${B}`)
  })
  it('keeps the section and drops list filters', () => {
    expect(switchEventPath(`/admin/e/${A}/registrations`, { status: 'paid', page: '3' }, B)).toBe(`/admin/e/${B}/registrations`)
  })
  it('keeps the speakers section and drops a speaker id', () => {
    expect(switchEventPath(`/admin/e/${A}/speakers`, { q: 'x' }, B)).toBe(`/admin/e/${B}/speakers`)
    expect(switchEventPath(`/admin/e/${A}/speakers/s1`, {}, B)).toBe(`/admin/e/${B}/speakers`)
  })
  it('keeps the partners section and drops a partner id', () => {
    expect(switchEventPath(`/admin/e/${A}/partners`, { q: 'x' }, B)).toBe(`/admin/e/${B}/partners`)
    expect(switchEventPath(`/admin/e/${A}/partners/p1`, {}, B)).toBe(`/admin/e/${B}/partners`)
  })
  it('keeps the guestbook section and drops its filters', () => {
    expect(switchEventPath(`/admin/e/${A}/guestbook`, { q: 'x', topic: 'Media' }, B)).toBe(`/admin/e/${B}/guestbook`)
  })

  it('keeps the tickets section and drops a ticket id', () => {
    expect(switchEventPath(`/admin/e/${A}/tickets`, { q: 'x' }, B)).toBe(`/admin/e/${B}/tickets`)
    expect(switchEventPath(`/admin/e/${A}/tickets/new`, {}, B)).toBe(`/admin/e/${B}/tickets`)
    expect(switchEventPath(`/admin/e/${A}/tickets/t1`, {}, B)).toBe(`/admin/e/${B}/tickets`)
  })
  it('drops a record id', () => {
    expect(switchEventPath(`/admin/e/${A}/registrations/u1`, {}, B)).toBe(`/admin/e/${B}/registrations`)
    expect(switchEventPath(`/admin/e/${A}/transactions/t1`, {}, B)).toBe(`/admin/e/${B}/transactions`)
  })
  it('keeps the settings tab', () => {
    expect(switchEventPath(`/admin/e/${A}/settings`, { tab: 'agenda' }, B)).toBe(`/admin/e/${B}/settings?tab=agenda`)
  })
  it('leaves the edit form for settings', () => {
    expect(switchEventPath(`/admin/e/${A}/settings/edit`, {}, B)).toBe(`/admin/e/${B}/settings`)
  })
  it('goes to the dashboard from global pages', () => {
    expect(switchEventPath('/admin/events', {}, B)).toBe(`/admin/e/${B}`)
    expect(switchEventPath('/admin/email-templates', { q: 'x' }, B)).toBe(`/admin/e/${B}`)
    expect(switchEventPath('/admin', {}, B)).toBe(`/admin/e/${B}`)
  })
  it('handles trailing slashes', () => {
    expect(switchEventPath(`/admin/e/${A}/`, {}, B)).toBe(`/admin/e/${B}`)
    expect(switchEventPath(`/admin/e/${A}/transactions/`, {}, B)).toBe(`/admin/e/${B}/transactions`)
  })
  it('treats an unknown section as the dashboard', () => {
    expect(switchEventPath(`/admin/e/${A}/nope`, {}, B)).toBe(`/admin/e/${B}`)
  })
  it('ignores a tab outside settings and a non-string tab', () => {
    expect(switchEventPath(`/admin/e/${A}/registrations`, { tab: 'agenda' }, B)).toBe(`/admin/e/${B}/registrations`)
    expect(switchEventPath(`/admin/e/${A}/settings`, { tab: ['a', 'b'] }, B)).toBe(`/admin/e/${B}/settings`)
  })
  it('encodes the tab', () => {
    expect(switchEventPath(`/admin/e/${A}/settings`, { tab: 'a b&c' }, B)).toBe(`/admin/e/${B}/settings?tab=a%20b%26c`)
  })
})

describe('pageSkeleton', () => {
  it('matches event pages', () => {
    expect(pageSkeleton(`/admin/e/${A}`)).toBe('dashboard')
    expect(pageSkeleton(`/admin/e/${A}/`)).toBe('dashboard')
    expect(pageSkeleton(`/admin/e/${A}/registrations`)).toBe('list')
    expect(pageSkeleton(`/admin/e/${A}/registrations/u1`)).toBe('detail')
    expect(pageSkeleton(`/admin/e/${A}/transactions/t1`)).toBe('detail')
    expect(pageSkeleton(`/admin/e/${A}/tickets`)).toBe('list')
    expect(pageSkeleton(`/admin/e/${A}/guestbook`)).toBe('list')
    expect(pageSkeleton(`/admin/e/${A}/tickets/new`)).toBe('form')
    expect(pageSkeleton(`/admin/e/${A}/tickets/t1`)).toBe('form')
    expect(pageSkeleton(`/admin/e/${A}/speakers`)).toBe('list')
    expect(pageSkeleton(`/admin/e/${A}/speakers/new`)).toBe('form')
    expect(pageSkeleton(`/admin/e/${A}/speakers/s1`)).toBe('form')
    expect(pageSkeleton(`/admin/e/${A}/partners`)).toBe('list')
    expect(pageSkeleton(`/admin/e/${A}/partners/new`)).toBe('form')
    expect(pageSkeleton(`/admin/e/${A}/partners/p1`)).toBe('form')
    expect(pageSkeleton(`/admin/e/${A}/settings`)).toBe('detail')
    expect(pageSkeleton(`/admin/e/${A}/settings/edit`)).toBe('form')
  })
  it('matches workspace pages', () => {
    expect(pageSkeleton('/admin/events')).toBe('list')
    expect(pageSkeleton('/admin/events/new')).toBe('form')
    expect(pageSkeleton('/admin/news')).toBe('list')
    expect(pageSkeleton(`/admin/news/${A}`)).toBe('form')
    expect(pageSkeleton('/admin/email-templates')).toBe('detail')
  })
})

describe('SECTION_PERMISSION', () => {
  it('puts speakers and partners with events, and the guestbook on its own permission', () => {
    expect(SECTION_PERMISSION.speakers).toBe('events.manage')
    expect(SECTION_PERMISSION.partners).toBe('events.manage')
    expect(SECTION_PERMISSION.guestbook).toBe('guestbook.manage')
  })
  it('lands a guestbook-only role on the guestbook', () => {
    expect(landingPath(['guestbook.manage'], A)).toBe(`/admin/e/${A}/guestbook`)
  })
})
