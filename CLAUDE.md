# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**WR Energy PMX** — A 4-screen mobile-first web app that helps non-technical users calculate their energy backup needs, captures them as leads, and redirects them to WhatsApp for conversion.

Stack: React + Vite (frontend) · FastAPI (backend) · Google Sheets API (data store)

**User flow:** Landing (Screen 0) → Lead Capture (Screen 1) → Equipment Selection (Screen 2) → Results + WhatsApp redirect (Screen 3)

---

## Dev Commands

### Backend
```bash
cd backend
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

uvicorn app.main:app --reload --port 8000
```

API docs auto-generated at `http://localhost:8000/docs`.

### Frontend
```bash
cd frontend
npm install
npm run dev      # Vite at http://localhost:5174
npm run build    # Production build → dist/
npm run preview  # Preview production build locally
```

There are no linting or test commands — no ESLint, Vitest, or pytest are configured.

### Environment Setup
- Copy `backend/.env.example` → `backend/.env`. Required vars: `GOOGLE_SHEETS_ID`, `GOOGLE_SERVICE_ACCOUNT_JSON`, `WHATSAPP_NUMBER`, `FRONTEND_URL`.
- Copy `frontend/.env.example` → `frontend/.env`. Required vars: `VITE_API_URL=http://localhost:8000`, `VITE_WHATSAPP_NUMBER`.
- `GOOGLE_SERVICE_ACCOUNT_JSON` accepts **either** a file path (`./credentials/service_account.json`) **or** the raw JSON content as a string (used on Railway). `sheets_service._get_service()` detects which by checking if the value starts with `{`. Falls back to Application Default Credentials if neither resolves.
- Optional backend vars (have defaults): `PORT` (default `8000`), `ENVIRONMENT` (default `development`).

---

## Architecture

### Backend (`backend/app/`)

Three route modules map 1:1 to the three API endpoints:
- `routes/equipment.py` → `GET /get-equipment` — reads `equipos` sheet
- `routes/systems.py` → `GET /get-systems` — reads `sistemas` sheet
- `routes/leads.py` → `POST /save-lead` — appends one row to `leads` + one row per equipment item to `equipos_lead`; returns `{ "ok": true, "lead_id": "<8-char hex>" }`

`services/sheets_service.py` has two distinct readers:
- `read_sheet(sheet_name)` — generic: row 0 is headers, rows 1+ are data. Used for `equipos`.
- `read_systems_sheet()` — custom parser for `sistemas`: skips header rows by scanning for a known brand name in column 1 using the `_KNOWN_BRANDS` set (`{"ecoflow", "enphase", "victron", "pytes"}`). Columns are read **by index position** (0–11), not by header name. If the sheet column order changes, this breaks silently. **If a new brand is added to the sheet, it must also be added to `_KNOWN_BRANDS` (line 59) or its rows will be silently ignored.**

Column mapping for `sistemas` (by index):
```
0  sistema name  |  1  marca  |  2  almacenamiento (kWh)  |  3  potencia (kW)  |  4  phases
5  MXN subtotal  |  6  MXN IVA  |  7  MXN final price
8  USD subtotal  |  9  USD IVA  |  10  USD final price  |  11  USD/Wh
```

`services/calculator.py` is pure Python with no I/O — it is called from the `/get-systems` route after fetching systems from Sheets.

`config.py` loads `.env` via `python-dotenv` and exposes typed settings.

### Frontend (`frontend/src/`)

`App.jsx` is the top-level router — it wraps everything in `CalculatorProvider` and conditionally renders the current screen. **Screen 0 renders without the shared Header/Footer layout**; screens 1–3 share the `Header` + `Footer` wrapper.

State is managed by a single `CalculatorContext` (`context/CalculatorContext.jsx`) that holds: lead data, equipment rows, catalogs loaded at app mount, calculation results, hours-of-backup setting, and current screen number (starts at 0). All screens read/write this shared context — no prop drilling.

- `hooks/useCalculator.js` — wraps context for screen components
- `hooks/useApi.js` — fetch wrapper with loading/error state
- `services/api.js` — typed functions calling the three backend endpoints
- `utils/calculator.js` — frontend mirror of the Python calculation engine (see below)
- `utils/whatsapp.js` — builds the pre-filled WhatsApp URL from results
- `i18n/` — i18next config + `es.json` / `en.json`; language persisted in localStorage

Screen 2's equipment table auto-calculates `Demanda (W) = cantidad × potencia_w` inline (non-editable). Screen 3 recalculates in real time when the user changes "Hours of backup" (debounce 300 ms).

### Data (Google Sheets)

Single workbook with **four** tabs: `equipos`, `sistemas`, `leads`, `equipos_lead`. The backend reads `equipos` and `sistemas` on demand; it appends to `leads` (summary row) and `equipos_lead` (one row per equipment item) on `POST /save-lead`. See `docs/google-sheets-setup.md` for Service Account permissions setup.

### Legacy root `index.html`

The static `index.html` at the repo root is a **standalone pre-React landing page** — its content was ported into `frontend/src/components/screens/Screen0_Landing.jsx` (commit `5ae8aa3`). It is not part of the Netlify build (`netlify.toml` sets `base = "frontend"`), so it's effectively orphaned. When asked to edit the landing page, edit `Screen0_Landing.jsx` (+ its CSS file), not this file.

### Deployment

- **Backend → Railway**: `backend/railway.toml` (nixpacks build) + `backend/Procfile` both start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- **Frontend → Netlify**: `netlify.toml` at repo root builds from `frontend` (`base = "frontend"`, `npm run build`, publish `dist`) and hardcodes `VITE_API_URL` / `VITE_WHATSAPP_NUMBER` as build environment vars — these must be updated there (not just in `frontend/.env`) for production changes to take effect.

---

## Calculation Engine

**Critical:** The calculation logic is intentionally duplicated — `backend/app/services/calculator.py` (used at lead-save time) and `frontend/src/utils/calculator.js` (used for real-time Screen 3 updates). Both must be kept in sync. If you change a formula or constant in one, change it in the other.

The key algorithm is **"Immediate Superior"** system selection:

```
total_demand_w   = Σ (cantidad × potencia_w)
system_power_w   = total_demand_w × 0.70
battery_kwh      = (system_power_w × hours_backup) / 1000 × 0.40
```
*(The 0.40 factor represents the real-use factor during backup per project spec.)*

**System selection rules:**
1. Filter by brand (Ecoflow or Enphase separately).
2. From candidates where `almacenamiento >= required_kwh` AND `potencia × 1000 >= required_w`, pick the one with **smallest capacity** (closest above). Tiebreak: lowest `usd_precio`.
   - Note: `potencia` in the sheet is in **kW**, demand is in **W** — multiply by 1000 before comparing.
3. If no candidate qualifies, return the largest system of that brand with `needs_custom_quote: true`.
4. Victron+Pytes is a UI placeholder only (no backend selection logic needed).

`recommend_systems()` / `recommendSystems()` is the orchestrator in each implementation.

---

## Pydantic Models (`backend/app/models/schemas.py`)

`System` reflects the actual `sistemas` sheet fields:
- `sistema` (str), `marca` (str), `almacenamiento` (kWh, float), `potencia` (kW, float), `phases` (int), `mxn_precio` (float), `usd_precio` (float), `usd_wh` (float)

`LeadInput` includes both lead contact data and enriched calculation results:
- Contact: `nombre`, `whatsapp`, `email` (optional)
- Result summary: `sistema_recomendado`, `costo_total`, `demanda_total_w`, `potencia_necesaria_w`, `capacidad_necesaria_kwh`, `horas_respaldo`
- Equipment list: `equipos: list[EquipmentItem]` (each has `equipo`, `cantidad`, `potencia_w`, `demanda_w`)

---

## Styling

Tailwind with custom brand tokens (defined in `tailwind.config.js`):

| Token | Hex |
|-------|-----|
| `azul-tormenta` | `#1B2A4A` |
| `amarillo-solar` | `#F4C430` |
| `carbon` | `#1A1A1A` |
| `hueso` | `#F2F2F2` |

Fonts: `font-display` (Barlow Condensed, headlines) · `font-body` (Inter) · `font-mono` (JetBrains Mono, numeric data like kWh/W). All loaded via Google Fonts in `index.html`.

Mobile-first: design at 375px baseline, scale up at `sm:` (640px), `md:` (768px), `lg:` (1024px). The equipment table on Screen 2 becomes vertical cards below 640px.

---

## Key Constraints

- **Bilingual:** All UI strings go through i18next — no hardcoded Spanish or English text in components.
- **CORS:** Backend allows only the origin specified by `FRONTEND_URL` in `.env`.
- **WhatsApp redirect:** The "Me interesa" button both POSTs to `/save-lead` AND opens `wa.me/{VITE_WHATSAPP_NUMBER}?text=...` with URL-encoded pre-filled message. Both actions happen on the same click.
- `email` is optional on the lead form; Pydantic validates format only if provided (`Optional[EmailStr]`).

## Other Endpoints

- `GET /health` — returns `{"status": "ok"}`, used by Railway for liveness checks.

## Debug Endpoints

Temporary Sheet-inspection routes (do not remove while debugging data ingestion):
- `GET /debug/sheet-tabs` — lists all tab names in the workbook
- `GET /debug/sistemas-raw` — returns first 4 raw rows of `sistemas`
- `GET /debug/equipos-headers` — returns parsed column headers of `equipos`
