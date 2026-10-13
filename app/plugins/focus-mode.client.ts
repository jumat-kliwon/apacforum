/**
 * Browsers treat a mouse click into a text input as :focus-visible, so fields can't tell
 * keyboard focus apart on their own. Core Field marks Tab navigation on <html> so the
 * `keyboard:` variant shows the blue ring for keyboard users and the gold border for clicks.
 */
export default defineNuxtPlugin(() => {
  const root = document.documentElement
  addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Tab') root.setAttribute('data-focus-mode', 'keyboard')
  }, true)
  addEventListener('pointerdown', () => root.removeAttribute('data-focus-mode'), true)
})
