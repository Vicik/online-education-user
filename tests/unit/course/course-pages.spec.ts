import { clearNuxtData } from '#app'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { enableAutoUnmount, flushPromises } from '@vue/test-utils'
import { toValue } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CourseDetailPage from '../../../app/pages/course/[slug].vue'
import CourseIndexPage from '../../../app/pages/course/index.vue'
import type { CourseDetail, CourseSummary } from '../../../app/features/course/course.types'

const { showErrorMock, usePageSeoMock } = vi.hoisted(() => ({
  showErrorMock: vi.fn(),
  usePageSeoMock: vi.fn(),
}))
mockNuxtImport('showError', () => showErrorMock)
mockNuxtImport('usePageSeo', () => usePageSeoMock)
enableAutoUnmount(afterEach)

const summary: CourseSummary = {
  id: 'course-1',
  slug: 'nuxt-ssr',
  title: 'Nuxt SSR 实战',
  description: '从渲染原理到上线部署，建立完整 SSR 工程能力。',
  imageUrl: '/img/nuxt-ssr.jpg',
  imageAlt: 'Nuxt SSR 实战课程封面',
  price: 99,
  originalPrice: 199,
  category: 'frontend',
  categoryLabel: '前端开发',
  updatedAt: '2026-10-29T12:00:00+08:00',
}

const detail: CourseDetail = {
  ...summary,
  teacher: { id: 'teacher-1', name: '林老师', title: '资深前端工程师' },
  audience: ['有 Vue 基础的开发者', '希望掌握 SSR 的前端工程师'],
  outline: [
    { id: 'chapter-1', title: '理解服务端渲染', lessons: ['渲染链路', '水合与状态'] },
  ],
  publishedAt: '2026-10-20T08:00:00+08:00',
}

const NuxtLinkStub = { props: ['to'], template: '<a :href="to"><slot /></a>' }

describe('course pages', () => {
  beforeEach(async () => {
    showErrorMock.mockClear()
    usePageSeoMock.mockClear()
    await clearNuxtData()
  })

  afterEach(async () => {
    vi.unstubAllGlobals()
    await clearNuxtData()
  })

  it.each(['/course?page=0', '/course?page=-2', '/course?page=abc'])(
    'normalizes an invalid page to one and removes default values from canonical: %s',
    async (route) => {
      const fetchMock = vi.fn().mockResolvedValue({ items: [summary], page: 1, pageSize: 12, total: 1 })
      vi.stubGlobal('$fetch', fetchMock)

      const wrapper = await mountSuspended(CourseIndexPage, {
        route,
        global: { stubs: { NuxtLink: NuxtLinkStub } },
      })
      await flushPromises()

      expect(wrapper.get('h1').text()).toBe('全部课程')
      expect(wrapper.get('.course-catalogue').element.tagName).toBe('DIV')
      expect(fetchMock).toHaveBeenCalledWith('/v1/courses', expect.objectContaining({
        query: { pageSize: 12 },
      }))
      expect(toValue(usePageSeoMock.mock.calls[0]![0])).toMatchObject({ path: '/course' })
    },
  )

  it('renders a four-column catalogue with real course links', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({ items: [summary], page: 1, pageSize: 12, total: 1 }))

    const wrapper = await mountSuspended(CourseIndexPage, {
      route: '/course?category=frontend&keyword=Nuxt',
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })
    await flushPromises()

    expect(wrapper.get('.course-grid').attributes('style') ?? '')
      .toContain('grid-template-columns: repeat(4, minmax(0, 1fr))')
    expect(wrapper.find('.catalogue-heading').exists()).toBe(false)
    expect(wrapper.get('h1').classes()).toContain('sr-only')
    expect(wrapper.text()).not.toContain('COURSE CATALOGUE')
    expect(wrapper.text()).not.toContain('共 1 门课程')
    expect(wrapper.get('a[href="/course/nuxt-ssr"]').text()).toContain('Nuxt SSR 实战')
    expect(wrapper.get('article h2').text()).toBe('Nuxt SSR 实战')
    expect(toValue(usePageSeoMock.mock.calls[0]![0])).toMatchObject({
      path: '/course?category=frontend&keyword=Nuxt',
      noindex: true,
    })
  })

  it('keeps the SEO input reactive across client-side query navigation', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({ items: [summary], page: 1, pageSize: 12, total: 24 }))

    const wrapper = await mountSuspended(CourseIndexPage, {
      route: '/course',
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })
    const seoInput = usePageSeoMock.mock.calls[0]![0]

    expect(toValue(seoInput)).toMatchObject({
      title: '全部课程｜知序学堂',
      path: '/course',
    })

    await wrapper.vm.$router.push('/course?page=2')
    await flushPromises()

    expect(toValue(seoInput)).toMatchObject({
      title: '全部课程第 2 页｜知序学堂',
      path: '/course?page=2',
    })
  })

  it('SSR-renders course content, outline, and Course plus breadcrumb schemas', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue(detail))

    const wrapper = await mountSuspended(CourseDetailPage, {
      route: '/course/nuxt-ssr',
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })
    await flushPromises()

    expect(wrapper.get('h1').text()).toBe('Nuxt SSR 实战')
    expect(wrapper.get('.course-detail').element.tagName).toBe('DIV')
    expect(wrapper.text()).toContain(detail.description)
    expect(wrapper.text()).toContain('理解服务端渲染')
    expect(toValue(usePageSeoMock.mock.calls[0]![0])).toEqual(expect.objectContaining({
      path: '/course/nuxt-ssr',
      schema: expect.arrayContaining([
        expect.objectContaining({ '@type': 'Course', 'name': 'Nuxt SSR 实战' }),
        expect.objectContaining({ '@type': 'BreadcrumbList' }),
      ]),
    }))
  })

  it('preserves a literal percent escape in the router slug', async () => {
    const literalPercentDetail: CourseDetail = { ...detail, id: 'course-percent', slug: 'rate%2Ftest' }
    const fetchMock = vi.fn().mockResolvedValue(literalPercentDetail)
    vi.stubGlobal('$fetch', fetchMock)

    await mountSuspended(CourseDetailPage, {
      route: '/course/rate%252Ftest',
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })
    await flushPromises()

    expect(fetchMock).toHaveBeenCalledWith('/v1/courses/rate%252Ftest', expect.any(Object))
  })

  it('restores detail SEO after a recoverable request succeeds on retry', async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce({ code: 'SERVICE_UNAVAILABLE', message: '服务暂时不可用。', status: 500 })
      .mockResolvedValueOnce(detail)
    vi.stubGlobal('$fetch', fetchMock)

    const wrapper = await mountSuspended(CourseDetailPage, {
      route: '/course/nuxt-ssr',
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('课程暂时无法加载')
    expect(usePageSeoMock).toHaveBeenCalledTimes(1)
    const seoInput = usePageSeoMock.mock.calls[0]![0]

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(wrapper.get('h1').text()).toBe('Nuxt SSR 实战')
    expect(toValue(seoInput)).toMatchObject({
      title: 'Nuxt SSR 实战｜知序学堂',
      description: detail.description,
      path: '/course/nuxt-ssr',
      schema: expect.arrayContaining([
        expect.objectContaining({ '@type': 'Course', 'name': 'Nuxt SSR 实战' }),
        expect.objectContaining({ '@type': 'BreadcrumbList' }),
      ]),
    })
  })

  it('enters the Nuxt error boundary when a retry resolves to a 404', async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce({ code: 'SERVICE_UNAVAILABLE', message: '服务暂时不可用。', status: 500 })
      .mockRejectedValueOnce({ code: 'NOT_FOUND', message: '请求的内容不存在。', status: 404 })
    vi.stubGlobal('$fetch', fetchMock)

    const wrapper = await mountSuspended(CourseDetailPage, {
      route: '/course/not-published',
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })
    await flushPromises()

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(showErrorMock).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 404,
      statusMessage: '课程不存在或尚未发布',
    }))
  })

  it('turns an unknown or unpublished slug into a real 404', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockRejectedValue({
      code: 'NOT_FOUND',
      message: '请求的内容不存在。',
      status: 404,
    }))

    await expect(mountSuspended(CourseDetailPage, {
      route: '/course/not-published',
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: '课程不存在或尚未发布',
    })
  })
})
