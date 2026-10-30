<script setup lang="ts">
import type { CourseOutlineSection } from '../course.types'

defineProps<{ sections: CourseOutlineSection[] }>()
</script>

<template>
  <section
    id="course-outline"
    class="course-outline"
    aria-labelledby="outline-heading"
  >
    <header>
      <p>COURSE OUTLINE</p>
      <h2 id="outline-heading">
        课程大纲
      </h2>
    </header>
    <ol
      v-if="sections.length"
      class="outline-list"
    >
      <li
        v-for="(section, index) in sections"
        :key="section.id"
      >
        <span class="chapter-index">{{ String(index + 1).padStart(2, '0') }}</span>
        <div>
          <h3>{{ section.title }}</h3>
          <ul>
            <li
              v-for="lesson in section.lessons"
              :key="lesson"
            >
              {{ lesson }}
            </li>
          </ul>
        </div>
      </li>
    </ol>
    <p
      v-else
      class="outline-empty"
    >
      课程大纲正在完善中。
    </p>
  </section>
</template>

<style scoped>
.course-outline {
  padding: 2rem;
  border: 1px solid #e7eaed;
  border-radius: 0.4rem;
  background: white;
}

.course-outline header {
  padding-bottom: 1rem;
  border-bottom: 2px solid #e8ecef;
}

.course-outline header p,
.course-outline h2 {
  margin: 0;
}

.course-outline header p {
  color: var(--color-jade);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.course-outline h2 {
  margin-top: 0.25rem;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 1.5rem;
}

.outline-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.outline-list > li {
  display: grid;
  grid-template-columns: 3rem 1fr;
  padding: 1.4rem 0;
  border-bottom: 1px solid #eef0f2;
  gap: 1rem;
}

.chapter-index {
  color: #aeb5bc;
  font-family: ui-monospace, "SFMono-Regular", monospace;
  font-size: 1.2rem;
}

.outline-list h3 {
  margin: 0;
  font-size: 1rem;
}

.outline-list ul {
  display: flex;
  flex-wrap: wrap;
  margin: 0.6rem 0 0;
  padding: 0;
  color: var(--color-muted);
  font-size: 0.88rem;
  list-style: none;
  gap: 0.45rem 1.4rem;
}

.outline-list ul li::before {
  content: "·";
  margin-right: 0.35rem;
  color: var(--color-jade);
}

.outline-empty {
  margin: 0;
  padding: 2rem 0 0;
  color: var(--color-muted);
}
</style>
