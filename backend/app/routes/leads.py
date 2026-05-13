import uuid
from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
from app.models.schemas import LeadInput
from app.services.sheets_service import append_row

router = APIRouter()


@router.post("/save-lead", status_code=201)
async def save_lead(lead: LeadInput):
    try:
        fecha = lead.fecha or datetime.now(timezone.utc)
        lead_id = uuid.uuid4().hex[:8].upper()  # e.g. "A3F2B1C9"

        append_row("leads", [
            lead_id,
            lead.nombre,
            lead.whatsapp,
            lead.email or "",
            lead.sistema_recomendado,
            lead.costo_total,
            round(lead.demanda_total_w, 2),
            round(lead.potencia_necesaria_w, 2),
            round(lead.capacidad_necesaria_kwh, 2),
            lead.horas_respaldo,
            fecha.isoformat(),
        ])

        for item in lead.equipos:
            append_row("equipos_lead", [
                lead_id,
                item.equipo,
                item.cantidad,
                item.potencia_w,
                round(item.demanda_w, 2),
            ])

        return {"ok": True, "lead_id": lead_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
