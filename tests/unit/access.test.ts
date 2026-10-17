import { describe, expect, it } from 'vitest'
import { hasAccess, isStaff } from '../../shared/utils/access'
import { deniedPath } from '../../app/utils/adminRoutes'

const A = '0190a0b0-0000-7000-8000-00000000000a'

describe('isStaff', () => {
  it('accepts both CMS roles only', () => {
    expect(isStaff('superadmin')).toBe(true)
    expect(isStaff('admin')).toBe(true)
    expect(isStaff('participant')).toBe(false)
    expect(isStaff(undefined)).toBe(false)
  })
})

describe('hasAccess', () => {
  it('lets superadmins open everything', () => {
    expect(hasAccess('superadmin', 'staff')).toBe(true)
    expect(hasAccess('superadmin', 'superadmin')).toBe(true)
  })
  it('lets admins open staff pages only', () => {
    expect(hasAccess('admin', 'staff')).toBe(true)
    expect(hasAccess('admin', 'superadmin')).toBe(false)
  })
  it('keeps participants and signed-out users out', () => {
    expect(hasAccess('participant', 'staff')).toBe(false)
    expect(hasAccess(undefined, 'superadmin')).toBe(false)
  })
})

describe('deniedPath', () => {
  it('sends event pages to the registrations', () => {
    expect(deniedPath(`/admin/e/${A}`)).toBe(`/admin/e/${A}/registrations`)
    expect(deniedPath(`/admin/e/${A}/transactions/t1`)).toBe(`/admin/e/${A}/registrations`)
  })
  it('sends workspace pages to News & Media', () => {
    expect(deniedPath('/admin')).toBe('/admin/news')
    expect(deniedPath('/admin/email-templates')).toBe('/admin/news')
  })
})
