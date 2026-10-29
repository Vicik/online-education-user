import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import type { NuxtError } from '#app'
import { describe, expect, it, vi } from 'vitest'
import ErrorPage from '~/error.vue'

const mocks = vi.hoisted(() => ({
  setResponseStatus: vi.fn(),
}))

mockNuxtImport('setResponseStatus', () => mocks.setResponseStatus)

describe('error.vue', () => {
  it.each([
    [404, '页面未找到'],
    [500, '服务暂时不可用'],
  ])('保留 HTTP %i 状态并输出对应提示', async (statusCode, message) => {
    mocks.setResponseStatus.mockClear()

    const wrapper = await mountSuspended(ErrorPage, {
      props: {
        error: {
          statusCode,
          statusMessage: message,
        } as NuxtError,
      },
    })

    expect(mocks.setResponseStatus).toHaveBeenCalledWith(statusCode)
    expect(wrapper.get('h1').text()).toBe(`${statusCode}`)
    expect(wrapper.text()).toContain(message)
  })

  it('将缺省的错误状态归一为 500', async () => {
    mocks.setResponseStatus.mockClear()

    const wrapper = await mountSuspended(ErrorPage, {
      props: {
        error: {} as NuxtError,
      },
    })

    expect(mocks.setResponseStatus).toHaveBeenCalledWith(500)
    expect(wrapper.get('h1').text()).toBe('500')
    expect(wrapper.text()).toContain('服务暂时不可用')
  })
})
