export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="font-body text-sm font-medium text-carbon">{label}</label>
      )}
      <input
        className={`border rounded-lg px-4 py-3 font-body bg-white focus:outline-none transition-colors ${
          error ? 'border-red-400 focus:border-red-500' : 'border-hueso focus:border-azul-tormenta'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-red-500 text-xs font-body">{error}</span>}
    </div>
  )
}
