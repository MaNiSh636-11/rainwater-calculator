from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator, model_validator


class CalculationRequest(BaseModel):
    project_name: Optional[str] = Field(
        default="Rainwater Harvesting Project",
        description="Project or property designation."
    )
    location: Optional[str] = Field(
        default="Catchment Site",
        description="Site location or geographical designation."
    )
    roof_area: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=10_000_000.0,
        description="Roof catchment area in square metres (m²). Must be non-negative."
    )
    catchment_area_m2: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=10_000_000.0,
        description="Alias for roof_area in square metres (m²)."
    )
    annual_rainfall: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=15_000.0,
        description="Average annual rainfall in millimetres (mm). Must be non-negative."
    )
    annual_rainfall_mm: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=15_000.0,
        description="Alias for annual_rainfall in millimetres (mm)."
    )
    collection_efficiency: float = Field(
        default=80.0,
        ge=1.0,
        le=100.0,
        description="Collection efficiency / runoff coefficient as a percentage (e.g., 80.0 for 80%)."
    )
    collection_efficiency_pct: Optional[float] = Field(
        default=None,
        ge=1.0,
        le=100.0,
        description="Alias for collection_efficiency as a percentage."
    )
    runoff_coefficient: Optional[float] = Field(
        default=None,
        ge=0.01,
        le=1.0,
        description="Runoff coefficient expressed as a decimal ratio (0.01 to 1.0)."
    )
    rainy_days: Optional[int] = Field(
        default=None,
        ge=0,
        le=365,
        description="Number of rainy days per year for daily harvest estimation during wet events."
    )
    water_cost_per_m3: Optional[float] = Field(
        default=0.0,
        ge=0.0,
        le=10_000.0,
        description="Water tariff or cost per cubic metre / kilolitre."
    )
    tank_capacity: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=100_000_000.0,
        description="Existing or planned storage tank capacity in litres."
    )
    tank_capacity_l: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=100_000_000.0,
        description="Alias for tank_capacity in litres."
    )
    daily_water_demand: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=1_000_000.0,
        description="Daily water demand in litres per day to calculate offset percentage."
    )
    daily_water_demand_l: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=1_000_000.0,
        description="Alias for daily_water_demand in litres per day."
    )
    monthly_rainfall: Optional[List[float]] = Field(
        default=None,
        description="Optional list of 12 monthly rainfall figures in mm (January to December)."
    )

    @model_validator(mode="before")
    @classmethod
    def reconcile_legacy_and_standard_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Check required fields
            has_area = ("roof_area" in data and data["roof_area"] is not None) or ("catchment_area_m2" in data and data["catchment_area_m2"] is not None)
            if not has_area:
                raise ValueError("Roof catchment area (roof_area or catchment_area_m2) is required.")

            has_rain = ("annual_rainfall" in data and data["annual_rainfall"] is not None) or ("annual_rainfall_mm" in data and data["annual_rainfall_mm"] is not None)
            if not has_rain:
                raise ValueError("Annual rainfall (annual_rainfall or annual_rainfall_mm) is required.")

            # 1. Resolve catchment area
            if "roof_area" not in data or data["roof_area"] is None:
                if "catchment_area_m2" in data and data["catchment_area_m2"] is not None:
                    data["roof_area"] = data["catchment_area_m2"]
            if "catchment_area_m2" not in data or data["catchment_area_m2"] is None:
                data["catchment_area_m2"] = data.get("roof_area")

            # 2. Resolve annual rainfall
            if "annual_rainfall" not in data or data["annual_rainfall"] is None:
                if "annual_rainfall_mm" in data and data["annual_rainfall_mm"] is not None:
                    data["annual_rainfall"] = data["annual_rainfall_mm"]
            if "annual_rainfall_mm" not in data or data["annual_rainfall_mm"] is None:
                data["annual_rainfall_mm"] = data.get("annual_rainfall")

            # 3. Resolve efficiency & runoff coefficient
            eff = data.get("collection_efficiency")
            eff_pct = data.get("collection_efficiency_pct")
            rc = data.get("runoff_coefficient")

            if eff is None:
                if eff_pct is not None:
                    eff = float(eff_pct)
                elif rc is not None:
                    eff = float(rc) * 100.0 if float(rc) <= 1.0 else float(rc)
                else:
                    eff = 80.0
            else:
                eff = float(eff)

            data["collection_efficiency"] = eff
            data["collection_efficiency_pct"] = eff
            data["runoff_coefficient"] = round(eff / 100.0, 4)

            # 4. Resolve water demand
            if "daily_water_demand" not in data or data["daily_water_demand"] is None:
                if "daily_water_demand_l" in data and data["daily_water_demand_l"] is not None:
                    data["daily_water_demand"] = data["daily_water_demand_l"]
            if "daily_water_demand_l" not in data or data["daily_water_demand_l"] is None:
                data["daily_water_demand_l"] = data.get("daily_water_demand")

            # 5. Resolve tank capacity
            if "tank_capacity" not in data or data["tank_capacity"] is None:
                if "tank_capacity_l" in data and data["tank_capacity_l"] is not None:
                    data["tank_capacity"] = data["tank_capacity_l"]
            if "tank_capacity_l" not in data or data["tank_capacity_l"] is None:
                data["tank_capacity_l"] = data.get("tank_capacity")

            # 6. Default metadata strings
            if not data.get("project_name"):
                data["project_name"] = "Rainwater Harvesting Project"
            if not data.get("location"):
                data["location"] = "Catchment Site"

        return data

    @field_validator("monthly_rainfall")
    @classmethod
    def validate_monthly_rainfall(cls, v: Optional[List[float]]) -> Optional[List[float]]:
        if v is not None:
            if len(v) != 12:
                raise ValueError("monthly_rainfall must contain exactly 12 monthly values.")
            for val in v:
                if val < 0.0:
                    raise ValueError("Monthly rainfall values cannot be negative.")
                if val > 5_000.0:
                    raise ValueError("Monthly rainfall value is physically unreasonable (>5000 mm).")
        return v


class MonthlyBreakdownItem(BaseModel):
    month: str
    month_index: int
    rainfall_mm: float
    gross_litres: float
    collectable_litres: float
    collectable_m3: float
    is_estimated: bool


class StorageAnalysis(BaseModel):
    recommended_capacity_litres: float
    recommended_capacity_m3: float
    recommendation_basis: str
    user_tank_capacity_litres: Optional[float] = None
    estimated_annual_overflow_litres: Optional[float] = None
    storage_coverage_days: Optional[float] = None


class EnvironmentalImpact(BaseModel):
    co2_reduction_kg: float
    stormwater_runoff_mitigated_litres: float
    sdg_alignment: List[Dict[str, str]]


class CalculationResponse(BaseModel):
    project_name: Optional[str] = "Rainwater Harvesting Project"
    location: Optional[str] = "Catchment Site"
    roof_area: Optional[float] = None
    catchment_area_m2: Optional[float] = None
    annual_rainfall: Optional[float] = None
    annual_rainfall_mm: Optional[float] = None
    gross_rainfall_litres: float
    collectable_litres: float
    collectable_m3: float
    annual_harvest_litres: Optional[float] = None
    annual_harvest_m3: Optional[float] = None
    collection_efficiency_pct: Optional[float] = None
    runoff_coefficient: Optional[float] = None
    average_monthly_litres: float
    average_daily_litres: Optional[float] = None
    average_daily_rainy_day_litres: Optional[float] = None
    estimated_financial_savings: float
    water_cost_per_m3: float
    daily_demand_litres: Optional[float] = None
    annual_demand_litres: Optional[float] = None
    demand_offset_percentage: Optional[float] = None
    storage_analysis: StorageAnalysis
    environmental_impact: EnvironmentalImpact
    monthly_breakdown: List[MonthlyBreakdownItem]
    formula_explanation: str
    assumptions: List[str]


class MonthlyBreakdownRequest(BaseModel):
    roof_area: float = Field(..., ge=0.0, le=10_000_000.0)
    collection_efficiency: float = Field(default=80.0, ge=1.0, le=100.0)
    monthly_rainfall: List[float] = Field(..., min_length=12, max_length=12)

    @field_validator("monthly_rainfall")
    @classmethod
    def check_values(cls, v: List[float]) -> List[float]:
        for val in v:
            if val < 0.0:
                raise ValueError("Monthly rainfall values cannot be negative.")
        return v


class SampleScenario(BaseModel):
    id: str
    title: str
    description: str
    data: CalculationRequest
