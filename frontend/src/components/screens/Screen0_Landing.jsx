import { useState, useEffect, useRef } from 'react'
import './Screen0_Landing.css'
import { useCalculator } from '../../hooks/useCalculator.js'
import { trackEvent } from '../../utils/analytics.js'
import { trackPixelCustom } from '../../utils/pixelEvents.js'

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || ''
const WHATSAPP_MESSAGE = 'Hola, me interesa instalar un sistema de respaldo en mi casa, ¿me pueden dar más información?'
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

const PAIN_CARDS = [
  { icon: '🌡️', title: 'Calor sin escape', desc: 'Sin ventilador ni AC en la costa, el calor se vuelve insoportable' },
  { icon: '🍱', title: 'Comida echada a perder', desc: 'Tu refri y congelador se calientan en menos de 2 horas' },
  { icon: '💧', title: 'Sin agua en la llave', desc: 'La bomba se apaga con la luz — sin presión en toda la casa' },
  { icon: '🌐', title: 'Internet y home-office caídos', desc: 'Tu trabajo y los estudios de tus hijos dependen de la conexión' },
]

const BAD_ITEMS = ['Gasolina cada apagón', 'Ruido que molesta', 'Arranque manual', 'Mantenimiento constante', 'Humo y emisiones', 'No baja tu recibo CFE']
const GOOD_ITEMS = ['Sin combustible', 'Silencioso, cero ruido', 'Automático en segundos', 'Sin mantenimiento continuo', 'Cero emisiones', 'Baja tu recibo de CFE']

const STEPS = [
  { n: '1', title: 'Calculas en 2 minutos', desc: 'Selecciona los equipos que quieres respaldar: refri, clima, bomba, internet. La calculadora hace el resto.' },
  { n: '2', title: 'Recibís tu propuesta', desc: 'Te enviamos una propuesta preliminar con el sistema recomendado, precio y opciones de pago.' },
  { n: '3', title: 'Instalamos en la costa', desc: 'Nuestro equipo instala en Puerto Escondido, Mazunte, Zipolite, Puerto Ángel y Huatulco.' },
]

const STATS = [
  { num: '5', label: 'Destinos en la costa de Oaxaca donde instalamos' },
  { num: '6 m', label: 'Temporada de lluvias con apagones frecuentes (jun–nov)' },
  { num: '2 min', label: 'Lo que tarda la calculadora en darte una propuesta' },
  { num: '0', label: 'Litros de gasolina que necesita el sistema instalado' },
]

const TESTIMONIALS = [
  {
    name: 'Eduardo',
    quote: 'Willie se tomó el tiempo de explicarme todo con calma, sin tecnicismos que no entendía. Resolvió cada duda que tuve, por básica que fuera.',
  },
  {
    name: 'Alejandra',
    quote: 'Lo que más valoro es que Willie siempre estuvo para responder mis preguntas. Se nota que sabe muchísimo del tema y lo explica de forma que cualquiera lo entiende.',
  },
  {
    name: 'Pedro',
    quote: 'Con Willie sentí que estaba en buenas manos desde el primer momento. Muy atento y paciente para explicar, no como otros que solo quieren vender.',
  },
]

// NOTA: los archivos reales en public/images/estaciones/ tienen doble extensión
// ".png.png" (no ".png") — se referencian tal cual existen en disco.
const CAROUSEL_SLIDES = [
  { img: '/images/estaciones/EFDeltaProUltra-US_instalado.png.png', caption: 'Delta Pro Ultra — para tu casa' },
  { img: '/images/estaciones/EFDeltaProUltra-US_instalado_2.png.png', caption: 'Delta Pro Ultra — para tu casa' },
  { img: '/images/estaciones/EFDeltaProUltra-US_instalado_3.png.png', caption: 'Delta Pro Ultra — para tu casa' },
  { img: '/images/estaciones/EFDeltaProUltra-US_avanzado_instalado.png.png', caption: 'Delta Pro Ultra — para hoteles boutique y residencias grandes' },
  { img: '/images/estaciones/DELTAPro-1600W-US_instalado.png.png', caption: 'Delta Pro — respaldo doméstico confiable' },
  { img: '/images/estaciones/DELTAPro-1600W-US_instalado_2.png.png', caption: 'Delta Pro — respaldo doméstico confiable' },
  { img: '/images/estaciones/DELTAPro-1600W-US_instalado_3.png.png', caption: 'Delta Pro — respaldo doméstico confiable' },
]

function Carousel({ slides }) {
  const trackRef = useRef(null)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const goTo = (i) => {
    const clamped = (i + slides.length) % slides.length
    setIndex(clamped)
    const track = trackRef.current
    if (track) {
      track.scrollTo({ left: clamped * track.clientWidth, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    if (paused) return
    const timer = setInterval(() => goTo(index + 1), 5500)
    return () => clearInterval(timer)
  }, [index, paused]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleScroll = () => {
    const track = trackRef.current
    if (!track) return
    const i = Math.round(track.scrollLeft / track.clientWidth)
    if (i !== index) setIndex(i)
  }

  return (
    <div
      className="lp-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="lp-carousel-track" ref={trackRef} onScroll={handleScroll}>
        {slides.map((s, i) => (
          <div className="lp-carousel-slide" key={i}>
            <img src={s.img} alt={s.caption} className="lp-carousel-img" loading="lazy" />
            <div className="lp-carousel-caption">{s.caption}</div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="lp-carousel-arrow lp-carousel-arrow-prev"
        onClick={() => goTo(index - 1)}
        aria-label="Imagen anterior"
      >
        ‹
      </button>
      <button
        type="button"
        className="lp-carousel-arrow lp-carousel-arrow-next"
        onClick={() => goTo(index + 1)}
        aria-label="Siguiente imagen"
      >
        ›
      </button>

      <div className="lp-carousel-dots">
        {slides.map((_, i) => (
          <button
            type="button"
            key={i}
            className={`lp-carousel-dot${i === index ? ' lp-carousel-dot-active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Ir a la imagen ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default function Screen0_Landing() {
  const { goToScreen, adPlacement } = useCalculator()
  const [pulsed, setPulsed] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setPulsed(true)
      setTimeout(() => setPulsed(false), 400)
    }, 8000)
    return () => clearTimeout(t)
  }, [])

  const handleCalcCTA = () => {
    trackEvent('cta_click', { tipo: 'calculadora_landing', placement: adPlacement })
    trackPixelCustom('CTAClick', { tipo: 'calculadora_landing' })
    goToScreen(1)
  }

  const handleWA = () => {
    trackEvent('cta_click', { tipo: 'whatsapp_landing', placement: adPlacement })
    trackPixelCustom('CTAClick', { tipo: 'whatsapp_landing' })
  }

  return (
    <div className="lp">
      {/* NAV */}
      <nav className="lp-nav">
        <a href="#" className="lp-nav-logo">WR<span>.</span>Energy</a>
        <span className="lp-nav-tag">Puerto Escondido, Oax.</span>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <p className="lp-eyebrow">Respaldo de energía · Costa de Oaxaca</p>
        <h1 className="lp-headline">
          Cuando se va<br />la luz, tu casa<br /><span className="lp-accent">sigue encendida.</span>
        </h1>
        <p className="lp-body">
          En la costa la luz se va y no avisa. Tu refri, tu clima, tu bomba y tu internet se apagan contigo. Un sistema de baterías entra solo en milisegundos — ni te enteras del apagón.
        </p>
        <button
          onClick={handleCalcCTA}
          className="lp-btn-primary"
          style={{ maxWidth: '360px', marginTop: '2rem' }}
        >
          ⚡ Calcula tu respaldo en 2 minutos
        </button>
        <p className="lp-hero-trust">Sin ruido · Sin humo · Sin gasolina · Sin mantenimiento</p>
      </section>

      {/* PAIN */}
      <section className="lp-section">
        <p className="lp-section-label">El problema</p>
        <h2 className="lp-section-title">Un apagón afecta<br />toda tu casa</h2>
        <p className="lp-section-sub">En la costa de Oaxaca, los apagones duran horas. Y cada hora tiene un costo.</p>

        <div className="lp-pain-grid">
          {PAIN_CARDS.map((c) => (
            <div key={c.title} className="lp-pain-card">
              <div className="lp-pain-icon">{c.icon}</div>
              <div className="lp-pain-title">{c.title}</div>
              <div className="lp-pain-desc">{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARE */}
      <section className="lp-section">
        <p className="lp-section-label">La solución</p>
        <h2 className="lp-section-title">Deja el generador atrás</h2>

        <div className="lp-compare-grid">
          <div className="lp-compare-col lp-bad">
            <div className="lp-compare-header">Generador de diésel</div>
            {BAD_ITEMS.map((item) => (
              <div key={item} className="lp-compare-item">
                <span className="lp-compare-icon">✕</span><span>{item}</span>
              </div>
            ))}
          </div>
          <div className="lp-compare-col lp-good">
            <div className="lp-compare-header">Sistema WR Energy</div>
            {GOOD_ITEMS.map((item) => (
              <div key={item} className="lp-compare-item">
                <span className="lp-compare-icon">✓</span><span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="lp-section">
        <p className="lp-section-label">Cómo funciona</p>
        <h2 className="lp-section-title">Tres pasos y listo</h2>

        <div className="lp-steps">
          {STEPS.map((s) => (
            <div key={s.n} className="lp-step">
              <div className="lp-step-num">{s.n}</div>
              <div>
                <div className="lp-step-title">{s.title}</div>
                <div className="lp-step-desc">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="lp-section">
        <p className="lp-section-label">Por qué la costa de Oaxaca</p>
        <h2 className="lp-section-title">Los números</h2>

        <div className="lp-stats-grid">
          {STATS.map((s) => (
            <div key={s.num} className="lp-stat-card">
              <div className="lp-stat-num">{s.num}</div>
              <div className="lp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROOF */}
      <section className="lp-section">
        <p className="lp-section-label">Lo que dicen</p>
        <h2 className="lp-section-title">Trato cercano,<br />conocimiento real</h2>
        <p className="lp-credibility-badge">🔧 10+ años de experiencia en sistemas de paneles solares y de almacenamiento de energía</p>

        <div className="lp-proof-grid">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="lp-proof-card">
              <p className="lp-proof-text">"{t.quote}"</p>
              <p className="lp-proof-attr"><span>{t.name}</span> · Costa de Oaxaca</p>
            </div>
          ))}
        </div>
      </section>

      {/* GALLERY */}
      <section className="lp-section">
        <p className="lp-section-label">Instalaciones</p>
        <h2 className="lp-section-title">Así se ve en la costa</h2>
        <Carousel slides={CAROUSEL_SLIDES} />
      </section>

      {/* FOOTER CTA */}
      <section className="lp-footer-cta" id="calc">
        <h2 className="lp-big-q">
          ¿Qué quieres respaldar<br />en tu <span className="lp-accent">casa?</span>
        </h2>
        <p>Usa la calculadora y en 2 minutos sabes qué sistema necesitas y cuánto cuesta.</p>
        <button
          onClick={handleCalcCTA}
          className="lp-btn-primary"
          style={{ maxWidth: '360px', margin: '0 auto 0.75rem' }}
        >
          ⚡ Calcula tu respaldo en 2 minutos
        </button>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="lp-btn-secondary"
          style={{ maxWidth: '360px', margin: '0 auto 0.75rem' }}
          onClick={handleWA}
        >
          💬 Prefiero hablar por WhatsApp
        </a>
        <p className="lp-payment-note">
          💳 60% de anticipo + 40% contra instalación
          <br />
          📱 O meses sin intereses a 3, 6, 9 o 12 con Mercado Pago (sistemas portátiles)
        </p>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
          Gratis · Sin compromiso · Puerto Escondido y alrededores
        </p>
      </section>

      {/* CTA FIXED */}
      <div className="lp-cta-fixed">
        <div style={{ display: 'flex', gap: '0.625rem', maxWidth: '480px', margin: '0 auto' }}>
          <button
            onClick={handleCalcCTA}
            className={`lp-btn-primary${pulsed ? ' lp-pulsed' : ''}`}
            style={{ flex: 1 }}
          >
            ⚡ Calcular
          </button>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="lp-btn-wa"
            onClick={handleWA}
            style={{ flex: 1 }}
          >
            💬 WhatsApp
          </a>
        </div>
        <p className="lp-cta-sub">Gratis · Sin compromiso · Respuesta inmediata</p>
      </div>
    </div>
  )
}
