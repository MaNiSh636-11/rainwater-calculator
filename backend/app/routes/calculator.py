from typing import List
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import (
    CalculationRequest,
    CalculationResponse,
    MonthlyBreakdownRequest,
    MonthlyBreakdownItem,
    SampleScenario,
)
from app.services.calculator import calculate_rainwater_potential, MONTH_NAMES

router = APIRouter(prefix="/api", tags=["Rainwater Calculator"])


@router.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    """Service health check endpoint."""
    return {
        "status": "healthy",
        "service": "Rainwater Harvesting Potential Calculator API",
        "version": "1.0.0",
    }


@router.post("/calculate", response_model=CalculationResponse, status_code=status.HTTP_200_OK)
def calculate_endpoint(request: CalculationRequest):
    """
    Calculate annual rainwater harvesting potential, monthly distributions,
    storage recommendations, monetary savings, and environmental SDG metrics.
    """
    try:
        response = calculate_rainwater_potential(request)
        return response
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during calculation: {str(e)}",
        )


@router.post("/monthly-breakdown", response_model=List[MonthlyBreakdownItem], status_code=status.HTTP_200_OK)
def monthly_breakdown_endpoint(request: MonthlyBreakdownRequest):
    """
    Calculate exact month-by-month gross and harvestable water volumes
    from an explicit 12-month rainfall dataset.
    """
    area = float(request.roof_area)
    eff = float(request.collection_efficiency) / 100.0

    items = []
    for i, rain in enumerate(request.monthly_rainfall):
        gross = area * rain
        coll = gross * eff
        items.append(
            MonthlyBreakdownItem(
                month=MONTH_NAMES[i],
                month_index=i + 1,
                rainfall_mm=round(rain, 2),
                gross_litres=round(gross, 2),
                collectable_litres=round(coll, 2),
                collectable_m3=round(coll / 1000.0, 3),
                is_estimated=False,
            )
        )
    return items


@router.get("/scenarios", response_model=List[SampleScenario], status_code=status.HTTP_200_OK)
def sample_scenarios_endpoint():
    """
    Provide realistic, calibrated preset scenarios for demonstration:
    - Urban Residential Home
    - University / College Campus Building
    - Commercial Warehouse / Industrial Shed
    """
    return [
        SampleScenario(
            id="residential",
            title="Urban Residential Home",
            description="Typical suburban family home with 150 m² tiled roof in a sub-tropical climate (annual rain 950 mm).",
            data=CalculationRequest(
                roof_area=150.0,
                annual_rainfall=950.0,
                collection_efficiency=85.0,
                rainy_days=75,
                water_cost_per_m3=2.85,
                tank_capacity=5000.0,
                daily_water_demand=350.0,
                monthly_rainfall=[45.0, 50.0, 65.0, 70.0, 95.0, 140.0, 160.0, 130.0, 85.0, 55.0, 35.0, 20.0],
            ),
        ),
        SampleScenario(
            id="campus",
            title="College / Campus Academic Block",
            description="Large institutional flat concrete roof of 1,200 m² with moderate rainfall (800 mm/year) and university water demand.",
            data=CalculationRequest(
                roof_area=1200.0,
                annual_rainfall=800.0,
                collection_efficiency=80.0,
                rainy_days=60,
                water_cost_per_m3=3.50,
                tank_capacity=50000.0,
                daily_water_demand=2500.0,
                monthly_rainfall=[20.0, 25.0, 40.0, 50.0, 80.0, 150.0, 180.0, 130.0, 75.0, 35.0, 10.0, 5.0],
            ),
        ),
        SampleScenario(
            id="industrial",
            title="Commercial Warehouse / Logistics Shed",
            description="Extensive corrugated metal sheet roof of 3,500 m² with high runoff efficiency (90%) and 1,100 mm rainfall.",
            data=CalculationRequest(
                roof_area=3500.0,
                annual_rainfall=1100.0,
                collection_efficiency=90.0,
                rainy_days=85,
                water_cost_per_m3=4.20,
                tank_capacity=100000.0,
                daily_water_demand=6000.0,
                monthly_rainfall=[30.0, 40.0, 60.0, 90.0, 120.0, 180.0, 210.0, 170.0, 110.0, 50.0, 25.0, 15.0],
            ),
        ),
    ]
