from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check_endpoint():
    """Verify health endpoint responds with 200 OK and healthy status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


def test_root_endpoint():
    """Verify root index documentation and endpoint discovery."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "documentation" in data


def test_calculate_endpoint_success():
    """Verify successful calculation via API endpoint."""
    payload = {
        "roof_area": 120.0,
        "annual_rainfall": 850.0,
        "collection_efficiency": 85.0,
        "rainy_days": 65,
        "water_cost_per_m3": 3.20,
        "tank_capacity": 5000.0,
        "daily_water_demand": 300.0,
    }
    response = client.post("/api/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "gross_rainfall_litres" in data
    assert "collectable_litres" in data
    assert "collectable_m3" in data
    assert "storage_analysis" in data
    assert "environmental_impact" in data
    assert "monthly_breakdown" in data
    assert len(data["monthly_breakdown"]) == 12
    assert data["gross_rainfall_litres"] == 120.0 * 850.0
    assert data["collectable_litres"] == (120.0 * 850.0) * 0.85


def test_calculate_endpoint_with_custom_monthly_rainfall():
    """Verify API calculation with custom 12-month array."""
    payload = {
        "roof_area": 100.0,
        "annual_rainfall": 600.0,
        "collection_efficiency": 80.0,
        "monthly_rainfall": [30.0, 40.0, 50.0, 60.0, 70.0, 80.0, 70.0, 60.0, 50.0, 40.0, 30.0, 20.0],
    }
    response = client.post("/api/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["monthly_breakdown"]) == 12
    assert data["monthly_breakdown"][0]["is_estimated"] is False


def test_calculate_invalid_negative_roof_area():
    """Verify validation rejects negative roof area with 422."""
    payload = {
        "roof_area": -50.0,
        "annual_rainfall": 800.0,
        "collection_efficiency": 80.0,
    }
    response = client.post("/api/calculate", json=payload)
    assert response.status_code == 422


def test_calculate_invalid_negative_rainfall():
    """Verify validation rejects negative annual rainfall with 422."""
    payload = {
        "roof_area": 100.0,
        "annual_rainfall": -100.0,
        "collection_efficiency": 80.0,
    }
    response = client.post("/api/calculate", json=payload)
    assert response.status_code == 422


def test_calculate_invalid_efficiency_out_of_bounds():
    """Verify validation rejects collection efficiency outside 1-100%."""
    # Test efficiency > 100
    res_high = client.post(
        "/api/calculate",
        json={"roof_area": 100.0, "annual_rainfall": 500.0, "collection_efficiency": 115.0},
    )
    assert res_high.status_code == 422

    # Test efficiency <= 0
    res_low = client.post(
        "/api/calculate",
        json={"roof_area": 100.0, "annual_rainfall": 500.0, "collection_efficiency": 0.0},
    )
    assert res_low.status_code == 422


def test_calculate_missing_required_fields():
    """Verify validation rejects requests missing mandatory fields."""
    response = client.post("/api/calculate", json={"roof_area": 100.0})
    assert response.status_code == 422


def test_calculate_invalid_monthly_rainfall_length():
    """Verify validation rejects monthly rainfall with fewer or greater than 12 entries."""
    payload = {
        "roof_area": 100.0,
        "annual_rainfall": 500.0,
        "collection_efficiency": 80.0,
        "monthly_rainfall": [50.0, 50.0, 50.0],  # only 3 months
    }
    response = client.post("/api/calculate", json=payload)
    assert response.status_code == 422


def test_monthly_breakdown_endpoint():
    """Verify dedicated monthly breakdown endpoint."""
    payload = {
        "roof_area": 150.0,
        "collection_efficiency": 85.0,
        "monthly_rainfall": [10.0, 20.0, 30.0, 40.0, 50.0, 60.0, 70.0, 80.0, 70.0, 60.0, 50.0, 40.0],
    }
    response = client.post("/api/monthly-breakdown", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 12
    assert data[0]["month"] == "Jan"
    assert data[0]["rainfall_mm"] == 10.0


def test_sample_scenarios_endpoint():
    """Verify sample scenarios endpoint provides pre-calibrated demo presets."""
    response = client.get("/api/scenarios")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3
    scenario_ids = [s["id"] for s in data]
    assert "residential" in scenario_ids
    assert "campus" in scenario_ids
    assert "industrial" in scenario_ids
