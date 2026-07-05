# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project context

WR-Energy sells and installs BESS (battery energy storage systems) on the Oaxacan coast. This app is a lead-generation funnel: users select their appliances, get a system recommendation with pricing, and are routed to WhatsApp. The validated audience is men and women 35–55 living on the coast.

**Deployed:** Frontend → Netlify, Backend → Railway  
**Brand:** blue `#1f2f58` (`azul-wr` / `azul-tormenta`), orange `#f47c02` (`naranja-wr` / `amarillo-solar`), white. Mobile-first. Voice: direct, no-nonsense, technical but accessible.

---

## Commands

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # or source venv/bin/activate on Mac/Linux
pip install -r requirements.txt
cp .env.example .env            # fill in values
uvicorn app.main:app --reload --port 8000
```

Required `.env` keys: `GOOGLE_SHEETS_ID`, `GOOGLE_SERVICE_ACCOUNT_JSON`, `GOOGLE_STORAGE_BUCKET`, `FRONTEND_URL`, `WHATSAPP_NUMBER`, `PORT`, `ENVIRONMENT`. `GOOGLE_STORAGE_BUCKET` is required for PDF proposal upload; if unset, lead saving still succeeds but `proposal_url` comes back empty (see PDF/GCS section below).

For local dev, `GOOGLE_SERVICE_ACCOUNT_JSON` can be a file path (`./credentials/service_account.json`). In Railway production it holds the raw JSON string. The GCS bucket needs `allUsers:objectViewer` at the IAM level for public read access to proposal PDFs.

WeasyPrint (PDF generation) needs system libraries (Pango/Cairo/GDK-PixBuf) beyond `pip install` — see WeasyPrint's install docs for your OS if `POST /save-lead` raises `RuntimeError: WeasyPrint system libraries missing`.

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev        # starts at localhost:5174
npm run build
npm run preview
```

No test or lint script is configured (`package.json` only has `dev`/`build`/`preview`).

Required `.env` keys: `VITE_DEFAULT_LANG`, `VITE_WHATSAPP_NUMBER`, `VITE_CALENDLY_URL` (used by the "call" A/B group — see below). In dev, leave `VITE_API_URL` empty — Vite proxies all API calls (`/get-*`, `/save-*`, `/recommend`, `/health`, `/debug/*`) to `localhost:8000`, so there's no CORS issue. In prod, set `VITE_API_URL` to the Railway backend URL.

---

## Architecture

### Screen flow (no router — `currentScreen` integer in context)

```
Screen0_Landing → Screen1_LeadCapture → Screen2_Equipment → Screen3_Results
```

- **Screen0**: Landing page. CTA navigates to Screen1 (not WhatsApp).
- **Screen1** (`Screen1_LeadCapture.jsx`): Checkbox list of all cargas from `/get-equipment`. Checking an item shows a +/- counter (default 1). "Añadir" calls `POST /recommend` server-side and stores results in context, then transitions to Screen2.
- **Screen2** (`Screen2_Equipment.jsx`): Shows system recommendation (Ecoflow; Victron is always a placeholder in MVP) with MXN pricing (contado, anticipo/saldo 60/40, MSI monthly). Backup-hours slider debounces a new `POST /recommend` call. A sticky "Continuar" button (`sticky top-14`) sits above the editable equipment list. Changes in the lower list also trigger recalculation.
- **Screen3** (`Screen3_Results.jsx`): Contact form (nombre, WhatsApp, email — lead captured here, not at the start). On submit → `POST /save-lead` → confirmation screen with either a WhatsApp button or a Calendly button, depending on the A/B group (see below).

### A/B test: WhatsApp vs. Calendly call

`CalculatorContext` assigns each session an `abTestGroup` (`'pdf'` or `'call'`, 50/50 via `Math.random()`, fixed for the session). On the Screen3 confirmation view, the `'call'` group sees a Calendly button (`VITE_CALENDLY_URL`) instead of the WhatsApp button. `ab_test_group` is sent to `POST /save-lead` and logged to the `leads` sheet. Despite the `'pdf'` name, PDF proposal generation (below) runs for every lead regardless of group — the group only controls the Screen3 CTA.

### Entry point and Meta Ads placement tracking

`CalculatorContext` reads two query params once at mount (via `useState(() => ...)` initializers, so they're fixed for the session):

- `entryPoint` — from `?entrada=directa`; `'directa'` skips straight to Screen1 (`currentScreen` initializes to `1` instead of `0`), anything else is `'landing'`.
- `adPlacement` — from `?utm_content`, meant to carry Meta Ads' dynamic `{{placement}}` token (e.g. `facebook_reels`, `instagram_feed`); defaults to `'sin_dato'` for organic/direct traffic.

Both read via plain `URLSearchParams(window.location.search)`, not react-router. `adPlacement` is threaded into `trackEvent` calls (`funnel_entry`, `cta_click`, `lead_form_submit`, `whatsapp_click_results`) so Meta Ads placement performance can be sliced in analytics; add it to any new funnel-tracking call the same way.

### Analytics (`src/utils/analytics.js`)

`trackEvent(name, params)` forwards to `window.gtag` (GA4) if present, else no-ops. Events fired: `funnel_entry` (mount, `{tipo, placement}`), `screen_view` (each screen), `cta_click` (landing, `{tipo, placement}`), `ab_test_assigned`, `lead_form_submit` (`{placement}`), `whatsapp_click_results` (`{placement}`), `calendly_click_results`. No GA snippet/tag ID is wired into the codebase itself — `gtag` must be injected separately (e.g. via a `<script>` tag or GTM).

### State management

All shared state lives in `src/context/CalculatorContext.jsx` via `CalculatorProvider`. The `useCalculator()` hook (at `src/hooks/useCalculator.js`) exposes:

| Key | Type | Purpose |
|---|---|---|
| `selections` | `{[equipo]: cantidad}` | Only checked items (no entry = unchecked) |
| `toggleItem(equipo)` | fn | Add/remove from selections |
| `setItemQty(equipo, qty)` | fn | Change quantity of a checked item |
| `getSelectedRows()` | fn | Returns `[{equipo, cantidad, potencia_w, demanda_w}]` for engine |
| `equipmentCatalog` | array | All cargas from `/get-equipment` (fetched on mount) |
| `hoursBackup` | number | Default 4, user-controlled |
| `results` | object | Output of `POST /recommend` — `{ requirements, recommendations }` |
| `lead` | object | `{nombre, whatsapp, email}` captured at Screen3 |
| `currentScreen` | number | 0–3 |
| `goToScreen(n)` | fn | Navigate |
| `entryPoint` | `'landing'` \| `'directa'` | From `?entrada`, read once at mount |
| `adPlacement` | string | From `?utm_content` (Meta Ads placement), read once at mount, default `'sin_dato'` |

`CalculatorContext` fetches only `/get-equipment` on mount. Systems data is not pre-fetched; it is computed on demand by the backend `/recommend` endpoint.

### Pricing utility (`src/utils/pricing.js`)

`calcPricing(usdEquipo, totalDemandW)` computes MXN pricing from a system's `usd_precio`. Uses hardcoded constants (TC, margins, IVA, material %) until the `parametros` Sheet endpoint is built. Returns `{contado, anticipo, saldo, mensualidad, aplica}`. If `totalDemandW / 1000 < 3kW`, no material or installation cost applies.

### Calculation logic (server-side, with a frontend mirror for requirements only)

Recommendations run server-side via `POST /recommend` in `backend/app/services/calculator.py`. The frontend's `src/utils/calculator.js` only contains `calculateRequirements` (demand math) for reference — it is not used for the actual recommendation.

Core formula in `calculator.py`:
```
totalDemandW = Σ(qty × potencia_w)
# If totalDemandW < 3 kW: no demand factor, no installation cost
systemPowerW = totalDemandW × 0.70  (skipped if < 3 kW)
batteryKwhRequired = (systemPowerW × hoursBackup / 1000) × 0.40
```

`select_ecoflow(stations, system_power_w, battery_kwh_required)` picks the smallest Ecoflow station that meets both kW and kWh requirements, stepping up battery count or station tier as needed. If nothing fits, returns the biggest config with `needs_custom_quote: true`. Enphase and Victron/Pytes are always `null` in MVP.

### Backend API (`app/main.py`)

CORS restricted to `FRONTEND_URL`. Four routers:

| Route | Handler | Description |
|---|---|---|
| `GET /get-equipment` | `routes/equipment.py` | Reads `cargas` Sheet tab |
| `GET /get-systems` | `routes/systems.py` | Joins `catalogo` + `specs_estaciones` |
| `POST /recommend` | `routes/recommend.py` | Runs recommendation engine server-side |
| `POST /save-lead` | `routes/leads.py` | Generates PDF proposal, uploads to GCS, writes to `leads` + `equipos_lead` tabs |

Debug-only endpoints (prefix `/debug/`) exist for inspecting raw Sheet tabs and headers — these are temporary and can be removed.

### PDF proposal + GCS upload (`save-lead` flow)

`POST /save-lead` (`routes/leads.py`) does three things per lead, in order:

1. Generates a PDF proposal via `pdf_service.generate_proposal_pdf(lead, fecha, lead_id)` — renders a hardcoded Jinja2 HTML template (brand colors/fonts independent of the frontend Tailwind tokens) and rasterizes it with WeasyPrint. Rendered in the submitting user's UI language (`lead.language`, `"es"` or `"en"`, defaults to `"es"`); shows the MXN contado price (with IVA) rather than the USD system cost.
2. Uploads the PDF via `storage_service.upload_pdf(pdf_bytes, filename, GOOGLE_STORAGE_BUCKET)` to a GCS bucket and returns the public `https://storage.googleapis.com/...` URL (public access comes from bucket-level IAM, not a per-object permission call).
3. Writes the lead to Sheets, including the resulting `proposal_url` (empty string if steps 1–2 failed).

Steps 1–2 are wrapped in a try/except that only logs on failure — **a PDF/GCS error never blocks the lead from being saved**. `lead_id` is an 8-char uppercase hex slug (`uuid.uuid4().hex[:8].upper()`) used as the Sheets row key and the PDF filename. `drive_service.py` (the old Google Drive uploader) is no longer imported anywhere — dead code slated for removal.

`leads` sheet column order (must match the sheet header row exactly): `fecha, nombre, whatsapp, email, demanda_kw, capacidad_kwh, horas_respaldo, sistema_recomendado, precio_contado_mxn, precio_msi_mxn, origen, equipos_resumen, lead_id, proposal_url, ab_test_group`.

### Google Sheets as database (`app/services/sheets_service.py`)

`read_sheet(sheet_name)` is the generic reader: row 0 = headers, rows 1+ = data, returns `list[dict]`. Always read by column name, never by positional index.

`read_station_specs()` enriches `specs_estaciones` rows with prices from `catalogo` and returns the list of dicts used directly by the recommendation engine. This is what `POST /recommend` calls.

`read_systems_from_catalog()` generates one entry per valid battery count (for `GET /get-systems`). It joins `catalogo` and `specs_estaciones` similarly but produces flattened system rows instead of raw station specs.

`read_systems_sheet()` (legacy, reads `sistemas` tab by position) and `_KNOWN_BRANDS` are still present but slated for removal — prefer `read_station_specs()` / `read_systems_from_catalog()`.

`append_row(sheet_name, row)` appends a single row. Leads write to both `leads` (summary) and `equipos_lead` (line items) with a shared `lead_id`.

Google Sheets credentials: if `GOOGLE_SERVICE_ACCOUNT_JSON` starts with `{`, it's parsed as JSON directly (Railway). If it's a file path that exists, it reads the file. Otherwise falls back to Application Default Credentials.

### `useApi` hook (`src/hooks/useApi.js`)

Generic wrapper for async API calls: `useApi(fn)` returns `{ call, loading, error }`. `call(...args)` invokes `fn`, manages loading/error state, and re-throws on failure.

### i18n

Two languages (ES/EN) via `i18next` + `react-i18next`. Translation files at `src/i18n/es.json` and `src/i18n/en.json`. Language persisted to `localStorage` key `lang`. `VITE_DEFAULT_LANG` sets the fallback. The `LanguageToggle` UI component switches languages at runtime.

### Tailwind tokens

Canonical color aliases are `azul-tormenta` and `amarillo-solar` (mapped to the brand hex values). The bare `azul-wr`/`naranja-wr` names also exist. Do not rename these — the screen components reference them directly. Fonts: `font-display` (Barlow Condensed), `font-body` (Inter), `font-mono` (JetBrains Mono).

### WhatsApp CTA

`src/utils/whatsapp.js` builds the `wa.me` URL with a pre-filled message summarizing kW/kWh requirements. `VITE_WHATSAPP_NUMBER` must be set (digits only, no `+` or spaces). The `window.open()` call in the Screen3 confirmation view must stay synchronous inside the click handler — moving it into a Promise will cause browsers to block the popup.
