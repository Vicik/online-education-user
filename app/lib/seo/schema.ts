import type {
  ArticleSeoSource,
  BreadcrumbItem,
  CourseSeoSource,
  SeoSchema,
} from './seo.types'

export function courseSchema(course: CourseSeoSource): SeoSchema {
  return {
    '@type': 'Course',
    'name': course.name,
    'description': course.description,
    'url': course.url,
    ...(course.image ? { image: course.image } : {}),
    ...(course.providerName
      ? {
          provider: {
            '@type': 'Organization',
            'name': course.providerName,
          },
        }
      : {}),
  }
}

export function articleSchema(article: ArticleSeoSource): SeoSchema {
  return {
    '@type': 'Article',
    'headline': article.headline,
    'description': article.description,
    'url': article.url,
    'author': {
      '@type': 'Person',
      'name': article.authorName,
    },
    'datePublished': article.datePublished,
    ...(article.dateModified ? { dateModified: article.dateModified } : {}),
    ...(article.image ? { image: article.image } : {}),
  }
}

export function breadcrumbSchema(items: BreadcrumbItem[]): SeoSchema {
  return {
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url,
    })),
  }
}
