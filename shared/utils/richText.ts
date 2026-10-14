/**
 * Event descriptions are HTML from the rich text editor. Events saved before the editor
 * existed hold plain text, so both formats are accepted wherever a description is read.
 */
const looksLikeHtml = (s: string) => /^\s*<[a-z][\s\S]*>/i.test(s)

const escapeHtml = (s: string) => s
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')

/** Plain text becomes paragraphs (blank line) and line breaks; HTML is returned unchanged. */
export function descriptionToHtml(description: string | null | undefined) {
  const text = description ?? ''
  if (!text.trim() || looksLikeHtml(text)) return text
  return text.trim().split(/\n\s*\n/)
    .map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('')
}

/** Text only, for meta descriptions and short previews. */
export function descriptionToText(description: string | null | undefined) {
  return (description ?? '')
    .replace(/<(br|\/p|\/li|\/h[1-6]|\/blockquote)\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}
