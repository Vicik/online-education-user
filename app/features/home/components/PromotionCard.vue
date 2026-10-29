<script setup lang="ts">
import type { PromotionStatus, PromotionSummary } from '../home.types'
import { formatPromotionEndTime } from '../home-formatters'

defineProps<{
  promotion: PromotionSummary
}>()

const priceFormatter = new Intl.NumberFormat('zh-CN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const statusLabels: Record<PromotionStatus, string> = {
  'upcoming': '即将开始',
  'active': '拼团中',
  'sold-out': '已售罄',
  'ended': '已结束',
}
</script>

<template>
  <article class="promotion-card">
    <NuxtLink
      :to="`/group-buy/${encodeURIComponent(promotion.slug)}`"
      class="promotion-link"
    >
      <span class="promotion-image-wrap">
        <img
          :src="promotion.imageUrl"
          :alt="promotion.imageAlt"
          width="560"
          height="320"
          loading="lazy"
        >
      </span>
      <span class="promotion-body">
        <strong>{{ promotion.title }}</strong>
        <span class="promotion-prices">
          <span class="promotion-price">¥{{ priceFormatter.format(promotion.price) }}</span>
          <del v-if="promotion.originalPrice !== undefined && promotion.originalPrice > promotion.price">
            ¥{{ priceFormatter.format(promotion.originalPrice) }}
          </del>
        </span>
      </span>
      <span class="promotion-status">
        <span>{{ statusLabels[promotion.status] }}</span>
        <time :datetime="promotion.endsAt">{{ formatPromotionEndTime(promotion.endsAt) }}</time>
      </span>
    </NuxtLink>
  </article>
</template>

<style scoped>
.promotion-card {
  overflow: hidden;
  border-radius: 0.45rem;
  background: var(--color-surface);
  box-shadow: 0 0.55rem 1.1rem rgb(24 36 55 / 11%);
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.promotion-card:hover {
  box-shadow: 0 1rem 2rem rgb(24 36 55 / 15%);
  transform: translateY(-0.2rem);
}

.promotion-card:focus-within {
  box-shadow:
    0 0 0 3px color-mix(in srgb, var(--color-jade), white 25%),
    0 1rem 2rem rgb(24 36 55 / 15%);
}

.promotion-link,
.promotion-image-wrap,
.promotion-body,
.promotion-status {
  display: block;
}

.promotion-image-wrap {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #eee8ff;
}

.promotion-image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.promotion-body {
  padding: 1rem 1.1rem 1.15rem;
}

.promotion-body strong {
  display: -webkit-box;
  min-height: 2.8em;
  overflow: hidden;
  color: #202938;
  font-size: 1rem;
  line-height: 1.4;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.promotion-prices {
  display: flex;
  align-items: baseline;
  margin-top: 0.9rem;
  gap: 0.7rem;
}

.promotion-price {
  color: #df4d55;
  font-size: 1.15rem;
  font-weight: 800;
}

.promotion-prices del {
  color: #8b929c;
  font-size: 0.82rem;
}

.promotion-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.72rem 1.1rem;
  background: #f49a12;
  color: white;
  font-size: 0.82rem;
  font-weight: 700;
  gap: 0.75rem;
}

.promotion-status time {
  font-size: 0.75rem;
  font-weight: 600;
}
</style>
