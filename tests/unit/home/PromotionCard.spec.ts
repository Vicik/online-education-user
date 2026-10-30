import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PromotionCard from '../../../app/components/promotion/PromotionCard.vue'
import type { PromotionSummary } from '../../../app/features/home/home.types'

const promotion: PromotionSummary = {
  id: 'group-countdown',
  slug: 'group-countdown',
  title: '前端实战拼团课程',
  imageUrl: '/img/group-countdown.jpg',
  imageAlt: '前端实战拼团课程封面',
  price: 8,
  originalPrice: 90,
  status: 'active',
  endsAt: '2026-10-30T02:03:04+08:00',
}

const NuxtLinkStub = {
  props: ['to'],
  template: '<a :href="to"><slot /></a>',
}

describe('PromotionCard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-29T00:00:00+08:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders and updates a day-hour-minute-second countdown', async () => {
    const wrapper = mount(PromotionCard, {
      props: { promotion, kind: 'group-buy', initialNow: Date.now() },
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })

    expect(wrapper.get('.promotion-countdown').text()).toBe('倒计时1天02:03:04')
    expect(wrapper.findAll('.countdown-value').map(value => value.text())).toEqual(['1', '02', '03', '04'])

    await vi.advanceTimersByTimeAsync(1000)

    expect(wrapper.get('.promotion-countdown').text()).toBe('倒计时1天02:03:03')
  })
})
