<script setup lang="ts">
import ExamOverview from '~/features/exam/components/ExamOverview.vue'
import { getExam } from '~/features/exam/exam.service'

const route = useRoute()
const slug = computed(() => Array.isArray(route.params.slug) ? route.params.slug[0] ?? '' : route.params.slug ?? '')

const { data: exam, error, status, refresh } = await useAsyncData(
  () => `exam:${slug.value}`,
  () => getExam(slug.value),
)

const createExamNotFoundError = () => createError({
  statusCode: 404,
  statusMessage: '考试不存在或尚未发布',
})

if (error.value?.statusCode === 404) {
  throw createExamNotFoundError()
}

watch(error, (value) => {
  if (value?.statusCode === 404) {
    showError(createExamNotFoundError())
  }
})

usePageSeo(computed(() => exam.value
  ? {
      title: `${exam.value.title}｜知序学堂`,
      description: exam.value.description,
      path: `/exam/${encodeURIComponent(exam.value.slug)}`,
    }
  : {
      title: '考试说明｜知序学堂',
      description: '查看知序学堂公开考试的考试说明与规则。',
      path: `/exam/${encodeURIComponent(slug.value)}`,
      noindex: true,
    }))
</script>

<template>
  <div
    class="exam-detail"
    style="width: var(--page-width)"
  >
    <nav
      class="breadcrumbs"
      aria-label="面包屑"
    >
      <NuxtLink to="/">首页</NuxtLink><span aria-hidden="true">/</span><NuxtLink to="/exam">考试</NuxtLink>
      <span aria-hidden="true">/</span><span
        v-if="exam"
        aria-current="page"
      >{{ exam.title }}</span>
    </nav>
    <section
      v-if="error"
      class="exam-state"
      role="alert"
    >
      <h1>考试暂时无法加载</h1><p>请检查网络连接后重试。</p>
      <button
        type="button"
        @click="() => refresh()"
      >
        重新加载
      </button>
    </section>
    <p
      v-else-if="status === 'pending'"
      class="exam-state"
      aria-live="polite"
    >
      正在加载考试说明…
    </p>
    <ExamOverview
      v-else-if="exam"
      :exam="exam"
    />
  </div>
</template>

<style scoped>
.exam-detail { margin-inline: auto; padding: 1.75rem 0 4.5rem; }
.breadcrumbs { display: flex; align-items: center; margin-bottom: 1.25rem; color: #737d88; font-size: 0.9rem; gap: 0.65rem; }
.exam-state { margin: 4rem 0; padding: 3rem; border: 1px solid var(--color-line); background: white; text-align: center; }
.exam-state h1, .exam-state p { margin: 0; }
.exam-state p { margin-top: 0.5rem; color: var(--color-muted); }
.exam-state button { margin-top: 1rem; padding: 0.7rem 1rem; border: 0; background: var(--color-indigo); color: white; cursor: pointer; font: inherit; font-weight: 700; }
@media (max-width: 78rem) { .exam-detail { width: calc(100% - 2rem) !important; } }
</style>
