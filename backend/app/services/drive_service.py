import io
import json
import os
import logging
import google.auth
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from google.oauth2 import service_account
from app.config import GOOGLE_SERVICE_ACCOUNT_JSON

logger = logging.getLogger(__name__)

# drive.file: only files created by this app — more secure than full drive scope
_SCOPES = ["https://www.googleapis.com/auth/drive.file"]


def _get_drive_service():
    """Same credential-resolution pattern as sheets_service.py."""
    sa_value = GOOGLE_SERVICE_ACCOUNT_JSON
    if sa_value and sa_value.strip().startswith("{"):
        info = json.loads(sa_value)
        creds = service_account.Credentials.from_service_account_info(info, scopes=_SCOPES)
    elif sa_value and os.path.exists(sa_value):
        creds = service_account.Credentials.from_service_account_file(sa_value, scopes=_SCOPES)
    else:
        creds, _ = google.auth.default(scopes=_SCOPES)
    return build("drive", "v3", credentials=creds)


def upload_pdf(pdf_bytes: bytes, filename: str, folder_id: str) -> str:
    """
    Uploads pdf_bytes to folder_id in Google Drive.
    Sets "anyone with the link can view" permission.
    Returns the webViewLink (shareable URL).

    Prerequisites (manual, outside this code):
      - The target folder must be shared with the service account's client_email
        as Editor so the service account can create files inside it.
    """
    service = _get_drive_service()

    file_metadata = {
        "name": filename,
        "mimeType": "application/pdf",
        "parents": [folder_id],
    }
    media = MediaIoBaseUpload(
        io.BytesIO(pdf_bytes),
        mimetype="application/pdf",
        resumable=False,
    )

    created = (
        service.files()
        .create(body=file_metadata, media_body=media, fields="id,webViewLink")
        .execute()
    )

    file_id = created.get("id", "")

    # Make the file publicly readable via link (no sign-in required)
    service.permissions().create(
        fileId=file_id,
        body={"type": "anyone", "role": "reader"},
        fields="id",
    ).execute()

    web_link = created.get("webViewLink", "")
    logger.info(f"PDF uploaded to Drive: {filename} → {web_link}")
    return web_link
