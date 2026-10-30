<script setup lang="ts">
import { computed } from 'vue'
import { normalizePage } from '~/utils/normalizePage'

const props = withDefaults(defineProps<{
  page: number
  pageSize: number
  total: number
  path: string
  query?: Record<string, string | string[] | undefined>
  ariaLabel?: string
}>(), {
  query: () => ({}),
  ariaLabel: '课程分页',
})

const currentPage = computed(() => normalizePage(props.page))
const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const pageItems = computed<Array<number | 'start-ellipsis' | 'end-ellipsis'>>(() => {
  if (pageCount.value <= 7) {
    return Array.from({ length: pageCount.value }, (_, index) => index + 1)
  }

  const start = Math.min(Math.max(currentPage.value - 2, 2), pageCount.value - 5)
  const middle = Array.from({ length: 5 }, (_, index) => start + index)

  return [
    1,
    ...(start > 2 ? ['start-ellipsis' as const] : []),
    ...middle,
    ...(start + 4 < pageCount.value - 1 ? ['end-ellipsis' as const] : []),
    pageCount.value,
  ]
})

function hrefFor(page: number): string {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(props.query)) {
    if (key === 'page' || value === undefined) {
      continue
    }

    const values = Array.isArray(value) ? value : [value]
    for (const item of values) {
      if (item.trim()) {
        search.append(key, item)
      }
    }
  }

  if (page > 1) {
    search.set('page', String(page))
  }

  const query = search.toString()
  return query ? `${props.path}?${query}` : props.path
}
</script>

<template>
  <nav
    v-if="pageCount > 1"
    class="pagination"
    :aria-label="ariaLabel"
  >
    <NuxtLink
      v-if="currentPage > 1"
      class="pagination-step"
      :to="hrefFor(currentPage - 1)"
      aria-label="上一页"
    >
      <span aria-hidden="true">‹</span>
    </NuxtLink>
    <span
      v-else
      class="pagination-step is-disabled"
      aria-label="上一页"
      aria-disabled="true"
    >
      <span aria-hidden="true">‹</span>
    </span>

    <template
      v-for="item in pageItems"
      :key="item"
    >
      <span
        v-if="typeof item !== 'number'"
        class="pagination-ellipsis"
        aria-hidden="true"
      >
        …
      </span>
      <span
        v-else-if="item === currentPage"
        class="pagination-page is-current"
        aria-current="page"
      >
        {{ item }}
      </span>
      <NuxtLink
        v-else
        class="pagination-page"
        :to="hrefFor(item)"
        :aria-label="`第 ${item} 页`"
      >
        {{ item }}
      </NuxtLink>
    </template>

    <NuxtLink
      v-if="currentPage < pageCount"
      class="pagination-step"
      :to="hrefFor(currentPage + 1)"
      aria-label="下一页"
    >
      <span aria-hidden="true">›</span>
    </NuxtLink>
    <span
      v-else
      class="pagination-step is-disabled"
      aria-label="下一页"
      aria-disabled="true"
    >
      <span aria-hidden="true">›</span>
    </span>
  </nav>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 3rem;
  gap: 0.5rem;
}

.pagination-page,
.pagination-step,
.pagination-ellipsis {
  display: grid;
  min-width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  background: var(--color-surface);
  color: #202a35;
  font-size: 1rem;
  transition: border-color 160ms ease, color 160ms ease, background-color 160ms ease;
}

.pagination-ellipsis {
  color: var(--color-muted);
}

.pagination-page:hover,
.pagination-step:hover {
  border-color: #9dcfc2;
  color: var(--color-jade);
}

.pagination-page.is-current {
  border-color: var(--color-jade);
  color: var(--color-jade);
  font-weight: 700;
}

.pagination-step {
  border-color: var(--color-line);
  font-size: 1.75rem;
}

.pagination-step.is-disabled {
  color: #c5cbd1;
  cursor: not-allowed;
}
</style>
