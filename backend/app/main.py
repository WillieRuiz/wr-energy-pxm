from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import FRONTEND_URL
from app.routes import equipment, systems, leads

app = FastAPI(title="WR Energy PMX Calculator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(equipment.router)
app.include_router(systems.router)
app.include_router(leads.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
