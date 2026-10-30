<script setup lang="ts">
import PromotionHero from '~/features/promotion/components/PromotionHero.vue'
import { getGroupBuy } from '~/features/promotion/promotion.service'

const route = useRoute()
const slug = computed(() => Array.isArray(route.params.slug) ? route.params.slug[0] ?? '' : route.params.slug ?? '')
const initialNow = useState('group-buy-detail-now', () => Date.now())

const { data: promotion, error, status, refresh } = await useAsyncData(
  () => `group-buy:${slug.value}`,
  () => getGroupBuy(slug.value),
)

const createNotFoundError = () => createError({
  statusCode: 404,
  statusMessage: '拼团活动不存在或尚未发布',
})

if (error.value?.statusCode === 404) throw createNotFoundError()
watch(error, (value) => {
  if (value?.statusCode === 404) showError(createNotFoundError())
})

usePageSeo(computed(() => promotion.value
  ? {
      title: `${promotion.value.title}｜拼团｜知序学堂`,
      description: promotion.value.description,
      path: `/group-buy/${encodeURIComponent(promotion.value.slug)}`,
      image: promotion.value.imageUrl,
    }
  : {
      title: '拼团详情｜知序学堂',
      description: '查看知序学堂课程拼团详情。',
      path: `/group-buy/${encodeURIComponent(slug.value)}`,
      noindex: true,
    }))
</script>

<template>
  <div
    class="promotion-detail"
    style="width: var(--page-width)"
  >
    <nav
      class="breadcrumbs"
      aria-label="面包屑"
    >
      <NuxtLink to="/">首页</NuxtLink><span aria-hidden="true">/</span><NuxtLink to="/group-buy">拼团</NuxtLink>
      <span aria-hidden="true">/</span><span
        v-if="promotion"
        aria-current="page"
      >{{ promotion.title }}</span>
    </nav>
    <section
      v-if="error"
      class="promotion-state"
      role="alert"
    >
      <h1>拼团活动暂时无法加载</h1><p>请检查网络连接后重试。</p>
      <button
        type="button"
        @click="() => refresh()"
      >
        重新加载
      </button>
    </section>
    <p
      v-else-if="status === 'pending'"
      class="promotion-state"
      aria-live="polite"
    >
      正在加载拼团详情…
    </p>
    <template v-else-if="promotion">
      <PromotionHero
        :promotion="promotion"
        kind="group-buy"
        :initial-now="initialNow"
      />
      <article class="promotion-content">
        <header><span>活动详情</span><h2>学习内容与活动说明</h2></header>
        <p>{{ promotion.description }}</p>
        <ul>
          <li
            v-for="item in promotion.details"
            :key="item"
          >
            {{ item }}
          </li>
        </ul>
      </article>
    </template>
  </div>
</template>

<style scoped>
.promotion-detail { margin-inline: auto; padding: 1.75rem 0 4.5rem; }
.breadcrumbs { display: flex; align-items: center; margin-bottom: 1.25rem; color: #737d88; font-size: 0.9rem; gap: 0.65rem; }
.breadcrumbs a:hover { color: var(--color-jade); }
.promotion-content { margin-top: 1.5rem; padding: 2rem; border: 1px solid #e3e7e3; border-radius: 0.4rem; background: white; }
.promotion-content header { padding-bottom: 1rem; border-bottom: 2px solid #edf0ed; }
.promotion-content header span { color: var(--color-jade); font-size: 0.72rem; font-weight: 900; letter-spacing: 0.14em; }
.promotion-content h2 { margin: 0.25rem 0 0; font-family: "Noto Serif SC", "Songti SC", serif; font-size: 1.5rem; }
.promotion-content p, .promotion-content ul { color: #45505c; line-height: 1.9; }
.promotion-content ul { padding-left: 1.3rem; }
.promotion-state { margin: 4rem 0; padding: 3rem; border: 1px solid var(--color-line); background: white; text-align: center; }
.promotion-state h1, .promotion-state p { margin: 0; }
.promotion-state p { margin-top: 0.5rem; color: var(--color-muted); }
.promotion-state button { margin-top: 1rem; padding: 0.7rem 1rem; border: 0; background: var(--color-jade); color: white; cursor: pointer; font: inherit; font-weight: 800; }
@media (max-width: 78rem) { .promotion-detail { width: calc(100% - 2rem) !important; } }
@media (max-width: 42rem) { .promotion-content { padding: 1.25rem 1rem; } }
</style>
