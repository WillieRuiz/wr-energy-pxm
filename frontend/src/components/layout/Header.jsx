import LanguageToggle from '../ui/LanguageToggle.jsx'

export default function Header() {
  return (
    <header className="bg-azul-tormenta text-white px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <img src="/logo-wr-energy-pmx.svg" alt="WR Energy PMX" className="h-8" />
        <span className="font-display font-bold text-lg tracking-wide hidden sm:block">
          WR Energy PMX
        </span>
      </div>
      <LanguageToggle />
    </header>
  )
}
