from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import FRONTEND_URL, ENVIRONMENT
from app.routes import equipment, systems, leads, recommend, webhooks

app = FastAPI(title="WR Energy PMX Calculator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    # In dev, accept any localhost port (Vite auto-increments when port is busy)
    allow_origin_regex=r"http://localhost:\d+" if ENVIRONMENT == "development" else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(equipment.router)
app.include_router(systems.router)
app.include_router(leads.router)
app.include_router(recommend.router)
app.include_router(webhooks.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
