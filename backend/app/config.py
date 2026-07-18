import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_SHEETS_ID: str = os.getenv("GOOGLE_SHEETS_ID", "")
GOOGLE_SERVICE_ACCOUNT_JSON: str = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON", "./credentials/service_account.json")
GOOGLE_STORAGE_BUCKET: str = os.getenv("GOOGLE_STORAGE_BUCKET", "")
FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
# Public URL of this backend, used to build the Mercado Pago webhook notification_url
# (e.g. https://wr-energy-pxm-production.up.railway.app). Left blank in local dev.
BACKEND_URL: str = os.getenv("BACKEND_URL", "")
WHATSAPP_NUMBER: str = os.getenv("WHATSAPP_NUMBER", "")
MERCADOPAGO_ACCESS_TOKEN: str = os.getenv("MERCADOPAGO_ACCESS_TOKEN", "")
PORT: int = int(os.getenv("PORT", "8000"))
ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
