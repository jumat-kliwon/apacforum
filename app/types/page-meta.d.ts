import type { Access } from '#shared/utils/access'

declare module '#app' {
  interface PageMeta {
    /** Where the close button of the `focus` layout leads. */
    backTo?: string
    /** Who may open this CMS page (checked by the admin middleware). Leave it out for superadmin only. */
    access?: Access
  }
}

export {}
