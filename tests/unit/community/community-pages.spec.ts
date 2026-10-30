import { clearNuxtData } from '#app'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { enableAutoUnmount, flushPromises } from '@vue/test-utils'
import { toValue } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { PostDetail, PostSummary } from '../../../app/features/community/community.types'
import CommunityDetailPage from '../../../app/pages/community/[slug].vue'
import CommunityIndexPage from '../../../app/pages/community/index.vue'

const { showErrorMock, usePageSeoMock } = vi.hoisted(() => ({
  showErrorMock: vi.fn(),
  usePageSeoMock: vi.fn(),
}))
mockNuxtImport('showError', () => showErrorMock)
mockNuxtImport('usePageSeo', () => usePageSeoMock)
enableAutoUnmount(afterEach)

const summary: PostSummary = {
  id: 'post-1',
  slug: 'nuxt-ssr-notes',
  title: 'Nuxt SSR 学习笔记：从请求到首屏渲染',
  excerpt: '梳理服务端渲染的数据请求、HTML 输出和客户端水合过程。',
  author: {
    id: 'author-1',
    name: '林同学',
    avatarUrl: '/img/avatar-lin.jpg',
  },
  coverImageUrl: '/img/nuxt-notes.jpg',
  coverImageAlt: 'Nuxt SSR 学习笔记配图',
  publishedAt: '2026-10-28T09:00:00+08:00',
  updatedAt: '2026-10-29T12:00:00+08:00',
}

const detail: PostDetail = {
  ...summary,
  content: {
    format: 'sanitized-html',
    html: '<h2>请求从哪里开始</h2><p>页面请求先到达 Nuxt 服务端。</p><a href="/course/nuxt-ssr">继续学习</a>',
  },
}

const NuxtLinkStub = { props: ['to'], template: '<a :href="to"><slot /></a>' }

describe('community pages', () => {
  beforeEach(async () => {
    showErrorMock.mockClear()
    usePageSeoMock.mockClear()
    await clearNuxtData()
  })

  afterEach(async () => {
    vi.unstubAllGlobals()
    await clearNuxtData()
  })

  it('renders a public post list with real detail and pagination links', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({
      items: [summary],
      page: 2,
      pageSize: 10,
      total: 21,
    }))

    const wrapper = await mountSuspended(CommunityIndexPage, {
      route: '/community?page=2',
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })
    await flushPromises()

    expect(wrapper.get('h1').text()).toBe('学习社区')
    expect(wrapper.get('h1').classes()).toContain('sr-only')
    expect(wrapper.find('.community-heading').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('LEARNING COMMONS')
    expect(wrapper.text()).not.toContain('读学习笔记，也分享你走过的路。')
    expect(wrapper.get('a[href="/community/nuxt-ssr-notes"]').text()).toContain(summary.title)
    expect(wrapper.text()).toContain(summary.excerpt)
    expect(wrapper.get('a[aria-label="第 3 页"]').attributes('href')).toBe('/community?page=3')
    expect(toValue(usePageSeoMock.mock.calls[0]![0])).toMatchObject({
      title: '学习社区第 2 页｜知序学堂',
      path: '/community?page=2',
    })
  })

  it('normalizes invalid pagination to the crawlable first page', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ items: [summary], page: 1, pageSize: 10, total: 1 })
    vi.stubGlobal('$fetch', fetchMock)

    await mountSuspended(CommunityIndexPage, {
      route: '/community?page=abc',
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })
    await flushPromises()

    expect(fetchMock).toHaveBeenCalledWith('/v1/posts', expect.objectContaining({
      query: { pageSize: 10 },
    }))
    expect(toValue(usePageSeoMock.mock.calls[0]![0])).toMatchObject({ path: '/community' })
  })

  it('SSR-renders trusted sanitized HTML, author/date metadata, and forum schemas', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue(detail))

    const wrapper = await mountSuspended(CommunityDetailPage, {
      route: '/community/nuxt-ssr-notes',
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })
    await flushPromises()

    expect(wrapper.get('h1').text()).toBe(detail.title)
    expect(wrapper.get('.post-content h2').text()).toBe('请求从哪里开始')
    expect(wrapper.get('.post-content a').attributes('href')).toBe('/course/nuxt-ssr')
    expect(wrapper.text()).toContain(detail.author.name)
    expect(wrapper.get('time').attributes('datetime')).toBe(detail.publishedAt)
    expect(toValue(usePageSeoMock.mock.calls[0]![0])).toEqual(expect.objectContaining({
      title: `${detail.title}｜知序学堂`,
      path: '/community/nuxt-ssr-notes',
      schema: expect.arrayContaining([
        expect.objectContaining({
          '@type': 'DiscussionForumPosting',
          'headline': detail.title,
          'author': expect.objectContaining({ name: detail.author.name }),
        }),
        expect.objectContaining({ '@type': 'BreadcrumbList' }),
      ]),
    }))
  })

  it('turns an unknown or unpublished slug into a real 404', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockRejectedValue({
      code: 'NOT_FOUND',
      message: '请求的内容不存在。',
      status: 404,
    }))

    await expect(mountSuspended(CommunityDetailPage, {
      route: '/community/not-published',
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: '帖子不存在或尚未发布',
    })
  })
})
