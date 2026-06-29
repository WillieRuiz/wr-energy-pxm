import math

# Constants — should come from 'parametros' sheet once that endpoint is built
UMBRAL_DEMANDA_KW = 3.0
FACTOR_DEMANDA = 0.70
FACTOR_USO_RESPALDO = 0.40
TOLERANCIA_ESTACION_W = 300.0


def calculate_requirements(equipment_list: list[dict], hours_backup: float = 4) -> dict:
    total_w = sum(item["cantidad"] * item["potencia_w"] for item in equipment_list)
    d_kw = total_w / 1000

    if d_kw < UMBRAL_DEMANDA_KW:
        system_power_w = total_w       # no demand factor below 3 kW
        aplica_instalacion = False
    else:
        system_power_w = total_w * FACTOR_DEMANDA
        aplica_instalacion = True

    e_kwh = (system_power_w * hours_backup) / 1000 * FACTOR_USO_RESPALDO

    return {
        "total_demand_w": total_w,
        "system_power_w": system_power_w,
        "battery_kwh_required": e_kwh,
        "hours_backup": hours_backup,
        "aplica_instalacion": aplica_instalacion,
    }


def _system_name(station: dict, n_baterias: int) -> str:
    nombre = station["nombre"]
    if n_baterias == 0:
        return nombre
    nombre_bat = station.get("nombre_bateria") or station.get("codigo_bateria", "Batería")
    if n_baterias == 1:
        return f"{nombre} + {nombre_bat}"
    return f"{nombre} + {n_baterias}× {nombre_bat}"


def _fit_batteries(station: dict, e_kwh: float, needs_custom_quote: bool = False) -> dict | None:
    """
    Tries to fit the required energy into one station.
    Returns a result dict, or None if batteries exceed max (caller should step up).
    """
    cap_base = station["cap_base_kwh"]
    cap_bat = station["cap_bateria_kwh"]
    min_bats = station["min_baterias"]
    max_bats = station["max_baterias"]

    if cap_bat > 0:
        n = math.ceil((e_kwh - cap_base) / cap_bat)
        n = max(n, min_bats)
    else:
        n = 0

    if n > max_bats:
        return None  # signal: step up to next station

    total_kwh = cap_base + n * cap_bat
    total_usd = station["precio_estacion_usd"] + n * station["precio_bateria_usd"]

    return {
        "sistema": _system_name(station, n),
        "marca": station["marca"],
        "almacenamiento": round(total_kwh, 2),
        "potencia": round(station["salida_continua_w"] / 1000, 2),
        "n_baterias": n,
        "usd_precio": round(total_usd, 2),
        "needs_custom_quote": needs_custom_quote,
        "acepta_smart_panel": station.get("acepta_smart_panel", False),
    }


def _max_config(station: dict) -> dict:
    """Returns the maximum configuration for a station (for custom-quote cases)."""
    max_bats = station["max_baterias"]
    cap_base = station["cap_base_kwh"]
    cap_bat = station["cap_bateria_kwh"]
    total_usd = station["precio_estacion_usd"] + max_bats * station["precio_bateria_usd"]
    return {
        "sistema": _system_name(station, max_bats),
        "marca": station["marca"],
        "almacenamiento": round(cap_base + max_bats * cap_bat, 2),
        "potencia": round(station["salida_continua_w"] / 1000, 2),
        "n_baterias": max_bats,
        "usd_precio": round(total_usd, 2),
        "needs_custom_quote": True,
        "acepta_smart_panel": station.get("acepta_smart_panel", False),
    }


def select_ecoflow(stations: list[dict], system_power_w: float, e_kwh: float) -> dict:
    """
    Implements §3.2 of plan.md:
    a) Pick station by power with 300 W tolerance
    b) Determine battery count, stepping up if needed
    c) needs_custom_quote if no single station+batteries fits
    """
    ecoflow = [s for s in stations if s.get("marca", "").lower() == "ecoflow"]
    sorted_st = sorted(ecoflow, key=lambda s: s["salida_continua_w"])

    if not sorted_st:
        return {"sistema": "Cotización personalizada", "marca": "Ecoflow",
                "almacenamiento": 0, "potencia": 0, "n_baterias": 0,
                "usd_precio": 0, "needs_custom_quote": True, "acepta_smart_panel": False}

    # §3.2a — find estacion_sup and estacion_inf
    estacion_sup = None
    estacion_inf = None
    for s in sorted_st:
        if s["salida_continua_w"] >= system_power_w:
            if estacion_sup is None:
                estacion_sup = s
        else:
            estacion_inf = s

    # Allow inferior station if within tolerance
    if (estacion_inf is not None
            and (system_power_w - estacion_inf["salida_continua_w"]) <= TOLERANCIA_ESTACION_W):
        start = estacion_inf
    elif estacion_sup is not None:
        start = estacion_sup
    else:
        # Power exceeds all stations → return max of biggest with custom quote
        return _max_config(sorted_st[-1])

    # §3.2b — try fitting from start station upward
    start_idx = sorted_st.index(start)
    for station in sorted_st[start_idx:]:
        result = _fit_batteries(station, e_kwh)
        if result is not None:
            return result
        # n_baterias > max → step up to next station (loop continues)

    # No station fits — return max of biggest with custom quote
    return _max_config(sorted_st[-1])


def recommend(equipment_list: list[dict], stations: list[dict], hours_backup: float = 4) -> dict:
    req = calculate_requirements(equipment_list, hours_backup)
    ecoflow = select_ecoflow(stations, req["system_power_w"], req["battery_kwh_required"])
    return {
        "requirements": req,
        "recommendations": {
            "ecoflow": ecoflow,
            "enphase": None,       # Phase 3
            "victron_pytes": None, # Phase 3
        },
    }
