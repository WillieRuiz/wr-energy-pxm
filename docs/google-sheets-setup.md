# Google Sheets Setup

## 1. Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com).
2. Create a new project (e.g. `wr-energy-pmx`).

## 2. Enable the Sheets API

1. In your project, navigate to **APIs & Services → Library**.
2. Search for **Google Sheets API** and click **Enable**.

## 3. Create a Service Account

1. Go to **APIs & Services → Credentials**.
2. Click **Create Credentials → Service account**.
3. Give it a name (e.g. `sheets-writer`), click **Done**.
4. Open the service account, go to the **Keys** tab.
5. Click **Add Key → Create new key → JSON**.
6. Save the downloaded file as `backend/credentials/service_account.json`.

## 4. Share the Sheet

1. Open your Google Sheet.
2. Click **Share**.
3. Paste the service account email (looks like `sheets-writer@your-project.iam.gserviceaccount.com`).
4. Set the role to **Editor**.

## 5. Configure the Sheet Structure

Create a workbook with three tabs named exactly:

### `equipos`
| equipo | potencia_w |
|--------|-----------|
| Refrigerador | 350 |
| Aire Acondicionado 1 ton | 1200 |
| Iluminación LED (10 focos) | 100 |

### `sistemas`
| marca | modelo | capacidad_bateria_kwh | potencia_sistema_w | precio_usd | caracteristicas |
|-------|--------|----------------------|--------------------|------------|-----------------|
| Ecoflow | Delta Pro Ultra | 6 | 4000 | 5800 | Modular, expandible hasta 90 kWh, app móvil |
| Enphase | IQ Battery 10 | 10.08 | 3840 | 5800 | Microinversor integrado, monitoreo en tiempo real |

### `leads`
Leave this tab empty with only the header row:

| nombre | whatsapp | email | sistema_recomendado | costo_total | fecha |
|--------|----------|-------|---------------------|-------------|-------|

## 6. Set the Sheet ID

Copy the Sheet ID from the URL:
```
https://docs.google.com/spreadsheets/d/THIS_IS_THE_ID/edit
```

Paste it into `backend/.env` as `GOOGLE_SHEETS_ID`.
