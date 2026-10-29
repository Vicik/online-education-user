import { clearNuxtData } from '#app'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { loadNuxtConfig } from 'nuxt/kit'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import HomePage from '../../../app/pages/index.vue'
import type { HomeResponse } from '../../../app/features/home/home.types'

const { usePageSeoMock } = vi.hoisted(() => ({
  usePageSeoMock: vi.fn(),
}))

mockNuxtImport('usePageSeo', () => usePageSeoMock)

const homeResponse: HomeResponse = {
  banners: [
    {
      id: 'banner-1',
      title: '循序建立前端知识体系',
      description: '从课程、练习到能力测评，找到下一步学习方向。',
      imageUrl: '/img/banner-home.jpg',
      imageAlt: '知序学堂首页课程推荐',
      href: '/course/frontend-path',
      width: 1600,
      height: 640,
    },
  ],
  groupBuys: [
    {
      id: 'group-1',
      slug: 'vue-team',
      title: 'Vue 3 小班拼团',
      imageUrl: '/img/vue-team.jpg',
      imageAlt: 'Vue 3 小班拼团课程封面',
      price: 8,
      originalPrice: 90,
      status: 'active',
      endsAt: '2026-11-30T12:00:00+08:00',
    },
  ],
  latestCourses: [
    {
      id: 'course-new',
      slug: 'nuxt-ssr',
      title: 'Nuxt SSR 实战',
      imageUrl: '/img/nuxt-ssr.jpg',
      imageAlt: 'Nuxt SSR 实战课程封面',
      price: 9.98,
      originalPrice: 20,
    },
  ],
  recommendedCourses: [
    {
      id: 'course-recommended',
      slug: 'typescript-design',
      title: 'TypeScript 类型设计',
      imageUrl: '/img/typescript-design.jpg',
      imageAlt: 'TypeScript 类型设计课程封面',
      price: 20,
      originalPrice: 30,
    },
  ],
}

const NuxtLinkStub = {
  props: ['to'],
  template: '<a :href="to"><slot /></a>',
}

function mountHomePage() {
  return mountSuspended(HomePage, {
    route: '/',
    global: {
      stubs: { NuxtLink: NuxtLinkStub },
    },
  })
}

describe('home page', () => {
  beforeEach(async () => {
    usePageSeoMock.mockClear()
    await clearNuxtData('home')
  })

  afterEach(async () => {
    vi.unstubAllGlobals()
    await clearNuxtData('home')
    document.head.innerHTML = ''
  })

  it('renders the four SSR data regions with crawlable detail links and page SEO', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue(homeResponse))

    const wrapper = await mountHomePage()
    await flushPromises()

    expect(wrapper.get('h1').text()).toBe('循序建立前端知识体系')
    expect(wrapper.get('[aria-label="精选学习内容"]')).toBeTruthy()
    expect(wrapper.findAll('h2').map(heading => heading.text())).toEqual([
      '正在拼团',
      '最新课程',
      '推荐课程',
    ])
    expect(wrapper.get('a[href="/group-buy/vue-team"]').text()).toContain('Vue 3 小班拼团')
    expect(wrapper.get('a[href="/course/nuxt-ssr"]').text()).toContain('Nuxt SSR 实战')
    expect(wrapper.get('a[href="/course/typescript-design"]').text()).toContain('TypeScript 类型设计')
    expect(usePageSeoMock).toHaveBeenCalledWith({
      title: '在线课程、考试与学习社区｜知序学堂',
      description: '在知序学堂发现最新课程、精选课程和限时拼团，用清晰的学习路径稳步提升。',
      path: '/',
    })
  })

  it('shows a retry action after a request failure and recovers on retry', async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new TypeError('network unavailable'))
      .mockResolvedValueOnce(homeResponse)
    vi.stubGlobal('$fetch', fetchMock)

    const wrapper = await mountHomePage()

    expect(wrapper.get('[role="alert"]').text()).toContain('首页内容暂时无法加载')
    expect(wrapper.get('.home-state-container').attributes('style') ?? '')
      .toContain('width: var(--page-width)')
    expect(wrapper.findAll('h2')).toHaveLength(0)

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.findAll('h2').map(heading => heading.text())).toEqual([
      '正在拼团',
      '最新课程',
      '推荐课程',
    ])
  })

  it('enables a 300 second public SWR rule only for the home route', async () => {
    const nuxtConfig = await loadNuxtConfig({ cwd: process.cwd() })

    expect(nuxtConfig.routeRules?.['/']).toEqual({ swr: 300 })
  })

  it('keeps the banner and course sections on the fixed desktop canvas', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue(homeResponse))

    const wrapper = await mountHomePage()
    await flushPromises()

    expect(wrapper.get('.home-banner').attributes('style') ?? '').toContain('width: var(--page-width)')
    expect(wrapper.get('.home-section').attributes('style') ?? '').toContain('width: var(--page-width)')
    expect(wrapper.get('.section-grid').attributes('style') ?? '')
      .toContain('grid-template-columns: repeat(4, minmax(0, 1fr))')
  })
})
