<script setup lang="ts">
import { ref } from 'vue'
import type { CourseSort } from '../course.types'

withDefaults(defineProps<{
  category?: string
  keyword?: string
  sort?: CourseSort
}>(), {
  category: '',
  keyword: '',
  sort: undefined,
})

const isPointerFocus = ref(false)
</script>

<template>
  <form
    class="course-filters"
    :class="{ 'is-pointer-focus': isPointerFocus }"
    action="/course"
    method="get"
    aria-label="筛选课程"
    @pointerdown="isPointerFocus = true"
    @keydown.tab="isPointerFocus = false"
  >
    <label>
      <span>课程分类</span>
      <select
        name="category"
        :value="category"
      >
        <option value="">全部分类</option>
        <option value="frontend">前端开发</option>
        <option value="backend">后端开发</option>
        <option value="design">产品设计</option>
      </select>
    </label>
    <label class="keyword-field">
      <span>搜索课程</span>
      <input
        type="search"
        name="keyword"
        :value="keyword"
        placeholder="输入课程名称"
      >
    </label>
    <label>
      <span>课程排序</span>
      <select
        name="sort"
        :value="sort"
      >
        <option value="">默认排序</option>
        <option value="latest">最新发布</option>
        <option value="recommended">精选推荐</option>
        <option value="price-asc">价格从低到高</option>
        <option value="price-desc">价格从高到低</option>
      </select>
    </label>
    <button type="submit">
      查看课程
    </button>
  </form>
</template>

<style scoped>
.course-filters {
  display: grid;
  grid-template-columns: 12rem minmax(18rem, 1fr) 12rem auto;
  align-items: end;
  margin: 1.5rem 0 2rem;
  padding: 1.2rem;
  border: 1px solid #e5e9ed;
  border-radius: 0.5rem;
  background: var(--color-surface);
  gap: 1rem;
}

.course-filters label,
.course-filters label > span {
  display: block;
}

.course-filters label > span {
  margin-bottom: 0.4rem;
  color: var(--color-muted);
  font-size: 0.8rem;
  font-weight: 700;
}

.course-filters input,
.course-filters select {
  width: 100%;
  height: 2.65rem;
  padding: 0 0.75rem;
  border: 1px solid var(--color-line);
  border-radius: 0.25rem;
  background: white;
  color: var(--color-ink);
  font: inherit;
}

.course-filters.is-pointer-focus input:focus,
.course-filters.is-pointer-focus select:focus {
  outline: none;
  border-color: var(--color-line);
  box-shadow: none;
}

.course-filters button {
  height: 2.65rem;
  padding: 0 1.25rem;
  border: 0;
  border-radius: 0.25rem;
  background: var(--color-jade);
  color: white;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}

@media (max-width: 64rem) {
  .course-filters {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 42rem) {
  .course-filters {
    grid-template-columns: 1fr;
  }
}
</style>
