import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import InputForm from './components/InputForm';
import ResultsDashboard from './components/ResultsDashboard';
import { calculateHarvest, fetchScenarios, fetchHealth } from './services/api';
import { Droplets, ShieldCheck, Award, Sparkles } from 'lucide-react';

const INITIAL_FORM = {
  roof_area: 150,
  annual_rainfall: 950,
  collection_efficiency: 85,
  rainy_days: 75,
  water_cost_per_m3: 2.85,
  tank_capacity: 5000,
  daily_water_demand: 350,
  monthly_rainfall: [45, 50, 65, 70, 95, 140, 160, 130, 85, 55, 35, 20],
};

export default function App() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [backendConnected, setBackendConnected] = useState(false);

  // Initialize and check backend connection
  useEffect(() => {
    async function init() {
      try {
        await fetchHealth();
        setBackendConnected(true);
      } catch {
        setBackendConnected(false);
      }

      try {
        const scn = await fetchScenarios();
        setScenarios(scn);
      } catch (e) {
        console.warn('Using default local presets:', e.message);
      }

      // Automatically execute initial calculation for presentation readiness
      handleCalculate(INITIAL_FORM);
    }
    init();
  }, []);

  const handleCalculate = async (dataToSubmit = formData) => {
    setLoading(true);
    setError(null);

    try {
      const roofAreaNum = Number(dataToSubmit.roof_area);
      const annualRainNum = Number(dataToSubmit.annual_rainfall);
      const effNum = Number(dataToSubmit.collection_efficiency);
      const demandNum = dataToSubmit.daily_water_demand ? Number(dataToSubmit.daily_water_demand) : 0.0;
      const tankNum = dataToSubmit.tank_capacity ? Number(dataToSubmit.tank_capacity) : null;

      const payload = {
        project_name: "Rainwater Harvesting Project",
        location: "Catchment Facility",
        roof_area: roofAreaNum,
        catchment_area_m2: roofAreaNum,
        annual_rainfall: annualRainNum,
        annual_rainfall_mm: annualRainNum,
        collection_efficiency: effNum,
        collection_efficiency_pct: effNum,
        runoff_coefficient: effNum > 1.0 ? effNum / 100.0 : effNum,
        daily_water_demand: demandNum,
        daily_water_demand_l: demandNum,
        tank_capacity: tankNum,
        tank_capacity_l: tankNum,
        rainy_days: dataToSubmit.rainy_days ? Number(dataToSubmit.rainy_days) : null,
        water_cost_per_m3: dataToSubmit.water_cost_per_m3
          ? Number(dataToSubmit.water_cost_per_m3)
          : 0.0,
        monthly_rainfall:
          dataToSubmit.monthly_rainfall && dataToSubmit.monthly_rainfall.length === 12
            ? dataToSubmit.monthly_rainfall.map(Number)
            : null,
      };

      const res = await calculateHarvest(payload);
      setResults(res);
      setBackendConnected(true);
    } catch (err) {
      console.error('Calculation failed:', err);
      setError(err.message || 'Failed to complete calculation. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      roof_area: '',
      annual_rainfall: '',
      collection_efficiency: 80,
      rainy_days: '',
      water_cost_per_m3: '',
      tank_capacity: '',
      daily_water_demand: '',
      monthly_rainfall: null,
    });
    setResults(null);
    setError(null);
  };

  return (
    <div className="app-container">
      <Navbar backendConnected={backendConnected} />

      {/* Hero Presentation Banner */}
      <section className="hero-banner">
        <h2 className="hero-title">Rooftop Rainwater Harvesting Potential Calculator</h2>
        <p className="hero-desc">
          Empowering educational institutions, homeowners, municipal planners, and commercial facilities
          with precise hydrological catchment modelling, storage optimization, and sustainable water autonomy metrics.
        </p>
        <div className="hero-pills">
          <span className="hero-pill">
            <Droplets size={14} />
            1 mm Rain on 1 m² = 1 Litre
          </span>
          <span className="hero-pill">
            <ShieldCheck size={14} />
            UN SDGs 6, 11 & 12 Aligned
          </span>
          <span className="hero-pill">
            <Award size={14} />
            Hydrological Mass-Balance Simulation
          </span>
          <span className="hero-pill">
            <Sparkles size={14} />
            Instant Audit & Report Export
          </span>
        </div>
      </section>

      {/* Main Two-Column Workflow */}
      <main className="main-grid">
        {/* Left Column: Input Form & Presets */}
        <InputForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={() => handleCalculate(formData)}
          loading={loading}
          onReset={handleReset}
          scenarios={scenarios}
        />

        {/* Right Column: Dynamic KPI Dashboard, Charts, and Tables */}
        <ResultsDashboard
          results={results}
          loading={loading}
          error={error}
          inputs={formData}
        />
      </main>
    </div>
  );
}
