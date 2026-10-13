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
        // sm / md / lg = 28 / 36 / 44px tall, 12 / 16 / 20px side padding
        size: {
          xs: { base: 'rounded-[6px]' },
          sm: { base: 'h-7 px-3 py-0 text-xs/4 gap-1.5 rounded-[6px]' },
          md: { base: 'h-9 px-4 py-0 text-sm/5 gap-2 rounded-[8px]' },
          lg: { base: 'h-11 px-5 py-0 text-base/6 gap-2 rounded-[12px]' },
          xl: { base: 'h-11 px-5 py-0 text-base/6 gap-2 rounded-[12px]' }
        }
      },
      compoundVariants: [
        // icon-only buttons are square at the same heights
        { size: 'sm', square: true, class: 'w-7 p-0 justify-center' },
        { size: 'md', square: true, class: 'w-9 p-0 justify-center' },
        { size: 'lg', square: true, class: 'w-11 p-0 justify-center' },
        {
          // primary button: gold fill with ink text, darkening to the hover/active tokens
          color: 'primary',
          variant: 'solid',
          class: 'text-(--brand-ink) bg-brand-400 hover:bg-brand-500 active:bg-brand-600 disabled:bg-brand-400 aria-disabled:bg-brand-400 focus-visible:outline-(--focus-ring)'
        }
      ]
    },
    formField: {
      // Core Field: 14/20 medium label, 4px + 4px to the input, 12/18 hint text,
      // "Optional" pill right next to the label
      slots: {
        labelWrapper: 'flex items-center justify-start gap-2',
        label: 'block text-sm/5 font-medium text-highlighted',
        container: 'mt-2',
        description: 'mt-0.5 text-xs/[18px] text-muted',
        hint: 'inline-flex items-center rounded-full bg-elevated px-2 py-0.5 text-[11px]/4 font-medium text-toned',
        help: 'mt-1 text-xs/[18px] text-muted',
        error: 'mt-1 text-xs/[18px] text-error'
      },
      variants: {
        required: { true: { label: 'after:content-none' } }
      }
    },
    input: {
      // Core Field input: 44px tall, 12px side padding, radius 12, border-input (#64748B), gold when active
      slots: { base: 'rounded-[12px]' },
      variants: {
        size: {
          md: { base: 'h-9 py-0 text-sm/5' },
          lg: { base: 'h-11 px-3 py-0 text-sm/5 gap-2', leadingIcon: 'size-5', trailingIcon: 'size-5' }
        },
        variant: {
          outline: 'ring-[var(--color-slate-500)] dark:ring-[#6b6d72]'
        }
      },
      compoundVariants: [
        { color: 'primary', variant: 'outline', class: 'focus-visible:ring-1 focus-visible:ring-brand-400' }
      ],
      defaultVariants: { size: 'lg' }
    },
    select: {
      slots: { base: 'rounded-[12px] ring-[var(--color-slate-500)] dark:ring-[#6b6d72]' },
      variants: {
        size: {
          md: { base: 'h-9 py-0 text-sm/5' },
          lg: { base: 'h-11 px-3 py-0 text-sm/5 gap-2', leadingIcon: 'size-5', trailingIcon: 'size-5', item: 'text-sm' }
        },
        variant: {
          outline: 'ring-[var(--color-slate-500)] dark:ring-[#6b6d72]'
        }
      },
      compoundVariants: [
        { color: 'primary', variant: 'outline', class: 'focus:ring-1 focus:ring-brand-400 focus-visible:ring-1 focus-visible:ring-brand-400' }
      ],
      defaultVariants: { size: 'lg' }
    },
    textarea: {
      slots: { base: 'rounded-[12px] ring-[var(--color-slate-500)] dark:ring-[#6b6d72]' },
      variants: {
        size: {
          lg: { base: 'px-3 py-2.5 text-sm/5' }
        },
        variant: {
          outline: 'ring-[var(--color-slate-500)] dark:ring-[#6b6d72]'
        }
      },
      compoundVariants: [
        { color: 'primary', variant: 'outline', class: 'focus-visible:ring-1 focus-visible:ring-brand-400' }
      ],
      defaultVariants: { size: 'lg' }
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
