# 📐 Especificación Técnica — Calculadora de Respaldo Energético

**Proyecto:** WR Energy PMX · Calculadora Mobile-First de Respaldo Eléctrico
**Versión:** 1.0
**Stack:** React (frontend) + FastAPI (backend) + Google Sheets API (datos)
**Filosofía:** Mobile-first · Bilingüe (ES/EN) · Vibe Coding

---

## 1. Visión General

Aplicación web de 3 pantallas que permite a usuarios no técnicos calcular sus necesidades de respaldo energético, captura sus datos como lead, y los redirige a WhatsApp para conversión.

**Objetivo de negocio:** Convertir tráfico de redes sociales y sitio web en leads cualificados para WR Energy PMX, con datos enriquecidos (equipos, demanda calculada, sistema recomendado, costo).

**Flujo macro:**
```
Lead Capture → Selección de Equipos → Resultados → WhatsApp + Lead a Sheets
```

---

## 2. Estructura de Carpetas

```
wr-energy-calculator/
│
├── backend/
│   ├── venv/                          # Entorno virtual (no se sube a git)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # Entry point FastAPI
│   │   ├── config.py                  # Carga de variables de entorno
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── equipment.py           # GET /get-equipment
│   │   │   ├── systems.py             # GET /get-systems
│   │   │   └── leads.py               # POST /save-lead
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── sheets_service.py      # Wrapper Google Sheets API
│   │   │   └── calculator.py          # Lógica de "Immediate Superior"
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── schemas.py             # Pydantic models
│   │   └── utils/
│   │       └── validators.py
│   ├── credentials/
│   │   └── service_account.json       # Google Service Account (gitignored)
│   ├── .env                           # Variables de entorno (gitignored)
│   ├── .env.example                   # Plantilla pública
│   ├── .gitignore
│   ├── requirements.txt
│   └── README.md
│
├── frontend/
│   ├── public/
│   │   ├── favicon.ico
│   │   └── logo-wr-energy-pmx.svg
│   ├── src/
│   │   ├── main.jsx                   # Entry point React
│   │   ├── App.jsx                    # Router + layout
│   │   ├── index.css                  # Tailwind base + custom
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx         # Logo + toggle ES/EN
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── ProgressBar.jsx    # Indicador 1/2/3
│   │   │   ├── screens/
│   │   │   │   ├── Screen1_LeadCapture.jsx
│   │   │   │   ├── Screen2_Equipment.jsx
│   │   │   │   └── Screen3_Results.jsx
│   │   │   ├── ui/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Dropdown.jsx
│   │   │   │   ├── SystemCard.jsx     # Card de sistema recomendado
│   │   │   │   └── LanguageToggle.jsx
│   │   │   └── calculator/
│   │   │       ├── EquipmentRow.jsx
│   │   │       └── EquipmentTable.jsx
│   │   ├── hooks/
│   │   │   ├── useCalculator.js       # Estado global del calculador
│   │   │   └── useApi.js              # Wrapper fetch
│   │   ├── context/
│   │   │   └── CalculatorContext.jsx  # Context API para estado compartido
│   │   ├── i18n/
│   │   │   ├── index.js               # Config i18next
│   │   │   ├── es.json
│   │   │   └── en.json
│   │   ├── services/
│   │   │   └── api.js                 # Funciones fetch a backend
│   │   └── utils/
│   │       └── whatsapp.js            # Builder del link de WhatsApp
│   ├── .env                           # VITE_API_URL, etc. (gitignored)
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── README.md
│
├── docs/
│   └── google-sheets-setup.md         # Guía de configuración del Service Account
│
└── README.md                          # README principal del proyecto
```

---

## 3. Configuración del Entorno

### 3.1 Backend — Entorno Virtual

```bash
# Desde la carpeta backend/
python3 -m venv venv
source venv/bin/activate            # Mac/Linux
# venv\Scripts\activate              # Windows
pip install -r requirements.txt
```

### 3.2 `requirements.txt`

```
fastapi==0.115.0
uvicorn[standard]==0.32.0
pydantic==2.9.2
google-api-python-client==2.149.0
google-auth==2.35.0
google-auth-oauthlib==1.2.1
python-dotenv==1.0.1
python-multipart==0.0.12
```

### 3.3 Variables de Entorno

**`backend/.env.example`:**
```env
# Google Sheets
GOOGLE_SHEETS_ID=1AbC_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_SERVICE_ACCOUNT_JSON=./credentials/service_account.json

# CORS
FRONTEND_URL=http://localhost:5173

# WhatsApp (sin + ni espacios, formato internacional)
WHATSAPP_NUMBER=5219541234567

# Server
PORT=8000
ENVIRONMENT=development
```

**`frontend/.env.example`:**
```env
VITE_API_URL=http://localhost:8000
VITE_DEFAULT_LANG=es
```

### 3.4 `.gitignore` (raíz y subcarpetas)

```
# Python
venv/
__pycache__/
*.pyc

# Node
node_modules/
dist/

# Environment
.env
*.env.local

# Credentials
credentials/*.json
!credentials/.gitkeep

# OS
.DS_Store
Thumbs.db
```

---

## 4. Arquitectura de Datos (Google Sheets)

### 4.1 Workbook Único — 3 Pestañas

#### Hoja `equipos`
| Columna | Tipo | Ejemplo |
|---------|------|---------|
| equipo | string | Refrigerador |
| potencia_w | number | 350 |

#### Hoja `sistemas`
| Columna | Tipo | Ejemplo |
|---------|------|---------|
| marca | string | Ecoflow |
| modelo | string | Delta Pro Ultra |
| capacidad_bateria_kwh | number | 6 |
| potencia_sistema_w | number | 4000 |
| precio_usd | number | 5800 |
| caracteristicas | string | "Modular, expandible hasta 90 kWh, app móvil..." |

#### Hoja `leads`
| Columna | Tipo | Ejemplo |
|---------|------|---------|
| nombre | string | Daniela Ramírez |
| whatsapp | string | +52 954 123 4567 |
| email | string | dani@hotelboutique.mx |
| sistema_recomendado | string | "Ecoflow Delta Pro Ultra · Enphase IQ Battery 10" |
| costo_total | number | 6500 |
| fecha | ISO 8601 | 2026-05-08T14:32:00Z |

### 4.2 Autenticación — Service Account

1. Crear proyecto en Google Cloud Console.
2. Habilitar Google Sheets API.
3. Crear Service Account y descargar JSON key.
4. Compartir el Sheet con el email del Service Account (rol **Editor**).
5. Guardar el JSON en `backend/credentials/service_account.json`.

Detalles paso a paso en `docs/google-sheets-setup.md`.

---

## 5. Motor de Cálculo

### 5.1 Fórmulas

```
Demanda por equipo (W)     = Cantidad × Potencia
Demanda total circuito (W) = Σ Demandas por equipo
Potencia del sistema (W)   = Demanda total × 0.70
Capacidad banco (kWh)      = (Potencia del sistema × Horas_respaldo) / 1000 × 0.40

       └─ NOTA: el 0.40 representa el factor de uso real del sistema
          durante el respaldo, según especificación del proyecto.
```

**Default `Horas_respaldo` = 4** (editable por el usuario en pantalla 3).

### 5.2 Regla "Immediate Superior"

De los sistemas filtrados por marca (Ecoflow o Enphase), elegir el sistema que cumpla **simultáneamente**:

- `capacidad_bateria_kwh >= capacidad_requerida_kwh`
- `potencia_sistema_w >= potencia_requerida_w`

De los que cumplan, elegir el de **menor capacidad** (el más cercano por arriba). Si hay empate en capacidad, desempata por **menor precio**.

**Nunca redondear hacia abajo.** Si ningún sistema del catálogo cumple, devolver el más grande disponible con un flag `needs_custom_quote: true`.

### 5.3 Pseudocódigo Python — `services/calculator.py`

```python
def calculate_requirements(equipment_list: list[dict], hours_backup: float = 4) -> dict:
    """
    equipment_list: [{'equipo': 'Refrigerador', 'cantidad': 1, 'potencia_w': 350}, ...]
    """
    total_demand_w = sum(item['cantidad'] * item['potencia_w'] for item in equipment_list)
    system_power_w = total_demand_w * 0.70
    battery_kwh = (system_power_w * hours_backup) / 1000 * 0.40

    return {
        'total_demand_w': total_demand_w,
        'system_power_w': system_power_w,
        'battery_kwh_required': battery_kwh,
        'hours_backup': hours_backup,
    }


def select_immediate_superior(systems: list[dict], required_kwh: float, required_w: float, brand: str) -> dict | None:
    """
    Filtra por marca y devuelve el sistema 'Immediate Superior'.
    Retorna None si no hay coincidencia, junto con flag needs_custom_quote.
    """
    candidates = [
        s for s in systems
        if s['marca'].lower() == brand.lower()
        and s['capacidad_bateria_kwh'] >= required_kwh
        and s['potencia_sistema_w'] >= required_w
    ]

    if not candidates:
        # Fallback: el más grande disponible de esa marca
        brand_systems = [s for s in systems if s['marca'].lower() == brand.lower()]
        if not brand_systems:
            return None
        biggest = max(brand_systems, key=lambda s: s['capacidad_bateria_kwh'])
        return {**biggest, 'needs_custom_quote': True}

    # Ordenar por capacidad ascendente, desempate por precio
    candidates.sort(key=lambda s: (s['capacidad_bateria_kwh'], s['precio_usd']))
    return {**candidates[0], 'needs_custom_quote': False}


def recommend_systems(equipment_list: list[dict], systems: list[dict], hours_backup: float = 4) -> dict:
    """Orquestador: calcula requerimientos y selecciona sistemas Ecoflow + Enphase."""
    requirements = calculate_requirements(equipment_list, hours_backup)

    ecoflow = select_immediate_superior(
        systems, requirements['battery_kwh_required'], requirements['system_power_w'], 'Ecoflow'
    )
    enphase = select_immediate_superior(
        systems, requirements['battery_kwh_required'], requirements['system_power_w'], 'Enphase'
    )

    return {
        'requirements': requirements,
        'recommendations': {
            'ecoflow': ecoflow,
            'enphase': enphase,
            'victron_pytes': None,  # Placeholder UI únicamente
        },
    }
```

---

## 6. API Endpoints (FastAPI)

### 6.1 `GET /get-equipment`

Devuelve el catálogo de equipos desde la hoja `equipos`.

**Response 200:**
```json
{
  "equipment": [
    { "equipo": "Refrigerador", "potencia_w": 350 },
    { "equipo": "Aire Acondicionado 1 ton", "potencia_w": 1200 },
    { "equipo": "Iluminación LED (10 focos)", "potencia_w": 100 }
  ]
}
```

### 6.2 `GET /get-systems`

Devuelve el catálogo de sistemas desde la hoja `sistemas`.

**Response 200:**
```json
{
  "systems": [
    {
      "marca": "Ecoflow",
      "modelo": "Delta Pro Ultra",
      "capacidad_bateria_kwh": 6,
      "potencia_sistema_w": 4000,
      "precio_usd": 5800,
      "caracteristicas": "Modular, expandible hasta 90 kWh, app móvil"
    }
  ]
}
```

### 6.3 `POST /save-lead`

Recibe los datos del lead + resultado calculado y los inserta en la hoja `leads`.

**Request Body:**
```json
{
  "nombre": "Daniela Ramírez",
  "whatsapp": "+52 954 123 4567",
  "email": "dani@hotelboutique.mx",
  "sistema_recomendado": "Ecoflow Delta Pro Ultra | Enphase IQ Battery 10",
  "costo_total": 11600
}
```

**Response 201:**
```json
{ "ok": true, "row_inserted": 47 }
```

**Response 400:** Validación fallida (Pydantic).
**Response 500:** Error de Google Sheets API.

### 6.4 Modelos Pydantic — `models/schemas.py`

```python
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class Equipment(BaseModel):
    equipo: str
    potencia_w: float

class System(BaseModel):
    marca: str
    modelo: str
    capacidad_bateria_kwh: float
    potencia_sistema_w: float
    precio_usd: float
    caracteristicas: str

class LeadInput(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    whatsapp: str = Field(..., min_length=10)
    email: Optional[EmailStr] = None
    sistema_recomendado: str
    costo_total: float
    fecha: Optional[datetime] = None
```

### 6.5 CORS

Habilitar CORS solo para el origen del frontend (`FRONTEND_URL` desde `.env`).

---

## 7. Frontend — Componentes y Estado

### 7.1 Estado Global (Context API)

```jsx
// CalculatorContext provee:
{
  // Lead data (Pantalla 1)
  lead: { nombre: '', whatsapp: '', email: '' },
  setLead: (data) => {},

  // Equipment selection (Pantalla 2)
  equipmentList: [{ equipo: '', cantidad: 1, potencia_w: 0 }],
  addRow: () => {},
  updateRow: (idx, field, value) => {},
  removeRow: (idx) => {},

  // Results (Pantalla 3)
  hoursBackup: 4,
  setHoursBackup: (n) => {},
  results: null,            // { requirements, recommendations }
  calculating: false,

  // Catalogs (cargados al montar la app)
  equipmentCatalog: [],
  systemsCatalog: [],

  // Navigation
  currentScreen: 1,
  goToScreen: (n) => {},
}
```

### 7.2 Pantalla 1 — Lead Capture

**Componente:** `Screen1_LeadCapture.jsx`

**Layout (mobile-first):**
- Logo WR Energy PMX centrado arriba.
- Headline grande en Barlow Condensed Bold: "Calcula tu respaldo en 2 minutos" / "Calculate your backup in 2 minutes".
- Subtítulo en Inter Regular: "Energía que no se apaga." / "Power that doesn't quit."
- Formulario:
  - Input: `Nombre` * (validación: min 2 caracteres).
  - Input: `WhatsApp` * (validación: regex teléfono internacional).
  - Input: `Email` (opcional, si se llena valida formato).
- Botón CTA grande: **"Siguiente →"** / **"Next →"** (amarillo solar, deshabilitado hasta validación correcta).
- Mensaje de privacidad pequeño abajo: "Solo usaremos tus datos para contactarte."

**Estado local:** validaciones por campo + flag `isValid`.
**Acción al click "Siguiente":** `setLead(formData); goToScreen(2)`.

### 7.3 Pantalla 2 — Selección de Equipos

**Componente:** `Screen2_Equipment.jsx`

**Layout:**
- ProgressBar arriba (2 de 3).
- Título: "¿Qué equipos necesitas respaldar?" / "What equipment do you need to back up?"
- **Tabla interactiva** (4 filas iniciales, scroll vertical en mobile):

| Equipo (dropdown) | Cantidad | Demanda (W) | 🗑️ |
|-------------------|----------|-------------|-----|
| [Refrigerador ▼]  | [ 1 ]    | 350         | ❌  |
| ...               | ...      | ...         |     |

  - **Equipo:** Dropdown poblado desde `equipmentCatalog`.
  - **Cantidad:** Numeric input, mín 1, default 1.
  - **Demanda (W):** Auto-calculada (`cantidad × potencia_w`), no editable.
  - **🗑️:** Botón eliminar fila.
- Botón secundario: **"+ Agregar fila"** / **"+ Add row"**.
- Footer fijo en mobile: total acumulado + botón **"Calcular →"** / **"Calculate →"**.

**Acción al click "Calcular":**
1. Validar al menos 1 fila con equipo seleccionado y cantidad > 0.
2. POST a backend (o cálculo local si systems ya están cargados).
3. Actualizar `results` en contexto.
4. `goToScreen(3)`.

### 7.4 Pantalla 3 — Resultados y Conversión

**Componente:** `Screen3_Results.jsx`

**Layout (mobile = stack vertical, desktop = 2 columnas):**

**Columna Izquierda — Resumen:**
- Card con tabla resumen de equipos seleccionados (read-only).
- Métricas grandes:
  - Demanda total: `XXXX W`
  - Potencia del sistema: `XXXX W`
  - Capacidad necesaria: `XX.X kWh`

**Columna Derecha — Sistemas Recomendados:**
- **Slider/input editable** "Horas de respaldo" / "Hours of backup":
  - Valor default: 4. Rango sugerido: 2–24.
  - **Recalcula en tiempo real** al cambiar (debounce 300 ms).
- 3 cards de sistema:
  - **Card Ecoflow:** logo, modelo, precio USD, características, badge "Recomendado" si cumple.
  - **Card Enphase:** mismo formato.
  - **Card Victron + Pytes:** placeholder "Cotización personalizada — habla con nosotros." (sin precio).
- Si algún card tiene `needs_custom_quote: true`, mostrar: "Tu necesidad excede nuestro catálogo estándar. Te contactaremos con una propuesta a medida."

**CTA de Conversión:**
- Botón verde grande: **"Me interesa"** / **"I'm interested"**.
- Acción 1: `POST /save-lead` con todos los datos.
- Acción 2: redirigir a `https://wa.me/{WHATSAPP_NUMBER}?text={mensaje}` con mensaje pre-llenado:

```
Hola, acabo de usar la calculadora y obtuve estos resultados:
- Demanda: XXXX W
- Capacidad necesaria: XX.X kWh
- Sistema Ecoflow recomendado: [modelo] · $X,XXX USD
- Sistema Enphase recomendado: [modelo] · $X,XXX USD
Estoy interesado.
```

(El mensaje se construye en `utils/whatsapp.js` y se URL-encode.)

### 7.5 Internacionalización (i18next)

**Setup en `frontend/src/i18n/index.js`:**
- Default: `es`.
- Toggle ES/EN visible en `Header.jsx` (esquina superior derecha).
- Persiste selección en `localStorage`.
- Archivos `es.json` y `en.json` con todas las strings de la UI organizadas por pantalla:

```json
// es.json (extracto)
{
  "screen1": {
    "headline": "Calcula tu respaldo en 2 minutos",
    "subtitle": "Energía que no se apaga.",
    "name_label": "Nombre",
    "whatsapp_label": "WhatsApp",
    "email_label": "Email (opcional)",
    "next_button": "Siguiente"
  },
  "screen2": { ... },
  "screen3": { ... }
}
```

---

## 8. Implementación de Estilo (Tailwind + Brand)

### 8.1 `tailwind.config.js`

```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'azul-tormenta': '#1B2A4A',
        'amarillo-solar': '#F4C430',
        'carbon': '#1A1A1A',
        'hueso': '#F2F2F2',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body: ['Inter', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        // Mobile-first: tamaños base pequeños, escalan con breakpoints
        'h1-mobile': ['32px', { lineHeight: '1.1', fontWeight: '700' }],
        'h1-desktop': ['48px', { lineHeight: '1.1', fontWeight: '700' }],
      },
      spacing: {
        // Espaciados según regla 60-30-10 del brandbook
      },
    },
  },
  plugins: [],
}
```

### 8.2 Reglas de Aplicación (Brandbook → Código)

| Elemento | Tailwind |
|----------|----------|
| Fondo principal | `bg-white` o `bg-hueso` |
| Headers / bloques estructurales | `bg-azul-tormenta text-white` |
| Tipografía cuerpo | `font-body text-carbon text-base` |
| Headlines | `font-display font-bold text-azul-tormenta` |
| CTA principal | `bg-amarillo-solar text-carbon font-display font-bold uppercase tracking-wide hover:brightness-95` |
| CTA secundario | `border border-azul-tormenta text-azul-tormenta hover:bg-azul-tormenta hover:text-white` |
| Botón "Me interesa" (conversión) | `bg-green-600 text-white font-display font-bold` (excepción brand para CTA crítico) |
| Cards | `bg-white border border-hueso rounded-2xl shadow-sm p-6` |
| Inputs | `border border-hueso rounded-lg px-4 py-3 focus:border-azul-tormenta focus:outline-none` |
| Datos técnicos (kWh, W) | `font-mono text-carbon` |

### 8.3 Mobile-First Breakpoints

```
default: < 640px  (mobile)
sm:      ≥ 640px  (tablet pequeña)
md:      ≥ 768px  (tablet)
lg:      ≥ 1024px (desktop)
```

**Regla:** todo se diseña primero en mobile (375px), luego se escala. La tabla de equipos en mobile se vuelve cards verticales si el ancho es <640px.

### 8.4 Importación de Fuentes

En `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

---

## 9. Hooks de Lógica (Resumen)

### Backend

| Función | Archivo | Propósito |
|---------|---------|-----------|
| `calculate_requirements()` | `services/calculator.py` | Calcula demanda, potencia y capacidad |
| `select_immediate_superior()` | `services/calculator.py` | Selección de sistema por marca |
| `recommend_systems()` | `services/calculator.py` | Orquestador principal |
| `read_sheet(sheet_name)` | `services/sheets_service.py` | Lectura genérica de pestaña |
| `append_row(sheet_name, row)` | `services/sheets_service.py` | Inserta fila en `leads` |

### Frontend

| Hook | Archivo | Propósito |
|------|---------|-----------|
| `useCalculator()` | `hooks/useCalculator.js` | Estado global del calculador |
| `useApi()` | `hooks/useApi.js` | Fetch wrapper con loading/error |
| `useTranslation()` | i18next builtin | Strings traducidas |

---

## 10. Comandos de Arranque

### Backend
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev    # Vite en http://localhost:5173
```

---

## 11. Checklist de Implementación

- [ ] Setup repo + estructura de carpetas
- [ ] Backend: venv + requirements + `.env`
- [ ] Backend: Service Account de Google + permisos al Sheet
- [ ] Backend: implementar `sheets_service.py`
- [ ] Backend: implementar `calculator.py` + tests unitarios de "Immediate Superior"
- [ ] Backend: 3 endpoints + CORS
- [ ] Frontend: Vite + React + Tailwind + i18next
- [ ] Frontend: paleta + fuentes en `tailwind.config.js`
- [ ] Frontend: Context global + 3 pantallas
- [ ] Frontend: Toggle ES/EN funcional
- [ ] Frontend: integración WhatsApp con mensaje pre-llenado
- [ ] Pruebas end-to-end en mobile (375px) y desktop (1024px+)
- [ ] Deploy: backend (Render/Railway) + frontend (Vercel/Netlify)

---

**WR Energy PMX · Energía que no se apaga.**
