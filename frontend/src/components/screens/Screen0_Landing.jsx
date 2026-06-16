import { useState, useEffect } from 'react'
import './Screen0_Landing.css'

const LOSS_PER_SECOND = 900 / 3600
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || ''
const WHATSAPP_MESSAGE = 'Hola, me interesa instalar un sistema de respaldo, ¿me pueden dar más información?'
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

const PAIN_CARDS = [
  { icon: '🥩', title: 'Merma de alimentos', desc: 'Refrigeradores y congeladores se calientan en <2 horas' },
  { icon: '🔒', title: 'Cierre forzado', desc: 'Sin luz no puedes operar ni cobrar con terminal' },
  { icon: '💳', title: 'POS caído', desc: 'La mayoría de tus clientes paga con tarjeta' },
  { icon: '🌧️', title: 'Temporada de lluvias', desc: 'Jun–Nov: apagones frecuentes y largos en toda la costa' },
]

const BAD_ITEMS = ['Gasolina cada apagón', 'Ruido que molesta', 'Arranque manual', 'Mantenimiento constante', 'Humo y emisiones', 'No baja tu recibo CFE']
const GOOD_ITEMS = ['Sin combustible', 'Silencioso, cero ruido', 'Automático en segundos', 'Sin mantenimiento continuo', 'Cero emisiones', 'Baja tu recibo de CFE']

const STEPS = [
  { n: '1', title: 'Calcula tu respaldo en 2 minutos', desc: 'Usa nuestra calculadora para seleccionar tus equipos críticos y ver la capacidad de batería que necesitas. Sin formularios largos.' },
  { n: '2', title: 'Evaluación gratuita en sitio', desc: 'Vamos a tu negocio, analizamos tu consumo y tus cargas críticas. Te decimos exactamente qué necesitas — y qué no necesitas.' },
  { n: '3', title: 'Propuesta con números reales', desc: 'Te mostramos cuánto pierdes hoy vs. cuánto costaría el sistema y cuándo se paga solo. Sin sorpresas.' },
  { n: '4', title: 'Instalación y listo', desc: 'Instalamos en días, no semanas. Monitoreo remoto activo desde el primer día. Soporte local permanente — a minutos de ti.' },
]

const STATS = [
  { num: '84', label: 'Interés de búsqueda en Oaxaca por respaldo eléctrico' },
  { num: '6 m', label: 'Temporada de lluvias con apagones frecuentes' },
  { num: 'DAC', label: 'Tarifa castigada de CFE que aplica a negocios con alta carga' },
  { num: '0', label: 'Costo de combustible con sistema de baterías instalado' },
]

export default function Screen0_Landing() {
  const [loss, setLoss] = useState(0)
  const [pulsed, setPulsed] = useState(false)

  useEffect(() => {
    const start = Date.now()
    const interval = setInterval(() => {
      setLoss(((Date.now() - start) / 1000) * LOSS_PER_SECOND)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      setPulsed(true)
      setTimeout(() => setPulsed(false), 400)
    }, 8000)
    return () => clearTimeout(t)
  }, [])

  const fmt = (n) => '$' + Math.floor(n).toLocaleString('es-MX')
  const handleCTA = () => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'click_whatsapp', { event_category: 'lead', event_label: 'landing_cta' })
    }
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
        <p className="lp-eyebrow">Respaldo de energía para negocios</p>
        <h1 className="lp-headline">
          Cada apagón<br />te cuesta<br /><span className="lp-accent">dinero real.</span>
        </h1>

        <div className="lp-loss-block">
          <p className="lp-loss-label">Lo que llevas perdido hoy</p>
          <div className="lp-loss-counter">{fmt(loss)}</div>
          <p className="lp-loss-sublabel">
            Basado en promedio de <span>restaurante en Puerto Escondido</span> —{' '}
            <a href="#calc" className="lp-link">calcula el tuyo</a>
          </p>
        </div>

        <p className="lp-body">
          Somos el único especialista en sistemas de respaldo con baterías y energía solar radicado en Puerto Escondido. Sin gasolina, sin ruido, sin mantenimiento — y tu negocio sigue operando aunque toda la calle esté a oscuras.
        </p>
      </section>

      {/* PAIN */}
      <section className="lp-section">
        <p className="lp-section-label">El problema</p>
        <h2 className="lp-section-title">Un apagón no es solo incómodo</h2>
        <p className="lp-section-sub">En Puerto Escondido, los apagones duran horas. Y cada hora tiene un costo real.</p>

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
        <h2 className="lp-section-title">Simple y rápido</h2>

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
        <p className="lp-section-label">Por qué Puerto Escondido</p>
        <h2 className="lp-section-title">Los números de la costa</h2>

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
        <h2 className="lp-section-title">Negocios que ya no se apagan</h2>

        <div className="lp-proof-box">
          <p className="lp-proof-text">
            "Antes cada que se iba la luz yo sentía que perdía dinero y no podía hacer nada. Ahora el sistema prende solo y mis clientes ni se enteran. Ya no gasto en gasolina para la planta."
          </p>
          <p className="lp-proof-attr"><span>Dueño de restaurante</span> · Puerto Escondido, Oaxaca</p>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="lp-footer-cta" id="calc">
        <h2 className="lp-big-q">
          ¿Cuánto te cuesta<br />el próximo <span className="lp-accent">apagón?</span>
        </h2>
        <p>Descúbrelo en 2 minutos. Selecciona tus equipos, obtén la capacidad que necesitas y recibe tu propuesta por WhatsApp.</p>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="lp-btn-calc"
          style={{ maxWidth: '360px', margin: '0 auto 0.75rem' }}
          onClick={handleCTA}
        >
          💬 Escríbenos por WhatsApp →
        </a>
        <p style={{ fontSize: '11px', color: 'var(--lp-gray4)', margin: 0 }}>
          Gratis · Sin compromiso · Puerto Escondido y alrededores
        </p>
      </section>

      {/* CTA FIXED */}
      <div className="lp-cta-fixed">
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`lp-btn-calc${pulsed ? ' lp-pulsed' : ''}`}
          onClick={handleCTA}
        >
          💬 Escríbenos por WhatsApp →
        </a>
        <p className="lp-cta-sub">Gratis · Sin compromiso · Respuesta inmediata</p>
      </div>
    </div>
  )
}
