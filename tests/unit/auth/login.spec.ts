import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../../app/composables/useApi'
import LoginForm from '../../../app/features/auth/components/LoginForm.vue'
import { resolveSafeRedirect } from '../../../app/features/auth/auth.service'
import LoginPage from '../../../app/pages/login.vue'

const { navigateToMock, usePageSeoMock } = vi.hoisted(() => ({
  navigateToMock: vi.fn(),
  usePageSeoMock: vi.fn(),
}))

mockNuxtImport('navigateTo', () => navigateToMock)
mockNuxtImport('usePageSeo', () => usePageSeoMock)

vi.mock('../../../app/composables/useApi', () => ({
  apiRequest: vi.fn(),
}))

function mountLoginForm(redirect = '/') {
  return mount(LoginForm, {
    props: { redirect },
    global: { plugins: [createPinia()] },
  })
}

describe('safe login redirect', () => {
  it('preserves a same-origin absolute path with its query and hash', () => {
    expect(resolveSafeRedirect('/exam/attempt/exam-1?from=list#question-2'))
      .toBe('/exam/attempt/exam-1?from=list#question-2')
  })

  it.each([
    'https://evil.example/steal',
    '//evil.example/steal',
    '/\\evil.example/steal',
    'javascript:alert(1)',
    'course/catalogue',
  ])('rejects the external or ambiguous redirect %s', (redirect) => {
    expect(resolveSafeRedirect(redirect)).toBe('/')
  })

  it.each([
    '/a/..//evil.example',
    '/%2e//evil.example',
  ])('rejects a redirect that becomes protocol-relative after normalization: %s', (redirect) => {
    expect(resolveSafeRedirect(redirect)).toBe('/')
  })
})

describe('LoginForm', () => {
  beforeEach(() => {
    vi.mocked(apiRequest).mockReset()
    navigateToMock.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders normalized field errors without writing credentials or tokens to localStorage', async () => {
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem')
    vi.mocked(apiRequest).mockRejectedValue({
      code: 'VALIDATION_FAILED',
      message: '请检查填写内容。',
      status: 422,
      fieldErrors: {
        email: ['请输入有效的邮箱地址。'],
        password: ['密码不正确。'],
      },
    })
    const wrapper = mountLoginForm()

    await wrapper.get('input[name="email"]').setValue('invalid@example.com')
    await wrapper.get('input[name="password"]').setValue('wrong-password')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('#login-email-error').text()).toBe('请输入有效的邮箱地址。')
    expect(wrapper.get('#login-password-error').text()).toBe('密码不正确。')
    expect(wrapper.get('[role="alert"]').text()).toContain('请检查填写内容。')
    expect(storageWrite).not.toHaveBeenCalled()
    expect(navigateToMock).not.toHaveBeenCalled()
  })

  it('stores the user projection and follows only the sanitized redirect after login', async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      user: { id: 'user-1', displayName: '林知序' },
      token: 'backend-token-that-must-be-discarded',
    })
    const wrapper = mountLoginForm('//evil.example/steal')

    await wrapper.get('input[name="email"]').setValue('learner@example.com')
    await wrapper.get('input[name="password"]').setValue('secret-value')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(navigateToMock).toHaveBeenCalledWith('/')
    expect(JSON.stringify(wrapper.vm.$pinia.state.value)).not.toContain('backend-token')
  })
})

describe('login page', () => {
  beforeEach(() => {
    usePageSeoMock.mockClear()
  })

  it('marks the private login page noindex', async () => {
    const wrapper = await mountSuspended(LoginPage, { route: '/login?redirect=%2Fcourse' })

    expect(usePageSeoMock).toHaveBeenCalledWith({
      title: '登录｜知序学堂',
      description: '登录知序学堂，继续课程学习和考试。',
      path: '/login',
      noindex: true,
    })
    expect(wrapper.find('main').exists()).toBe(false)
  })
})
