import os
import json
import google.auth
from googleapiclient.discovery import build
from google.oauth2 import service_account
from app.config import GOOGLE_SERVICE_ACCOUNT_JSON, GOOGLE_SHEETS_ID

_SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]


def _get_service():
    sa_value = GOOGLE_SERVICE_ACCOUNT_JSON
    if sa_value and sa_value.strip().startswith("{"):
        # Env var contains the JSON content directly (Railway/production)
        info = json.loads(sa_value)
        creds = service_account.Credentials.from_service_account_info(info, scopes=_SCOPES)
    elif sa_value and os.path.exists(sa_value):
        # Env var is a file path (local dev)
        creds = service_account.Credentials.from_service_account_file(sa_value, scopes=_SCOPES)
    else:
        # Fall back to Application Default Credentials
        creds, _ = google.auth.default(scopes=_SCOPES)
    return build("sheets", "v4", credentials=creds)


def _parse_currency(val: str) -> float:
    """Strip $, commas and whitespace then parse as float."""
    return float(val.replace("$", "").replace(",", "").strip()) if val else 0.0


def read_sheet(sheet_name: str) -> list[dict]:
    """Generic reader: uses row 0 as headers, rows 1+ as data."""
    service = _get_service()
    result = (
        service.spreadsheets()
        .values()
        .get(spreadsheetId=GOOGLE_SHEETS_ID, range=sheet_name)
        .execute()
    )
    values = result.get("values", [])
    if not values:
        return []
    headers = values[0]
    return [dict(zip(headers, row)) for row in values[1:]]


def _get_raw_sheet(sheet_name: str) -> list[list]:
    """Returns raw rows as lists (no header parsing)."""
    service = _get_service()
    result = (
        service.spreadsheets()
        .values()
        .get(spreadsheetId=GOOGLE_SHEETS_ID, range=sheet_name)
        .execute()
    )
    return result.get("values", [])


_KNOWN_BRANDS = {"ecoflow", "enphase", "victron", "pytes"}


def _is_data_row(row: list) -> bool:
    """True if the row looks like a system entry (brand in col 1)."""
    if len(row) < 2:
        return False
    return row[1].strip().lower() in _KNOWN_BRANDS


def read_systems_sheet() -> list[dict]:
    """
    Reads the 'sistemas' tab. Automatically skips however many header rows
    exist by scanning for the first row whose second column matches a known
    brand (Ecoflow, Enphase…).

    Expected column order once data starts:
      0  Sistema name  |  1  Marca  |  2  kWh  |  3  kW  |  4  phases
      5  MXN Subtotal  |  6  MXN IVA  |  7  MXN Price
      8  USD Subtotal  |  9  USD IVA  |  10 USD Price  |  11 USD/Wh
    """
    values = _get_raw_sheet("sistemas")
    systems = []
    for row in values:
        if not _is_data_row(row):
            continue
        def col(i, currency=False):
            v = row[i] if len(row) > i else ""
            return _parse_currency(v) if currency else v

        try:
            systems.append({
                "sistema":        col(0),
                "marca":          col(1),
                "almacenamiento": float(col(2)) if col(2) else 0.0,
                "potencia":       float(col(3)) if col(3) else 0.0,
                "phases":         int(float(col(4))) if col(4) else 2,
                "mxn_precio":     col(7, currency=True),
                "usd_precio":     col(10, currency=True),
                "usd_wh":         col(11, currency=True),
            })
        except (ValueError, IndexError):
            continue
    return systems


def _pf(val) -> float:
    """Parse float from a sheet cell value (strips $, commas, whitespace)."""
    if not val:
        return 0.0
    try:
        return float(str(val).replace("$", "").replace(",", "").strip())
    except ValueError:
        return 0.0


def read_systems_from_catalog() -> list[dict]:
    """
    Builds complete system configurations from:
      - 'catalogo'        → prices (costo_usd, precio_final_usd_ref) indexed by codigo
      - 'specs_estaciones' → station power/capacity + compatible battery info

    For each station generates one entry per valid battery count
    (min_baterias..max_baterias). Returns list sorted by (marca, almacenamiento).
    """
    catalogo_rows = read_sheet("catalogo")
    estaciones_rows = read_sheet("specs_estaciones")

    # Index catalog by codigo → {codigo: row_dict}
    catalogo = {r["codigo"]: r for r in catalogo_rows if r.get("codigo")}

    sistemas = []

    for est in estaciones_rows:
        e_codigo = est.get("codigo", "")
        if not e_codigo:
            continue

        e_cat = catalogo.get(e_codigo, {})
        e_precio = _pf(e_cat.get("precio_final_usd_ref") or e_cat.get("costo_usd"))
        if not e_precio:
            continue

        e_nombre = est.get("nombre", e_codigo)
        e_potencia_kw = _pf(est.get("salida_continua_w")) / 1000
        e_kwh_base = _pf(est.get("cap_base_kwh"))
        marca = e_cat.get("marca", "Ecoflow")

        b_codigo = est.get("codigo_bateria", "")
        b_kwh = _pf(est.get("cap_bateria_kwh"))
        min_bats = int(_pf(est.get("min_baterias")) or 0)
        max_bats = int(_pf(est.get("max_baterias")) or 0)

        b_precio = 0.0
        b_nombre = ""
        if b_codigo and b_codigo in catalogo:
            b_cat = catalogo[b_codigo]
            b_precio = _pf(b_cat.get("precio_final_usd_ref") or b_cat.get("costo_usd"))
            b_nombre = b_cat.get("nombre", b_codigo)

        bat_range = range(min_bats, max_bats + 1) if (b_kwh > 0 and b_codigo) else [0]

        for n_bats in bat_range:
            total_kwh = e_kwh_base + n_bats * b_kwh
            total_usd = e_precio + n_bats * b_precio

            if total_kwh <= 0 or total_usd <= 0:
                continue

            if n_bats == 0:
                nombre = e_nombre
            elif n_bats == 1:
                nombre = f"{e_nombre} + {b_nombre}" if b_nombre else e_nombre
            else:
                nombre = f"{e_nombre} + {n_bats}× {b_nombre}" if b_nombre else e_nombre

            sistemas.append({
                "sistema":        nombre,
                "marca":          marca,
                "almacenamiento": round(total_kwh, 2),
                "potencia":       round(e_potencia_kw, 2),
                "phases":         1,
                "usd_precio":     round(total_usd, 2),
                "mxn_precio":     0.0,
                "usd_wh":         round(total_usd / (total_kwh * 1000), 4) if total_kwh else 0.0,
            })

    return sorted(sistemas, key=lambda s: (s["marca"], s["almacenamiento"]))


def read_station_specs() -> list[dict]:
    """
    Returns specs_estaciones enriched with prices from catalogo.
    Each entry contains all fields needed by the recommendation engine (§3.2).
    """
    catalogo_rows = read_sheet("catalogo")
    estaciones_rows = read_sheet("specs_estaciones")

    catalogo = {r["codigo"]: r for r in catalogo_rows if r.get("codigo")}

    result = []
    for est in estaciones_rows:
        codigo = est.get("codigo", "")
        if not codigo:
            continue

        cat = catalogo.get(codigo, {})
        precio_est = _pf(cat.get("precio_final_usd_ref") or cat.get("costo_usd"))
        if not precio_est:
            continue

        b_codigo = est.get("codigo_bateria", "")
        b_cat = catalogo.get(b_codigo, {}) if b_codigo else {}
        precio_bat = _pf(b_cat.get("precio_final_usd_ref") or b_cat.get("costo_usd"))

        result.append({
            "codigo": codigo,
            "nombre": est.get("nombre", codigo),
            "marca": cat.get("marca", "Ecoflow"),
            "salida_continua_w": _pf(est.get("salida_continua_w")),
            "cap_base_kwh": _pf(est.get("cap_base_kwh")),
            "cap_bateria_kwh": _pf(est.get("cap_bateria_kwh")),
            "min_baterias": int(_pf(est.get("min_baterias")) or 0),
            "max_baterias": int(_pf(est.get("max_baterias")) or 0),
            "codigo_bateria": b_codigo,
            "nombre_bateria": b_cat.get("nombre", b_codigo),
            "precio_estacion_usd": precio_est,
            "precio_bateria_usd": precio_bat,
            "acepta_smart_panel": est.get("acepta_smart_panel", "NO").strip().upper() in ("SÍ", "SI", "YES"),
        })

    return result


def _col_letter(index: int) -> str:
    """0-indexed column number → spreadsheet column letter (0→A, 25→Z, 26→AA, ...)."""
    letters = ""
    index += 1
    while index > 0:
        index, remainder = divmod(index - 1, 26)
        letters = chr(65 + remainder) + letters
    return letters


def update_row_by_key(sheet_name: str, key_column: str, key_value: str, updates: dict) -> bool:
    """
    Finds the row where key_column == key_value and updates only the columns present
    in `updates` ({column_name: new_value}), leaving every other cell untouched.
    Returns True if the row was found and updated, False if key_value wasn't found.
    """
    service = _get_service()
    raw = _get_raw_sheet(sheet_name)
    if not raw:
        return False

    headers = raw[0]
    if key_column not in headers:
        return False
    key_idx = headers.index(key_column)

    row_number = None  # 1-indexed sheet row (header is row 1, so data starts at row 2)
    for i, row in enumerate(raw[1:], start=2):
        if len(row) > key_idx and row[key_idx] == key_value:
            row_number = i
            break

    if row_number is None:
        return False

    data = []
    for col_name, value in updates.items():
        if col_name not in headers:
            continue
        col_letter = _col_letter(headers.index(col_name))
        data.append({"range": f"{sheet_name}!{col_letter}{row_number}", "values": [[value]]})

    if not data:
        return False

    service.spreadsheets().values().batchUpdate(
        spreadsheetId=GOOGLE_SHEETS_ID,
        body={"valueInputOption": "USER_ENTERED", "data": data},
    ).execute()
    return True


def append_row(sheet_name: str, row: list) -> int:
    service = _get_service()
    result = (
        service.spreadsheets()
        .values()
        .append(
            spreadsheetId=GOOGLE_SHEETS_ID,
            range=sheet_name,
            valueInputOption="USER_ENTERED",
            insertDataOption="INSERT_ROWS",
            body={"values": [row]},
        )
        .execute()
    )
    updated_range = result.get("updates", {}).get("updatedRange", "")
    try:
        # Parse "leads!A47:F47" → 47
        return int(updated_range.split("!")[-1].split(":")[0][1:])
    except (ValueError, IndexError):
        return 0
