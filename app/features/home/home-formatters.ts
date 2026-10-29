const chinaDateFormatter = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatPromotionEndTime(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '结束时间待定' : `${chinaDateFormatter.format(date)} 结束`
}

export interface PromotionCountdown {
  days: number
  hours: string
  minutes: string
  seconds: string
}

export function promotionCountdown(value: string, now: number): PromotionCountdown | null {
  const endsAt = new Date(value).getTime()
  if (Number.isNaN(endsAt)) {
    return null
  }

  const remainingSeconds = Math.floor((endsAt - now) / 1000)
  if (remainingSeconds <= 0) {
    return null
  }

  const days = Math.floor(remainingSeconds / 86_400)
  const hours = Math.floor((remainingSeconds % 86_400) / 3_600)
  const minutes = Math.floor((remainingSeconds % 3_600) / 60)
  const seconds = remainingSeconds % 60

  return {
    days,
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  }
}
