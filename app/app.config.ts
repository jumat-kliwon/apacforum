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
      compoundVariants: [
        {
          // tombol utama desain: latar emas (brand-400) dengan teks gelap
          color: 'primary',
          variant: 'solid',
          class: 'text-(--brand-ink) bg-brand-400 hover:bg-brand-500 active:bg-brand-600 disabled:bg-brand-400 aria-disabled:bg-brand-400 outline-brand-400/40'
        }
      ]
    },
    card: {
      slots: {
        root: 'rounded-2xl'
      }
    },
    badge: {
      defaultVariants: {
        variant: 'subtle'
      }
    }
  }
})
