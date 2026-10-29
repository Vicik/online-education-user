import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import HomeBanner from '../../../app/features/home/components/HomeBanner.vue'
import type { BannerItem } from '../../../app/features/home/home.types'

const banners: BannerItem[] = [
  {
    id: 'banner-vue',
    title: 'Vue 3 实战课程',
    description: '从组件基础到工程化交付',
    imageUrl: '/img/vue-course.jpg',
    imageAlt: 'Vue 3 实战课程封面',
    href: '/course/vue-3-practice',
    width: 1600,
    height: 640,
  },
  {
    id: 'banner-exam',
    title: '前端能力测评',
    description: '检验知识掌握情况',
    imageUrl: '/img/frontend-exam.jpg',
    imageAlt: '前端能力测评封面',
    href: '/exam/frontend-foundation',
    width: 1600,
    height: 640,
  },
]

const NuxtLinkStub = {
  props: ['to'],
  template: '<a :href="to"><slot /></a>',
}

function mountBanner() {
  return mount(HomeBanner, {
    props: { banners },
    global: {
      stubs: { NuxtLink: NuxtLinkStub },
    },
  })
}

describe('HomeBanner', () => {
  it('exposes a named carousel and named controls', () => {
    const wrapper = mountBanner()

    expect(wrapper.get('[role="region"]').attributes('aria-label')).toBe('精选学习内容')
    expect(wrapper.get('button[aria-label="上一张横幅"]').attributes('type')).toBe('button')
    expect(wrapper.get('button[aria-label="下一张横幅"]').attributes('type')).toBe('button')
    expect(wrapper.get('button[aria-label="查看第 1 张横幅：Vue 3 实战课程"]')).toBeTruthy()
    expect(wrapper.get('button[aria-label="查看第 2 张横幅：前端能力测评"]')).toBeTruthy()
  })

  it('loads the first image eagerly at an explicit size and later images lazily', () => {
    const wrapper = mountBanner()
    const images = wrapper.findAll('img')

    expect(images).toHaveLength(2)
    expect(images[0]?.attributes()).toMatchObject({
      alt: 'Vue 3 实战课程封面',
      width: '1600',
      height: '640',
      loading: 'eager',
      fetchpriority: 'high',
    })
    expect(images[1]?.attributes()).toMatchObject({
      alt: '前端能力测评封面',
      width: '1600',
      height: '640',
      loading: 'lazy',
    })
  })

  it('keeps a meaningful first-slide link in the initial markup and changes slides with controls', async () => {
    const wrapper = mountBanner()

    expect(wrapper.get('a[href="/course/vue-3-practice"]').text()).toContain('Vue 3 实战课程')
    expect(wrapper.get('a[href="/course/vue-3-practice"]').attributes('aria-hidden')).toBeUndefined()
    expect(wrapper.get('a[href="/exam/frontend-foundation"]').attributes('aria-hidden')).toBe('true')

    await wrapper.get('button[aria-label="下一张横幅"]').trigger('click')

    expect(wrapper.get('a[href="/exam/frontend-foundation"]').attributes('aria-hidden')).toBeUndefined()
    expect(wrapper.get('a[href="/course/vue-3-practice"]').attributes('aria-hidden')).toBe('true')
    expect(wrapper.get('h1').text()).toBe('前端能力测评')
  })

  it('moves link focus with an arrow-key slide change', async () => {
    const wrapper = mount(HomeBanner, {
      attachTo: document.body,
      props: { banners },
      global: {
        stubs: { NuxtLink: NuxtLinkStub },
      },
    })
    const firstLink = wrapper.get('a[href="/course/vue-3-practice"]')
    const secondLink = wrapper.get('a[href="/exam/frontend-foundation"]')
    firstLink.element.focus()

    await firstLink.trigger('keydown', { key: 'ArrowRight' })

    expect(document.activeElement).toBe(secondLink.element)
    wrapper.unmount()
  })
})
