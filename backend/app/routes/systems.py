from fastapi import APIRouter, HTTPException
from app.services.sheets_service import read_systems_sheet, _get_raw_sheet

router = APIRouter()


@router.get("/get-systems")
async def get_systems():
    try:
        systems = read_systems_sheet()
        return {"systems": systems}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/debug/sheet-tabs")
async def debug_tabs():
    """Temporal: lista los nombres exactos de todas las pestañas del workbook."""
    try:
        from app.services.sheets_service import _get_service
        from app.config import GOOGLE_SHEETS_ID
        service = _get_service()
        meta = service.spreadsheets().get(spreadsheetId=GOOGLE_SHEETS_ID).execute()
        tabs = [s["properties"]["title"] for s in meta.get("sheets", [])]
        return {"tabs": tabs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/debug/sistemas-raw")
async def debug_sistemas():
    """Temporal: devuelve las primeras 4 filas crudas del Sheet."""
    try:
        rows = _get_raw_sheet("sistemas")
        return {"total_rows": len(rows), "first_4_rows": rows[:4]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
