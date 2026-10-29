import { describe, expect, it } from 'vitest'
import { resolvePageSeo } from '~/composables/usePageSeo'

describe('resolvePageSeo', () => {
  it('输出绝对 canonical、基础元数据、noindex 与 JSON-LD', () => {
    const schema = {
      '@type': 'Course',
      'name': 'Vue 3 实战课',
    }

    expect(resolvePageSeo({
      title: '课程详情',
      description: '系统学习 Vue 3 与 Nuxt 4',
      path: '/courses/vue?from=campaign',
      noindex: true,
      schema,
    }, 'https://example.com')).toEqual({
      head: {
        title: '课程详情',
        link: [{
          rel: 'canonical',
          href: 'https://example.com/courses/vue?from=campaign',
        }],
      },
      meta: {
        description: '系统学习 Vue 3 与 Nuxt 4',
        robots: 'noindex, nofollow',
        ogTitle: '课程详情',
        ogDescription: '系统学习 Vue 3 与 Nuxt 4',
        ogUrl: 'https://example.com/courses/vue?from=campaign',
      },
      schema: [schema],
    })
  })

  it('默认允许索引且不自动携带当前路由查询参数', () => {
    const resolved = resolvePageSeo({
      title: '课程列表',
      description: '查看全部课程',
      path: '/courses',
    }, 'https://example.com')

    expect(resolved.head.link).toEqual([{
      rel: 'canonical',
      href: 'https://example.com/courses',
    }])
    expect(resolved.meta.robots).toBe('index, follow')
    expect(resolved.schema).toEqual([])
  })
})
