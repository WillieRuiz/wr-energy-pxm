from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class Equipment(BaseModel):
    equipo: str
    potencia_w: float


class System(BaseModel):
    sistema: str        # full name, e.g. "Ecoflow 6kWh-7.2kW"
    marca: str
    almacenamiento: float   # kWh
    potencia: float         # kW
    phases: int
    mxn_precio: float       # MXN final price (with IVA)
    usd_precio: float       # USD final price (with IVA)
    usd_wh: float           # USD per Wh (efficiency metric)


class EquipmentItem(BaseModel):
    equipo: str
    cantidad: int
    potencia_w: float
    demanda_w: float


class LeadInput(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    whatsapp: str = Field(..., min_length=10)
    email: Optional[EmailStr] = None
    sistema_recomendado: str
    costo_total: float
    # Calculation results
    demanda_total_w: float = 0
    potencia_necesaria_w: float = 0
    capacidad_necesaria_kwh: float = 0
    horas_respaldo: float = 4
    # MXN prices as computed and shown to the user in Screen2
    precio_contado_mxn: Optional[float] = None
    precio_msi_mxn: Optional[float] = None   # mensualidad 12 MSI
    # Relational equipment list
    equipos: list[EquipmentItem] = []
    fecha: Optional[datetime] = None
    # A/B test group assigned by the frontend ("pdf" | "call")
    ab_test_group: Optional[str] = None
