def calculate_requirements(equipment_list: list[dict], hours_backup: float = 4) -> dict:
    total_demand_w = sum(item["cantidad"] * item["potencia_w"] for item in equipment_list)
    system_power_w = total_demand_w * 0.70
    battery_kwh = (system_power_w * hours_backup) / 1000 * 0.40

    return {
        "total_demand_w": total_demand_w,
        "system_power_w": system_power_w,
        "battery_kwh_required": battery_kwh,
        "hours_backup": hours_backup,
    }


def select_immediate_superior(
    systems: list[dict], required_kwh: float, required_w: float, brand: str
) -> dict | None:
    brand_systems = [s for s in systems if s["marca"].lower() == brand.lower()]
    candidates = [
        s
        for s in brand_systems
        # almacenamiento is in kWh; potencia is in kW → convert to W for comparison
        if s["almacenamiento"] >= required_kwh and (s["potencia"] * 1000) >= required_w
    ]

    if not candidates:
        if not brand_systems:
            return None
        biggest = max(brand_systems, key=lambda s: s["almacenamiento"])
        return {**biggest, "needs_custom_quote": True}

    candidates.sort(key=lambda s: (s["almacenamiento"], s["usd_precio"]))
    return {**candidates[0], "needs_custom_quote": False}


def recommend_systems(
    equipment_list: list[dict], systems: list[dict], hours_backup: float = 4
) -> dict:
    requirements = calculate_requirements(equipment_list, hours_backup)

    ecoflow = select_immediate_superior(
        systems,
        requirements["battery_kwh_required"],
        requirements["system_power_w"],
        "Ecoflow",
    )
    enphase = select_immediate_superior(
        systems,
        requirements["battery_kwh_required"],
        requirements["system_power_w"],
        "Enphase",
    )

    return {
        "requirements": requirements,
        "recommendations": {
            "ecoflow": ecoflow,
            "enphase": enphase,
            "victron_pytes": None,
        },
    }
