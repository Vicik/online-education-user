import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import AppFooter from '../../../app/components/shell/AppFooter.vue'

describe('AppFooter', () => {
  it('renders the site name and a stable current year', async () => {
    const wrapper = await mountSuspended(AppFooter)

    expect(wrapper.text()).toContain('知序学堂')
    expect(wrapper.text()).toContain(String(new Date().getFullYear()))
  })
})
