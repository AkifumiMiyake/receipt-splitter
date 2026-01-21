import { forwardRef, type ChangeEvent } from 'react'
import { formatNumber } from '../utils/format'

type AmountInputProps = {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  helperText?: string
}

const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  ({ value, onChange, label = '合計金額（円）', placeholder, helperText }, ref) => {
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      const digits = event.target.value.replace(/[^\d]/g, '')
      onChange(digits)
    }

    return (
      <label className="field">
        <span className="field-label">{label}</span>
        <input
          ref={ref}
          className="amount-input"
          type="text"
          inputMode="numeric"
          placeholder={placeholder}
          value={formatNumber(value)}
          onChange={handleChange}
        />
        {helperText ? <span className="field-helper">{helperText}</span> : null}
      </label>
    )
  },
)

AmountInput.displayName = 'AmountInput'

export default AmountInput
