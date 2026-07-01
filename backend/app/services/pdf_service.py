import logging
from datetime import datetime
from jinja2 import Template
from weasyprint import HTML

logger = logging.getLogger(__name__)

_MESES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]


def _fecha_es(dt: datetime) -> str:
    """Cross-platform, locale-independent Spanish date."""
    return f"{dt.day} de {_MESES[dt.month - 1]} de {dt.year}"


# ---------------------------------------------------------------------------
# HTML template — brand: navy #1B2A4A, orange #F97316, cream #FAF7F2
# Barlow Condensed loaded via Google Fonts (WeasyPrint resolves remote URLs)
# ---------------------------------------------------------------------------
_HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Barlow Condensed', 'Arial Narrow', Arial, sans-serif;
  background: #FAF7F2;
  color: #1B2A4A;
  font-size: 13px;
  line-height: 1.45;
}

.page { padding: 40px 48px; }

/* ── Header ── */
.header {
  background: #1B2A4A;
  color: white;
  padding: 20px 28px;
  margin: -40px -48px 28px;
}
.header-row { display: flex; justify-content: space-between; align-items: flex-start; }
.brand { font-size: 26px; font-weight: 700; letter-spacing: 1px; }
.brand-dot { color: #F97316; }
.brand-sub {
  font-size: 10px; font-weight: 600; letter-spacing: 2px;
  text-transform: uppercase; opacity: 0.6; margin-top: 3px;
}
.header-meta { text-align: right; font-size: 11px; opacity: 0.65; line-height: 1.7; }

/* ── Doc heading ── */
.doc-title {
  font-size: 20px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 2px; color: #1B2A4A; margin-bottom: 2px;
}
.doc-note { font-size: 11px; color: #888; margin-bottom: 22px; }

/* ── Client block ── */
.client-block {
  border-left: 4px solid #F97316;
  padding: 10px 16px;
  background: white;
  margin-bottom: 26px;
}
.micro-label {
  font-size: 9px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 2px; color: #F97316; margin-bottom: 3px;
}
.client-name { font-size: 18px; font-weight: 700; color: #1B2A4A; }
.client-sub { font-size: 11px; color: #666; margin-top: 2px; }

/* ── Section heads ── */
.section-head {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 2px; color: #F97316;
  border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 12px;
}

/* ── Equipment table ── */
.eq-table { width: 100%; border-collapse: collapse; margin-bottom: 26px; font-size: 12px; }
.eq-table thead tr { background: #1B2A4A; color: white; }
.eq-table thead th {
  padding: 7px 10px; text-align: left;
  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
}
.eq-table thead th.r { text-align: right; }
.eq-table tbody tr:nth-child(even) { background: white; }
.eq-table tbody tr:nth-child(odd)  { background: #FAF7F2; }
.eq-table tbody td { padding: 6px 10px; border-bottom: 1px solid #e8e2da; }
.eq-table tbody td.r { text-align: right; }
.eq-table tfoot tr { background: #2d3f5e; color: white; font-weight: 700; }
.eq-table tfoot td { padding: 7px 10px; }
.eq-table tfoot td.r { text-align: right; }

/* ── Summary cards (3-column table layout, safe for WeasyPrint) ── */
.summary-table { width: 100%; border-collapse: collapse; margin-bottom: 26px; }
.summary-table td { width: 33%; vertical-align: top; }
.summary-table td:nth-child(2) { padding: 0 8px; }
.s-card {
  background: white; border: 1px solid #ddd;
  border-top: 3px solid #F97316; padding: 12px 16px;
}
.s-label {
  font-size: 9px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 2px; color: #999; margin-bottom: 5px;
}
.s-value { font-size: 22px; font-weight: 700; color: #1B2A4A; }
.s-unit { font-size: 11px; font-weight: 400; color: #999; }

/* ── System recommendation ── */
.system-box { background: #1B2A4A; color: white; padding: 16px 20px; margin-bottom: 22px; }
.system-inner { display: flex; justify-content: space-between; align-items: center; }
.system-tag {
  font-size: 9px; text-transform: uppercase; letter-spacing: 2px;
  opacity: 0.65; margin-bottom: 4px;
}
.system-name { font-size: 16px; font-weight: 700; }
.price-tag {
  font-size: 9px; text-transform: uppercase; letter-spacing: 2px;
  opacity: 0.65; margin-bottom: 4px; text-align: right;
}
.price-value { font-size: 22px; font-weight: 700; color: #F97316; text-align: right; }

/* ── Disclaimer ── */
.disclaimer {
  background: white; border: 1px solid #ddd;
  padding: 12px 16px; margin-bottom: 32px;
  font-size: 11px; color: #555; line-height: 1.6;
}

/* ── Footer ── */
.footer { border-top: 1px solid #ddd; padding-top: 12px; }
.footer-inner { display: flex; justify-content: space-between; font-size: 10px; color: #aaa; }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="header-row">
      <div>
        <div class="brand">WR<span class="brand-dot">.</span>Energy PXM</div>
        <div class="brand-sub">Sistemas de respaldo · Costa de Oaxaca</div>
      </div>
      <div class="header-meta">
        Ref: {{ lead_id }}<br>
        {{ fecha_str }}
      </div>
    </div>
  </div>

  <div class="doc-title">Propuesta Preliminar</div>
  <div class="doc-note">Sujeta a visita de diagnóstico en sitio</div>

  <!-- Client -->
  <div class="client-block">
    <div class="micro-label">Preparada para</div>
    <div class="client-name">{{ nombre }}</div>
    <div class="client-sub">{{ whatsapp }}{% if email %} · {{ email }}{% endif %}</div>
  </div>

  <!-- Equipment table -->
  <div class="section-head">Cargas seleccionadas</div>
  <table class="eq-table">
    <thead>
      <tr>
        <th>Equipo</th>
        <th class="r">Cant.</th>
        <th class="r">Potencia&nbsp;W</th>
        <th class="r">Demanda&nbsp;W</th>
      </tr>
    </thead>
    <tbody>
      {% for item in equipos %}
      <tr>
        <td>{{ item.equipo }}</td>
        <td class="r">{{ item.cantidad }}</td>
        <td class="r">{{ "%.0f"|format(item.potencia_w) }}</td>
        <td class="r">{{ "%.0f"|format(item.demanda_w) }}</td>
      </tr>
      {% endfor %}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="3">Demanda total</td>
        <td class="r">{{ "%.0f"|format(demanda_total_w) }}&nbsp;W</td>
      </tr>
    </tfoot>
  </table>

  <!-- Summary cards -->
  <div class="section-head">Capacidad recomendada</div>
  <table class="summary-table">
    <tr>
      <td>
        <div class="s-card">
          <div class="s-label">Potencia del sistema</div>
          <div class="s-value">{{ "%.1f"|format(potencia_kw) }}<span class="s-unit"> kW</span></div>
        </div>
      </td>
      <td>
        <div class="s-card">
          <div class="s-label">Banco de baterías</div>
          <div class="s-value">{{ "%.1f"|format(capacidad_kwh) }}<span class="s-unit"> kWh</span></div>
        </div>
      </td>
      <td>
        <div class="s-card">
          <div class="s-label">Horas de respaldo</div>
          <div class="s-value">{{ horas_respaldo|int }}<span class="s-unit"> hrs</span></div>
        </div>
      </td>
    </tr>
  </table>

  <!-- System recommendation -->
  <div class="section-head">Sistema recomendado</div>
  <div class="system-box">
    <div class="system-inner">
      <div>
        <div class="system-tag">Sistema</div>
        <div class="system-name">{{ sistema_recomendado }}</div>
      </div>
      <div>
        <div class="price-tag">Precio referencial</div>
        <div class="price-value">${{ "{:,.0f}".format(costo_total) }} USD</div>
      </div>
    </div>
  </div>

  <!-- Disclaimer -->
  <div class="disclaimer">
    <strong>Propuesta preliminar</strong> sujeta a visita de diagnóstico en sitio.
    Precio referencial con IVA incluido; el costo final puede variar según condiciones
    de instalación y tipo de cambio vigente.
    <strong>Sin comisiones de proveedor</strong> — WR Energy PXM trabaja directamente con el cliente.
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-inner">
      <div>WR Energy PXM · Puerto Escondido, Oaxaca, México</div>
      <div>wrenergymexico.com</div>
    </div>
  </div>

</div>
</body>
</html>"""


def generate_proposal_pdf(lead, fecha: datetime, lead_id: str) -> bytes:
    """
    Renders the proposal HTML template and returns PDF bytes.
    Does not write to disk — caller is responsible for storage.
    """
    fecha_str = _fecha_es(fecha) if hasattr(fecha, "strftime") else str(fecha)

    html_str = Template(_HTML_TEMPLATE).render(
        lead_id=lead_id,
        fecha_str=fecha_str,
        nombre=lead.nombre,
        whatsapp=lead.whatsapp,
        email=lead.email or "",
        equipos=lead.equipos,
        demanda_total_w=lead.demanda_total_w,
        potencia_kw=lead.potencia_necesaria_w / 1000,
        capacidad_kwh=lead.capacidad_necesaria_kwh,
        horas_respaldo=lead.horas_respaldo,
        sistema_recomendado=lead.sistema_recomendado,
        costo_total=lead.costo_total,
    )

    return HTML(string=html_str).write_pdf()
