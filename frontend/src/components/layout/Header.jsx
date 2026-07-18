import LanguageToggle from '../ui/LanguageToggle.jsx'

export default function Header() {
  return (
    <header className="bg-azul-tormenta text-white px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="font-display font-bold text-lg tracking-wide">
          WR<span className="text-naranja-wr">.</span>Energy
        </span>
      </div>
      <LanguageToggle />
    </header>
  )
}
