import React from 'react';
import { Table, CheckCircle2 } from 'lucide-react';

export default function ResultsTable({ monthlyBreakdown, assumptions, formulaExplanation }) {
  if (!monthlyBreakdown || monthlyBreakdown.length === 0) return null;

  const totalRain = monthlyBreakdown.reduce((sum, item) => sum + item.rainfall_mm, 0);
  const totalGross = monthlyBreakdown.reduce((sum, item) => sum + item.gross_litres, 0);
  const totalColl = monthlyBreakdown.reduce((sum, item) => sum + item.collectable_litres, 0);

  return (
    <div className="panel-card" style={{ marginBottom: 24 }}>
      <div className="panel-header">
        <div className="panel-title-wrapper">
          <div className="panel-icon" style={{ background: '#f0fdf4', color: '#166534' }}>
            <Table size={18} />
          </div>
          <div>
            <h3 className="panel-title">Monthly Detailed Calculation Breakdown</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Full tabular data with units, precision, and basis of calculation
            </p>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Rainfall (mm)</th>
              <th>Gross Catchment (L)</th>
              <th>Harvestable Water (L)</th>
              <th>Harvestable Volume (m³)</th>
              <th>Data Basis</th>
            </tr>
          </thead>
          <tbody>
            {monthlyBreakdown.map((row) => (
              <tr key={row.month_index}>
                <td style={{ fontWeight: 600 }}>{row.month}</td>
                <td>{row.rainfall_mm.toFixed(1)}</td>
                <td>{row.gross_litres.toLocaleString()}</td>
                <td style={{ fontWeight: 600, color: '#0d9488' }}>
                  {row.collectable_litres.toLocaleString()}
                </td>
                <td>{row.collectable_m3.toFixed(2)}</td>
                <td>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: 12,
                      background: row.is_estimated ? '#f1f5f9' : '#ecfdf5',
                      color: row.is_estimated ? '#64748b' : '#15803d',
                      fontWeight: 600,
                    }}
                  >
                    {row.is_estimated ? 'Avg Estimate' : 'Measured'}
                  </span>
                </td>
              </tr>
            ))}
            <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
              <td>Annual Total</td>
              <td>{totalRain.toFixed(1)} mm</td>
              <td>{Math.round(totalGross).toLocaleString()} L</td>
              <td style={{ color: '#0d9488' }}>{Math.round(totalColl).toLocaleString()} L</td>
              <td>{(totalColl / 1000).toFixed(2)} m³</td>
              <td>-</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Assumptions & Formula Box */}
      <div style={{ marginTop: 20, padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>
          Formula & Scientific Assumptions
        </h4>
        <p style={{ fontSize: '0.8rem', color: '#475569', marginBottom: 10, lineHeight: 1.5 }}>
          {formulaExplanation}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {assumptions &&
            assumptions.map((asm, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: '0.78rem', color: '#475569' }}>
                <CheckCircle2 size={14} color="#0d9488" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{asm}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
