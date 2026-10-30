<script setup lang="ts">
import PromotionCountdown from '~/components/promotion/PromotionCountdown.vue'
import type { PromotionDetail, PromotionKind, PromotionStatus } from '../promotion.types'

const props = defineProps<{
  promotion: PromotionDetail
  kind: PromotionKind
  initialNow: number
}>()

const priceFormatter = new Intl.NumberFormat('zh-CN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const dateTimeFormatter = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

function formatPromotionTime(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '时间待确认' : dateTimeFormatter.format(date)
}

const stateLabels: Record<PromotionStatus, string> = {
  'upcoming': '即将开始',
  'active': props.kind === 'group-buy' ? '立即拼团' : '立即秒杀',
  'sold-out': '已售罄',
  'ended': '已结束',
}
</script>

<template>
  <section class="promotion-hero">
    <div class="promotion-hero-image">
      <img
        :src="promotion.imageUrl"
        :alt="promotion.imageAlt"
        width="760"
        height="430"
      >
    </div>
    <div class="promotion-hero-content">
      <p class="promotion-eyebrow">
        {{ kind === 'group-buy' ? 'GROUP LEARNING' : 'FLASH OFFER' }}
      </p>
      <h1>{{ promotion.title }}</h1>
      <p class="promotion-description">
        {{ promotion.description }}
      </p>
      <dl class="promotion-schedule">
        <div>
          <dt>开始时间</dt>
          <dd><time :datetime="promotion.startsAt">{{ formatPromotionTime(promotion.startsAt) }}</time></dd>
        </div>
        <div>
          <dt>结束时间</dt>
          <dd><time :datetime="promotion.endsAt">{{ formatPromotionTime(promotion.endsAt) }}</time></dd>
        </div>
      </dl>

      <div class="promotion-panel">
        <div
          class="promotion-panel-band"
          :class="`is-${promotion.status}`"
        >
          <span>
            <template v-if="kind === 'group-buy'">{{ promotion.groupSize ?? 2 }} 人拼团</template>
            <template v-else>已抢 {{ promotion.soldCount ?? 0 }} 份 / 剩余 {{ promotion.remaining }} 份</template>
          </span>
          <PromotionCountdown
            :status="promotion.status"
            :starts-at="promotion.startsAt"
            :ends-at="promotion.endsAt"
            :initial-now="initialNow"
          />
        </div>
        <div class="promotion-panel-price">
          <strong>¥{{ priceFormatter.format(promotion.price) }}</strong>
          <del v-if="promotion.originalPrice !== undefined && promotion.originalPrice > promotion.price">
            ¥{{ priceFormatter.format(promotion.originalPrice) }}
          </del>
          <span class="promotion-stock">
            {{ kind === 'group-buy' ? `已拼 ${promotion.soldCount ?? 0} 人，剩余 ${promotion.remaining} 个名额` : '库存状态以后端返回为准' }}
          </span>
        </div>
      </div>

      <button
        type="button"
        class="promotion-action"
        :disabled="promotion.status !== 'active'"
      >
        {{ stateLabels[promotion.status] }}
      </button>
      <p class="promotion-authority-note">
        活动资格与库存以后端实时结果为准
      </p>
    </div>
  </section>
</template>

<style scoped>
.promotion-hero {
  display: grid;
  grid-template-columns: minmax(25rem, 0.95fr) minmax(0, 1.05fr);
  overflow: hidden;
  border: 1px solid #e3e7e3;
  border-radius: 0.45rem;
  background: white;
  box-shadow: var(--shadow-soft);
}

.promotion-hero-image { min-height: 27rem; background: #eef0ec; }
.promotion-hero-image img { width: 100%; height: 100%; object-fit: cover; }

.promotion-hero-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2.5rem 3rem;
}

.promotion-eyebrow {
  margin: 0;
  color: var(--color-jade);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.18em;
}

.promotion-hero h1 {
  margin: 0.55rem 0 0;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: clamp(1.75rem, 3vw, 2.45rem);
  line-height: 1.25;
}

.promotion-description { margin: 0.75rem 0 0; color: var(--color-muted); line-height: 1.75; }

.promotion-schedule {
  display: flex;
  flex-wrap: wrap;
  margin: 1rem 0 0;
  color: var(--color-muted);
  font-size: 0.78rem;
  gap: 0.75rem 1.5rem;
}

.promotion-schedule div { display: flex; gap: 0.45rem; }
.promotion-schedule dt { font-weight: 800; }
.promotion-schedule dd { margin: 0; font-variant-numeric: tabular-nums; }

.promotion-panel {
  overflow: hidden;
  margin-top: 1.5rem;
  border: 1px solid #ebaca0;
  border-radius: 0.35rem;
}

.promotion-panel-band {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 3.25rem;
  padding: 0.65rem 1rem;
  background: #ed624d;
  color: white;
  font-weight: 800;
  gap: 1rem;
}

.promotion-panel-band.is-upcoming { background: #ba7a16; }
.promotion-panel-band.is-sold-out,
.promotion-panel-band.is-ended { background: #69727c; }

.promotion-panel-price {
  display: flex;
  align-items: baseline;
  min-height: 4.3rem;
  padding: 0.75rem 1rem;
  gap: 0.7rem;
}

.promotion-panel-price strong { color: #df4d55; font-size: 1.75rem; }
.promotion-panel-price del { color: #8b929c; }
.promotion-stock { margin-left: auto; color: var(--color-muted); font-size: 0.8rem; }

.promotion-action {
  align-self: flex-start;
  margin-top: 1.4rem;
  padding: 0.78rem 1.4rem;
  border: 0;
  border-radius: 0.28rem;
  background: var(--color-jade);
  color: white;
  cursor: pointer;
  font: inherit;
  font-weight: 800;
}

.promotion-action:disabled { background: #89929c; cursor: not-allowed; }
.promotion-authority-note { margin: 0.65rem 0 0; color: #7b8490; font-size: 0.76rem; }

@media (max-width: 64rem) {
  .promotion-hero { grid-template-columns: 1fr; }
  .promotion-hero-image { min-height: 0; aspect-ratio: 16 / 9; }
}

@media (max-width: 42rem) {
  .promotion-hero-content { padding: 1.5rem 1rem; }
  .promotion-panel-band,
  .promotion-panel-price { align-items: flex-start; flex-direction: column; }
  .promotion-stock { margin-left: 0; }
}
</style>
