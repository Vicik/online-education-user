<script setup lang="ts">
import PromotionCard from '~/components/promotion/PromotionCard.vue'
import type { PromotionKind, PromotionSummary } from '../promotion.types'

defineProps<{
  promotions: PromotionSummary[]
  kind: PromotionKind
  initialNow: number
}>()
</script>

<template>
  <div
    v-if="promotions.length"
    class="promotion-grid"
    style="grid-template-columns: repeat(4, minmax(0, 1fr))"
  >
    <PromotionCard
      v-for="promotion in promotions"
      :key="promotion.id"
      :promotion="promotion"
      :kind="kind"
      :initial-now="initialNow"
    />
  </div>
  <section
    v-else
    class="promotion-empty"
  >
    <h2>当前没有可展示的活动</h2>
    <p>新的学习优惠正在准备中，请稍后再来看看。</p>
  </section>
</template>

<style scoped>
.promotion-grid {
  display: grid;
  margin-top: 1.75rem;
  gap: 1.3rem;
}

.promotion-empty {
  margin-top: 1.75rem;
  padding: 4rem 1.5rem;
  border: 1px solid var(--color-line);
  background: white;
  text-align: center;
}

.promotion-empty h2,
.promotion-empty p { margin: 0; }
.promotion-empty p { margin-top: 0.5rem; color: var(--color-muted); }

@media (max-width: 64rem) {
  .promotion-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
}

@media (max-width: 38rem) {
  .promotion-grid { grid-template-columns: 1fr !important; }
}
</style>
