import { formatYen } from '../utils/format'
import type { HistoryItem } from '../utils/storage'

type HistoryListProps = {
  items: HistoryItem[]
  onSelect: (item: HistoryItem) => void
  onDelete: (id: string) => void
  onClear: () => void
}

const HistoryList = ({ items, onSelect, onDelete, onClear }: HistoryListProps) => {
  if (!items.length) {
    return <p className="history-empty">履歴はまだありません。</p>
  }

  return (
    <div className="history-list">
      <div className="history-actions">
        <span className="history-count">最新{items.length}件</span>
        <button type="button" className="ghost-button" onClick={onClear}>
          全削除
        </button>
      </div>
      <div className="history-grid">
        {items.map((item) => (
          <div key={item.id} className="history-card">
            <button type="button" className="history-load" onClick={() => onSelect(item)}>
              <span className="history-title">
                {formatYen(item.total)} / {item.people}人（少{item.low}・多{item.high}）
              </span>
              <span className="history-meta">
                {new Date(item.createdAt).toLocaleString('ja-JP', {
                  month: 'numeric',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            </button>
            <button
              type="button"
              className="history-delete"
              onClick={() => onDelete(item.id)}
            >
              削除
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HistoryList
