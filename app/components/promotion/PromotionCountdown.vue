<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { PromotionStatus } from '~/features/promotion/promotion.types'

const props = defineProps<{
  status: PromotionStatus
  startsAt?: string
  endsAt: string
  initialNow: number
}>()

const now = ref(props.initialNow)
let timer: ReturnType<typeof setInterval> | undefined

const target = computed(() => props.status === 'upcoming' ? props.startsAt : props.status === 'active' ? props.endsAt : undefined)
const remaining = computed(() => {
  if (!target.value) return null
  const milliseconds = Date.parse(target.value) - now.value
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) return null

  const totalSeconds = Math.floor(milliseconds / 1000)
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: String(Math.floor((totalSeconds % 86_400) / 3_600)).padStart(2, '0'),
    minutes: String(Math.floor((totalSeconds % 3_600) / 60)).padStart(2, '0'),
    seconds: String(totalSeconds % 60).padStart(2, '0'),
  }
})
const label = computed(() => props.status === 'upcoming' ? '距开始' : '倒计时')

onMounted(() => {
  now.value = Date.now()
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (timer !== undefined) clearInterval(timer)
})
</script>

<template>
  <time
    v-if="remaining && target"
    class="promotion-countdown"
    :datetime="target"
    :aria-label="`${label} ${remaining.days} 天 ${remaining.hours} 小时 ${remaining.minutes} 分 ${remaining.seconds} 秒`"
  >
    <span class="countdown-label">{{ label }}</span>
    <span class="countdown-value">{{ remaining.days }}</span><span>天</span>
    <span class="countdown-value">{{ remaining.hours }}</span><span aria-hidden="true">:</span>
    <span class="countdown-value">{{ remaining.minutes }}</span><span aria-hidden="true">:</span>
    <span class="countdown-value">{{ remaining.seconds }}</span>
  </time>
  <span
    v-else
    class="promotion-countdown promotion-countdown-static"
  >
    {{ status === 'sold-out' ? '名额已满' : status === 'ended' ? '活动已结束' : '等待活动时间' }}
  </span>
</template>

<style scoped>
.promotion-countdown {
  display: inline-flex;
  align-items: center;
  gap: 0.18rem;
  color: inherit;
  font-size: 0.78rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.countdown-label { margin-right: 0.2rem; }

.countdown-value {
  min-width: 1.7rem;
  padding: 0.2rem 0.3rem;
  border-radius: 0.18rem;
  background: rgb(255 255 255 / 94%);
  color: #c66c08;
  font-weight: 800;
  text-align: center;
}

.promotion-countdown-static { font-weight: 700; }
</style>
