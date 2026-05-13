import os
import google.auth
from googleapiclient.discovery import build
from google.oauth2 import service_account
from app.config import GOOGLE_SERVICE_ACCOUNT_JSON, GOOGLE_SHEETS_ID

_SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]


def _get_service():
    sa_path = GOOGLE_SERVICE_ACCOUNT_JSON
    if sa_path and os.path.exists(sa_path):
        # JSON key file available (personal GCP project or explicitly provided)
        creds = service_account.Credentials.from_service_account_file(sa_path, scopes=_SCOPES)
    else:
        # Fall back to Application Default Credentials:
        #   local dev  → run: gcloud auth application-default login
        #   Cloud Run  → service account attached to the instance, no key needed
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
