import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { computed, defineComponent, ref, toValue } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resolvePageSeo, usePageSeo } from '~/composables/usePageSeo'

const { useHeadMock, useSeoMetaMock, useSchemaOrgMock } = vi.hoisted(() => ({
  useHeadMock: vi.fn(),
  useSeoMetaMock: vi.fn(),
  useSchemaOrgMock: vi.fn(),
}))

mockNuxtImport('useHead', () => useHeadMock)
mockNuxtImport('useSeoMeta', () => useSeoMetaMock)
mockNuxtImport('useSchemaOrg', () => useSchemaOrgMock)

beforeEach(() => {
  useHeadMock.mockClear()
  useSeoMetaMock.mockClear()
  useSchemaOrgMock.mockClear()
})

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

  it('响应式输入变化后更新 canonical、robots、标题与 Open Graph URL', async () => {
    const page = ref(1)

    await mountSuspended(defineComponent({
      setup() {
        usePageSeo(computed(() => ({
          title: page.value === 1 ? '全部课程｜知序学堂' : `课程第 ${page.value} 页｜知序学堂`,
          description: '查看全部课程',
          path: page.value === 1 ? '/course' : `/course?page=${page.value}`,
          noindex: page.value > 1,
        })))
      },
      template: '<div />',
    }))

    const headInput = useHeadMock.mock.calls[0]![0]
    const metaInput = useSeoMetaMock.mock.calls[0]![0]

    const readMeta = () => Object.fromEntries(
      Object.entries(metaInput).map(([key, value]) => [key, toValue(value)]),
    )

    expect(toValue(headInput)).toEqual(expect.objectContaining({
      title: '全部课程｜知序学堂',
      link: [{ rel: 'canonical', href: 'http://localhost:3000/course' }],
    }))
    expect(readMeta()).toEqual(expect.objectContaining({
      robots: 'index, follow',
      ogUrl: 'http://localhost:3000/course',
    }))

    page.value = 2

    expect(toValue(headInput)).toEqual(expect.objectContaining({
      title: '课程第 2 页｜知序学堂',
      link: [{ rel: 'canonical', href: 'http://localhost:3000/course?page=2' }],
    }))
    expect(readMeta()).toEqual(expect.objectContaining({
      robots: 'noindex, nofollow',
      ogUrl: 'http://localhost:3000/course?page=2',
    }))
  })
})
