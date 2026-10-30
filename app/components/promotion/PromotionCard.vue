<script setup lang="ts">
import PromotionCountdown from './PromotionCountdown.vue'
import type {
  PromotionKind,
  PromotionStatus,
  PromotionSummary,
} from '~/features/promotion/promotion.types'

withDefaults(defineProps<{
  promotion: PromotionSummary
  kind: PromotionKind
  initialNow: number
  headingTag?: 'h2' | 'h3'
}>(), {
  headingTag: 'h2',
})

const priceFormatter = new Intl.NumberFormat('zh-CN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const statusLabels: Record<PromotionStatus, string> = {
  'upcoming': '即将开始',
  'active': '进行中',
  'sold-out': '已售罄',
  'ended': '已结束',
}
</script>

<template>
  <article class="promotion-card">
    <NuxtLink :to="`/${kind}/${encodeURIComponent(promotion.slug)}`">
      <span class="promotion-image">
        <img
          :src="promotion.imageUrl"
          :alt="promotion.imageAlt"
          width="560"
          height="320"
          loading="lazy"
        >
        <span class="promotion-kind">{{ kind === 'group-buy' ? `${promotion.groupSize ?? 2} 人拼团` : '限时秒杀' }}</span>
      </span>
      <span class="promotion-card-body">
        <component :is="headingTag">
          {{ promotion.title }}
        </component>
        <span class="promotion-prices">
          <strong>¥{{ priceFormatter.format(promotion.price) }}</strong>
          <del v-if="promotion.originalPrice !== undefined && promotion.originalPrice > promotion.price">
            ¥{{ priceFormatter.format(promotion.originalPrice) }}
          </del>
        </span>
      </span>
      <span
        class="promotion-band"
        :class="`is-${promotion.status}`"
      >
        <span>{{ statusLabels[promotion.status] }}</span>
        <PromotionCountdown
          :status="promotion.status"
          :starts-at="promotion.startsAt"
          :ends-at="promotion.endsAt"
          :initial-now="initialNow"
        />
      </span>
    </NuxtLink>
  </article>
</template>

<style scoped>
.promotion-card {
  overflow: hidden;
  border: 1px solid #e2e6e2;
  border-radius: 0.45rem;
  background: var(--color-surface);
  box-shadow: 0 0.6rem 1.3rem rgb(24 36 55 / 9%);
  transition: box-shadow 180ms ease, transform 180ms ease;
}

.promotion-card:hover,
.promotion-card:focus-within {
  box-shadow: 0 1rem 2rem rgb(24 36 55 / 14%);
  transform: translateY(-0.18rem);
}

.promotion-card a,
.promotion-image,
.promotion-card-body,
.promotion-band { display: block; }

.promotion-image {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  background: #edf0eb;
}

.promotion-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 280ms ease;
}

.promotion-card:hover img { transform: scale(1.025); }

.promotion-kind {
  position: absolute;
  top: 0.8rem;
  left: 0.8rem;
  padding: 0.3rem 0.55rem;
  border-radius: 0.2rem;
  background: rgb(24 36 55 / 88%);
  color: white;
  font-size: 0.72rem;
  font-weight: 800;
}

.promotion-card-body { min-height: 7.1rem; padding: 1rem 1.1rem; }

.promotion-card h2,
.promotion-card h3 {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: var(--color-ink);
  font-size: 1rem;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.promotion-prices {
  display: flex;
  align-items: baseline;
  margin-top: 0.7rem;
  gap: 0.65rem;
}

.promotion-prices strong { color: #d94b4b; font-size: 1.25rem; }
.promotion-prices del { color: #8a929b; font-size: 0.82rem; }

.promotion-band {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 3.15rem;
  padding: 0.65rem 1rem;
  background: #e98a10;
  color: white;
  font-size: 0.82rem;
  font-weight: 800;
  gap: 0.6rem;
}

.promotion-band.is-upcoming { background: #ba7a16; }
.promotion-band.is-sold-out,
.promotion-band.is-ended { background: #69727c; }
</style>
