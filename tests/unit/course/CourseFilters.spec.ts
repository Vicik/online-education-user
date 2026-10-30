import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CourseFilters from '../../../app/features/course/components/CourseFilters.vue'

describe('CourseFilters', () => {
  it.each([
    'select[name="category"]',
    'input[name="keyword"]',
    'select[name="sort"]',
  ])('suppresses the focus decoration after pointer interaction on %s', async (selector) => {
    const wrapper = mount(CourseFilters)

    await wrapper.get(selector).trigger('pointerdown')

    expect(wrapper.get('form').classes()).toContain('is-pointer-focus')
  })

  it('restores the visible focus mode when the user switches to the keyboard', async () => {
    const wrapper = mount(CourseFilters)
    const keywordInput = wrapper.get('input[name="keyword"]')

    await keywordInput.trigger('pointerdown')
    await keywordInput.trigger('keydown', { key: 'Tab' })

    expect(wrapper.get('form').classes()).not.toContain('is-pointer-focus')
  })
})
