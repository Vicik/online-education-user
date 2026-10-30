import { loadNuxtConfig } from 'nuxt/kit'
import { describe, expect, it } from 'vitest'

describe('private route rules', () => {
  it.each([
    '/login',
    '/exam/attempt/**',
    '/account/**',
  ])('keeps %s out of indexes and shared caches', async (path) => {
    const config = await loadNuxtConfig({ cwd: process.cwd() })
    const rule = config.routeRules?.[path]

    expect(rule).toMatchObject({
      robots: false,
      headers: {
        'cache-control': 'private, no-store, max-age=0',
      },
    })
    expect(rule).not.toHaveProperty('swr')
    expect(rule).not.toHaveProperty('isr')
    expect(rule).not.toHaveProperty('cache')
  })

  it('keeps public cache rules independent of user cookies', async () => {
    const config = await loadNuxtConfig({ cwd: process.cwd() })
    const publicRules = [
      config.routeRules?.['/'],
      config.routeRules?.['/course/**'],
      config.routeRules?.['/exam/**'],
      config.routeRules?.['/group-buy/**'],
      config.routeRules?.['/flash-sale/**'],
      config.routeRules?.['/community/**'],
    ]

    expect(config.routeRules?.['/']).toEqual({ swr: 300 })
    expect(JSON.stringify(publicRules).toLowerCase()).not.toContain('cookie')
  })
})
