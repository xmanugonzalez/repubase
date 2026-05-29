export function Input({
  label,
  value,
  onChange,
  type = 'text',
  disabled = false,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  disabled?: boolean
  placeholder?: string
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
      />
    </label>
  )
}
