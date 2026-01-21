import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import AmountInput from './components/AmountInput'
import Counter from './components/Counter'
import HistoryList from './components/HistoryList'
import { formatYen, parseDigits } from './utils/format'
import { calcSplit, type SplitGroup, type SplitResult } from './utils/splitCalc'
import {
  addHistory,
  clearHistory,
  loadHistory,
  loadLast,
  removeHistory,
  saveLast,
  type HistoryItem,
} from './utils/storage'

function App() {
  const [amountRaw, setAmountRaw] = useState('')
  const [people, setPeople] = useState(1)
  const [low, setLow] = useState(0)
  const [high, setHigh] = useState(0)
  const [result, setResult] = useState<SplitResult | null>(null)
  const [showSheet, setShowSheet] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const amountRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const last = loadLast()
    if (last) {
      setAmountRaw(last.amount)
      setPeople(last.people)
      setLow(last.low)
      setHigh(last.high)
    }
    setHistory(loadHistory())
  }, [])

  useEffect(() => {
    saveLast({ amount: amountRaw, people, low, high })
  }, [amountRaw, people, low, high])

  useEffect(() => {
    amountRef.current?.focus()
  }, [])

  const total = useMemo(() => parseDigits(amountRaw), [amountRaw])
  const normal = useMemo(() => people - low - high, [people, low, high])

  const error = useMemo(() => {
    if (!amountRaw || total <= 0) return '合計金額を入力してください'
    if (people < 1) return '人数は1人以上にしてください'
    if (low < 0 || high < 0) return '人数は0以上にしてください'
    if (low + high > people) return '少なめ+多めが人数を超えています'
    return ''
  }, [amountRaw, total, people, low, high])

  const handleCalculate = () => {
    if (error) return
    const next = calcSplit(total, people, low, high)
    setResult(next)
    setShowSheet(true)
    setHistory((current) => addHistory(current, { amount: amountRaw, people, low, high }))
  }

  const handleRestore = (item: HistoryItem) => {
    setAmountRaw(item.amount)
    setPeople(item.people)
    setLow(item.low)
    setHigh(item.high)
    setResult(null)
  }

  const handleDeleteHistory = (id: string) => {
    setHistory((current) => removeHistory(current, id))
  }

  const handleClearHistory = () => {
    setHistory(clearHistory())
  }

  const formatBreakdown = (group: SplitGroup) => {
    if (group.count === 0) return '0人'
    return group.breakdown
      .map((item) => `${formatYen(item.amount)}×${item.count}人`)
      .join(' / ')
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <div>
            <h1>らくらく割り勘計算｜割り勘計算・レシート対応</h1>
          </div>
        </div>
        <div className="brand-note">
          少なめ0.8 / 普通1.0 / 多め1.2 の重みで、100円単位に自動調整します。
        </div>
      </header>

      <main className="layout">
        <section className="panel input-panel">
          <h2>入力</h2>
          <AmountInput
            ref={amountRef}
            value={amountRaw}
            onChange={setAmountRaw}
            placeholder="例 18,000"
            helperText="数字のみ入力できます。"
          />
          <div className="counter-grid">
            <Counter
              label="人数"
              value={people}
              min={1}
              onChange={(value) => {
                setPeople(value)
                const nextHigh = Math.min(high, Math.max(0, value - low))
                const nextLow = Math.min(low, Math.max(0, value - nextHigh))
                if (nextHigh !== high) setHigh(nextHigh)
                if (nextLow !== low) setLow(nextLow)
              }}
            />
            <Counter
              label="少なめの人"
              value={low}
              min={0}
              max={Math.max(0, people - high)}
              onChange={setLow}
              helperText="x0.8で計算"
            />
            <Counter
              label="多めの人"
              value={high}
              min={0}
              max={Math.max(0, people - low)}
              onChange={setHigh}
              helperText="x1.2で計算"
            />
            <div className="counter summary">
              <div>
                <div className="field-label">普通の人</div>
                <div className="field-helper">自動計算</div>
              </div>
              <div className="summary-value">{normal >= 0 ? normal : 0}人</div>
            </div>
          </div>

          {error ? <div className="error-message">{error}</div> : null}

          <button
            type="button"
            className="primary-button"
            onClick={handleCalculate}
            disabled={!!error}
          >
            計算する
          </button>
        </section>

        <section className="panel result-panel">
          <h2>結果</h2>
          {result ? (
            <div className="result-grid">
              <div className="result-card">
                <span className="result-label">少なめ</span>
                <strong>{formatBreakdown(result.low)}</strong>
              </div>
              <div className="result-card">
                <span className="result-label">普通</span>
                <strong>{formatBreakdown(result.normal)}</strong>
              </div>
              <div className="result-card">
                <span className="result-label">多め</span>
                <strong>{formatBreakdown(result.high)}</strong>
              </div>
              <div className="result-total">
                合計 {formatYen(result.total)} / {result.people}人
              </div>
            </div>
          ) : (
            <div className="result-empty">
              <p>金額と人数を入力して「計算する」を押してください。</p>
            </div>
          )}
        </section>

        <section className="panel history-panel">
          <div className="history-header">
            <h2>履歴</h2>
            <p>タップで入力に復元できます。</p>
          </div>
          <HistoryList
            items={history}
            onSelect={handleRestore}
            onDelete={handleDeleteHistory}
            onClear={handleClearHistory}
          />
        </section>
      </main>

      <div className={`result-sheet ${showSheet ? 'is-open' : ''}`}>
        <div className="result-sheet-header">
          <h2>結果</h2>
          <button type="button" className="ghost-button" onClick={() => setShowSheet(false)}>
            閉じる
          </button>
        </div>
        {result ? (
          <div className="result-grid">
            <div className="result-card">
              <span className="result-label">少なめ</span>
              <strong>{formatBreakdown(result.low)}</strong>
            </div>
            <div className="result-card">
              <span className="result-label">普通</span>
              <strong>{formatBreakdown(result.normal)}</strong>
            </div>
            <div className="result-card">
              <span className="result-label">多め</span>
              <strong>{formatBreakdown(result.high)}</strong>
            </div>
            <div className="result-total">
              合計 {formatYen(result.total)} / {result.people}人
            </div>
          </div>
        ) : (
          <div className="result-empty">
            <p>金額と人数を入力して「計算する」を押してください。</p>
          </div>
        )}
      </div>
      <div
        className={`result-sheet-overlay ${showSheet ? 'is-open' : ''}`}
        onClick={() => setShowSheet(false)}
        aria-hidden="true"
      />
    </div>
  )
}

export default App
