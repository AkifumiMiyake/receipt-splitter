export type GroupBreakdown = {
  amount: number
  count: number
}

export type SplitGroup = {
  count: number
  breakdown: GroupBreakdown[]
}

export type SplitResult = {
  total: number
  people: number
  low: SplitGroup
  normal: SplitGroup
  high: SplitGroup
}

const roundTo100 = (value: number): number => Math.round(value / 100) * 100

const distributeDiff = (base: number, count: number, diff: number): number[] => {
  if (count <= 0) return []
  const amounts = Array.from({ length: count }, () => base)
  if (diff === 0) return amounts
  const step = 100
  const sign = diff > 0 ? 1 : -1
  let remaining = Math.abs(diff)
  const units = Math.floor(remaining / step)
  for (let i = 0; i < units; i += 1) {
    amounts[i % count] += sign * step
  }
  remaining -= units * step
  if (remaining > 0) {
    amounts[0] += sign * remaining
  }
  return amounts
}

const toBreakdown = (amounts: number[]): GroupBreakdown[] => {
  const map = new Map<number, number>()
  amounts.forEach((amount) => {
    map.set(amount, (map.get(amount) ?? 0) + 1)
  })
  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([amount, count]) => ({ amount, count }))
}

export const calcSplit = (
  total: number,
  people: number,
  low: number,
  high: number,
): SplitResult => {
  const normal = people - low - high
  const weightSum = low * 0.8 + normal * 1.0 + high * 1.2
  const unit = total / weightSum
  const baseLow = roundTo100(unit * 0.8)
  const baseNormal = roundTo100(unit)
  const baseHigh = roundTo100(unit * 1.2)
  const baseTotal = baseLow * low + baseNormal * normal + baseHigh * high
  const diff = total - baseTotal

  const target = high > 0 ? 'high' : normal > 0 ? 'normal' : 'low'

  const lowAmounts = distributeDiff(baseLow, low, target === 'low' ? diff : 0)
  const normalAmounts = distributeDiff(
    baseNormal,
    normal,
    target === 'normal' ? diff : 0,
  )
  const highAmounts = distributeDiff(baseHigh, high, target === 'high' ? diff : 0)

  return {
    total,
    people,
    low: { count: low, breakdown: toBreakdown(lowAmounts) },
    normal: { count: normal, breakdown: toBreakdown(normalAmounts) },
    high: { count: high, breakdown: toBreakdown(highAmounts) },
  }
}
