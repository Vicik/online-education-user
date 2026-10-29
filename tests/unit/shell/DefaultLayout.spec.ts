import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import DefaultLayout from '../../../app/layouts/default.vue'

describe('default layout integration', () => {
  it('renders the shared header and footer around page content', async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      slots: {
        default: '<h1>首页内容</h1>',
      },
      route: '/',
    })

    expect(wrapper.get('nav[aria-label="主导航"]')).toBeTruthy()
    expect(wrapper.find('[data-testid="mobile-navigation"]').exists()).toBe(false)
    expect(wrapper.get('a[href="#main-content"]').text()).toContain('跳到主要内容')
    expect(wrapper.get('main').text()).toContain('首页内容')
    expect(wrapper.get('footer').text()).toContain('知序学堂')
  })
})
