export function Input({
  label,
  value,
  onChange,
  type = 'text',
  disabled = false,
  placeholder,
  min,
  step,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  disabled?: boolean
  placeholder?: string
  min?: number
  step?: number
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input
        className="control"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        disabled={disabled}
        placeholder={placeholder}
        min={min}
        step={step}
      />
    </label>
  )
}
