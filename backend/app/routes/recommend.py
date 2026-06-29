from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.calculator import recommend as run_recommend
from app.services.sheets_service import read_station_specs

router = APIRouter()


class EquipoItem(BaseModel):
    equipo: str
    cantidad: int
    potencia_w: float


class RecommendInput(BaseModel):
    equipos: list[EquipoItem]
    horas_respaldo: float = 4.0


@router.post("/recommend")
async def recommend(body: RecommendInput):
    try:
        stations = read_station_specs()
        equipment_list = [
            {"cantidad": e.cantidad, "potencia_w": e.potencia_w}
            for e in body.equipos
        ]
        result = run_recommend(equipment_list, stations, body.horas_respaldo)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
