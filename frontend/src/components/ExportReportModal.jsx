import React from 'react';
import { X, Printer, Download, Droplet, CheckCircle, FileText } from 'lucide-react';

export default function ExportReportModal({ isOpen, onClose, calculationData, inputs }) {
  if (!isOpen || !calculationData) return null;

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // CSV Generator
  const downloadCSV = () => {
    const lines = [];
    lines.push(['RAINWATER HARVESTING POTENTIAL AUDIT REPORT']);
    lines.push([`Generated on: ${today}`]);
    lines.push([]);
    lines.push(['--- USER INPUTS ---']);
    lines.push(['Roof Catchment Area (m²)', inputs.roof_area]);
    lines.push(['Annual Rainfall (mm)', inputs.annual_rainfall]);
    lines.push(['Collection Efficiency (%)', inputs.collection_efficiency]);
    lines.push(['Rainy Days per Year', inputs.rainy_days || 'N/A']);
    lines.push(['Water Cost ($/m³)', inputs.water_cost_per_m3 || '0.00']);
    lines.push(['Specified Tank Capacity (L)', inputs.tank_capacity || 'N/A']);
    lines.push(['Daily Water Demand (L/day)', inputs.daily_water_demand || 'N/A']);
    lines.push([]);
    lines.push(['--- CALCULATION RESULTS ---']);
    lines.push(['Gross Rainfall Volume (Litres)', calculationData.gross_rainfall_litres]);
    lines.push(['Annual Collectable Water (Litres)', calculationData.collectable_litres]);
    lines.push(['Annual Collectable Water (m³ / kL)', calculationData.collectable_m3]);
    lines.push(['Average Monthly Harvest (Litres)', calculationData.average_monthly_litres]);
    lines.push(['Average Daily Harvest (Litres/day)', calculationData.average_daily_litres]);
    lines.push(['Estimated Financial Savings ($)', calculationData.estimated_financial_savings]);
    lines.push([
      'Recommended Tank Capacity (Litres)',
      calculationData.storage_analysis?.recommended_capacity_litres,
    ]);
    lines.push([
      'Estimated Annual Tank Overflow (Litres)',
      calculationData.storage_analysis?.estimated_annual_overflow_litres || 0,
    ]);
    lines.push([
      'Water Demand Offset (%)',
      calculationData.demand_offset_percentage ? `${calculationData.demand_offset_percentage}%` : 'N/A',
    ]);
    lines.push([
      'CO2 Footprint Offset (kg CO2e)',
      calculationData.environmental_impact?.co2_reduction_kg,
    ]);
    lines.push([
      'Stormwater Mitigated (Litres)',
      calculationData.environmental_impact?.stormwater_runoff_mitigated_litres,
    ]);
    lines.push([]);
    lines.push(['--- MONTHLY BREAKDOWN ---']);
    lines.push(['Month', 'Rainfall (mm)', 'Gross Catchment (L)', 'Harvestable Water (L)', 'Volume (m³)', 'Data Type']);

    calculationData.monthly_breakdown?.forEach((item) => {
      lines.push([
        item.month,
        item.rainfall_mm,
        item.gross_litres,
        item.collectable_litres,
        item.collectable_m3,
        item.is_estimated ? 'Estimated' : 'Measured',
      ]);
    });

    lines.push([]);
    lines.push(['--- ASSUMPTIONS & FORMULA ---']);
    lines.push([calculationData.formula_explanation]);
    calculationData.assumptions?.forEach((asm) => lines.push([asm]));

    lines.push([]);
    lines.push(['--- WATER CONSERVATION RECOMMENDATIONS ---']);
    lines.push([
      '1. Install a first-flush diverter (1-2 mm of initial rainfall) to flush roof contaminants, dust, and organic debris.',
    ]);
    lines.push([
      '2. Fit stainless steel leaf screens on gutters and mosquito-proof mesh on tank vents.',
    ]);
    lines.push([
      '3. Periodically inspect downpipes and clean the storage tank at the start of each monsoon season.',
    ]);
    lines.push([
      '4. Connect harvested rainwater to dedicated dual-plumbing for non-potable uses like landscaping, toilet flushing, and cooling towers.',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      lines.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rainwater_Harvesting_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={20} color="#0284c7" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Calculation Audit Report</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <X size={20} color="#64748b" />
          </button>
        </div>

        <div className="modal-body">
          {/* Printable Report Document */}
          <div className="report-paper">
            <div className="report-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0369a1', marginBottom: 4 }}>
                    AquaHarvest Potential & Feasibility Report
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Standard Rooftop Rainwater Harvesting Engineering Assessment
                  </p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#64748b' }}>
                  <div><strong>Date:</strong> {today}</div>
                  <div><strong>Status:</strong> Validated</div>
                </div>
              </div>
            </div>

            {/* Inputs & Key Results Grid */}
            <div className="report-grid-2">
              <div className="report-box">
                <div className="report-box-title">Site Catchment Specifications</div>
                <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div><strong>Catchment Area:</strong> {inputs.roof_area} m²</div>
                  <div><strong>Annual Rainfall:</strong> {inputs.annual_rainfall} mm</div>
                  <div><strong>Runoff Efficiency:</strong> {inputs.collection_efficiency}%</div>
                  <div><strong>Rainy Days:</strong> {inputs.rainy_days || 'Not specified'}</div>
                  <div><strong>Water Cost:</strong> ${Number(inputs.water_cost_per_m3 || 0).toFixed(2)} / m³</div>
                  <div><strong>Current Tank:</strong> {inputs.tank_capacity ? `${inputs.tank_capacity} L` : 'None'}</div>
                </div>
              </div>

              <div className="report-box" style={{ background: '#ecfdf5', borderColor: '#bbf7d0' }}>
                <div className="report-box-title" style={{ color: '#166534' }}>Annual Harvest Potential</div>
                <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: 5, color: '#14532d' }}>
                  <div><strong>Collectable Water:</strong> {calculationData.collectable_litres.toLocaleString()} L ({calculationData.collectable_m3} m³)</div>
                  <div><strong>Monthly Average:</strong> {calculationData.average_monthly_litres.toLocaleString()} L / month</div>
                  <div><strong>Annual Financial Savings:</strong> ${calculationData.estimated_financial_savings.toFixed(2)}</div>
                  <div><strong>Recommended Tank:</strong> {calculationData.storage_analysis?.recommended_capacity_litres.toLocaleString()} L</div>
                  <div><strong>Demand Offset:</strong> {calculationData.demand_offset_percentage ? `${calculationData.demand_offset_percentage}%` : 'N/A'}</div>
                  <div><strong>Carbon Offset:</strong> {calculationData.environmental_impact?.co2_reduction_kg} kg CO₂e</div>
                </div>
              </div>
            </div>

            {/* Monthly Summary Table */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 8 }}>
                12-Month Water Harvest Profile
              </h4>
              <div className="table-responsive">
                <table className="data-table" style={{ fontSize: '0.78rem' }}>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Rain (mm)</th>
                      <th>Gross (L)</th>
                      <th>Harvest (L)</th>
                      <th>Volume (m³)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculationData.monthly_breakdown?.map((m) => (
                      <tr key={m.month_index}>
                        <td>{m.month}</td>
                        <td>{m.rainfall_mm}</td>
                        <td>{m.gross_litres.toLocaleString()}</td>
                        <td style={{ fontWeight: 600 }}>{m.collectable_litres.toLocaleString()}</td>
                        <td>{m.collectable_m3}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Water Conservation Recommendations */}
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 6, color: '#0f172a' }}>
                Engineering & Water Stewardship Recommendations
              </h4>
              <ul style={{ fontSize: '0.8rem', color: '#475569', paddingLeft: 18, lineHeight: 1.6 }}>
                <li><strong>First-Flush Diversion:</strong> Divert initial 1-2 mm of rain to wash atmospheric particulate, pollen, and roof dust before collection.</li>
                <li><strong>Pre-filtration:</strong> Install stainless-steel mesh leaves-guards and self-cleaning inlet vortex filters.</li>
                <li><strong>Storage Maintenance:</strong> Keep storage cisterns light-tight and sealed to prevent algae formation and mosquito breeding.</li>
                <li><strong>UN SDG Alignment:</strong> Contributes directly to SDG 6 (Clean Water), SDG 11 (Resilient Cities), and SDG 12 (Sustainable Consumption).</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="modal-footer no-print">
          <button type="button" onClick={downloadCSV} className="btn btn-secondary">
            <Download size={15} />
            Download CSV Data
          </button>
          <button type="button" onClick={handlePrint} className="btn btn-primary">
            <Printer size={15} />
            Print / Save to PDF
          </button>
        </div>
      </div>
    </div>
  );
}
