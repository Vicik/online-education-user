import { useNuxtApp } from '#app'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useApiData } from '../../../app/composables/useApi'

describe('useApiData', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('resolves a reactive path and exposes fetched data through AsyncData', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ title: '课程数据' })
    vi.stubGlobal('$fetch', fetchMock)
    const path = ref('/v1/courses')

    const state = await useNuxtApp().runWithContext(() => useApiData<{ title: string }>(
      'api-data-reactive-path',
      path,
    ))

    expect(state.data.value).toEqual({ title: '课程数据' })
    expect(fetchMock).toHaveBeenCalledWith('/v1/courses', expect.any(Object))
  })

  it('uses null as the default data value when execution is deferred', () => {
    const state = useNuxtApp().runWithContext(() => useApiData(
      'api-data-deferred',
      '/v1/home',
      { immediate: false },
    ))

    expect(state.data.value).toBeNull()
    expect(state.status.value).toBe('idle')
  })

  it('exposes request failures as the normalized API error shape', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockRejectedValue({
      response: {
        status: 422,
        _data: {
          code: 'VALIDATION_FAILED',
          message: '请检查查询条件',
          fieldErrors: {
            keyword: ['关键词无效'],
          },
          requestId: 'req-api-data',
        },
      },
    }))

    const state = await useNuxtApp().runWithContext(() => useApiData(
      'api-data-normalized-error',
      '/v1/courses',
    ))

    expect(state.data.value).toBeNull()
    expect(state.status.value).toBe('error')
    expect(state.error.value).toEqual({
      code: 'VALIDATION_FAILED',
      message: '请检查查询条件',
      status: 422,
      fieldErrors: {
        keyword: ['关键词无效'],
      },
      requestId: 'req-api-data',
    })
  })
})
