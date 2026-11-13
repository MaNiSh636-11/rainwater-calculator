import React from 'react';
import { Leaf, ShieldCheck, CloudRain, Droplet } from 'lucide-react';

export default function EnvironmentalImpactCard({ environmentalImpact, collectableM3 }) {
  if (!environmentalImpact) return null;

  const co2 = environmentalImpact.co2_reduction_kg || 0;
  const runoff = environmentalImpact.stormwater_runoff_mitigated_litres || 0;
  const sdgs = environmentalImpact.sdg_alignment || [];

  return (
    <div className="panel-card" style={{ marginBottom: 24 }}>
      <div className="panel-header">
        <div className="panel-title-wrapper">
          <div className="panel-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <Leaf size={18} />
          </div>
          <div>
            <h3 className="panel-title">Environmental Benefits & UN SDG Alignment</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Ecological sustainability metrics and alignment with Global 2030 Sustainable Development Goals
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 16, borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#166534', fontWeight: 700, fontSize: '0.82rem', marginBottom: 4 }}>
            <CloudRain size={16} />
            Stormwater Runoff Mitigated
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#14532d' }}>
            {runoff.toLocaleString()} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Litres</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#166534', marginTop: 4 }}>
            Diverts surge loads from municipal storm drains, mitigating localized urban flooding.
          </p>
        </div>

        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: 16, borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1e40af', fontWeight: 700, fontSize: '0.82rem', marginBottom: 4 }}>
            <Leaf size={16} />
            Carbon Footprint Offset
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e3a8a' }}>
            {co2.toLocaleString()} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>kg CO₂e / year</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#1e40af', marginTop: 4 }}>
            Avoids carbon-intensive centralized municipal water treatment and booster pumping electricity.
          </p>
        </div>

        <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', padding: 16, borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b21a8', fontWeight: 700, fontSize: '0.82rem', marginBottom: 4 }}>
            <Droplet size={16} />
            Groundwater Conservation
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#581c87' }}>
            {collectableM3.toLocaleString(undefined, { maximumFractionDigits: 1 })}{' '}
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>m³ (kL)</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6b21a8', marginTop: 4 }}>
            Directly spares regional aquifers and deep borewells from depletion during dry periods.
          </p>
        </div>
      </div>

      {/* SDG Cards */}
      <div className="sdg-grid">
        {sdgs.map((item, idx) => {
          let styleClass = 'sdg-6';
          if (item.sdg.includes('11')) styleClass = 'sdg-11';
          if (item.sdg.includes('12')) styleClass = 'sdg-12';

          return (
            <div key={idx} className={`sdg-card ${styleClass}`}>
              <div className="sdg-card-title">
                <ShieldCheck size={16} />
                {item.sdg}: {item.title}
              </div>
              <div className="sdg-card-target">{item.target}</div>
              <div className="sdg-card-impact">{item.impact}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
