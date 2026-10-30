import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AppPagination from '../../../app/components/common/AppPagination.vue'

const NuxtLinkStub = {
  props: ['to'],
  template: '<a :href="to"><slot /></a>',
}

describe('AppPagination', () => {
  it('renders crawlable anchors while preserving active filters', () => {
    const wrapper = mount(AppPagination, {
      props: {
        page: 2,
        pageSize: 12,
        total: 50,
        path: '/course',
        query: { category: 'frontend', keyword: 'Nuxt', page: '2', empty: '' },
      },
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })

    expect(wrapper.get('nav').attributes('aria-label')).toBe('课程分页')
    expect(wrapper.get('[aria-current="page"]').text()).toBe('2')
    expect(wrapper.get('a[aria-label="上一页"]').attributes('href'))
      .toBe('/course?category=frontend&keyword=Nuxt')
    expect(wrapper.get('a[aria-label="下一页"]').attributes('href'))
      .toBe('/course?category=frontend&keyword=Nuxt&page=3')
    expect(wrapper.findAll('a').every(link => Boolean(link.attributes('href')))).toBe(true)
  })

  it('normalizes invalid pages and disables only the unavailable direction', () => {
    const wrapper = mount(AppPagination, {
      props: { page: 0, pageSize: 12, total: 24, path: '/course' },
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })

    expect(wrapper.get('[aria-current="page"]').text()).toBe('1')
    expect(wrapper.get('[aria-label="上一页"]').attributes('aria-disabled')).toBe('true')
    expect(wrapper.get('a[aria-label="下一页"]').attributes('href')).toBe('/course?page=2')
  })

  it('keeps large catalogues compact while retaining real nearby links', () => {
    const wrapper = mount(AppPagination, {
      props: { page: 50, pageSize: 12, total: 1200, path: '/course' },
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })

    expect(wrapper.findAll('.pagination-page')).toHaveLength(7)
    expect(wrapper.findAll('.pagination-ellipsis')).toHaveLength(2)
    expect(wrapper.get('a[aria-label="第 49 页"]').attributes('href')).toBe('/course?page=49')
    expect(wrapper.get('[aria-current="page"]').text()).toBe('50')
  })
})
