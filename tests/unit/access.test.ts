import { describe, expect, it } from 'vitest'
import { can, canGrant, isPermission, PERMISSION_KEYS } from '../../shared/utils/access'
import { roleKey } from '../../shared/schemas/access'
import { firstEventSection, landingPath } from '../../app/utils/adminRoutes'

const A = '0190a0b0-0000-7000-8000-00000000000a'
const ADMIN = ['news.manage', 'events.manage', 'registrations.manage']

describe('can', () => {
  it('needs one of the permissions', () => {
    expect(can(ADMIN, 'news.manage')).toBe(true)
    expect(can(ADMIN, ['transactions.manage', 'events.manage'])).toBe(true)
    expect(can(ADMIN, 'transactions.manage')).toBe(false)
  })
  it('denies without permissions', () => {
    expect(can(undefined, 'news.manage')).toBe(false)
    expect(can([], 'news.manage')).toBe(false)
  })
})

describe('isPermission', () => {
  it('knows the catalog only', () => {
    expect(isPermission('news.manage')).toBe(true)
    expect(isPermission('toString')).toBe(false)
    expect(isPermission('news.delete')).toBe(false)
  })
})

describe('canGrant', () => {
  const superadmin = { role: 'superadmin', permissions: PERMISSION_KEYS }
  const admin = { role: 'admin', permissions: ADMIN }
  it('lets superadmins grant anything', () => {
    expect(canGrant(superadmin, 'superadmin', PERMISSION_KEYS)).toBe(true)
    expect(canGrant(superadmin, 'finance', ['transactions.manage'])).toBe(true)
  })
  it('lets others grant only what they hold', () => {
    expect(canGrant(admin, 'editor', ['news.manage'])).toBe(true)
    expect(canGrant(admin, 'finance', ['transactions.manage'])).toBe(false)
    expect(canGrant(admin, 'empty', [])).toBe(true)
  })
  it('keeps the superadmin role for superadmins', () => {
    expect(canGrant({ role: 'it', permissions: PERMISSION_KEYS }, 'superadmin', [])).toBe(false)
  })
})

describe('firstEventSection', () => {
  it('follows the menu order', () => {
    expect(firstEventSection(PERMISSION_KEYS)).toBe('')
    expect(firstEventSection(ADMIN)).toBe('registrations')
    expect(firstEventSection(['transactions.manage'])).toBe('transactions')
    expect(firstEventSection(['events.manage'])).toBe('tickets')
    expect(firstEventSection(['news.manage'])).toBeUndefined()
  })
})

describe('landingPath', () => {
  it('stays in the event when a section is allowed', () => {
    expect(landingPath(ADMIN, A)).toBe(`/admin/e/${A}/registrations`)
    expect(landingPath(PERMISSION_KEYS, A)).toBe(`/admin/e/${A}`)
  })
  it('lets /admin pick the event', () => {
    expect(landingPath(ADMIN)).toBe('/admin')
  })
  it('falls back to the first workspace page', () => {
    expect(landingPath(['news.manage'], A)).toBe('/admin/news')
    expect(landingPath(['email_templates.view', 'access.manage'])).toBe('/admin/email-templates')
    expect(landingPath(['access.manage'])).toBe('/admin/access/users')
  })
})

describe('roleKey', () => {
  it('slugs the role name', () => {
    expect(roleKey('Finance team')).toBe('finance-team')
    expect(roleKey('  Événements & Billets ')).toBe('evenements-billets')
    expect(roleKey('!!!')).toBe('')
  })
})
