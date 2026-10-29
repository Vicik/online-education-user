<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const statusCode = computed(() => props.error.statusCode ?? 500)

setResponseStatus(statusCode.value)

const isNotFound = computed(() => statusCode.value === 404)
const heading = computed(() => props.error.statusMessage
  || (isNotFound.value ? '页面未找到' : '服务暂时不可用'))
const description = computed(() => isNotFound.value
  ? '你访问的内容可能已删除、未发布或链接有误。'
  : '请稍后重试。如果问题持续存在，请返回首页继续浏览。')
</script>

<template>
  <main class="error-page">
    <section
      class="error-card"
      aria-labelledby="error-heading"
    >
      <p class="error-code">
        {{ statusCode }}
      </p>
      <h1 id="error-heading">
        {{ statusCode }}
      </h1>
      <p class="error-heading">
        {{ heading }}
      </p>
      <p class="error-description">
        {{ description }}
      </p>
      <NuxtLink
        class="error-action"
        to="/"
      >
        返回首页
      </NuxtLink>
    </section>
  </main>
</template>

<style scoped>
.error-page {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 2rem 1rem;
  background: var(--color-paper);
}

.error-card {
  width: min(100%, 38rem);
  padding: clamp(2rem, 7vw, 4rem);
  border: 1px solid var(--color-line);
  border-radius: 1.5rem;
  background: var(--color-surface);
  box-shadow: var(--shadow-soft);
  text-align: center;
}

.error-code {
  margin: 0;
  color: var(--color-jade);
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.18em;
}

h1 {
  margin: 0.5rem 0;
  font-size: clamp(3.5rem, 15vw, 7rem);
  line-height: 1;
}

.error-heading {
  margin: 1rem 0 0;
  font-size: 1.35rem;
  font-weight: 700;
}

.error-description {
  margin: 0.75rem auto 0;
  color: var(--color-muted);
  line-height: 1.7;
}

.error-action {
  display: inline-flex;
  margin-top: 1.75rem;
  padding: 0.75rem 1.25rem;
  border-radius: 999px;
  background: var(--color-jade);
  color: white;
  font-weight: 700;
}
</style>
