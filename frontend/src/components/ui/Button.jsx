export default function Button({
  children,
  variant = 'primary',
  disabled,
  onClick,
  className = '',
  type = 'button',
}) {
  const base =
    'font-display font-bold uppercase tracking-wide px-6 py-3 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-naranja-wr text-white hover:brightness-95',
    secondary:
      'border border-azul-tormenta text-azul-tormenta hover:bg-azul-tormenta hover:text-white',
    success: 'bg-green-600 text-white hover:bg-green-700',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
