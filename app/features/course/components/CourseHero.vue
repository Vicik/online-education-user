<script setup lang="ts">
import type { CourseDetail } from '../course.types'

defineProps<{ course: CourseDetail }>()

const priceFormatter = new Intl.NumberFormat('zh-CN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
</script>

<template>
  <section
    class="course-hero"
    aria-labelledby="course-title"
  >
    <div class="hero-cover">
      <img
        :src="course.imageUrl"
        :alt="course.imageAlt"
        width="720"
        height="405"
      >
    </div>
    <div class="hero-content">
      <p
        v-if="course.categoryLabel"
        class="hero-category"
      >
        {{ course.categoryLabel }}
      </p>
      <h1 id="course-title">
        {{ course.title }}
      </h1>
      <p class="hero-description">
        {{ course.description }}
      </p>
      <p class="hero-teacher">
        主讲：<strong>{{ course.teacher.name }}</strong>
        <span v-if="course.teacher.title"> · {{ course.teacher.title }}</span>
      </p>
      <div class="hero-price-row">
        <span class="hero-price">{{ course.price === 0 ? '免费' : `¥${priceFormatter.format(course.price)}` }}</span>
        <del v-if="course.originalPrice !== undefined && course.originalPrice > course.price">
          ¥{{ priceFormatter.format(course.originalPrice) }}
        </del>
      </div>
      <a
        class="hero-action"
        href="#course-outline"
      >立即学习</a>
    </div>
  </section>
</template>

<style scoped>
.course-hero {
  display: grid;
  grid-template-columns: minmax(28rem, 36%) 1fr;
  min-height: 25rem;
  padding: 2rem;
  border: 1px solid #e7eaed;
  border-radius: 0.4rem;
  background: white;
  box-shadow: 0 0.5rem 1.5rem rgb(24 36 55 / 5%);
  gap: 2rem;
}

.hero-cover {
  align-self: start;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 0.3rem;
  background: #e7ebef;
}

.hero-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-content {
  padding: 0.4rem 0;
}

.hero-category {
  margin: 0 0 0.5rem;
  color: var(--color-jade);
  font-size: 0.8rem;
  font-weight: 800;
}

.hero-content h1 {
  margin: 0;
  color: #141d27;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 2rem;
  line-height: 1.3;
}

.hero-description {
  max-width: 46rem;
  margin: 1rem 0 0;
  color: var(--color-muted);
  line-height: 1.8;
}

.hero-teacher {
  margin: 1rem 0 0;
  color: #687281;
  font-size: 0.9rem;
}

.hero-price-row {
  display: flex;
  align-items: baseline;
  margin-top: 1.25rem;
  gap: 0.8rem;
}

.hero-price {
  color: #e2555f;
  font-size: 1.75rem;
  font-weight: 850;
}

.hero-price-row del {
  color: #9299a2;
}

.hero-action {
  display: inline-flex;
  min-width: 8.5rem;
  min-height: 3rem;
  align-items: center;
  justify-content: center;
  margin-top: 2rem;
  border-radius: 0.25rem;
  background: var(--color-jade);
  color: white;
  font-weight: 750;
}

@media (max-width: 64rem) {
  .course-hero {
    grid-template-columns: 1fr;
  }

  .hero-cover {
    max-width: 42rem;
  }
}

@media (max-width: 42rem) {
  .course-hero {
    min-height: 0;
    padding: 1rem;
  }

  .hero-content h1 {
    font-size: 1.6rem;
  }
}
</style>
