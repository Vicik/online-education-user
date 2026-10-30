<script setup lang="ts">
import type { CourseSummary } from '../../course/course.types'

defineProps<{
  course: CourseSummary
}>()

const priceFormatter = new Intl.NumberFormat('zh-CN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
</script>

<template>
  <article class="course-card">
    <NuxtLink
      :to="`/course/${encodeURIComponent(course.slug)}`"
      class="card-link"
    >
      <span class="card-image-wrap">
        <img
          :src="course.imageUrl"
          :alt="course.imageAlt"
          width="560"
          height="315"
          loading="lazy"
        >
      </span>
      <span class="card-body">
        <strong>{{ course.title }}</strong>
        <span class="card-prices">
          <span class="card-price">¥{{ priceFormatter.format(course.price) }}</span>
          <del v-if="course.originalPrice !== undefined && course.originalPrice > course.price">
            ¥{{ priceFormatter.format(course.originalPrice) }}
          </del>
        </span>
      </span>
    </NuxtLink>
  </article>
</template>

<style scoped>
.course-card {
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--color-line), transparent 25%);
  border-radius: 0.35rem;
  background: var(--color-surface);
  box-shadow: 0 0.45rem 1rem rgb(24 36 55 / 8%);
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.course-card:hover {
  box-shadow: 0 0.9rem 1.8rem rgb(24 36 55 / 13%);
  transform: translateY(-0.2rem);
}

.course-card:focus-within {
  box-shadow:
    0 0 0 3px color-mix(in srgb, var(--color-jade), white 25%),
    0 0.9rem 1.8rem rgb(24 36 55 / 13%);
}

.card-link,
.card-image-wrap,
.card-body,
.card-prices {
  display: block;
}

.card-image-wrap {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--color-jade-soft);
}

.card-image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 240ms ease;
}

.card-link:hover img {
  transform: scale(1.025);
}

.card-body {
  padding: 1rem 1.1rem 1.15rem;
}

.card-body strong {
  display: -webkit-box;
  overflow: hidden;
  color: #202938;
  font-size: 1rem;
  line-height: 1.4;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.card-prices {
  display: flex;
  align-items: baseline;
  margin-top: 0.45rem;
  gap: 0.7rem;
}

.card-price {
  color: #df4d55;
  font-size: 1.15rem;
  font-weight: 800;
}

.card-prices del {
  color: #8b929c;
  font-size: 0.82rem;
}
</style>
