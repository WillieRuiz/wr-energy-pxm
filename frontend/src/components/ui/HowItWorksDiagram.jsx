function StepIcon({ index }) {
  switch (index) {
    case 0: // power cut — bolt with a slash through it
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
          <line x1="3" y1="3" x2="21" y2="21" />
        </svg>
      )
    case 1: // detection — radar pulse
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="7" strokeDasharray="2 3" />
          <circle cx="12" cy="12" r="11" strokeDasharray="2 4" opacity="0.5" />
        </svg>
      )
    case 2: // battery taking the load
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
          <rect x="2" y="7" width="18" height="10" rx="2" />
          <rect x="22" y="10" width="1.5" height="4" fill="currentColor" stroke="none" />
          <rect x="4.5" y="9.5" width="11" height="5" fill="currentColor" stroke="none" />
        </svg>
      )
    default: // house stays on
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11 12 3l9 8" />
          <path d="M5 10v10h14V10" />
          <path d="M9.5 15l1.75 1.75L14.5 13" />
        </svg>
      )
  }
}

export default function HowItWorksDiagram({ steps }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
      <div className="flex flex-wrap gap-y-4">
        {steps.map((label, i) => (
          <div key={i} className="flex items-center min-w-[45%] sm:min-w-0 sm:flex-1">
            <div className="flex flex-col items-center text-center gap-2 flex-1 px-1">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-azul-tormenta text-amarillo-solar shrink-0">
                <StepIcon index={i} />
              </div>
              <p className="font-body text-xs text-carbon leading-snug">{label}</p>
            </div>
            {i < steps.length - 1 && (
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-300 hidden sm:block shrink-0" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
