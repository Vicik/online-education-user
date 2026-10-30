<script setup lang="ts">
import type { QuestionNavigationItem } from '../exam.types'

defineProps<{
  items: QuestionNavigationItem[]
  currentQuestion: number
}>()

const emit = defineEmits<{
  select: [index: number]
}>()
</script>

<template>
  <nav
    class="question-navigator"
    aria-label="题目导航"
  >
    <button
      v-for="(item, index) in items"
      :key="item.id"
      type="button"
      :class="{ 'is-current': index === currentQuestion, 'is-answered': item.answered }"
      :aria-current="index === currentQuestion ? 'step' : undefined"
      :aria-label="`第 ${item.number} 题${item.answered ? '，已作答' : '，未作答'}`"
      @click="emit('select', index)"
    >
      {{ item.number }}
    </button>
  </nav>
</template>

<style scoped>
.question-navigator {
  display: grid;
  grid-template-columns: repeat(5, 2.5rem);
  gap: 0.6rem;
}

.question-navigator button {
  height: 2.5rem;
  border: 1px solid var(--color-line);
  border-radius: 0.25rem;
  background: white;
  color: var(--color-ink);
  cursor: pointer;
}

.question-navigator button.is-answered {
  border-color: var(--color-jade);
  color: var(--color-jade);
}

.question-navigator button.is-current {
  border-color: var(--color-indigo);
  background: var(--color-indigo);
  color: white;
}
</style>
