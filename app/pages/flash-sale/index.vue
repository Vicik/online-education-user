<script setup lang="ts">
import AppPagination from '~/components/common/AppPagination.vue'
import AppErrorState from '~/components/common/AppErrorState.vue'
import PromotionGrid from '~/features/promotion/components/PromotionGrid.vue'
import { getFlashSales } from '~/features/promotion/promotion.service'
import { normalizePage } from '~/utils/normalizePage'

const PAGE_SIZE = 12
const route = useRoute()
const page = computed(() => normalizePage(Array.isArray(route.query.page) ? route.query.page[0] : route.query.page))
const initialNow = useState('flash-sale-list-now', () => Date.now())

const { data: promotions, error, status, refresh } = await useAsyncData(
  () => `flash-sales:${page.value}`,
  () => getFlashSales({ page: page.value, pageSize: PAGE_SIZE }),
  { watch: [page] },
)

usePageSeo(computed(() => ({
  title: page.value > 1 ? `限时秒杀第 ${page.value} 页｜知序学堂` : '限时秒杀｜知序学堂',
  description: '浏览知序学堂课程限时秒杀，查看活动时间、优惠价格与后端权威库存状态。',
  path: page.value > 1 ? `/flash-sale?page=${page.value}` : '/flash-sale',
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
      <NuxtLink to="/">首页</NuxtLink><span aria-hidden="true">/</span><span aria-current="page">秒杀列表</span>
    </nav>
    <h1 class="sr-only">
      限时秒杀
    </h1>

    <AppErrorState
      v-if="error"
      title="秒杀活动暂时无法加载"
      message="请检查网络连接后重试。"
      @retry="refresh"
    />
    <p
      v-else-if="status === 'pending'"
      class="promotion-state"
      aria-live="polite"
    >
      正在加载秒杀活动…
    </p>
    <template v-else-if="promotions">
      <PromotionGrid
        :promotions="promotions.items"
        kind="flash-sale"
        :initial-now="initialNow"
      />
      <AppPagination
        :page="promotions.page"
        :page-size="promotions.pageSize"
        :total="promotions.total"
        path="/flash-sale"
        aria-label="秒杀活动分页"
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
