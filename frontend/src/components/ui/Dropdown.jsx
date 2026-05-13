export default function Dropdown({ options, value, onChange, placeholder, className = '', ...props }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`border border-hueso rounded-lg px-3 py-2 font-body focus:border-azul-tormenta focus:outline-none bg-white w-full transition-colors ${className}`}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => {
        const val = opt.value ?? opt
        const label = opt.label ?? opt
        return (
          <option key={val} value={val}>
            {label}
          </option>
        )
      })}
    </select>
  )
}
