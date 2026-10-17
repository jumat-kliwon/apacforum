import type { Permission } from '#shared/utils/access'

declare module '#app' {
  interface PageMeta {
    /** Where the close button of the `focus` layout leads. */
    backTo?: string
    /**
     * Permission(s) needed to open this CMS page, any one of them; checked by the admin middleware.
     * `any` = every CMS user. Left out = superadmin only, so a page nobody marked stays closed.
     */
    permission?: Permission | Permission[] | 'any'
  }
}

export {}
