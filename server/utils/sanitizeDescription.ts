import sanitizeHtml from 'sanitize-html'
import { descriptionToHtml, descriptionToText } from '../../shared/utils/richText'

/**
 * Event descriptions are rendered with v-html on the public event page, so only the
 * markup the admin editor can produce is kept: text styles, h2/h3, lists, quotes and links.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'a'],
  allowedAttributes: { a: ['href', 'target', 'rel'] },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  transformTags: {
    // external links open in a new tab without handing the page a window.opener
    a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer nofollow' })
  }
}

export function sanitizeDescription(description: string) {
  const html = sanitizeHtml(descriptionToHtml(description), OPTIONS).trim()
  // an emptied editor still sends <p></p>
  return descriptionToText(html) ? html : ''
}
