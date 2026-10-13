import { describe, expect, it } from 'vitest'
import { eventPath, switchEventPath } from '../../app/utils/adminRoutes'

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
