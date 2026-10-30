<script setup lang="ts">
import type { PostSummary } from '../community.types'
import PostMeta from './PostMeta.vue'

defineProps<{ post: PostSummary }>()
</script>

<template>
  <article class="post-card">
    <NuxtLink
      class="post-card-link"
      :to="`/community/${encodeURIComponent(post.slug)}`"
    >
      <span class="post-card-copy">
        <PostMeta
          :author="post.author"
          :published-at="post.publishedAt"
        />
        <h2>{{ post.title }}</h2>
        <span class="post-excerpt">{{ post.excerpt }}</span>
        <span class="post-action">阅读全文 <span aria-hidden="true">→</span></span>
      </span>
      <span
        v-if="post.coverImageUrl"
        class="post-cover"
      >
        <img
          :src="post.coverImageUrl"
          :alt="post.coverImageAlt || ''"
          width="360"
          height="220"
          loading="lazy"
        >
      </span>
    </NuxtLink>
  </article>
</template>

<style scoped>
.post-card {
  position: relative;
  border-bottom: 1px solid #e7ebe8;
  background: var(--color-surface);
}

.post-card::before {
  position: absolute;
  top: 1.75rem;
  bottom: 1.75rem;
  left: 0;
  width: 0.2rem;
  background: transparent;
  content: "";
  transition: background-color 160ms ease;
}

.post-card:hover::before,
.post-card:focus-within::before {
  background: var(--color-jade);
}

.post-card-link {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  min-height: 13rem;
  padding: 1.75rem 2rem;
  gap: 2rem;
}

.post-card-copy {
  display: block;
}

.post-card h2 {
  margin: 1.1rem 0 0;
  color: var(--color-ink);
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 1.35rem;
  line-height: 1.45;
}

.post-excerpt {
  display: -webkit-box;
  overflow: hidden;
  margin-top: 0.65rem;
  color: var(--color-muted);
  line-height: 1.8;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.post-action {
  display: inline-block;
  margin-top: 1rem;
  color: var(--color-jade);
  font-size: 0.9rem;
  font-weight: 800;
}

.post-cover {
  display: block;
  overflow: hidden;
  width: 15rem;
  height: 9.25rem;
  align-self: center;
  border-radius: 0.25rem;
  background: #e6ebe8;
}

.post-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 180ms ease;
}

.post-card:hover .post-cover img {
  transform: scale(1.02);
}
</style>
