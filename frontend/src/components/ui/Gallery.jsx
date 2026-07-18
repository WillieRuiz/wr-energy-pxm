import { useRef, useState } from 'react'

// Lighter sibling of the landing page carousel (Screen0_Landing.jsx): same scroll-snap +
// dots pattern, but no autoplay/arrows — this lives inside a card, not a full section, and
// the landing carousel's styling is built on its own CSS variables (scoped to `.lp`) rather
// than this app's Tailwind classes, so it isn't directly reusable here.
export default function Gallery({ images, alt }) {
  const trackRef = useRef(null)
  const [index, setIndex] = useState(0)

  if (!images || images.length === 0) return null

  const handleScroll = () => {
    const track = trackRef.current
    if (!track) return
    const i = Math.round(track.scrollLeft / track.clientWidth)
    if (i !== index) setIndex(i)
  }

  const goTo = (i) => {
    setIndex(i)
    trackRef.current?.scrollTo({ left: i * trackRef.current.clientWidth, behavior: 'smooth' })
  }

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory rounded-xl [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${alt} ${i + 1}`}
            loading="lazy"
            className="w-full shrink-0 snap-start aspect-[4/3] object-cover"
          />
        ))}
      </div>
      {images.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ir a la imagen ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-4 bg-amarillo-solar' : 'w-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
