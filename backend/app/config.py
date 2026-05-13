import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_SHEETS_ID: str = os.getenv("GOOGLE_SHEETS_ID", "")
GOOGLE_SERVICE_ACCOUNT_JSON: str = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON", "./credentials/service_account.json")
FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
WHATSAPP_NUMBER: str = os.getenv("WHATSAPP_NUMBER", "")
PORT: int = int(os.getenv("PORT", "8000"))
ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
