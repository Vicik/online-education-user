import type { PageSeoInput } from '~/lib/seo/seo.types'

export function resolvePageSeo(input: PageSeoInput, siteUrl: string) {
  const canonical = new URL(input.path, siteUrl).toString()

  return {
    head: {
      title: input.title,
      link: [
        {
          rel: 'canonical' as const,
          href: canonical,
        },
      ],
    },
    meta: {
      description: input.description,
      robots: input.noindex ? 'noindex, nofollow' : 'index, follow',
      ogTitle: input.title,
      ogDescription: input.description,
      ogUrl: canonical,
      ...(input.image ? { ogImage: input.image } : {}),
    },
    schema: input.schema
      ? (Array.isArray(input.schema) ? input.schema : [input.schema])
      : [],
  }
}

export function usePageSeo(input: PageSeoInput): void {
  const config = useRuntimeConfig()
  const resolved = resolvePageSeo(input, config.public.siteUrl)

  useHead(resolved.head)
  useSeoMeta(resolved.meta)

  if (resolved.schema.length > 0) {
    useSchemaOrg(resolved.schema)
  }
}
