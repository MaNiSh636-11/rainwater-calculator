import React, { useState } from 'react';
import {
  Sliders,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Calculator,
  HelpCircle,
  Building2,
  Home,
  Factory,
  Sparkles,
} from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function InputForm({
  formData,
  setFormData,
  onSubmit,
  loading,
  onReset,
  scenarios,
}) {
  const [showMonthly, setShowMonthly] = useState(false);
  const [activeScenario, setActiveScenario] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!formData.roof_area || Number(formData.roof_area) <= 0) {
      errors.roof_area = 'Roof area must be greater than 0 m²';
    } else if (Number(formData.roof_area) > 1000000) {
      errors.roof_area = 'Roof area exceeds reasonable limit (1,000,000 m²)';
    }

    if (formData.annual_rainfall === '' || Number(formData.annual_rainfall) < 0) {
      errors.annual_rainfall = 'Annual rainfall cannot be negative';
    } else if (Number(formData.annual_rainfall) > 15000) {
      errors.annual_rainfall = 'Rainfall exceeds record threshold (15,000 mm)';
    }

    if (
      formData.collection_efficiency === '' ||
      Number(formData.collection_efficiency) < 1 ||
      Number(formData.collection_efficiency) > 100
    ) {
      errors.collection_efficiency = 'Efficiency must be between 1% and 100%';
    }

    if (formData.rainy_days !== '' && formData.rainy_days !== null) {
      const rd = Number(formData.rainy_days);
      if (rd < 0 || rd > 365) {
        errors.rainy_days = 'Rainy days must be between 0 and 365';
      }
    }

    if (formData.water_cost_per_m3 !== '' && Number(formData.water_cost_per_m3) < 0) {
      errors.water_cost_per_m3 = 'Water tariff cannot be negative';
    }

    if (formData.tank_capacity !== '' && Number(formData.tank_capacity) < 0) {
      errors.tank_capacity = 'Tank capacity cannot be negative';
    }

    if (formData.daily_water_demand !== '' && Number(formData.daily_water_demand) < 0) {
      errors.daily_water_demand = 'Water demand cannot be negative';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit();
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setActiveScenario(null);
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleMonthlyRainChange = (index, val) => {
    const updated = [...(formData.monthly_rainfall || Array(12).fill(0))];
    updated[index] = val === '' ? 0 : Math.max(0, parseFloat(val) || 0);
    const newAnnual = updated.reduce((a, b) => a + b, 0);

    setFormData((prev) => ({
      ...prev,
      monthly_rainfall: updated,
      annual_rainfall: Math.round(newAnnual * 10) / 10,
    }));
    setActiveScenario(null);
  };

  const loadPreset = (scenario) => {
    setActiveScenario(scenario.id);
    setFormData({
      roof_area: scenario.data.roof_area,
      annual_rainfall: scenario.data.annual_rainfall,
      collection_efficiency: scenario.data.collection_efficiency,
      rainy_days: scenario.data.rainy_days || '',
      water_cost_per_m3: scenario.data.water_cost_per_m3 || '',
      tank_capacity: scenario.data.tank_capacity || '',
      daily_water_demand: scenario.data.daily_water_demand || '',
      monthly_rainfall: scenario.data.monthly_rainfall ? [...scenario.data.monthly_rainfall] : null,
    });
    setValidationErrors({});
    if (scenario.data.monthly_rainfall) {
      setShowMonthly(true);
    }
  };

  return (
    <div className="panel-card form-panel-wrapper">
      <div className="panel-header">
        <div className="panel-title-wrapper">
          <div className="panel-icon">
            <Sliders size={18} />
          </div>
          <div>
            <h2 className="panel-title">Catchment & Site Inputs</h2>
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          title="Reset to default clean inputs"
        >
          <RefreshCw size={13} />
          Reset
        </button>
      </div>

      {/* Preset Scenarios */}
      <div className="preset-section">
        <div className="preset-title">
          <Sparkles size={14} color="#0284c7" />
          Quick Load Presets (Demo Scenarios)
        </div>
        <div className="preset-grid">
          <button
            type="button"
            className={`btn-preset ${activeScenario === 'residential' ? 'active' : ''}`}
            onClick={() => {
              const p = scenarios?.find((s) => s.id === 'residential') || {
                id: 'residential',
                data: {
                  roof_area: 150,
                  annual_rainfall: 950,
                  collection_efficiency: 85,
                  rainy_days: 75,
                  water_cost_per_m3: 2.85,
                  tank_capacity: 5000,
                  daily_water_demand: 350,
                  monthly_rainfall: [45, 50, 65, 70, 95, 140, 160, 130, 85, 55, 35, 20],
                },
              };
              loadPreset(p);
            }}
          >
            <Home size={13} style={{ marginBottom: 3, display: 'inline', marginRight: 4 }} />
            Home (150 m²)
          </button>
          <button
            type="button"
            className={`btn-preset ${activeScenario === 'campus' ? 'active' : ''}`}
            onClick={() => {
              const p = scenarios?.find((s) => s.id === 'campus') || {
                id: 'campus',
                data: {
                  roof_area: 1200,
                  annual_rainfall: 800,
                  collection_efficiency: 80,
                  rainy_days: 60,
                  water_cost_per_m3: 3.5,
                  tank_capacity: 50000,
                  daily_water_demand: 2500,
                  monthly_rainfall: [20, 25, 40, 50, 80, 150, 180, 130, 75, 35, 10, 5],
                },
              };
              loadPreset(p);
            }}
          >
            <Building2 size={13} style={{ marginBottom: 3, display: 'inline', marginRight: 4 }} />
            Campus (1.2k m²)
          </button>
          <button
            type="button"
            className={`btn-preset ${activeScenario === 'industrial' ? 'active' : ''}`}
            onClick={() => {
              const p = scenarios?.find((s) => s.id === 'industrial') || {
                id: 'industrial',
                data: {
                  roof_area: 3500,
                  annual_rainfall: 1100,
                  collection_efficiency: 90,
                  rainy_days: 85,
                  water_cost_per_m3: 4.2,
                  tank_capacity: 100000,
                  daily_water_demand: 6000,
                  monthly_rainfall: [30, 40, 60, 90, 120, 180, 210, 170, 110, 50, 25, 15],
                },
              };
              loadPreset(p);
            }}
          >
            <Factory size={13} style={{ marginBottom: 3, display: 'inline', marginRight: 4 }} />
            Industrial (3.5k m²)
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Roof Catchment Area */}
        <div className="form-group">
          <div className="form-label-row">
            <label className="form-label" htmlFor="roof_area">
              Roof Area
            </label>
            <span className="form-unit">m²</span>
          </div>
          <div className="form-input-wrapper">
            <input
              id="roof_area"
              type="number"
              step="any"
              min="1"
              max="1000000"
              placeholder="e.g. 150"
              value={formData.roof_area}
              onChange={(e) => handleInputChange('roof_area', e.target.value)}
              className={`form-input ${validationErrors.roof_area ? 'has-error' : ''}`}
              required
            />
          </div>
          {validationErrors.roof_area && (
            <p className="form-error">{validationErrors.roof_area}</p>
          )}
          <p className="form-helper">Horizontal footprint area of the rooftop catchment.</p>
        </div>

        {/* Annual Rainfall */}
        <div className="form-group">
          <div className="form-label-row">
            <label className="form-label" htmlFor="annual_rainfall">
              Annual Rainfall
            </label>
            <span className="form-unit">mm / year</span>
          </div>
          <div className="form-input-wrapper">
            <input
              id="annual_rainfall"
              type="number"
              step="any"
              min="0"
              max="15000"
              placeholder="e.g. 950"
              value={formData.annual_rainfall}
              onChange={(e) => handleInputChange('annual_rainfall', e.target.value)}
              className={`form-input ${validationErrors.annual_rainfall ? 'has-error' : ''}`}
              required
            />
          </div>
          {validationErrors.annual_rainfall && (
            <p className="form-error">{validationErrors.annual_rainfall}</p>
          )}
          <p className="form-helper">
            Local mean precipitation (1 mm over 1 m² = exactly 1 Litre).
          </p>
        </div>

        {/* Collection Efficiency */}
        <div className="form-group">
          <div className="form-label-row">
            <label className="form-label" htmlFor="collection_efficiency">
              Collection Efficiency
            </label>
            <span className="form-unit">%</span>
          </div>
          <div className="form-input-wrapper">
            <input
              id="collection_efficiency"
              type="number"
              step="1"
              min="1"
              max="100"
              placeholder="e.g. 85"
              value={formData.collection_efficiency}
              onChange={(e) => handleInputChange('collection_efficiency', e.target.value)}
              className={`form-input ${validationErrors.collection_efficiency ? 'has-error' : ''}`}
              required
            />
          </div>
          {validationErrors.collection_efficiency && (
            <p className="form-error">{validationErrors.collection_efficiency}</p>
          )}
          <p className="form-helper">
            Typical runoff: Metal/GI sheet (90%), Concrete/Tile (80-85%), Gravel (70%).
          </p>
        </div>

        {/* Number of Rainy Days */}
        <div className="form-group">
          <div className="form-label-row">
            <label className="form-label" htmlFor="rainy_days">
              Rainy Days per Year
            </label>
            <span className="form-unit">days</span>
          </div>
          <div className="form-input-wrapper">
            <input
              id="rainy_days"
              type="number"
              min="1"
              max="365"
              placeholder="e.g. 75 (optional)"
              value={formData.rainy_days}
              onChange={(e) => handleInputChange('rainy_days', e.target.value)}
              className={`form-input ${validationErrors.rainy_days ? 'has-error' : ''}`}
            />
          </div>
          {validationErrors.rainy_days && (
            <p className="form-error">{validationErrors.rainy_days}</p>
          )}
          <p className="form-helper">Used to estimate average rainwater yield per wet event.</p>
        </div>

        {/* Water Cost */}
        <div className="form-group">
          <div className="form-label-row">
            <label className="form-label" htmlFor="water_cost_per_m3">
              Water Tariff / Cost
            </label>
            <span className="form-unit">$ / m³ (kL)</span>
          </div>
          <div className="form-input-wrapper">
            <input
              id="water_cost_per_m3"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 2.85"
              value={formData.water_cost_per_m3}
              onChange={(e) => handleInputChange('water_cost_per_m3', e.target.value)}
              className={`form-input ${validationErrors.water_cost_per_m3 ? 'has-error' : ''}`}
            />
          </div>
          {validationErrors.water_cost_per_m3 && (
            <p className="form-error">{validationErrors.water_cost_per_m3}</p>
          )}
          <p className="form-helper">Local municipal water or tanker delivery cost per 1,000 Litres.</p>
        </div>

        {/* Planned / Existing Storage Tank Capacity */}
        <div className="form-group">
          <div className="form-label-row">
            <label className="form-label" htmlFor="tank_capacity">
              Existing / Desired Tank Capacity
            </label>
            <span className="form-unit">Litres</span>
          </div>
          <div className="form-input-wrapper">
            <input
              id="tank_capacity"
              type="number"
              step="100"
              min="0"
              placeholder="e.g. 5000 (optional)"
              value={formData.tank_capacity}
              onChange={(e) => handleInputChange('tank_capacity', e.target.value)}
              className={`form-input ${validationErrors.tank_capacity ? 'has-error' : ''}`}
            />
          </div>
          {validationErrors.tank_capacity && (
            <p className="form-error">{validationErrors.tank_capacity}</p>
          )}
          <p className="form-helper">Allows the calculator to simulate tank overflow and sufficiency.</p>
        </div>

        {/* Daily Water Demand */}
        <div className="form-group">
          <div className="form-label-row">
            <label className="form-label" htmlFor="daily_water_demand">
              Daily Water Demand
            </label>
            <span className="form-unit">L / day</span>
          </div>
          <div className="form-input-wrapper">
            <input
              id="daily_water_demand"
              type="number"
              step="10"
              min="0"
              placeholder="e.g. 350 (optional)"
              value={formData.daily_water_demand}
              onChange={(e) => handleInputChange('daily_water_demand', e.target.value)}
              className={`form-input ${validationErrors.daily_water_demand ? 'has-error' : ''}`}
            />
          </div>
          {validationErrors.daily_water_demand && (
            <p className="form-error">{validationErrors.daily_water_demand}</p>
          )}
          <p className="form-helper">
            Facility or household non-potable consumption (e.g. toilet flushing, gardening).
          </p>
        </div>

        {/* Accordion for Monthly Rainfall */}
        <div
          className="accordion-header"
          onClick={() => setShowMonthly(!showMonthly)}
          role="button"
          tabIndex={0}
        >
          <span className="accordion-title">
            <HelpCircle size={15} color="#0284c7" />
            Monthly Rainfall Breakdown (Optional)
          </span>
          {showMonthly ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>

        {showMonthly && (
          <div className="monthly-inputs-grid">
            {MONTHS.map((m, idx) => {
              const val =
                formData.monthly_rainfall && formData.monthly_rainfall[idx] !== undefined
                  ? formData.monthly_rainfall[idx]
                  : '';
              return (
                <div key={m} className="month-cell">
                  <label htmlFor={`m_${idx}`}>{m}</label>
                  <input
                    id={`m_${idx}`}
                    type="number"
                    min="0"
                    step="any"
                    placeholder="mm"
                    value={val}
                    onChange={(e) => handleMonthlyRainChange(idx, e.target.value)}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Action Button */}
        <div className="form-actions">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="spin" />
                Computing Engine...
              </>
            ) : (
              <>
                <Calculator size={18} />
                Calculate Harvest Potential
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
