export function normalizePage(value: unknown): number {
  if (typeof value !== 'number' && typeof value !== 'string') {
    return 1
  }

  const page = typeof value === 'number' ? value : Number(value)

  return Number.isInteger(page) && page > 0 ? page : 1
}
