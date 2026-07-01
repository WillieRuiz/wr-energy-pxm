import io
import json
import os
import logging
from google.oauth2 import service_account
from google.cloud import storage
from app.config import GOOGLE_SERVICE_ACCOUNT_JSON

logger = logging.getLogger(__name__)


def _get_storage_client():
    sa_value = GOOGLE_SERVICE_ACCOUNT_JSON
    if sa_value and sa_value.strip().startswith("{"):
        info = json.loads(sa_value)
        creds = service_account.Credentials.from_service_account_info(info)
    elif sa_value and os.path.exists(sa_value):
        creds = service_account.Credentials.from_service_account_file(sa_value)
    else:
        creds = None  # falls back to Application Default Credentials
    return storage.Client(credentials=creds, project=creds.project_id if creds else None)


def upload_pdf(pdf_bytes: bytes, filename: str, bucket_name: str) -> str:
    """
    Uploads pdf_bytes to a GCS bucket.
    The bucket must have allUsers:objectViewer for public access.
    Returns the public URL.
    """
    client = _get_storage_client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(f"propuestas/{filename}")
    blob.upload_from_file(
        io.BytesIO(pdf_bytes),
        content_type="application/pdf",
    )
    blob.make_public()
    public_url = blob.public_url
    logger.info(f"PDF uploaded to GCS: {filename} → {public_url}")
    return public_url
