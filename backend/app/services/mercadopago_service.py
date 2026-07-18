import logging
import mercadopago
from app.config import MERCADOPAGO_ACCESS_TOKEN, FRONTEND_URL, BACKEND_URL

logger = logging.getLogger(__name__)


def _get_sdk() -> mercadopago.SDK:
    return mercadopago.SDK(MERCADOPAGO_ACCESS_TOKEN)


def create_preference(lead_id: str, monto: float, descripcion: str, nombre_cliente: str) -> dict:
    """
    Creates a Mercado Pago Checkout Pro preference for a lead's payment.

    Raises on any failure (missing token, API error, unexpected shape) — the caller
    (routes/leads.py) wraps this in a non-blocking try/except, same pattern already
    used there for PDF generation. A payment-link error must never lose the lead.
    """
    sdk = _get_sdk()

    return_url = f"{FRONTEND_URL}/?pago=gracias"
    preference_data = {
        "items": [{
            "title": descripcion,
            "quantity": 1,
            "unit_price": monto,
            "currency_id": "MXN",
        }],
        "external_reference": lead_id,
        "payer": {"name": nombre_cliente},
        "back_urls": {
            "success": return_url,
            "pending": return_url,
            "failure": return_url,
        },
    }

    # Mercado Pago rejects auto_return with a non-HTTPS back_url.success (e.g. local dev's
    # http://localhost:5174) — "auto_return invalid. back_url.success must be defined".
    # Omit it there; back_urls still work, the user just won't get auto-redirected.
    if return_url.startswith("https://"):
        preference_data["auto_return"] = "approved"
    else:
        logger.warning(f"FRONTEND_URL is not HTTPS ({FRONTEND_URL}) — Mercado Pago auto_return omitted")

    if BACKEND_URL:
        preference_data["notification_url"] = f"{BACKEND_URL}/webhooks/mercadopago"
    else:
        logger.warning("BACKEND_URL is not set — Mercado Pago notification_url omitted, webhook won't fire")

    result = sdk.preference().create(preference_data)
    if result.get("status") not in (200, 201):
        raise RuntimeError(f"Mercado Pago preference creation failed: {result}")

    preference = result["response"]
    return {
        "preference_id": preference["id"],
        "link_pago": preference["init_point"],
    }


def get_payment(payment_id: str) -> dict:
    """Fetches a payment's detail by ID (status, external_reference, etc.) for the webhook."""
    sdk = _get_sdk()
    result = sdk.payment().get(payment_id)
    if result.get("status") != 200:
        raise RuntimeError(f"Mercado Pago get_payment failed for {payment_id}: {result}")
    return result["response"]
