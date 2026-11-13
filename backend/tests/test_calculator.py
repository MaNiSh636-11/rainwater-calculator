import pytest
from app.models.schemas import CalculationRequest
from app.services.calculator import calculate_rainwater_potential


def test_basic_rainfall_formula():
    """Verify fundamental formula: Collected (L) = Area (m²) × Rainfall (mm) × Efficiency"""
    req = CalculationRequest(
        roof_area=100.0,
        annual_rainfall=1000.0,
        collection_efficiency=80.0,
    )
    res = calculate_rainwater_potential(req)

    # 100 m² × 1000 mm = 100,000 Litres gross
    assert res.gross_rainfall_litres == 100000.0
    # 100,000 L × 80% = 80,000 Litres collectable
    assert res.collectable_litres == 80000.0
    # 80,000 L = 80.0 m³
    assert res.collectable_m3 == 80.0
    # Average monthly = 80,000 / 12 = 6666.67 L
    assert pytest.approx(res.average_monthly_litres, 0.01) == 6666.67


def test_zero_rainfall():
    """Verify system handles zero rainfall correctly without divide-by-zero errors."""
    req = CalculationRequest(
        roof_area=200.0,
        annual_rainfall=0.0,
        collection_efficiency=85.0,
    )
    res = calculate_rainwater_potential(req)
    assert res.gross_rainfall_litres == 0.0
    assert res.collectable_litres == 0.0
    assert res.collectable_m3 == 0.0
    assert res.average_monthly_litres == 0.0
    assert res.estimated_financial_savings == 0.0


def test_zero_roof_area():
    """Verify system handles zero roof catchment area correctly."""
    req = CalculationRequest(
        roof_area=0.0,
        annual_rainfall=1200.0,
        collection_efficiency=85.0,
    )
    res = calculate_rainwater_potential(req)
    assert res.gross_rainfall_litres == 0.0
    assert res.collectable_litres == 0.0
    assert res.collectable_m3 == 0.0


def test_different_collection_efficiencies():
    """Verify calculations across various standard catchment materials/efficiencies."""
    efficiencies = [70.0, 80.0, 85.0, 90.0, 95.0]
    area = 150.0
    rainfall = 800.0
    gross = area * rainfall  # 120,000 L

    for eff in efficiencies:
        req = CalculationRequest(
            roof_area=area,
            annual_rainfall=rainfall,
            collection_efficiency=eff,
        )
        res = calculate_rainwater_potential(req)
        expected_collectable = gross * (eff / 100.0)
        assert pytest.approx(res.collectable_litres, 0.01) == expected_collectable
        assert pytest.approx(res.collectable_m3, 0.001) == (expected_collectable / 1000.0)


def test_water_cost_savings_calculation():
    """Verify financial savings calculation: collectable_m3 × tariff."""
    req = CalculationRequest(
        roof_area=250.0,
        annual_rainfall=1000.0,
        collection_efficiency=80.0,
        water_cost_per_m3=3.75,
    )
    res = calculate_rainwater_potential(req)
    # Collectable: 250 × 1000 × 0.8 = 200,000 L = 200 m³
    # Savings: 200 m³ × $3.75 = $750.00
    assert res.collectable_m3 == 200.0
    assert res.estimated_financial_savings == 750.0


def test_monthly_totals_with_explicit_monthly_rainfall():
    """Verify calculations when user supplies 12 discrete monthly rainfall amounts."""
    monthly_rain = [20.0, 30.0, 50.0, 80.0, 120.0, 150.0, 140.0, 110.0, 70.0, 40.0, 25.0, 15.0]
    total_rain = sum(monthly_rain)  # 850 mm
    area = 200.0
    eff = 85.0

    req = CalculationRequest(
        roof_area=area,
        annual_rainfall=total_rain,
        collection_efficiency=eff,
        monthly_rainfall=monthly_rain,
    )
    res = calculate_rainwater_potential(req)

    assert len(res.monthly_breakdown) == 12
    # Verify first month (Jan: 20 mm)
    jan = res.monthly_breakdown[0]
    assert jan.month == "Jan"
    assert jan.rainfall_mm == 20.0
    assert jan.gross_litres == 200.0 * 20.0  # 4,000 L
    assert jan.collectable_litres == 4000.0 * 0.85  # 3,400 L
    assert not jan.is_estimated

    # Verify total sum matches
    sum_monthly_coll = sum(item.collectable_litres for item in res.monthly_breakdown)
    assert pytest.approx(res.collectable_litres, 0.01) == sum_monthly_coll


def test_storage_tank_recommendation_and_overflow():
    """Verify storage tank recommendation and overflow mass-balance simulation."""
    req = CalculationRequest(
        roof_area=300.0,
        annual_rainfall=1000.0,
        collection_efficiency=80.0,
        tank_capacity=10000.0,  # 10,000 L tank
        daily_water_demand=500.0,
    )
    res = calculate_rainwater_potential(req)

    # 300 × 1000 × 0.8 = 240,000 L annual
    assert res.collectable_litres == 240000.0
    # Recommended capacity based on 25 days of 500 L/day = 12,500 L
    assert res.storage_analysis.recommended_capacity_litres == 12500.0
    assert res.storage_analysis.user_tank_capacity_litres == 10000.0
    assert res.storage_analysis.estimated_annual_overflow_litres is not None
    assert res.storage_analysis.storage_coverage_days == 20.0  # 10,000 / 500 = 20 days


def test_daily_harvest_estimates():
    """Verify daily harvest rate calculation both across 365 days and wet days."""
    req = CalculationRequest(
        roof_area=100.0,
        annual_rainfall=730.0,
        collection_efficiency=100.0,
        rainy_days=73,
    )
    res = calculate_rainwater_potential(req)
    # Collectable = 100 × 730 × 1.0 = 73,000 L
    assert res.collectable_litres == 73000.0
    # 365-day average: 73,000 / 365 = 200 L/day
    assert pytest.approx(res.average_daily_litres, 0.01) == 200.0
    # Rainy-day average: 73,000 / 73 = 1000 L/rainy day
    assert pytest.approx(res.average_daily_rainy_day_litres, 0.01) == 1000.0


def test_demand_offset_percentage():
    """Verify percentage of household/facility demand satisfied by harvested water."""
    req = CalculationRequest(
        roof_area=100.0,
        annual_rainfall=1000.0,
        collection_efficiency=80.0,
        daily_water_demand=400.0,  # 400 L/day × 365 = 146,000 L/year
    )
    res = calculate_rainwater_potential(req)
    # Collectable: 80,000 L. Offset = 80,000 / 146,000 = 54.79% -> 54.8%
    assert pytest.approx(res.demand_offset_percentage, 0.1) == 54.8
