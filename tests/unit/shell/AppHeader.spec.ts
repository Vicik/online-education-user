import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import AppHeader from '../../../app/components/shell/AppHeader.vue'
import { NAV_ITEMS } from '../../../app/config/navigation'

describe('AppHeader', () => {
  it('renders the confirmed navigation in the exact order', async () => {
    expect(NAV_ITEMS).toEqual([
      { label: '首页', to: '/' },
      { label: '考试', to: '/exam' },
      { label: '拼团', to: '/group-buy' },
      { label: '秒杀', to: '/flash-sale' },
      { label: '社区', to: '/community' },
      { label: '课程', to: '/course' },
    ])

    const wrapper = await mountSuspended(AppHeader)
    const links = wrapper.get('[data-testid="desktop-navigation"]').findAll('a')

    expect(links.map(link => link.text())).toEqual(NAV_ITEMS.map(item => item.label))
    expect(links.map(link => link.attributes('href'))).toEqual(NAV_ITEMS.map(item => item.to))
  })

  it('keeps a single desktop navigation without a mobile menu', async () => {
    const wrapper = await mountSuspended(AppHeader)

    expect(wrapper.find('[data-testid="mobile-navigation"]').exists()).toBe(false)
    expect(wrapper.findAll('nav')).toHaveLength(1)
    expect(wrapper.get('nav').attributes('aria-label')).toBe('主导航')
  })
})
