import { computed, toValue, type MaybeRefOrGetter } from 'vue'
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

export function usePageSeo(input: MaybeRefOrGetter<PageSeoInput>): void {
  const config = useRuntimeConfig()
  const resolved = computed(() => resolvePageSeo(toValue(input), config.public.siteUrl))

  useHead(() => resolved.value.head)
  useSeoMeta({
    description: () => resolved.value.meta.description,
    robots: () => resolved.value.meta.robots,
    ogTitle: () => resolved.value.meta.ogTitle,
    ogDescription: () => resolved.value.meta.ogDescription,
    ogUrl: () => resolved.value.meta.ogUrl,
    ogImage: () => resolved.value.meta.ogImage,
  })
  useSchemaOrg(computed(() => resolved.value.schema))
}
