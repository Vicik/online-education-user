import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AppErrorState from '../../../app/components/common/AppErrorState.vue'

describe('AppErrorState', () => {
  it('renders feature-specific copy with the requested heading level and retry action', async () => {
    const wrapper = mount(AppErrorState, {
      props: {
        title: '课程暂时无法加载',
        message: '请求失败，请稍后重试。',
        headingTag: 'h2',
      },
    })

    expect(wrapper.get('[role="alert"]').classes()).toContain('app-error')
    expect(wrapper.get('h2').text()).toBe('课程暂时无法加载')
    expect(wrapper.text()).toContain('请求失败，请稍后重试。')

    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })
})
