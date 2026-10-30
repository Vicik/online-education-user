<script setup lang="ts">
import AppPagination from '~/components/common/AppPagination.vue'
import AppErrorState from '~/components/common/AppErrorState.vue'
import CourseFilters from '~/features/course/components/CourseFilters.vue'
import CourseGrid from '~/features/course/components/CourseGrid.vue'
import { getCourses } from '~/features/course/course.service'
import type { CourseSort } from '~/features/course/course.types'
import { normalizePage } from '~/utils/normalizePage'

const PAGE_SIZE = 12
const route = useRoute()

function firstQueryValue(value: string | null | (string | null)[] | undefined): string {
  const firstValue = Array.isArray(value) ? value[0] : value
  return typeof firstValue === 'string' ? firstValue : ''
}

const page = computed(() => normalizePage(firstQueryValue(route.query.page)))
const category = computed(() => firstQueryValue(route.query.category).trim())
const keyword = computed(() => firstQueryValue(route.query.keyword).trim())
const sort = computed(() => {
  const value = firstQueryValue(route.query.sort)
  const supported: CourseSort[] = ['latest', 'recommended', 'price-asc', 'price-desc']
  return supported.includes(value as CourseSort) ? value as CourseSort : undefined
})
const requestQuery = computed(() => ({
  page: page.value,
  pageSize: PAGE_SIZE,
  ...(category.value ? { category: category.value } : {}),
  ...(keyword.value ? { keyword: keyword.value } : {}),
  ...(sort.value ? { sort: sort.value } : {}),
}))

const { data: courseList, error, status, refresh } = await useAsyncData(
  () => `courses:${page.value}:${category.value}:${keyword.value}:${sort.value ?? ''}`,
  () => getCourses(requestQuery.value),
  { watch: [page, category, keyword, sort] },
)

const canonicalQuery = computed(() => {
  const search = new URLSearchParams()
  if (category.value) search.set('category', category.value)
  if (keyword.value) search.set('keyword', keyword.value)
  if (sort.value) search.set('sort', sort.value)
  if (page.value > 1) search.set('page', String(page.value))
  return search.toString()
})
const hasFilters = computed(() => Boolean(category.value || keyword.value || sort.value))

usePageSeo(computed(() => ({
  title: hasFilters.value
    ? '筛选课程｜知序学堂'
    : page.value > 1
      ? `全部课程第 ${page.value} 页｜知序学堂`
      : '全部课程｜知序学堂',
  description: '浏览知序学堂的公开课程目录，按分类、关键词和排序方式找到适合自己的学习内容。',
  path: canonicalQuery.value ? `/course?${canonicalQuery.value}` : '/course',
  ...(hasFilters.value ? { noindex: true } : {}),
})))
</script>

<template>
  <div
    class="course-catalogue"
    style="width: var(--page-width)"
  >
    <nav
      class="breadcrumbs"
      aria-label="面包屑"
    >
      <NuxtLink to="/">首页</NuxtLink>
      <span aria-hidden="true">/</span>
      <span aria-current="page">课程列表</span>
    </nav>

    <h1 class="sr-only">
      全部课程
    </h1>

    <CourseFilters
      :category="category"
      :keyword="keyword"
      :sort="sort"
    />

    <AppErrorState
      v-if="error"
      title="课程暂时无法加载"
      :message="error.message"
      @retry="refresh"
    />
    <p
      v-else-if="status === 'pending'"
      class="course-state"
      aria-live="polite"
    >
      正在加载课程…
    </p>
    <template v-else-if="courseList">
      <CourseGrid :courses="courseList.items" />
      <AppPagination
        :page="courseList.page"
        :page-size="courseList.pageSize"
        :total="courseList.total"
        path="/course"
        :query="{
          ...(category ? { category } : {}),
          ...(keyword ? { keyword } : {}),
          ...(sort ? { sort } : {}),
        }"
      />
    </template>
  </div>
</template>

<style scoped>
.course-catalogue {
  margin-inline: auto;
  padding: 2rem 0 4.5rem;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  color: #737d88;
  font-size: 0.9rem;
  gap: 0.7rem;
}

.breadcrumbs a:hover {
  color: var(--color-jade);
}

.course-state {
  margin: 2rem 0;
  padding: 3rem;
  border: 1px solid var(--color-line);
  background: white;
  text-align: center;
}

.course-state h2,
.course-state p {
  margin: 0;
}

.course-state p {
  margin-top: 0.5rem;
  color: var(--color-muted);
}

@media (max-width: 78rem) {
  .course-catalogue {
    width: calc(100% - 2rem) !important;
  }
}
</style>
