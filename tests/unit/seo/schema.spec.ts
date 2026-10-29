import { describe, expect, it } from 'vitest'
import { articleSchema, breadcrumbSchema, courseSchema } from '~/lib/seo/schema'

describe('schema helpers', () => {
  it('生成 Course 结构化数据', () => {
    expect(courseSchema({
      name: 'Nuxt 4 入门',
      description: '面向前端开发者的 SSR 课程',
      url: 'https://example.com/courses/nuxt-4',
      providerName: '知序学堂',
    })).toEqual({
      '@type': 'Course',
      'name': 'Nuxt 4 入门',
      'description': '面向前端开发者的 SSR 课程',
      'url': 'https://example.com/courses/nuxt-4',
      'provider': {
        '@type': 'Organization',
        'name': '知序学堂',
      },
    })
  })

  it('生成 Article 结构化数据', () => {
    expect(articleSchema({
      headline: '如何制定备考计划',
      description: '一份可执行的备考计划指南',
      url: 'https://example.com/community/study-plan',
      authorName: '张老师',
      datePublished: '2026-10-28T08:00:00+08:00',
    })).toMatchObject({
      '@type': 'Article',
      'headline': '如何制定备考计划',
      'author': {
        '@type': 'Person',
        'name': '张老师',
      },
    })
  })

  it('生成带位置与绝对链接的 BreadcrumbList', () => {
    const schema = breadcrumbSchema([
      { name: '首页', url: 'https://example.com/' },
      { name: '课程', url: 'https://example.com/courses' },
    ])

    expect(schema).toEqual({
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': '首页',
          'item': 'https://example.com/',
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': '课程',
          'item': 'https://example.com/courses',
        },
      ],
    })
  })
})
