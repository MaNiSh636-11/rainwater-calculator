from typing import List, Optional, Tuple
from app.models.schemas import (
    CalculationRequest,
    CalculationResponse,
    MonthlyBreakdownItem,
    StorageAnalysis,
    EnvironmentalImpact,
)

MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]


def calculate_rainwater_potential(request: CalculationRequest) -> CalculationResponse:
    """
    Core calculation engine for rainwater harvesting potential.

    Formula:
    Potential Collected Water (Litres) = Roof Area (m²) × Rainfall (mm) × Collection Efficiency

    Scientific Principle:
    1 mm of rain across 1 square metre of surface yields exactly 1 litre of water:
    1 mm = 0.001 m
    0.001 m × 1 m² = 0.001 m³ = 1 Litre (since 1 m³ = 1,000 Litres).
    """
    area = float(request.roof_area)
    eff_pct = float(request.collection_efficiency)
    efficiency_factor = eff_pct / 100.0
    water_cost = float(request.water_cost_per_m3 or 0.0)

    # 1. Monthly breakdown determination
    monthly_items: List[MonthlyBreakdownItem] = []
    assumptions: List[str] = [
        "1 mm of rainfall falling on 1 m² of roof catchment equals exactly 1 litre of gross rainwater.",
        f"Catchment runoff efficiency applied is {eff_pct:.1f}% to account for surface absorption, evaporation, and gutter conveyance losses.",
    ]

    if request.monthly_rainfall and len(request.monthly_rainfall) == 12:
        # User provided actual monthly figures
        total_monthly_rain = sum(request.monthly_rainfall)
        annual_rain = total_monthly_rain
        assumptions.append(
            "Monthly breakdown calculated directly from 12-month user-supplied rainfall figures."
        )

        total_gross = 0.0
        total_collectable = 0.0

        for i, rain_mm in enumerate(request.monthly_rainfall):
            m_gross = area * rain_mm
            m_coll = m_gross * efficiency_factor
            total_gross += m_gross
            total_collectable += m_coll

            monthly_items.append(
                MonthlyBreakdownItem(
                    month=MONTH_NAMES[i],
                    month_index=i + 1,
                    rainfall_mm=round(rain_mm, 2),
                    gross_litres=round(m_gross, 2),
                    collectable_litres=round(m_coll, 2),
                    collectable_m3=round(m_coll / 1000.0, 3),
                    is_estimated=False,
                )
            )

        gross_litres = total_gross
        collectable_litres = total_collectable
    else:
        # Uniform distribution estimate from annual rainfall
        annual_rain = float(request.annual_rainfall)
        gross_litres = area * annual_rain
        collectable_litres = gross_litres * efficiency_factor

        avg_monthly_rain = annual_rain / 12.0
        avg_monthly_gross = gross_litres / 12.0
        avg_monthly_coll = collectable_litres / 12.0

        assumptions.append(
            "Monthly breakdown is an estimated average (annual totals divided evenly across 12 months) because specific monthly rainfall was not provided."
        )

        for i, name in enumerate(MONTH_NAMES):
            monthly_items.append(
                MonthlyBreakdownItem(
                    month=name,
                    month_index=i + 1,
                    rainfall_mm=round(avg_monthly_rain, 2),
                    gross_litres=round(avg_monthly_gross, 2),
                    collectable_litres=round(avg_monthly_coll, 2),
                    collectable_m3=round(avg_monthly_coll / 1000.0, 3),
                    is_estimated=True,
                )
            )

    collectable_m3 = collectable_litres / 1000.0
    average_monthly_litres = collectable_litres / 12.0

    # 2. Daily calculations
    average_daily_litres = collectable_litres / 365.0 if collectable_litres > 0 else 0.0
    average_daily_rainy_day_litres = None
    if request.rainy_days is not None and request.rainy_days > 0:
        average_daily_rainy_day_litres = collectable_litres / request.rainy_days
        assumptions.append(
            f"Average wet-day harvest of {average_daily_rainy_day_litres:.1f} L/rainy day is based on {request.rainy_days} rainy days per year."
        )

    # 3. Financial savings
    estimated_financial_savings = collectable_m3 * water_cost

    # 4. Storage tank sizing recommendation
    # Standard engineering heuristic:
    # Option A: 10-15% of annual harvest volume (buffer for dry season)
    # Option B: If daily demand is known, 21-30 days of storage.
    if request.daily_water_demand and request.daily_water_demand > 0:
        recommended_capacity = request.daily_water_demand * 25.0  # 25 days buffer
        tank_basis = (
            f"25 days of average water demand buffer ({request.daily_water_demand:.0f} L/day × 25 days), "
            "providing reliable non-potable autonomy during typical dry intervals."
        )
    else:
        # Default: 10% of annual harvest or 20 days of average yield, capped reasonably
        recommended_capacity = max(1000.0, collectable_litres * 0.10) if collectable_litres > 0 else 1000.0
        tank_basis = (
            "10% of total annual harvest volume (approximately 36 days of average harvested yield), "
            "balancing capital installation costs with collection retention during seasonal peaks."
        )

    # 5. Tank overflow simulation (if user tank capacity is provided)
    annual_overflow = None
    storage_coverage_days = None

    if request.tank_capacity is not None and request.tank_capacity > 0:
        tank_cap = float(request.tank_capacity)
        # Determine monthly consumption for mass balance
        if request.daily_water_demand and request.daily_water_demand > 0:
            monthly_consumption = request.daily_water_demand * (365.0 / 12.0)
            storage_coverage_days = round(tank_cap / request.daily_water_demand, 1)
        else:
            monthly_consumption = average_monthly_litres

        current_storage = 0.0
        total_overflow = 0.0

        for item in monthly_items:
            inflow = item.collectable_litres
            available = current_storage + inflow
            consumed = min(available, monthly_consumption)
            remaining = available - consumed
            if remaining > tank_cap:
                overflow = remaining - tank_cap
                current_storage = tank_cap
            else:
                overflow = 0.0
                current_storage = remaining
            total_overflow += overflow

        annual_overflow = round(total_overflow, 2)
        assumptions.append(
            f"Tank overflow simulation modeled using dynamic monthly mass-balance with a {tank_cap:,.0f} L storage tank."
        )

    # 6. Water demand offset
    demand_offset_pct = None
    annual_demand = None
    if request.daily_water_demand and request.daily_water_demand > 0:
        annual_demand = request.daily_water_demand * 365.0
        if annual_demand > 0:
            demand_offset_pct = round(min(100.0, (collectable_litres / annual_demand) * 100.0), 1)

    # 7. Environmental Impact & SDG alignment
    # Displacement of municipal pumping/treatment energy ~0.35 kWh/m³, grid factor 0.82 kg CO2/kWh -> 0.287 kg CO2/m³
    co2_reduction = round(collectable_m3 * 0.287, 2)
    runoff_mitigated = round(collectable_litres, 1)

    sdg_list = [
        {
            "sdg": "SDG 6",
            "title": "Clean Water and Sanitation",
            "target": "Target 6.4: Substantially increase water-use efficiency across all sectors and ensure sustainable withdrawals.",
            "impact": f"Harvests {collectable_m3:,.1f} m³ of clean rainwater annually, reducing reliance on stressed municipal supplies.",
        },
        {
            "sdg": "SDG 11",
            "title": "Sustainable Cities and Communities",
            "target": "Target 11.B: Enhance disaster risk management and climate resilience.",
            "impact": f"Attenuates {runoff_mitigated:,.0f} litres of rooftop stormwater runoff, easing pressure on urban drainage and reducing flood risks.",
        },
        {
            "sdg": "SDG 12",
            "title": "Responsible Consumption and Production",
            "target": "Target 12.2: Achieve sustainable management and efficient use of natural resources.",
            "impact": "Decentralized rainwater recycling promotes local water stewardship, circular resource cycles, and lowered water utility footprints.",
        },
    ]

    formula_text = (
        "Potential Collected Water (Litres) = Catchment Roof Area (m²) × Annual Rainfall (mm) × Collection Efficiency (% / 100). "
        "Because 1 mm of rain over 1 m² equals 1 litre, Gross Rainfall (L) = Area × Rainfall. "
        "The collection efficiency factor accounts for roof surface texture, initial first-flush diversion, evaporation, and gutter overflow."
    )

    return CalculationResponse(
        project_name=request.project_name or "Rainwater Harvesting Project",
        location=request.location or "Catchment Site",
        roof_area=round(area, 2),
        catchment_area_m2=round(area, 2),
        annual_rainfall=round(annual_rain, 2),
        annual_rainfall_mm=round(annual_rain, 2),
        gross_rainfall_litres=round(gross_litres, 2),
        collectable_litres=round(collectable_litres, 2),
        collectable_m3=round(collectable_m3, 3),
        annual_harvest_litres=round(collectable_litres, 2),
        annual_harvest_m3=round(collectable_m3, 3),
        collection_efficiency_pct=round(eff_pct, 2),
        runoff_coefficient=round(efficiency_factor, 4),
        average_monthly_litres=round(average_monthly_litres, 2),
        average_daily_litres=round(average_daily_litres, 2),
        average_daily_rainy_day_litres=round(average_daily_rainy_day_litres, 2) if average_daily_rainy_day_litres is not None else None,
        estimated_financial_savings=round(estimated_financial_savings, 2),
        water_cost_per_m3=round(water_cost, 2),
        daily_demand_litres=request.daily_water_demand,
        annual_demand_litres=annual_demand,
        demand_offset_percentage=demand_offset_pct,
        storage_analysis=StorageAnalysis(
            recommended_capacity_litres=round(recommended_capacity, 0),
            recommended_capacity_m3=round(recommended_capacity / 1000.0, 2),
            recommendation_basis=tank_basis,
            user_tank_capacity_litres=request.tank_capacity,
            estimated_annual_overflow_litres=annual_overflow,
            storage_coverage_days=storage_coverage_days,
        ),
        environmental_impact=EnvironmentalImpact(
            co2_reduction_kg=co2_reduction,
            stormwater_runoff_mitigated_litres=runoff_mitigated,
            sdg_alignment=sdg_list,
        ),
        monthly_breakdown=monthly_items,
        formula_explanation=formula_text,
        assumptions=assumptions,
    )
