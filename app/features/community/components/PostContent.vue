<script setup lang="ts">
import type { SanitizedPostContent } from '../community.types'

defineProps<{ content: SanitizedPostContent }>()
</script>

<template>
  <!-- The API contract guarantees this exact format contains backend-sanitized HTML. -->
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div
    v-if="content.format === 'sanitized-html'"
    class="post-content"
    v-html="content.html"
  />
  <p
    v-else
    class="post-content-error"
    role="alert"
  >
    正文格式暂不受支持。
  </p>
</template>

<style scoped>
.post-content {
  color: #344252;
  font-size: 1.04rem;
  line-height: 2;
}

.post-content :deep(h2),
.post-content :deep(h3) {
  color: var(--color-ink);
  font-family: "Noto Serif SC", "Songti SC", serif;
  line-height: 1.45;
}

.post-content :deep(h2) {
  margin: 2.5rem 0 1rem;
  padding-left: 0.9rem;
  border-left: 0.22rem solid var(--color-jade);
  font-size: 1.55rem;
}

.post-content :deep(h3) {
  margin: 2rem 0 0.8rem;
  font-size: 1.25rem;
}

.post-content :deep(p) {
  margin: 1rem 0;
}

.post-content :deep(a) {
  color: var(--color-jade);
  text-decoration: underline;
  text-decoration-thickness: 0.08em;
  text-underline-offset: 0.2em;
}

.post-content :deep(img) {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 1.75rem auto;
}

.post-content :deep(blockquote) {
  margin: 1.5rem 0;
  padding: 1rem 1.25rem;
  border-left: 0.2rem solid #9bc9bd;
  background: #f4f8f6;
  color: #4f5d69;
}

.post-content-error {
  padding: 2rem;
  border: 1px solid var(--color-line);
  color: var(--color-muted);
  text-align: center;
}
</style>
