interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  options: { label: string; value: string }[]
}

export function Select({ value, onValueChange, options }: SelectProps) {
  return (
    <select className="select" value={value} onChange={(e) => onValueChange(e.target.value)}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
