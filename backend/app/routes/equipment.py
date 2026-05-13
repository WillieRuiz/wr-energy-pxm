from fastapi import APIRouter, HTTPException
from app.services.sheets_service import read_sheet

router = APIRouter()

_EQUIPO_KEYS = ["equipo", "equipment", "nombre", "name"]
_POTENCIA_KEYS = ["potencia_w", "potencia", "watts", "w", "potencia (w)", "potencia(w)", "power_w", "power"]


def _find(row: dict, candidates: list[str]) -> str:
    lowered = {k.lower().strip(): v for k, v in row.items()}
    for key in candidates:
        if key in lowered:
            return lowered[key]
    return ""


@router.get("/get-equipment")
async def get_equipment():
    try:
        rows = read_sheet("equipos")
        equipment = []
        for r in rows:
            nombre = _find(r, _EQUIPO_KEYS)
            potencia_raw = _find(r, _POTENCIA_KEYS)
            if not nombre:
                continue
            try:
                potencia = float(str(potencia_raw).replace(",", "").strip()) if potencia_raw else 0.0
            except ValueError:
                potencia = 0.0
            equipment.append({"equipo": nombre, "potencia_w": potencia})
        return {"equipment": equipment}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/debug/equipos-headers")
async def debug_equipos():
    """Temporal: devuelve los nombres exactos de columnas del Sheet."""
    try:
        rows = read_sheet("equipos")
        return {"headers": list(rows[0].keys()) if rows else [], "sample": rows[0] if rows else {}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
