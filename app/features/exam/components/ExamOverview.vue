<script setup lang="ts">
import type { ExamDetail } from '../exam.types'

defineProps<{ exam: ExamDetail }>()
</script>

<template>
  <section
    class="exam-overview"
    aria-labelledby="exam-title"
  >
    <div class="exam-overview-main">
      <p class="exam-kicker">
        公开考试说明
      </p>
      <h1 id="exam-title">
        {{ exam.title }}
      </h1>
      <p class="exam-description">
        {{ exam.description }}
      </p>
      <dl class="exam-facts">
        <div>
          <dt>考试时长</dt>
          <dd>{{ exam.durationMinutes }} 分钟</dd>
        </div>
        <div>
          <dt>题目数量</dt>
          <dd>{{ exam.questionCount }} 题</dd>
        </div>
      </dl>
      <NuxtLink
        class="exam-action"
        :to="`/exam/attempt/${encodeURIComponent(exam.id)}`"
      >
        开始答题
      </NuxtLink>
    </div>
    <aside
      class="exam-rules"
      aria-labelledby="exam-rules-heading"
    >
      <h2 id="exam-rules-heading">
        考试规则
      </h2>
      <p v-if="exam.instructions">
        {{ exam.instructions }}
      </p>
      <ul>
        <li
          v-for="rule in exam.rules"
          :key="rule"
        >
          {{ rule }}
        </li>
      </ul>
    </aside>
  </section>
</template>

<style scoped>
.exam-overview {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(20rem, 0.65fr);
  overflow: hidden;
  border: 1px solid #e2e6ea;
  border-radius: 0.4rem;
  background: white;
  box-shadow: var(--shadow-soft);
}

.exam-overview-main {
  padding: 3rem;
}

.exam-kicker {
  margin: 0;
  color: var(--color-indigo);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.exam-overview h1 {
  margin: 0.6rem 0 0;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 2.25rem;
}

.exam-description {
  max-width: 44rem;
  margin: 1rem 0 0;
  color: var(--color-muted);
  line-height: 1.85;
}

.exam-facts {
  display: flex;
  margin: 2rem 0 0;
  gap: 3rem;
}

.exam-facts dt,
.exam-facts dd {
  margin: 0;
}

.exam-facts dt {
  color: var(--color-muted);
  font-size: 0.8rem;
}

.exam-facts dd {
  margin-top: 0.2rem;
  font-weight: 750;
}

.exam-action {
  display: inline-flex;
  min-width: 9rem;
  min-height: 3rem;
  align-items: center;
  justify-content: center;
  margin-top: 2rem;
  border-radius: 0.25rem;
  background: var(--color-indigo);
  color: white;
  font-weight: 750;
}

.exam-rules {
  padding: 2.25rem;
  background: #f1f3f9;
}

.exam-rules h2,
.exam-rules p {
  margin: 0;
}

.exam-rules p {
  margin-top: 0.75rem;
  color: var(--color-muted);
  line-height: 1.7;
}

.exam-rules ul {
  margin: 1.25rem 0 0;
  padding-left: 1.2rem;
  line-height: 1.9;
}

@media (max-width: 64rem) {
  .exam-overview { grid-template-columns: 1fr; }
}
</style>
