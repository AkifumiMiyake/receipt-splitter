import { parseDigits } from './format'

export type LastInput = {
  amount: string
  people: number
  low: number
  high: number
}

export type HistoryItem = LastInput & {
  id: string
  createdAt: number
  total: number
}

const LAST_KEY = 'split_last'
const HISTORY_KEY = 'split_history'

const isValidLast = (value: unknown): value is LastInput => {
  if (!value || typeof value !== 'object') return false
  const input = value as LastInput
  return (
    typeof input.amount === 'string' &&
    typeof input.people === 'number' &&
    typeof input.low === 'number' &&
    typeof input.high === 'number'
  )
}

const isValidHistoryItem = (value: unknown): value is HistoryItem => {
  if (!value || typeof value !== 'object') return false
  const item = value as HistoryItem
  return (
    typeof item.id === 'string' &&
    typeof item.createdAt === 'number' &&
    typeof item.total === 'number' &&
    isValidLast(item)
  )
}

export const loadLast = (): LastInput | null => {
  try {
    const raw = localStorage.getItem(LAST_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return isValidLast(parsed) ? parsed : null
  } catch {
    return null
  }
}

export const saveLast = (input: LastInput): void => {
  try {
    localStorage.setItem(LAST_KEY, JSON.stringify(input))
  } catch {
    // ignore storage errors
  }
}

export const loadHistory = (): HistoryItem[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidHistoryItem)
  } catch {
    return []
  }
}

export const saveHistory = (items: HistoryItem[]): void => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items))
  } catch {
    // ignore storage errors
  }
}

export const addHistory = (items: HistoryItem[], input: LastInput): HistoryItem[] => {
  const total = parseDigits(input.amount)
  const next: HistoryItem = {
    ...input,
    total,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  }
  const updated = [next, ...items].slice(0, 5)
  saveHistory(updated)
  return updated
}

export const removeHistory = (items: HistoryItem[], id: string): HistoryItem[] => {
  const updated = items.filter((item) => item.id !== id)
  saveHistory(updated)
  return updated
}

export const clearHistory = (): HistoryItem[] => {
  saveHistory([])
  return []
}
