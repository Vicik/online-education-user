<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { PromotionStatus, PromotionSummary } from '../home.types'
import { promotionCountdown } from '../home-formatters'

const props = defineProps<{
  promotion: PromotionSummary
  initialNow: number
}>()

const now = ref(props.initialNow)
const countdown = computed(() => promotionCountdown(props.promotion.endsAt, now.value))
let countdownTimer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  now.value = Date.now()
  countdownTimer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (countdownTimer !== undefined) {
    clearInterval(countdownTimer)
  }
})

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
        <time
          class="promotion-countdown"
          :datetime="promotion.endsAt"
          :aria-label="countdown ? `剩余 ${countdown.days} 天 ${countdown.hours} 小时 ${countdown.minutes} 分 ${countdown.seconds} 秒` : '活动已结束'"
        >
          <template v-if="countdown">
            <span class="countdown-label">倒计时</span>
            <span class="countdown-value">{{ countdown.days }}</span>
            <span>天</span>
            <span class="countdown-value">{{ countdown.hours }}</span>
            <span class="countdown-separator">:</span>
            <span class="countdown-value">{{ countdown.minutes }}</span>
            <span class="countdown-separator">:</span>
            <span class="countdown-value">{{ countdown.seconds }}</span>
          </template>
          <span v-else>已结束</span>
        </time>
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
  margin-top: 0.45rem;
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

.promotion-countdown {
  display: flex;
  align-items: center;
  gap: 0.18rem;
  white-space: nowrap;
}

.countdown-label {
  margin-right: 0.18rem;
}

.countdown-value {
  min-width: 1.55rem;
  padding: 0.18rem 0.25rem;
  border-radius: 0.18rem;
  background: white;
  color: #e88909;
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.countdown-separator {
  opacity: 0.86;
}
</style>
