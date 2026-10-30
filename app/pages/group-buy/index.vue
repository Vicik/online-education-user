<script setup lang="ts">
import AppPagination from '~/components/common/AppPagination.vue'
import AppErrorState from '~/components/common/AppErrorState.vue'
import PromotionGrid from '~/features/promotion/components/PromotionGrid.vue'
import { getGroupBuys } from '~/features/promotion/promotion.service'
import { normalizePage } from '~/utils/normalizePage'

const PAGE_SIZE = 12
const route = useRoute()
const page = computed(() => normalizePage(Array.isArray(route.query.page) ? route.query.page[0] : route.query.page))
const initialNow = useState('group-buy-list-now', () => Date.now())

const { data: promotions, error, status, refresh } = await useAsyncData(
  () => `group-buys:${page.value}`,
  () => getGroupBuys({ page: page.value, pageSize: PAGE_SIZE }),
  { watch: [page] },
)

usePageSeo(computed(() => ({
  title: page.value > 1 ? `拼团活动第 ${page.value} 页｜知序学堂` : '拼团活动｜知序学堂',
  description: '浏览知序学堂正在进行和即将开始的课程拼团活动，查看活动时间、价格与剩余名额。',
  path: page.value > 1 ? `/group-buy?page=${page.value}` : '/group-buy',
})))
</script>

<template>
  <div
    class="promotion-page"
    style="width: var(--page-width)"
  >
    <nav
      class="breadcrumbs"
      aria-label="面包屑"
    >
      <NuxtLink to="/">首页</NuxtLink><span aria-hidden="true">/</span><span aria-current="page">拼团列表</span>
    </nav>
    <h1 class="sr-only">
      拼团活动
    </h1>

    <AppErrorState
      v-if="error"
      title="拼团活动暂时无法加载"
      message="请检查网络连接后重试。"
      @retry="refresh"
    />
    <p
      v-else-if="status === 'pending'"
      class="promotion-state"
      aria-live="polite"
    >
      正在加载拼团活动…
    </p>
    <template v-else-if="promotions">
      <PromotionGrid
        :promotions="promotions.items"
        kind="group-buy"
        :initial-now="initialNow"
      />
      <AppPagination
        :page="promotions.page"
        :page-size="promotions.pageSize"
        :total="promotions.total"
        path="/group-buy"
        aria-label="拼团活动分页"
      />
    </template>
  </div>
</template>

<style scoped>
.promotion-page { margin-inline: auto; padding: 2rem 0 4.5rem; }
.breadcrumbs { display: flex; align-items: center; color: #737d88; font-size: 0.9rem; gap: 0.7rem; }
.breadcrumbs a:hover { color: var(--color-jade); }
.promotion-state { margin: 2rem 0; padding: 3rem; border: 1px solid var(--color-line); background: white; text-align: center; }
.promotion-state h2, .promotion-state p { margin: 0; }
.promotion-state p { margin-top: 0.5rem; color: var(--color-muted); }
@media (max-width: 78rem) { .promotion-page { width: calc(100% - 2rem) !important; } }
</style>
