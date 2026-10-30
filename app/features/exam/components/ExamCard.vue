<script setup lang="ts">
import type { ExamSummary } from '../exam.types'

defineProps<{ exam: ExamSummary }>()

const difficultyLabels = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '挑战',
} as const
</script>

<template>
  <article class="exam-card">
    <NuxtLink :to="`/exam/${encodeURIComponent(exam.slug)}`">
      <span class="exam-card-meta">
        <span v-if="exam.difficulty">{{ difficultyLabels[exam.difficulty] }}</span>
        <span>{{ exam.durationMinutes }} 分钟</span>
        <span>{{ exam.questionCount }} 题</span>
      </span>
      <h2>{{ exam.title }}</h2>
      <p>{{ exam.description }}</p>
      <span class="exam-card-action">查看考试说明 <span aria-hidden="true">→</span></span>
    </NuxtLink>
  </article>
</template>

<style scoped>
.exam-card {
  border: 1px solid #e1e5e8;
  border-top: 0.25rem solid var(--color-indigo);
  border-radius: 0.3rem;
  background: var(--color-surface);
  box-shadow: var(--shadow-soft);
}

.exam-card a {
  display: block;
  min-height: 16rem;
  padding: 1.5rem;
}

.exam-card-meta {
  display: flex;
  flex-wrap: wrap;
  color: var(--color-muted);
  font-size: 0.82rem;
  gap: 0.8rem;
}

.exam-card-meta span + span::before {
  margin-right: 0.8rem;
  color: #c1c7ce;
  content: "·";
}

.exam-card h2 {
  margin: 1rem 0 0;
  color: var(--color-ink);
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 1.35rem;
}

.exam-card p {
  margin: 0.7rem 0 0;
  color: var(--color-muted);
  line-height: 1.75;
}

.exam-card-action {
  display: inline-block;
  margin-top: 1.35rem;
  color: var(--color-indigo);
  font-weight: 700;
}

.exam-card:focus-within,
.exam-card:hover {
  border-color: color-mix(in srgb, var(--color-indigo), white 55%);
}
</style>
