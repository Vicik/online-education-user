<script setup lang="ts">
import { computed } from 'vue'
import type { PostAuthor } from '../community.types'

const props = defineProps<{
  author: PostAuthor
  publishedAt: string
}>()

const publishedLabel = computed(() => new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
}).format(new Date(props.publishedAt)))
</script>

<template>
  <div class="post-meta">
    <span
      v-if="author.avatarUrl"
      class="post-avatar"
    >
      <img
        :src="author.avatarUrl"
        :alt="`${author.name}的头像`"
        width="44"
        height="44"
        loading="lazy"
      >
    </span>
    <span
      v-else
      class="post-avatar post-avatar-fallback"
      aria-hidden="true"
    >{{ author.name.slice(0, 1) }}</span>
    <span class="post-meta-copy">
      <strong>{{ author.name }}</strong>
      <time :datetime="publishedAt">{{ publishedLabel }}</time>
    </span>
  </div>
</template>

<style scoped>
.post-meta {
  display: flex;
  align-items: center;
  color: var(--color-muted);
  gap: 0.75rem;
}

.post-avatar {
  display: grid;
  overflow: hidden;
  width: 2.75rem;
  height: 2.75rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
  background: var(--color-jade-soft);
  color: var(--color-jade);
  font-weight: 800;
}

.post-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-meta-copy {
  display: grid;
  gap: 0.15rem;
}

.post-meta strong {
  color: #283645;
  font-size: 0.9rem;
}

.post-meta time {
  font-size: 0.78rem;
}
</style>
