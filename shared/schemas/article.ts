import * as z from 'zod'

const optionalText = (max: number) => z.string().trim().max(max).nullish().transform(v => v || null)
const objectKey = z.string().max(300).nullish()

export const articleFormSchema = z.object({
  title: z.string().trim().min(1, 'Required').max(200),
  slug: z.string().trim().toLowerCase().max(160).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Lowercase letters, digits and hyphens'),
  excerpt: optionalText(500),
  /** HTML from the rich-text editor; sanitised on the server. */
  content: z.string().max(200_000, 'The content is too long').default(''),
  thumbnailKey: objectKey,
  status: z.enum(['draft', 'published']),
  /** Optional: back- or forward-date the article. Empty = the moment it is first published. */
  publishedAt: z.iso.datetime({ offset: true, local: true, error: 'Enter a valid date and time' }).nullish().or(z.literal('')).transform(v => v || null),
  seoTitle: optionalText(70),
  seoDescription: optionalText(160),
  seoKeywords: optionalText(255),
  ogImageKey: objectKey,
  canonicalUrl: z.url({ protocol: /^https?$/, error: 'Enter a full URL starting with https://' }).max(500).nullish().or(z.literal('')).transform(v => v || null),
  noIndex: z.boolean().default(false)
})

export type ArticleFormInput = z.input<typeof articleFormSchema>
export type ArticleForm = z.output<typeof articleFormSchema>

export const articleListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().refine(n => [10, 25, 50, 100].includes(n)).default(10),
  dir: z.enum(['asc', 'desc']).default('desc'),
  q: z.string().trim().max(100).optional(),
  status: z.enum(['draft', 'published']).optional(),
  sort: z.enum(['title', 'status', 'published', 'updated']).default('updated')
})

/** URL-safe slug from a title. */
export const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 160)
