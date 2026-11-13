import React, { useState } from 'react';
import {
  Droplets,
  Calendar,
  Cylinder,
  DollarSign,
  TrendingUp,
  Download,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import MonthlyChart from './MonthlyChart';
import GrossVsCollectableChart from './GrossVsCollectableChart';
import StorageAnalysisCard from './StorageAnalysisCard';
import EnvironmentalImpactCard from './EnvironmentalImpactCard';
import ResultsTable from './ResultsTable';
import ExportReportModal from './ExportReportModal';

export default function ResultsDashboard({ results, loading, error, inputs }) {
  const [isExportOpen, setIsExportOpen] = useState(false);

  if (loading) {
    return (
      <div className="panel-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ width: 44, height: 44, margin: '0 auto 16px', border: '3px solid #e0f2fe', borderTopColor: '#0284c7', borderRadius: '50%' }} className="spin" />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
          Simulating Rainwater Harvesting Potential...
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 6 }}>
          Executing hydrological catchment equations, storage simulations, and SDG evaluations.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="panel-card"
        style={{
          borderLeft: '4px solid #ef4444',
          background: '#fef2f2',
          padding: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#b91c1c' }}>
          <AlertCircle size={22} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Calculation Error</h3>
        </div>
        <p style={{ color: '#991b1b', fontSize: '0.88rem', marginTop: 8, lineHeight: 1.5 }}>
          {error}
        </p>
        <p style={{ color: '#7f1d1d', fontSize: '0.78rem', marginTop: 12 }}>
          Please verify your inputs (such as roof area, rainfall values, or network connectivity) and try recalculating.
        </p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="panel-card" style={{ textAlign: 'center', padding: '70px 24px', background: '#f8fafc' }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: '#e0f2fe',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <Droplets size={28} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
          Ready to Calculate Harvest Potential
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: 480, margin: '8px auto 20px', lineHeight: 1.6 }}>
          Enter your roof dimensions and local rainfall data on the left, or select one of the pre-configured demonstration scenarios above to visualize results.
        </p>
      </div>
    );
  }

  const isEstimated = results.monthly_breakdown?.some((m) => m.is_estimated);

  return (
    <div>
      {/* Top Bar with Export Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Rainwater Harvesting Results & Analysis
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Audited hydrological performance metrics based on input catchment specifications
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsExportOpen(true)}
          className="btn btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <Download size={15} />
          Export Audit Report
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        {/* Annual Collectable */}
        <div className="kpi-card">
          <div className="kpi-accent-stripe kpi-accent-blue" />
          <div className="kpi-header">
            <span className="kpi-label">Annual Collectable</span>
            <div className="kpi-icon kpi-icon-blue">
              <Droplets size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">{results.collectable_m3.toLocaleString()}</span>
            <span className="kpi-unit">m³ (kL)</span>
          </div>
          <div className="kpi-subtext">
            {results.collectable_litres.toLocaleString()} Litres / year
          </div>
        </div>

        {/* Average Monthly */}
        <div className="kpi-card">
          <div className="kpi-accent-stripe kpi-accent-emerald" />
          <div className="kpi-header">
            <span className="kpi-label">Monthly Average</span>
            <div className="kpi-icon kpi-icon-emerald">
              <Calendar size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">
              {Math.round(results.average_monthly_litres).toLocaleString()}
            </span>
            <span className="kpi-unit">Litres</span>
          </div>
          <div className="kpi-subtext">
            ~{(results.average_monthly_litres / 1000).toFixed(2)} m³ per month
          </div>
        </div>

        {/* Suggested Storage Tank */}
        <div className="kpi-card">
          <div className="kpi-accent-stripe kpi-accent-amber" />
          <div className="kpi-header">
            <span className="kpi-label">Suggested Tank</span>
            <div className="kpi-icon kpi-icon-amber">
              <Cylinder size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">
              {results.storage_analysis?.recommended_capacity_litres.toLocaleString()}
            </span>
            <span className="kpi-unit">Litres</span>
          </div>
          <div className="kpi-subtext">
            Buffer capacity: {results.storage_analysis?.recommended_capacity_m3} m³
          </div>
        </div>

        {/* Annual Financial Savings */}
        <div className="kpi-card">
          <div className="kpi-accent-stripe kpi-accent-indigo" />
          <div className="kpi-header">
            <span className="kpi-label">Financial Savings</span>
            <div className="kpi-icon kpi-icon-indigo">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">${results.estimated_financial_savings.toFixed(2)}</span>
            <span className="kpi-unit">/ year</span>
          </div>
          <div className="kpi-subtext">
            At ${results.water_cost_per_m3.toFixed(2)} / m³ municipal tariff
          </div>
        </div>
      </div>

      {/* Demand Offset Pill if available */}
      {results.demand_offset_percentage !== null && results.demand_offset_percentage !== undefined && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            padding: '12px 18px',
            borderRadius: 12,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TrendingUp size={20} color="#059669" />
            <div>
              <span style={{ fontWeight: 700, color: '#065f46', fontSize: '0.9rem' }}>
                Water Demand Offset: {results.demand_offset_percentage}%
              </span>
              <p style={{ fontSize: '0.78rem', color: '#047857' }}>
                Harvested rainwater can satisfy {results.demand_offset_percentage}% of the facility's annual {results.annual_demand_litres?.toLocaleString()} L non-potable demand.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="charts-grid">
        <MonthlyChart monthlyData={results.monthly_breakdown} isEstimated={isEstimated} />
        <GrossVsCollectableChart
          grossLitres={results.gross_rainfall_litres}
          collectableLitres={results.collectable_litres}
        />
      </div>

      {/* Storage Sizing & Overflow Analysis */}
      <StorageAnalysisCard
        storageAnalysis={results.storage_analysis}
        annualCollectableLitres={results.collectable_litres}
      />

      {/* Environmental & SDG Card */}
      <EnvironmentalImpactCard
        environmentalImpact={results.environmental_impact}
        collectableM3={results.collectable_m3}
      />

      {/* Detailed Results Table */}
      <ResultsTable
        monthlyBreakdown={results.monthly_breakdown}
        assumptions={results.assumptions}
        formulaExplanation={results.formula_explanation}
      />

      {/* Modal for PDF/CSV Export */}
      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        calculationData={results}
        inputs={inputs}
      />
    </div>
  );
}
