<script setup lang="ts">
import LoginForm from '~/features/auth/components/LoginForm.vue'

const route = useRoute()
const redirect = computed(() => {
  const value = route.query.redirect
  return Array.isArray(value) ? value[0] ?? '/' : value ?? '/'
})

usePageSeo({
  title: '登录｜知序学堂',
  description: '登录知序学堂，继续课程学习和考试。',
  path: '/login',
  noindex: true,
})
</script>

<template>
  <div
    class="login-page"
    style="width: var(--page-width)"
  >
    <section class="login-panel">
      <header>
        <p class="login-eyebrow">
          欢迎回来
        </p>
        <h1>登录知序学堂</h1>
        <p>继续你的课程学习和考试进度。</p>
      </header>
      <LoginForm :redirect="redirect" />
    </section>
  </div>
</template>

<style scoped>
.login-page {
  display: grid;
  min-height: calc(100vh - var(--header-height));
  margin-inline: auto;
  padding: 4rem 0 5rem;
  place-items: start center;
}

.login-panel {
  width: min(100%, 30rem);
  padding: 2.5rem;
  border: 1px solid var(--color-line);
  border-top: 0.35rem solid var(--color-jade);
  border-radius: 0.55rem;
  background: var(--color-surface);
  box-shadow: var(--shadow-soft);
}

.login-panel header {
  margin-bottom: 2rem;
}

.login-panel h1,
.login-panel header p {
  margin: 0;
}

.login-panel h1 {
  margin-top: 0.35rem;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: clamp(1.8rem, 4vw, 2.35rem);
}

.login-panel header p:last-child {
  margin-top: 0.65rem;
  color: var(--color-muted);
}

.login-eyebrow {
  color: var(--color-jade);
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}

@media (max-width: 78rem) {
  .login-page {
    width: calc(100% - 2rem) !important;
  }
}

@media (max-width: 42rem) {
  .login-page {
    padding-top: 2rem;
  }

  .login-panel {
    padding: 1.5rem;
  }
}
</style>
