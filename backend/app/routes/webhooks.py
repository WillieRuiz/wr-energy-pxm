import logging
from fastapi import APIRouter, Request
from datetime import datetime, timezone
from app.services.mercadopago_service import get_payment
from app.services.sheets_service import update_row_by_key

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/webhooks/mercadopago")
async def mercadopago_webhook(request: Request):
    """
    Mercado Pago notifies payment events here. Depending on the notification
    version it may send type/id as query params (?type=payment&data.id=123) and/or
    as a JSON body ({"type": "payment", "data": {"id": "123"}}) — check both.

    Always returns 200 when at all possible: Mercado Pago retries on anything else,
    and a webhook hiccup must never surface as a 500.
    """
    try:
        params = request.query_params
        event_type = params.get("type") or params.get("topic")
        payment_id = params.get("data.id") or params.get("id")

        if not event_type or not payment_id:
            try:
                body = await request.json()
            except Exception:
                body = {}
            event_type = event_type or body.get("type") or (body.get("action") or "").split(".")[0]
            payment_id = payment_id or (body.get("data") or {}).get("id")

        if event_type != "payment" or not payment_id:
            return {"ok": True}

        payment = get_payment(str(payment_id))
        lead_id = payment.get("external_reference")
        status = payment.get("status")

        if not lead_id or not status:
            logger.warning(f"Mercado Pago webhook: missing external_reference/status for payment {payment_id}")
            return {"ok": True}

        updated = update_row_by_key("links_pago", "lead_id", lead_id, {
            "estatus_pago": status,
            "fecha_pago": datetime.now(timezone.utc).isoformat() if status == "approved" else "",
            "payment_id": str(payment_id),
        })
        if not updated:
            logger.warning(f"Mercado Pago webhook: no links_pago row found for lead_id {lead_id}")

    except Exception as e:
        logger.error(f"Mercado Pago webhook error: {e}", exc_info=True)

    return {"ok": True}
