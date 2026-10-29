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
