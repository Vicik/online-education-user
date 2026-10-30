<script setup lang="ts">
import AppPagination from '~/components/common/AppPagination.vue'
import ExamCard from '~/features/exam/components/ExamCard.vue'
import { getExams } from '~/features/exam/exam.service'
import { normalizePage } from '~/utils/normalizePage'

const PAGE_SIZE = 12
const route = useRoute()
const page = computed(() => normalizePage(Array.isArray(route.query.page) ? route.query.page[0] : route.query.page))
const { data: examList, error, status, refresh } = await useAsyncData(
  () => `exams:${page.value}`,
  () => getExams({ page: page.value, pageSize: PAGE_SIZE }),
  { watch: [page] },
)

usePageSeo(computed(() => ({
  title: page.value > 1 ? `公开考试第 ${page.value} 页｜知序学堂` : '公开考试｜知序学堂',
  description: '浏览知序学堂公开考试，了解考试时长、题量与规则，选择适合自己的能力测验。',
  path: page.value > 1 ? `/exam?page=${page.value}` : '/exam',
})))
</script>

<template>
  <div
    class="exam-list"
    style="width: var(--page-width)"
  >
    <nav
      class="breadcrumbs"
      aria-label="面包屑"
    >
      <NuxtLink to="/">首页</NuxtLink><span aria-hidden="true">/</span><span aria-current="page">考试</span>
    </nav>
    <h1 class="sr-only">
      公开考试
    </h1>

    <section
      v-if="error"
      class="exam-state"
      role="alert"
    >
      <h2>考试暂时无法加载</h2>
      <p>{{ error.message }}</p>
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
      正在加载考试…
    </p>
    <template v-else-if="examList">
      <div
        v-if="examList.items.length"
        class="exam-grid"
      >
        <ExamCard
          v-for="exam in examList.items"
          :key="exam.id"
          :exam="exam"
        />
      </div>
      <section
        v-else
        class="exam-state"
      >
        <h2>暂无公开考试</h2><p>新的考试发布后会显示在这里。</p>
      </section>
      <AppPagination
        :page="examList.page"
        :page-size="examList.pageSize"
        :total="examList.total"
        path="/exam"
        aria-label="考试分页"
      />
    </template>
  </div>
</template>

<style scoped>
.exam-list { margin-inline: auto; padding: 2rem 0 4.5rem; }
.breadcrumbs { display: flex; color: #737d88; font-size: 0.9rem; gap: 0.7rem; }
.exam-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); margin-top: 2rem; gap: 1.35rem; }
.exam-state { margin-top: 2rem; padding: 3rem; border: 1px solid var(--color-line); background: white; text-align: center; }
.exam-state h2, .exam-state p { margin: 0; }
.exam-state p { margin-top: 0.5rem; color: var(--color-muted); }
.exam-state button { margin-top: 1rem; padding: 0.7rem 1rem; border: 0; background: var(--color-indigo); color: white; cursor: pointer; font: inherit; font-weight: 700; }
@media (max-width: 78rem) { .exam-list { width: calc(100% - 2rem) !important; } }
@media (max-width: 64rem) { .exam-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
