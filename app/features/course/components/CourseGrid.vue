<script setup lang="ts">
import CourseCard from '~/components/course/CourseCard.vue'
import type { CourseSummary } from '../course.types'

defineProps<{ courses: CourseSummary[] }>()
</script>

<template>
  <div
    v-if="courses.length"
    class="course-grid"
    style="grid-template-columns: repeat(4, minmax(0, 1fr))"
  >
    <CourseCard
      v-for="course in courses"
      :key="course.id"
      :course="course"
    />
  </div>
  <section
    v-else
    class="course-empty"
  >
    <h2>没有找到匹配的课程</h2>
    <p>可以尝试清空关键词或选择其他分类。</p>
    <NuxtLink to="/course">查看全部课程</NuxtLink>
  </section>
</template>

<style scoped>
.course-grid {
  display: grid;
  gap: 1.35rem;
}

.course-empty {
  padding: 4rem 1rem;
  border: 1px dashed var(--color-line);
  background: white;
  text-align: center;
}

.course-empty h2,
.course-empty p {
  margin: 0;
}

.course-empty p {
  margin-top: 0.5rem;
  color: var(--color-muted);
}

.course-empty a {
  display: inline-block;
  margin-top: 1.25rem;
  color: var(--color-jade);
  font-weight: 700;
}

@media (max-width: 64rem) {
  .course-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}

@media (max-width: 42rem) {
  .course-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
