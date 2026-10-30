import { clearNuxtData } from '#app'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { toValue } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PromotionHero from '../../../app/features/promotion/components/PromotionHero.vue'
import type { PromotionDetail, PromotionStatus, PromotionSummary } from '../../../app/features/promotion/promotion.types'
import FlashSaleDetailPage from '../../../app/pages/flash-sale/[slug].vue'
import FlashSaleIndexPage from '../../../app/pages/flash-sale/index.vue'
import GroupBuyDetailPage from '../../../app/pages/group-buy/[slug].vue'
import GroupBuyIndexPage from '../../../app/pages/group-buy/index.vue'

const { showErrorMock, usePageSeoMock } = vi.hoisted(() => ({
  showErrorMock: vi.fn(),
  usePageSeoMock: vi.fn(),
}))
mockNuxtImport('showError', () => showErrorMock)
mockNuxtImport('usePageSeo', () => usePageSeoMock)
enableAutoUnmount(afterEach)

const summary: PromotionSummary = {
  id: 'promotion-1',
  slug: 'nuxt-group',
  title: 'Nuxt SSR 实战拼团',
  imageUrl: '/img/nuxt-group.jpg',
  imageAlt: 'Nuxt SSR 实战拼团封面',
  price: 9.9,
  originalPrice: 199,
  status: 'active',
  startsAt: '2026-10-30T10:00:00+08:00',
  endsAt: '2026-10-31T10:00:00+08:00',
  remaining: 18,
  soldCount: 82,
  groupSize: 2,
  updatedAt: '2026-10-30T12:00:00+08:00',
}

const detail: PromotionDetail = {
  ...summary,
  description: '通过实战掌握 Nuxt 服务端渲染、数据获取与部署。',
  details: ['适合有 Vue 基础的学习者', '课程内容在活动结束后仍可查看'],
}

const NuxtLinkStub = { props: ['to'], template: '<a :href="to"><slot /></a>' }

describe('promotion pages', () => {
  beforeEach(async () => {
    showErrorMock.mockClear()
    usePageSeoMock.mockClear()
    await clearNuxtData()
  })

  afterEach(async () => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    await clearNuxtData()
  })

  it.each([
    ['active', '立即拼团', false],
    ['upcoming', '即将开始', true],
    ['sold-out', '已售罄', true],
    ['ended', '已结束', true],
  ] as const)('uses the authoritative %s state for the group-buy CTA', (status, label, disabled) => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-30T12:00:00+08:00'))
    const wrapper = mount(PromotionHero, {
      props: { promotion: { ...detail, status: status as PromotionStatus }, kind: 'group-buy', initialNow: Date.now() },
    })

    const button = wrapper.get('button')
    expect(button.text()).toBe(label)
    expect(button.attributes('disabled') !== undefined).toBe(disabled)
  })

  it('uses flash-sale copy and keeps expired detail readable', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-30T12:00:00+08:00'))
    const wrapper = mount(PromotionHero, {
      props: { promotion: { ...detail, status: 'ended' }, kind: 'flash-sale', initialNow: Date.now() },
    })

    expect(wrapper.get('h1').text()).toBe(detail.title)
    expect(wrapper.text()).toContain(detail.description)
    expect(wrapper.get('button').text()).toBe('已结束')
  })

  it.each([
    [GroupBuyIndexPage, '/group-buy', '/v1/group-buys', '/group-buy/nuxt-group', '拼团活动'],
    [FlashSaleIndexPage, '/flash-sale', '/v1/flash-sales', '/flash-sale/nuxt-group', '限时秒杀'],
  ] as const)('SSR-renders a four-column activity list for %s', async (page, route, endpoint, href, heading) => {
    const fetchMock = vi.fn().mockResolvedValue({ items: [summary], page: 1, pageSize: 12, total: 1 })
    vi.stubGlobal('$fetch', fetchMock)

    const wrapper = await mountSuspended(page, {
      route,
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })
    await flushPromises()

    expect(wrapper.get('h1').text()).toBe(heading)
    expect(wrapper.get('.promotion-grid').attributes('style') ?? '').toContain('repeat(4, minmax(0, 1fr))')
    expect(wrapper.get(`a[href="${href}"]`).text()).toContain(summary.title)
    expect(fetchMock).toHaveBeenCalledWith(endpoint, expect.objectContaining({ query: { pageSize: 12 } }))
    expect(toValue(usePageSeoMock.mock.calls[0]![0])).toMatchObject({ path: route })
  })

  it.each([
    [GroupBuyDetailPage, '/group-buy/nuxt-group', '/v1/group-buys/nuxt-group', '立即拼团'],
    [FlashSaleDetailPage, '/flash-sale/nuxt-group', '/v1/flash-sales/nuxt-group', '立即秒杀'],
  ] as const)('SSR-renders authoritative detail content for %s', async (page, route, endpoint, cta) => {
    const fetchMock = vi.fn().mockResolvedValue(detail)
    vi.stubGlobal('$fetch', fetchMock)

    const wrapper = await mountSuspended(page, {
      route,
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })
    await flushPromises()

    expect(wrapper.get('h1').text()).toBe(detail.title)
    expect(wrapper.text()).toContain(detail.description)
    expect(wrapper.text()).toContain('适合有 Vue 基础的学习者')
    expect(wrapper.get('button').text()).toBe(cta)
    expect(wrapper.get(`.promotion-schedule time[datetime="${detail.startsAt}"]`).exists()).toBe(true)
    expect(wrapper.get(`.promotion-schedule time[datetime="${detail.endsAt}"]`).exists()).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith(endpoint, expect.any(Object))
  })

  it('turns an unknown or unpublished group-buy slug into a real 404', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockRejectedValue({
      code: 'NOT_FOUND', message: '请求的内容不存在。', status: 404,
    }))

    await expect(mountSuspended(GroupBuyDetailPage, {
      route: '/group-buy/not-published',
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: '拼团活动不存在或尚未发布',
    })
  })

  it('enters the error boundary when a flash-sale retry resolves to a 404', async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce({ code: 'SERVICE_UNAVAILABLE', message: '服务暂时不可用。', status: 500 })
      .mockRejectedValueOnce({ code: 'NOT_FOUND', message: '请求的内容不存在。', status: 404 })
    vi.stubGlobal('$fetch', fetchMock)

    const wrapper = await mountSuspended(FlashSaleDetailPage, {
      route: '/flash-sale/not-published',
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })
    await flushPromises()

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(showErrorMock).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 404,
      statusMessage: '秒杀活动不存在或尚未发布',
    }))
  })
})
