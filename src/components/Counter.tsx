type CounterProps = {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  helperText?: string
}

const Counter = ({ label, value, onChange, min = 0, max, helperText }: CounterProps) => {
  const decDisabled = value <= min
  const incDisabled = max !== undefined ? value >= max : false

  return (
    <div className="counter">
      <div>
        <div className="field-label">{label}</div>
        {helperText ? <div className="field-helper">{helperText}</div> : null}
      </div>
      <div className="counter-controls">
        <button
          type="button"
          className="counter-button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={decDisabled}
        >
          -
        </button>
        <span className="counter-value">{value}</span>
        <button
          type="button"
          className="counter-button"
          onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)}
          disabled={incDisabled}
        >
          +
        </button>
      </div>
    </div>
  )
}

export default Counter
