export default function ProgressBar({ current, total = 3 }) {
  return (
    <div className="flex gap-2 py-3">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${
            i + 1 <= current ? 'bg-amarillo-solar' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  )
}
