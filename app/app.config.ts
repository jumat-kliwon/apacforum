/** Nuxt UI theme following the Core Design System. */

// Core Field states shared by input, select and textarea:
// 1px gold border-brand-secondary while active, 2px blue ring only for keyboard focus,
// border-error-secondary (red-700) on error, bg-disabled / text-disabled when disabled
const fieldDisabled = 'disabled:opacity-100 disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-[#222529] dark:disabled:text-[#5e6066]'
const fieldActive = 'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-700 dark:focus-visible:ring-brand-400 keyboard:focus-visible:ring-2 keyboard:focus-visible:ring-(--focus-ring)'
const fieldError = 'ring-red-700 hover:ring-red-700 focus-visible:outline-none focus-visible:ring-red-700'
const fieldIcons = { leadingIcon: 'text-toned', trailingIcon: 'text-toned' }
// 1px border-secondary (slate-300) at rest, border-tertiary (slate-400) on hover
const fieldBorder = 'ring-slate-300 hover:ring-slate-400 dark:ring-[#3e4045] dark:hover:ring-[#6b6d72]'

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
      // Core Field: 14/20 medium label, 4px to the subtitle, 8px to the input and to the hint,
      // 12/18 hint text in text-tertiary / text-error-primary,
      // "Optional" pill right next to the label
      slots: {
        labelWrapper: 'flex items-center justify-start gap-2',
        label: 'block text-sm/5 font-medium tracking-[-0.16px] text-highlighted',
        container: 'mt-2',
        description: 'mt-1 text-xs/[18px] text-muted',
        hint: 'inline-flex items-center rounded-full bg-elevated px-2 py-0.5 text-[11px]/4 font-medium text-toned',
        help: 'mt-2 text-xs/[18px] text-muted',
        error: 'mt-2 text-xs/[18px] text-red-600 dark:text-[#e57373]'
      },
      variants: {
        required: { true: { label: 'after:content-none' } }
      }
    },
    input: {
      // Core Field input: 44px tall, 12px side padding, radius 12, 1px border-secondary, 20px icon-secondary icons
      slots: { base: `rounded-[12px] ${fieldDisabled}`, ...fieldIcons },
      variants: {
        size: {
          md: { base: 'h-9 py-0 text-sm/5' },
          lg: { base: 'h-11 px-3 py-0 text-sm/5 gap-2', leadingIcon: 'size-5', trailingIcon: 'size-5' }
        },
        variant: {
          outline: fieldBorder
        }
      },
      compoundVariants: [
        { color: 'primary', variant: 'outline', class: fieldActive },
        { color: 'error', highlight: true, class: fieldError }
      ],
      defaultVariants: { size: 'lg' }
    },
    select: {
      slots: { base: `rounded-[12px] ${fieldDisabled}`, ...fieldIcons },
      variants: {
        size: {
          md: { base: 'h-9 py-0 text-sm/5' },
          lg: { base: 'h-11 px-3 py-0 text-sm/5 gap-2', leadingIcon: 'size-5', trailingIcon: 'size-5', item: 'text-sm' }
        },
        variant: {
          outline: fieldBorder
        }
      },
      compoundVariants: [
        {
          // the trigger is a button, so :focus-visible already means keyboard focus
          color: 'primary',
          variant: 'outline',
          class: 'focus:outline-none focus:ring-1 focus:ring-brand-700 dark:focus:ring-brand-400 focus-visible:ring-2 focus-visible:ring-(--focus-ring) dark:focus-visible:ring-(--focus-ring)'
        },
        { color: 'error', highlight: true, class: `${fieldError} focus:ring-red-700` }
      ],
      defaultVariants: { size: 'lg' }
    },
    textarea: {
      slots: { base: `rounded-[12px] ${fieldDisabled}`, ...fieldIcons },
      variants: {
        size: {
          lg: { base: 'px-3 py-2.5 text-sm/5' }
        },
        variant: {
          outline: fieldBorder
        }
      },
      compoundVariants: [
        { color: 'primary', variant: 'outline', class: fieldActive },
        { color: 'error', highlight: true, class: fieldError }
      ],
      defaultVariants: { size: 'lg' }
    },
    card: {
      // cards: radius 12, 1px border, shadow-xs at rest
      slots: { root: 'rounded-[12px] shadow-xs' }
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
    tabs: {
      // Core Tab: 10/16 padding, 14/20 medium text-secondary, 8px gap to icon and counter,
      // counter pill 11px semibold on bg-secondary
      slots: {
        trigger: 'data-[state=inactive]:text-toned hover:data-[state=inactive]:not-disabled:text-highlighted',
        trailingBadge: 'rounded-full bg-elevated px-1.5 text-[11px]/4 font-semibold text-toned ring-0'
      },
      variants: {
        size: {
          md: { trigger: 'px-4 py-2.5 text-sm/5 gap-2', leadingIcon: 'size-4' }
        },
        variant: {
          // Pill: segmented filter, transparent track, active = gold pill with ink text
          pill: { list: 'bg-transparent p-0 gap-1', trigger: 'grow-0 rounded-full hover:data-[state=inactive]:bg-muted', indicator: 'rounded-full shadow-none' }
        }
      },
      compoundVariants: [
        {
          // Underline: active text-brand-primary with a 2px gold indicator
          color: 'primary',
          variant: 'link',
          class: { indicator: 'bg-brand-400', trigger: 'data-[state=active]:text-brand-800 dark:data-[state=active]:text-brand-300' }
        },
        {
          // the grey rule is an inset shadow rather than a border so the 2px indicator can cover it
          // without poking out of the list, which would show a scrollbar when the list scrolls sideways
          orientation: 'horizontal',
          variant: 'link',
          class: { list: 'border-b-0 mb-0 shadow-[inset_0_-1px_0_var(--ui-border)]', indicator: 'bottom-0 h-0.5' }
        },
        {
          color: 'primary',
          variant: 'pill',
          class: { indicator: 'bg-brand-400', trigger: 'data-[state=active]:text-(--brand-ink)' }
        }
      ]
    },
    stepper: {
      // Core Stepper: 32px circles, pending = white with a 1.5px border-primary ring and text-tertiary,
      // active / complete = gold bg-brand-secondary with ink text, 2px connector, 12/18 labels
      slots: {
        trigger: 'bg-default ring-[1.5px] ring-inset ring-slate-200 dark:ring-[#303236] text-muted text-[13px] font-semibold group-data-[state=active]:ring-0 group-data-[state=completed]:ring-0',
        title: 'text-xs/[18px] font-medium text-muted group-data-[state=active]:font-semibold group-data-[state=active]:text-highlighted group-data-[state=completed]:text-toned',
        separator: 'bg-slate-200 dark:bg-[#303236]'
      },
      variants: {
        color: {
          primary: {
            trigger: 'group-data-[state=completed]:bg-brand-400 group-data-[state=active]:bg-brand-400 group-data-[state=completed]:text-(--brand-ink) group-data-[state=active]:text-(--brand-ink)',
            separator: 'group-data-[state=completed]:bg-brand-400'
          }
        }
      }
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
