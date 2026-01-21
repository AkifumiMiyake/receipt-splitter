export const formatNumber = (input: number | string): string => {
  if (input === null || input === undefined) return ''
  const raw = typeof input === 'number' ? `${Math.trunc(input)}` : input
  const digits = raw.replace(/[^\d]/g, '')
  if (!digits) return ''
  const value = Number(digits)
  if (!Number.isFinite(value)) return ''
  return new Intl.NumberFormat('ja-JP').format(value)
}

export const formatYen = (input: number | string): string => {
  const formatted = formatNumber(input)
  if (!formatted) return ''
  return `${formatted}円`
}

export const parseDigits = (input: string): number => {
  if (!input) return 0
  const digits = input.replace(/[^\d]/g, '')
  if (!digits) return 0
  const value = Number(digits)
  return Number.isFinite(value) ? value : 0
}
