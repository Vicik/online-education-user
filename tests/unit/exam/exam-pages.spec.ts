import { clearNuxtData } from '#app'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { enableAutoUnmount, flushPromises } from '@vue/test-utils'
import { toValue } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ExamDetailPage from '../../../app/pages/exam/[slug].vue'
import ExamIndexPage from '../../../app/pages/exam/index.vue'
import AttemptPage from '../../../app/pages/exam/attempt/[id].vue'
import type { ExamDetail, ExamSummary } from '../../../app/features/exam/exam.types'

const { showErrorMock, usePageSeoMock } = vi.hoisted(() => ({
  showErrorMock: vi.fn(),
  usePageSeoMock: vi.fn(),
}))
mockNuxtImport('showError', () => showErrorMock)
mockNuxtImport('usePageSeo', () => usePageSeoMock)
enableAutoUnmount(afterEach)

const summary: ExamSummary = {
  id: 'exam-1',
  slug: 'frontend-foundation',
  title: '前端基础能力测验',
  description: '检验 HTML、CSS 与 JavaScript 基础知识。',
  durationMinutes: 60,
  questionCount: 50,
  difficulty: 'intermediate',
  updatedAt: '2026-10-29T12:00:00+08:00',
}

const detail: ExamDetail = {
  ...summary,
  rules: ['考试限时 60 分钟', '提交后由服务端判定成绩'],
  instructions: '开始前请确认网络连接稳定。',
}

const NuxtLinkStub = { props: ['to'], template: '<a :href="to"><slot /></a>' }

describe('exam pages', () => {
  beforeEach(async () => {
    showErrorMock.mockClear()
    usePageSeoMock.mockClear()
    await clearNuxtData()
  })

  afterEach(async () => {
    vi.unstubAllGlobals()
    await clearNuxtData()
  })

  it('SSR-renders the public exam list with crawlable detail links', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({
      items: [summary], page: 1, pageSize: 12, total: 1,
    }))

    const wrapper = await mountSuspended(ExamIndexPage, {
      route: '/exam',
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })
    await flushPromises()

    expect(wrapper.get('.exam-list').element.tagName).toBe('DIV')
    expect(wrapper.find('.exam-list-header').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('EXAM DISCOVERY')
    expect(wrapper.text()).not.toContain('先读规则，再从容作答')
    expect(wrapper.get('h1').text()).toBe('公开考试')
    expect(wrapper.get('h1').classes()).toContain('sr-only')
    expect(wrapper.text()).toContain('前端基础能力测验')
    expect(wrapper.get('a[href="/exam/frontend-foundation"]').exists()).toBe(true)
    expect(toValue(usePageSeoMock.mock.calls[0]![0])).toMatchObject({ path: '/exam' })
  })

  it('SSR-renders public rules and the exam title on detail', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue(detail))

    const wrapper = await mountSuspended(ExamDetailPage, {
      route: '/exam/frontend-foundation',
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })
    await flushPromises()

    expect(wrapper.get('.exam-detail').element.tagName).toBe('DIV')
    expect(wrapper.get('h1').text()).toBe('前端基础能力测验')
    expect(wrapper.text()).toContain('考试限时 60 分钟')
    expect(wrapper.text()).toContain('提交后由服务端判定成绩')
    expect(wrapper.get('a[href="/exam/attempt/exam-1"]').text()).toContain('开始答题')
  })

  it('preserves a literal percent escape in the router slug', async () => {
    const literalPercentDetail: ExamDetail = { ...detail, id: 'exam-percent', slug: 'rate%2Ftest' }
    const fetchMock = vi.fn().mockResolvedValue(literalPercentDetail)
    vi.stubGlobal('$fetch', fetchMock)

    await mountSuspended(ExamDetailPage, {
      route: '/exam/rate%252Ftest',
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })
    await flushPromises()

    expect(fetchMock).toHaveBeenCalledWith('/v1/exams/rate%252Ftest', expect.any(Object))
  })

  it('restores detail SEO after a recoverable request succeeds on retry', async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce({ code: 'SERVICE_UNAVAILABLE', message: '服务暂时不可用。', status: 500 })
      .mockResolvedValueOnce(detail)
    vi.stubGlobal('$fetch', fetchMock)

    const wrapper = await mountSuspended(ExamDetailPage, {
      route: '/exam/frontend-foundation',
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('考试暂时无法加载')
    expect(usePageSeoMock).toHaveBeenCalledTimes(1)
    const seoInput = usePageSeoMock.mock.calls[0]![0]

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(wrapper.get('h1').text()).toBe('前端基础能力测验')
    expect(toValue(seoInput)).toMatchObject({
      title: '前端基础能力测验｜知序学堂',
      description: detail.description,
      path: '/exam/frontend-foundation',
    })
  })

  it('turns an unknown or unpublished exam slug into a real 404', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockRejectedValue({
      code: 'NOT_FOUND', message: '请求的内容不存在。', status: 404,
    }))

    await expect(mountSuspended(ExamDetailPage, {
      route: '/exam/not-published',
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: '考试不存在或尚未发布',
    })
  })

  it('enters the Nuxt error boundary when an exam retry resolves to a 404', async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce({ code: 'SERVICE_UNAVAILABLE', message: '服务暂时不可用。', status: 500 })
      .mockRejectedValueOnce({ code: 'NOT_FOUND', message: '请求的内容不存在。', status: 404 })
    vi.stubGlobal('$fetch', fetchMock)

    const wrapper = await mountSuspended(ExamDetailPage, {
      route: '/exam/not-published',
      global: { stubs: { NuxtLink: NuxtLinkStub } },
    })
    await flushPromises()

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(showErrorMock).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 404,
      statusMessage: '考试不存在或尚未发布',
    }))
  })

  it('marks the protected attempt shell noindex without grading in the browser', async () => {
    const wrapper = await mountSuspended(AttemptPage, { route: '/exam/attempt/exam-1' })

    expect(wrapper.get('.attempt-shell').element.tagName).toBe('DIV')
    expect(wrapper.get('h1').text()).toBe('正在确认登录状态')
    expect(wrapper.text()).not.toContain('考试编号：')
    expect(wrapper.text()).toContain('最终成绩以服务端提交结果为准')
    expect(toValue(usePageSeoMock.mock.calls[0]![0])).toMatchObject({
      path: '/exam/attempt/exam-1',
      noindex: true,
    })
    expect(wrapper.text()).not.toContain('本地判分')
  })
})
