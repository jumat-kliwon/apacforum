/** Nuxt UI theme following the Core Design System. */
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'brand',
      neutral: 'slate',
      success: 'green',
      warning: 'amber',
      error: 'red',
      info: 'blue'
    },
    button: {
      slots: {
        base: 'font-semibold'
      },
      variants: {
        // button radius per size: 6 / 8 / 12
        size: {
          xs: { base: 'rounded-[6px]' },
          sm: { base: 'rounded-[6px]' },
          md: { base: 'rounded-[8px]' },
          lg: { base: 'rounded-[12px]' },
          xl: { base: 'rounded-[12px]' }
        }
      },
      compoundVariants: [
        {
          // primary button: gold fill with ink text, darkening to the hover/active tokens
          color: 'primary',
          variant: 'solid',
          class: 'text-(--brand-ink) bg-brand-400 hover:bg-brand-500 active:bg-brand-600 disabled:bg-brand-400 aria-disabled:bg-brand-400 focus-visible:outline-(--focus-ring)'
        }
      ]
    },
    input: {
      // inputs: radius 12, border-input (#64748B) for 3:1 contrast, gold when active
      variants: {
        variant: {
          outline: 'ring-[var(--color-slate-500)] dark:ring-[#6b6d72]'
        }
      },
      compoundVariants: [
        { color: 'primary', variant: 'outline', class: 'focus-visible:ring-1 focus-visible:ring-brand-400' }
      ],
      slots: { base: 'rounded-[12px]' }
    },
    select: {
      slots: { base: 'rounded-[12px] ring-[var(--color-slate-500)] dark:ring-[#6b6d72]' },
      compoundVariants: [
        { color: 'primary', variant: 'outline', class: 'focus:ring-1 focus:ring-brand-400 focus-visible:ring-1 focus-visible:ring-brand-400' }
      ]
    },
    textarea: {
      slots: { base: 'rounded-[12px] ring-[var(--color-slate-500)] dark:ring-[#6b6d72]' },
      compoundVariants: [
        { color: 'primary', variant: 'outline', class: 'focus-visible:ring-1 focus-visible:ring-brand-400' }
      ]
    },
    card: {
      // cards: radius 16, 1px border, shadow-xs at rest
      slots: { root: 'rounded-[16px] shadow-xs' }
    },
    badge: {
      // label chips: radius 8
      slots: { base: 'rounded-[8px] font-medium' },
      defaultVariants: { variant: 'subtle' }
    },
    modal: {
      slots: { content: 'rounded-[16px] shadow-xl' }
    },
    switch: {
      // toggle "on" track uses the gold brand (border-brand-secondary)
      slots: { base: 'data-[state=checked]:bg-brand-400' }
    },
    checkbox: {
      slots: { base: 'rounded-[4px]' }
    },
    navigationMenu: {
      compoundVariants: [
        {
          // active nav item: subtle gold fill, brand text
          orientation: 'vertical',
          active: true,
          variant: 'pill',
          class: { link: 'before:bg-brand-50 dark:before:bg-[#2e2a18] text-brand-900 dark:text-brand-300', linkLeadingIcon: 'text-brand-800 dark:text-brand-400' }
        }
      ]
    }
  }
})
