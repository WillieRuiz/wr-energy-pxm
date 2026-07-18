import uuid
import logging
from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
from app.models.schemas import LeadInput
from app.services.sheets_service import append_row
from app.services.pdf_service import generate_proposal_pdf
from app.services.storage_service import upload_pdf
from app.services.mercadopago_service import create_preference
from app.config import GOOGLE_STORAGE_BUCKET

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/save-lead", status_code=201)
async def save_lead(lead: LeadInput):
    try:
        fecha = lead.fecha or datetime.now(timezone.utc)
        lead_id = uuid.uuid4().hex[:8].upper()  # e.g. "A3F2B1C9"

        # ── Mercado Pago payment link (non-blocking on failure) ──────────────
        preference_id = ""
        link_pago = ""
        try:
            mp = create_preference(
                lead_id,
                lead.precio_contado_mxn or 0,
                "Sistema de respaldo de energía WR Energy",
                lead.nombre,
            )
            preference_id = mp["preference_id"]
            link_pago = mp["link_pago"]
        except Exception as mp_err:
            logger.error(f"Mercado Pago preference failed for lead {lead_id}: {mp_err}", exc_info=True)
            # Lead is saved regardless — never lose a lead over a payment-link error

        # ── PDF generation + Drive upload (non-blocking on failure) ──────────
        proposal_url = ""
        try:
            if not GOOGLE_STORAGE_BUCKET:
                raise ValueError("GOOGLE_STORAGE_BUCKET is not set")
            pdf_bytes = generate_proposal_pdf(lead, fecha, lead_id, link_pago)
            safe_name = lead.nombre.replace(" ", "_")[:40]
            filename = f"propuesta_{lead_id}_{safe_name}.pdf"
            proposal_url = upload_pdf(pdf_bytes, filename, GOOGLE_STORAGE_BUCKET)
        except Exception as pdf_err:
            logger.error(f"PDF/Drive failed for lead {lead_id}: {pdf_err}", exc_info=True)
            # Lead is saved regardless — never lose a lead over a PDF error

        # ── Compact equipment summary (e.g. "2x AC Mini Split | 1x Refrigerador") ──
        equipos_resumen = " | ".join(
            f"{item.cantidad}x {item.equipo}" for item in lead.equipos
        )

        # ── Persist to Sheets ────────────────────────────────────────────────
        # Column order MUST match the sheet header row exactly:
        # fecha | nombre | whatsapp | email | demanda_kw | capacidad_kwh |
        # horas_respaldo | sistema_recomendado | precio_contado_mxn |
        # precio_msi_mxn | origen |
        # [new] equipos_resumen | lead_id | proposal_url | ab_test_group
        append_row("leads", [
            fecha.isoformat(),                              # fecha
            lead.nombre,                                    # nombre
            lead.whatsapp,                                  # whatsapp
            lead.email or "",                               # email
            round(lead.demanda_total_w / 1000, 3),          # demanda_kw (W → kW)
            round(lead.capacidad_necesaria_kwh, 2),         # capacidad_kwh
            lead.horas_respaldo,                            # horas_respaldo
            lead.sistema_recomendado,                       # sistema_recomendado
            round(lead.precio_contado_mxn) if lead.precio_contado_mxn else "",  # precio_contado_mxn
            round(lead.precio_msi_mxn) if lead.precio_msi_mxn else "",          # precio_msi_mxn
            "calculadora_web",                              # origen
            equipos_resumen,                                # [new] equipos_resumen
            lead_id,                                        # [new] lead_id
            proposal_url,                                   # [new] proposal_url
            lead.ab_test_group or "",                       # [new] ab_test_group
        ])

        for item in lead.equipos:
            append_row("equipos_lead", [
                lead_id,
                item.equipo,
                item.cantidad,
                item.potencia_w,
                round(item.demanda_w, 2),
            ])

        # ── Payment link tracking row (non-blocking on failure) ──────────────
        # Header (create this sheet yourself before running the backend):
        # lead_id | preference_id | link_pago | monto_mxn | fecha_generado | estatus_pago | fecha_pago | payment_id
        try:
            append_row("links_pago", [
                lead_id,
                preference_id,
                link_pago,
                round(lead.precio_contado_mxn) if lead.precio_contado_mxn else "",
                fecha.isoformat(),
                "pendiente",
                "",
                "",
            ])
        except Exception as links_err:
            logger.error(f"links_pago row failed for lead {lead_id}: {links_err}", exc_info=True)

        return {"ok": True, "lead_id": lead_id, "proposal_url": proposal_url, "link_pago": link_pago}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
