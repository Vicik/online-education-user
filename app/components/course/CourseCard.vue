<script setup lang="ts">
import type { CourseSummary } from '~/features/course/course.types'

withDefaults(defineProps<{
  course: CourseSummary
  headingTag?: 'h2' | 'h3'
}>(), {
  headingTag: 'h2',
})

const priceFormatter = new Intl.NumberFormat('zh-CN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
</script>

<template>
  <article class="course-card">
    <NuxtLink :to="`/course/${encodeURIComponent(course.slug)}`">
      <span class="course-cover">
        <img
          :src="course.imageUrl"
          :alt="course.imageAlt"
          width="560"
          height="315"
          loading="lazy"
        >
      </span>
      <span class="course-card-body">
        <span
          v-if="course.categoryLabel"
          class="course-category"
        >{{ course.categoryLabel }}</span>
        <component :is="headingTag">
          {{ course.title }}
        </component>
        <span class="course-prices">
          <span class="course-price">{{ course.price === 0 ? '免费' : `¥${priceFormatter.format(course.price)}` }}</span>
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
  border: 1px solid #e1e5e8;
  border-radius: 0.3rem;
  background: var(--color-surface);
  box-shadow: 0 0.4rem 1rem rgb(24 36 55 / 7%);
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.course-card:hover,
.course-card:focus-within {
  box-shadow: 0 0.8rem 1.5rem rgb(24 36 55 / 12%);
  transform: translateY(-0.2rem);
}

.course-card a,
.course-cover,
.course-card-body,
.course-prices {
  display: block;
}

.course-cover {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #e8edf1;
}

.course-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 220ms ease;
}

.course-card:hover img {
  transform: scale(1.025);
}

.course-card-body {
  min-height: 8.5rem;
  padding: 0.9rem 1rem 1.1rem;
}

.course-category {
  margin-bottom: 0.4rem;
  color: var(--color-jade);
  font-size: 0.75rem;
  font-weight: 700;
}

.course-card h2,
.course-card h3 {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: #1c2631;
  font-size: 1rem;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.course-prices {
  display: flex;
  align-items: baseline;
  margin-top: 0.8rem;
  gap: 0.65rem;
}

.course-price {
  color: #e2555f;
  font-size: 1.1rem;
  font-weight: 800;
}

.course-prices del {
  color: #9299a2;
  font-size: 0.82rem;
}
</style>
